'use strict';

const db = uniCloud.database();
const newsCollection = db.collection('news');
const briefCollection = db.collection('morning_briefs');

const config = {
  maxNewsRefs: 6,
  selectionWindowHours: 48,
  titlePrefix: '候鸟生态早报'
};

function formatDate(ts) {
  const date = new Date(ts || Date.now());
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function startOfDay(dateKey) {
  return new Date(`${dateKey}T00:00:00+08:00`).getTime();
}

function normalizeText(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreNews(item) {
  const themeBoost = item.themeCategory === 'migratory-bird' ? 100 : 0;
  const score = Number(item.themeScore) || 0;
  const freshness = new Date(item.publishTime || item.createTime || 0).getTime() || 0;
  return themeBoost + score * 10 + freshness / 100000000;
}

function buildLead(stats) {
  if (stats.migratoryBirdCount > 0) {
    return `今天优先梳理候鸟动态，共纳入 ${stats.newsCount} 条重点信息，其中候鸟相关 ${stats.migratoryBirdCount} 条，生态保护延展 ${stats.ecologyCount} 条。`;
  }

  return `今天候鸟直接相关资讯较少，本期早报以生态保护动态为主，共纳入 ${stats.newsCount} 条重点信息。`;
}

function buildSummary(selected) {
  const topTitles = selected
    .slice(0, 3)
    .map((item) => item.title)
    .join('；');

  return `本期重点关注：${topTitles}`.slice(0, 220);
}

function buildSections(selected) {
  const migratory = selected.filter((item) => item.themeCategory === 'migratory-bird');
  const ecology = selected.filter((item) => item.themeCategory !== 'migratory-bird');
  const sections = [];

  if (migratory.length) {
    sections.push({
      title: '候鸟动态',
      content: migratory
        .map((item, index) => `${index + 1}. ${item.title}。${normalizeText(item.summary || item.contentText).slice(0, 80)}`)
        .join('\n')
    });
  }

  if (ecology.length) {
    sections.push({
      title: '生态延展',
      content: ecology
        .map((item, index) => `${index + 1}. ${item.title}。${normalizeText(item.summary || item.contentText).slice(0, 80)}`)
        .join('\n')
    });
  }

  sections.push({
    title: '观察提示',
    content: migratory.length
      ? '优先关注湿地巡护、迁飞通道、栖息地修复和重点保护鸟类监测动态，适合作为当日早报主线。'
      : '当日候鸟直接报道不足，建议在展示层明确“生态兜底”来源，避免用户误以为全部都是候鸟新闻。'
  });

  return sections;
}

function mapNewsRef(item) {
  return {
    id: item._id || item.id,
    title: item.title,
    source: item.source || '',
    time: item.time || formatDate(item.publishTime || item.createTime),
    tag: item.tag || '新闻',
    tagType: item.tagType || 'news',
    summary: normalizeText(item.summary || item.contentText).slice(0, 120),
    themeCategory: item.themeCategory || 'ecology'
  };
}

async function triggerCrawler() {
  const result = await uniCloud.callFunction({
    name: 'gw-news-crawler'
  });

  return result.result || {
    success: false,
    message: '新闻抓取失败'
  };
}

async function loadCandidateNews(dateKey) {
  const dateStart = startOfDay(dateKey);
  const windowStart = dateStart - config.selectionWindowHours * 60 * 60 * 1000;
  const result = await newsCollection
    .where({
      publishTime: db.command.gte(windowStart)
    })
    .orderBy('publishTime', 'desc')
    .limit(60)
    .get();

  const rows = (result.result && result.result.data) || result.data || [];
  return rows.filter((item) => item.extractionStatus === 'fulltext');
}

function pickNews(newsList) {
  const sorted = [...newsList].sort((a, b) => scoreNews(b) - scoreNews(a));
  const migratory = sorted.filter((item) => item.themeCategory === 'migratory-bird');
  const ecology = sorted.filter((item) => item.themeCategory !== 'migratory-bird');

  return [
    ...migratory.slice(0, config.maxNewsRefs),
    ...ecology.slice(0, Math.max(config.maxNewsRefs - migratory.length, 0))
  ].slice(0, config.maxNewsRefs);
}

async function upsertBrief(brief) {
  const existing = await briefCollection.where({
    dateKey: brief.dateKey
  }).limit(1).get();

  const rows = (existing.result && existing.result.data) || existing.data || [];
  if (rows.length > 0) {
    await briefCollection.doc(rows[0]._id).update({
      ...brief,
      updateTime: Date.now()
    });
    return rows[0]._id;
  }

  const res = await briefCollection.add({
    ...brief,
    createTime: Date.now(),
    updateTime: Date.now()
  });
  return res.id;
}

async function generateDailyBrief(options = {}) {
  const dateKey = options.dateKey || formatDate(Date.now());
  const refreshNews = options.refreshNews === true;

  let crawlerResult = null;
  if (refreshNews) {
    crawlerResult = await triggerCrawler();
  }

  const candidates = await loadCandidateNews(dateKey);
  const selected = pickNews(candidates);
  if (!selected.length) {
    return {
      success: false,
      message: '没有可生成早报的全文新闻',
      data: {
        dateKey,
        crawlerResult
      }
    };
  }

  const stats = {
    newsCount: selected.length,
    migratoryBirdCount: selected.filter((item) => item.themeCategory === 'migratory-bird').length,
    ecologyCount: selected.filter((item) => item.themeCategory !== 'migratory-bird').length
  };

  const cover = selected.find((item) => item.cover)?.cover || '';
  const brief = {
    dateKey,
    title: `${config.titlePrefix} ${dateKey}`,
    summary: buildSummary(selected),
    lead: buildLead(stats),
    sections: buildSections(selected),
    newsRefs: selected.map(mapNewsRef),
    stats,
    cover,
    status: 'ready'
  };

  const id = await upsertBrief(brief);
  return {
    success: true,
    message: '早报生成完成',
    data: {
      id,
      dateKey,
      stats,
      crawlerResult
    }
  };
}

async function getLatestBrief() {
  const result = await briefCollection
    .orderBy('dateKey', 'desc')
    .limit(1)
    .get();

  const rows = (result.result && result.result.data) || result.data || [];
  return {
    success: true,
    data: rows[0] || null
  };
}

async function getBriefDetail(event) {
  const id = event.id;
  if (!id) {
    throw new Error('缺少早报 ID');
  }

  const result = await briefCollection.doc(id).get();
  const rows = (result.result && result.result.data) || result.data || [];
  return {
    success: true,
    data: rows[0] || null
  };
}

async function getBriefList(event) {
  const page = Math.max(Number(event.page) || 1, 1);
  const pageSize = Math.min(Math.max(Number(event.pageSize) || 10, 1), 30);

  const [listRes, countRes] = await Promise.all([
    briefCollection.orderBy('dateKey', 'desc').skip((page - 1) * pageSize).limit(pageSize).get(),
    briefCollection.count()
  ]);

  return {
    success: true,
    data: (listRes.result && listRes.result.data) || listRes.data || [],
    total: (countRes.result && countRes.result.total) || countRes.total || 0,
    page,
    pageSize
  };
}

exports.main = async (event = {}) => {
  const action = event.action || 'generateDailyBrief';

  try {
    switch (action) {
      case 'generateDailyBrief':
        return await generateDailyBrief(event);
      case 'getLatestBrief':
        return await getLatestBrief();
      case 'getBriefDetail':
        return await getBriefDetail(event);
      case 'getBriefList':
        return await getBriefList(event);
      default:
        throw new Error('未知操作');
    }
  } catch (error) {
    console.error('morning brief failed:', error);
    return {
      success: false,
      message: error.message || '早报处理失败'
    };
  }
};
