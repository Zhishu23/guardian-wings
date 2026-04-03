'use strict';

const https = require('https');

const db = uniCloud.database();
const newsCollection = db.collection('news');

const config = {
  sources: [
    {
      name: '新华网',
      url: 'https://www.xinhuanet.com/'
    },
    {
      name: '中国新闻网',
      url: 'https://www.chinanews.com/'
    }
  ],
  keywords: [
    '候鸟', '鸟类', '保护', '湿地', '生态', '野生动物',
    '迁徙', '栖息地', '保护区', '环保', '自然保护'
  ],
  crawlInterval: 1000,
  detailInterval: 300,
  maxSummaryLength: 120
};

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
      },
      timeout: 10000
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => resolve(data));
    }).on('error', reject).on('timeout', () => reject(new Error('请求超时')));
  });
}

function stripHtml(value) {
  return String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function makeAbsoluteUrl(baseUrl, href) {
  if (!href) return '';
  if (/^https?:\/\//i.test(href)) return href;

  const normalizedBase = baseUrl.replace(/\/$/, '');
  if (href.startsWith('/')) {
    return `${normalizedBase}${href}`;
  }
  return `${normalizedBase}/${href}`;
}

function pickFirstMatch(html, patterns) {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return '';
}

function decodeHtmlEntities(value) {
  return String(value || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function extractParagraphs(html) {
  const paragraphs = [];
  const paragraphRegex = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;
  let match;

  while ((match = paragraphRegex.exec(html)) !== null) {
    const text = stripHtml(decodeHtmlEntities(match[1]));
    if (text.length >= 12) {
      paragraphs.push(text);
    }
  }

  return paragraphs;
}

function isDeletedPage(html) {
  const text = stripHtml(html).slice(0, 1200).toLowerCase();
  return [
    '404',
    '页面不存在',
    '您访问的页面不存在',
    '文章不存在',
    '内容不存在',
    '稿件不存在',
    '内容已删除',
    '该文章已删除',
    '已被删除',
    'not found'
  ].some((keyword) => text.includes(keyword.toLowerCase()));
}

function extractContentBlocks(html) {
  const containerPatterns = [
    /<article\b[^>]*>([\s\S]*?)<\/article>/i,
    /<div[^>]+class=["'][^"']*(?:article|content|detail|main|txt|正文)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
    /<section[^>]+class=["'][^"']*(?:article|content|detail|main)[^"']*["'][^>]*>([\s\S]*?)<\/section>/i
  ];

  for (const pattern of containerPatterns) {
    const match = html.match(pattern);
    if (!match || !match[1]) {
      continue;
    }

    const paragraphs = extractParagraphs(match[1]);
    if (paragraphs.length >= 2) {
      return paragraphs;
    }
  }

  return extractParagraphs(html);
}

function buildArticleHtml(paragraphs, link) {
  const blocks = paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('');
  if (!link) {
    return blocks;
  }
  return `${blocks}<p><a href="${link}" target="_blank">查看原文</a></p>`;
}

function isLikelyNewsImage(url) {
  if (!url) return false;
  if (/logo|icon|avatar|qrcode|code|wechat|weixin|banner-ad|advert/i.test(url)) {
    return false;
  }
  return /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(url) || /image|img/i.test(url);
}

function extractCover(html, pageUrl) {
  const metaImage = pickFirstMatch(html, [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
    /<meta[^>]+itemprop=["']image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+itemprop=["']image["']/i
  ]);

  if (metaImage) {
    return makeAbsoluteUrl(pageUrl, metaImage);
  }

  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const candidate = makeAbsoluteUrl(pageUrl, (match[1] || '').trim());
    if (isLikelyNewsImage(candidate)) {
      return candidate;
    }
  }

  return '';
}

function inferTag(title) {
  if (/科普|知识|课堂|解读/.test(title)) return '科普';
  if (/通告|通知|公告/.test(title)) return '通知';
  if (/活动|行动|宣传/.test(title)) return '活动';
  return '新闻';
}

function inferTagType(tag) {
  switch (tag) {
    case '科普': return 'science';
    case '通知': return 'notice';
    case '活动': return 'activity';
    default: return 'news';
  }
}

function buildSummary(title) {
  const text = stripHtml(title);
  if (!text) return '暂无摘要';
  return text.slice(0, config.maxSummaryLength);
}

function parseNews(html, source) {
  const newsItems = [];
  const linkRegex = /<a[^>]*href\s*=\s*['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const href = (match[1] || '').trim();
    const title = stripHtml(match[2]);

    if (!title || title.length < 10) {
      continue;
    }

    const hitKeyword = config.keywords.some((keyword) => title.includes(keyword));
    if (!hitKeyword) {
      continue;
    }

    const fullLink = makeAbsoluteUrl(source.url, href);
    const tag = inferTag(title);
    newsItems.push({
      title,
      link: fullLink,
      source: source.name,
      summary: buildSummary(title),
      content: `<p>${title}</p><p><a href="${fullLink}" target="_blank">查看原文</a></p>`,
      time: new Date().toISOString().slice(0, 10),
      publishTime: Date.now(),
      tag,
      tagType: inferTagType(tag)
    });
  }

  return newsItems;
}

async function crawlSource(source) {
  try {
    console.log(`start crawl: ${source.name}`);
    const html = await httpGet(source.url);
    const list = parseNews(html, source);
    console.log(`finish crawl: ${source.name}, ${list.length} items`);
    return list;
  } catch (error) {
    console.error(`crawl failed: ${source.name}`, error.message);
    return [];
  }
}

async function enrichNewsItem(item) {
  if (!item.link) {
    return null;
  }

  try {
    const detailHtml = await httpGet(item.link);
    if (!detailHtml || isDeletedPage(detailHtml)) {
      return null;
    }

    const paragraphs = extractContentBlocks(detailHtml);
    if (paragraphs.length < 2) {
      return null;
    }

    const cover = extractCover(detailHtml, item.link);
    const contentParagraphs = paragraphs.slice(0, 12);
    return {
      ...item,
      cover,
      summary: contentParagraphs[0].slice(0, config.maxSummaryLength) || item.summary,
      content: buildArticleHtml(contentParagraphs, item.link)
    };
  } catch (error) {
    console.error(`detail fetch failed: ${item.link}`, error.message);
    return null;
  }
}

async function enrichNewsItems(newsItems) {
  const enriched = [];

  for (const item of newsItems) {
    const enrichedItem = await enrichNewsItem(item);
    if (enrichedItem) {
      enriched.push(enrichedItem);
    }
    await new Promise((resolve) => setTimeout(resolve, config.detailInterval));
  }

  return enriched;
}

function dedupeNews(newsItems) {
  const map = new Map();

  newsItems.forEach((item) => {
    const key = `${item.source}::${item.title}`;
    if (!map.has(key)) {
      map.set(key, item);
    }
  });

  return Array.from(map.values());
}

async function findExistingTitles(titles) {
  const uniqueTitles = Array.from(new Set(titles)).filter(Boolean);
  if (!uniqueTitles.length) {
    return new Set();
  }

  const dbCmd = db.command;
  const result = await newsCollection.where({
    title: dbCmd.in(uniqueTitles)
  }).field({ title: true }).get();

  const rows = (result.result && result.result.data) || result.data || [];
  return new Set(rows.map((item) => item.title));
}

async function saveNews(newsItems) {
  const existingTitles = await findExistingTitles(newsItems.map((item) => item.title));
  const freshItems = newsItems
    .filter((item) => !existingTitles.has(item.title))
    .map((item) => ({
      ...item,
      createTime: Date.now(),
      updateTime: Date.now()
    }));

  if (!freshItems.length) {
    return {
      insertedCount: 0,
      insertedIds: []
    };
  }

  const ids = [];
  for (const item of freshItems) {
    const res = await newsCollection.add(item);
    ids.push(res.id);
  }

  return {
    insertedCount: freshItems.length,
    insertedIds: ids
  };
}

exports.main = async () => {
  try {
    let allNews = [];

    for (const source of config.sources) {
      const list = await crawlSource(source);
      allNews = allNews.concat(list);
      await new Promise((resolve) => setTimeout(resolve, config.crawlInterval));
    }

    const uniqueNews = dedupeNews(allNews);
    if (!uniqueNews.length) {
      return {
        success: false,
        message: '未找到相关新闻'
      };
    }

    const enrichedNews = await enrichNewsItems(uniqueNews);
    if (!enrichedNews.length) {
      return {
        success: false,
        message: '详情页校验后没有可用新闻'
      };
    }

    const saveResult = await saveNews(enrichedNews);

    return {
      success: true,
      message: saveResult.insertedCount > 0 ? `已更新 ${saveResult.insertedCount} 条新闻` : '没有可新增的新闻',
      data: {
        crawledCount: allNews.length,
        uniqueCount: uniqueNews.length,
        validCount: enrichedNews.length,
        coverCount: enrichedNews.filter((item) => item.cover).length,
        insertedCount: saveResult.insertedCount,
        insertedIds: saveResult.insertedIds
      }
    };
  } catch (error) {
    console.error('news crawler failed:', error);
    return {
      success: false,
      message: error.message || '新闻抓取失败'
    };
  }
};
