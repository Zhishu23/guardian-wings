'use strict';

const http = require('http');
const https = require('https');

const db = uniCloud.database();
const newsCollection = db.collection('news');

const config = {
  sources: [
    { name: '新华网', url: 'https://www.xinhuanet.com/' },
    { name: '中国新闻网', url: 'https://www.chinanews.com/' }
  ],
  crawlInterval: 1000,
  detailInterval: 300,
  maxSummaryLength: 120,
  minParagraphLength: 20,
  minArticleTextLength: 120,
  maxParagraphCount: 80,
  maxBodyFallbackParagraphs: 18,
  themeThreshold: 3,
  highPriorityThreshold: 8,
  titleMinLength: 10,
  keywords: {
    primary: [
      '候鸟', '迁徙鸟类', '迁飞', '越冬鸟', '夏候鸟', '冬候鸟', '水鸟',
      '雁', '鸭', '鹤', '鹳', '鸥', '鹭', '天鹅', '鸿雁', '黑颈鹤', '丹顶鹤',
      '湿地鸟类', '鸟类迁徙'
    ],
    secondary: [
      '生态', '生态环境', '生态保护', '湿地', '自然保护地', '保护区', '栖息地',
      '生物多样性', '野生动物', '野生鸟类', '环保', '修复生态', '生态修复',
      '自然保护', '国家公园', '巡护', '生态治理'
    ],
    negative: [
      '二维码', '小程序', '扫码', '直播', '专题', '图集', '视频', '广告',
      '招聘', '招生', '彩票网', '游戏', '娱乐', '明星', '体育'
    ]
  }
};

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const client = /^http:\/\//i.test(url) ? http : https;
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
      },
      timeout: 10000
    };

    client.get(url, options, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = makeAbsoluteUrl(url, res.headers.location);
        res.resume();
        resolve(httpGet(redirectUrl));
        return;
      }

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => resolve(data));
    }).on('error', reject).on('timeout', () => reject(new Error('请求超时')));
  });
}

function decodeHtmlEntities(value) {
  return String(value || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&emsp;|&ensp;|&thinsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, '\'')
    .replace(/&#12288;|&#8194;|&#8195;|&#8201;/g, ' ')
    .replace(/&ldquo;|&rdquo;/gi, '"')
    .replace(/&lsquo;|&rsquo;/gi, '\'')
    .replace(/&mdash;/gi, ' - ')
    .replace(/&hellip;/gi, '...')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function stripHtml(value) {
  return decodeHtmlEntities(String(value || ''))
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<img[^>]*>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function normalizeText(value) {
  return String(value || '')
    .replace(/\u3000/g, ' ')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function makeAbsoluteUrl(baseUrl, href) {
  if (!href) return '';

  try {
    return new URL(href, baseUrl).toString();
  } catch (error) {
    return '';
  }
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

function countKeywordHits(text, words) {
  let score = 0;
  for (const word of words) {
    if (!word) continue;
    if (String(text || '').includes(word)) {
      score += word.length >= 3 ? 3 : 2;
    }
  }
  return score;
}

function scoreTheme(text) {
  const content = String(text || '');
  const primaryScore = countKeywordHits(content, config.keywords.primary);
  const secondaryScore = countKeywordHits(content, config.keywords.secondary);
  const negativeScore = countKeywordHits(content, config.keywords.negative);

  return {
    primaryScore,
    secondaryScore,
    negativeScore,
    total: primaryScore * 2 + secondaryScore - negativeScore * 2
  };
}

function isRelevantTitle(title) {
  if (!title || title.length < config.titleMinLength) {
    return false;
  }

  const score = scoreTheme(title);
  return score.primaryScore > 0 || score.secondaryScore > 0 || score.total >= config.themeThreshold;
}

function inferTag(title) {
  if (/科普|知识|课堂|解读/.test(title)) return '科普';
  if (/通告|通知|公告/.test(title)) return '通知';
  if (/活动|行动|宣传/.test(title)) return '活动';
  return '新闻';
}

function inferTagType(tag) {
  switch (tag) {
    case '科普':
      return 'science';
    case '通知':
      return 'notice';
    case '活动':
      return 'activity';
    default:
      return 'news';
  }
}

function extractMetaPublishTime(html) {
  const value = pickFirstMatch(html, [
    /<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+name=["']publishdate["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+name=["']PubDate["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+name=["']Date["'][^>]+content=["']([^"']+)["']/i
  ]);

  if (!value) {
    return null;
  }

  const ts = Date.parse(value.replace(/\./g, '-'));
  return Number.isNaN(ts) ? null : ts;
}

function extractVisibleLines(fragment) {
  const text = normalizeText(
    stripHtml(
      String(fragment || '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<\/li>/gi, '\n')
    )
  );

  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length >= config.minParagraphLength);
}

function isGarbageParagraph(text) {
  if (!text) return true;

  if (text.length < config.minParagraphLength) {
    return true;
  }

  if (/责任编辑|责编|编辑[:：]|记者[:：]|作者[:：]|来源[:：]|原标题|点击进入专题|返回首页|打印|关闭窗口|分享到|扫描二维码|微信扫一扫|手机客户端|APP下载/.test(text) && text.length < 60) {
    return true;
  }

  if (/^[(（]?(完|记者|责编|编辑)[)）]?$/.test(text)) {
    return true;
  }

  if (/二维码|扫码|微信|微博|抖音|快手|客户端|下载APP|APP|小程序/.test(text) && text.length < 80) {
    return true;
  }

  if (/推荐阅读|相关阅读|延伸阅读|相关报道|更多新闻|专题报道|进入专题|打印本页|关闭窗口|返回首页|收藏本站|免责声明|版权声明|广告声明|上一篇|下一篇/.test(text)) {
    return true;
  }

  if (/^[A-Za-z0-9_\-]{1,20}$/.test(text)) {
    return true;
  }

  return false;
}

function sanitizeParagraph(text) {
  let value = normalizeText(text);

  value = value
    .replace(/^\s*(来源|原标题|责任编辑|责编|编辑|记者)[:：]\s*.*$/g, '')
    .replace(/\s*(责任编辑|责编|编辑)[:：]\s*[^，。；;]{1,20}$/g, '')
    .replace(/\s*(扫描二维码|微信扫一扫|打开小程序|下载客户端|进入专题|相关阅读|延伸阅读).*$/g, '')
    .replace(/\s*(推荐阅读|相关报道|更多新闻|专题报道|打印本页|关闭窗口|返回首页|上一篇|下一篇).*$/g, '')
    .replace(/\s*【?纠错】?.*$/g, '')
    .replace(/\s*【?责任编辑[:：]?[^】]*】?$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return value;
}

function cleanupParagraphs(paragraphs) {
  const result = [];
  const seen = new Set();

  for (const paragraph of paragraphs || []) {
    const text = sanitizeParagraph(paragraph);
    if (isGarbageParagraph(text)) {
      continue;
    }

    if (seen.has(text)) {
      continue;
    }

    seen.add(text);
    result.push(text);

    if (result.length >= config.maxParagraphCount) {
      break;
    }
  }

  return result;
}

function shouldStopAtParagraph(text) {
  return /推荐阅读|相关阅读|延伸阅读|相关报道|更多新闻|专题报道|进入专题|打印本页|关闭窗口|返回首页|版权声明|免责声明|广告|联系我们|上一篇|下一篇|微信扫一扫|扫描二维码/.test(text);
}

function trimTrailingNoise(paragraphs) {
  const result = [];
  for (const paragraph of paragraphs || []) {
    if (shouldStopAtParagraph(paragraph)) {
      break;
    }
    result.push(paragraph);
  }
  return result;
}

function extractParagraphs(fragment) {
  const paragraphs = [];
  const paragraphRegex = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;
  let match;

  while ((match = paragraphRegex.exec(fragment)) !== null) {
    const text = normalizeText(stripHtml(match[1]));
    if (text.length >= config.minParagraphLength) {
      paragraphs.push(text);
    }
  }

  return trimTrailingNoise(cleanupParagraphs(paragraphs));
}

function extractArticleCandidates(html) {
  const candidates = [];
  const patterns = [
    /<article\b[^>]*>([\s\S]*?)<\/article>/gi,
    /<(div|section)[^>]+(?:id|class)=["'][^"']*(?:article|content|detail|main|text|txt|正文|article-content|news-content|post-content|left_zw|center_box|content_left)[^"']*["'][^>]*>([\s\S]*?)<\/\1>/gi
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const fragment = match[2] || match[1] || '';
      if (!fragment) continue;

      const paragraphs = extractParagraphs(fragment);
      const fallbackLines = paragraphs.length ? [] : extractVisibleLines(fragment);
      const finalParagraphs = trimTrailingNoise(cleanupParagraphs(paragraphs.length ? paragraphs : fallbackLines));
      if (!finalParagraphs.length) continue;

      candidates.push({
        fragment,
        paragraphs: finalParagraphs
      });
    }
  }

  const bodyMatch = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch && bodyMatch[1]) {
    const bodyParagraphs = extractParagraphs(bodyMatch[1]).slice(0, config.maxBodyFallbackParagraphs);
    const finalParagraphs = trimTrailingNoise(cleanupParagraphs(bodyParagraphs.length ? bodyParagraphs : extractVisibleLines(bodyMatch[1]).slice(0, config.maxBodyFallbackParagraphs)));
    const bodyText = finalParagraphs.join('\n');
    const bodyTheme = scoreTheme(bodyText);
    if (finalParagraphs.length >= 2 && (bodyTheme.primaryScore > 0 || bodyTheme.total >= config.highPriorityThreshold)) {
      candidates.push({
        fragment: bodyMatch[1],
        paragraphs: finalParagraphs
      });
    }
  }

  return candidates;
}

function scoreCandidate(candidate, title) {
  const paragraphs = candidate.paragraphs || [];
  const text = paragraphs.join('\n');
  const totalLength = text.length;
  const titleHit = title && text.includes(title) ? 15 : 0;
  const paragraphScore = Math.min(paragraphs.length, 20) * 6;
  const lengthScore = Math.min(totalLength, 6000) / 40;
  const themeScore = Math.max(scoreTheme(`${title}\n${text}`).total, 0);
  const penalty = /登录|注册|导航|推荐阅读|相关阅读|版权声明|广告|二维码|扫一扫|微信|联系我们|免责声明|上一篇|下一篇/.test(text) ? 40 : 0;

  return paragraphScore + lengthScore + titleHit + themeScore - penalty;
}

function pickBestArticle(html, title) {
  const candidates = extractArticleCandidates(html);
  if (!candidates.length) {
    return null;
  }

  const ranked = candidates
    .map((candidate) => ({
      ...candidate,
      score: scoreCandidate(candidate, title)
    }))
    .sort((a, b) => b.score - a.score);

  return ranked[0] || null;
}

function buildSummaryFromParagraphs(paragraphs, title) {
  const text = normalizeText((paragraphs || []).slice(0, 2).join(' ')) || normalizeText(title);
  if (!text) {
    return '暂无摘要';
  }

  return text.slice(0, config.maxSummaryLength);
}

function buildArticleHtml(paragraphs) {
  return (paragraphs || [])
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join('');
}

function isLikelyNewsImage(url, rawTag) {
  if (!url) return false;

  const raw = String(rawTag || '');
  const text = `${url} ${raw}`.toLowerCase();

  if (!/\.(jpg|jpeg|png|webp)(\?|$)/i.test(url) && !/image|img|photo|pic/i.test(text)) {
    return false;
  }

  if (/logo|icon|avatar|qrcode|qr|code|barcode|wechat|weixin|miniapp|appcode|share|thumb|sprite|banner-ad|advert|poster/.test(text)) {
    return false;
  }

  if (/(二维码|扫码|微信|微博|抖音|客户端)/.test(raw)) {
    return false;
  }

  return true;
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
    const metaUrl = makeAbsoluteUrl(pageUrl, metaImage);
    if (isLikelyNewsImage(metaUrl, metaImage)) {
      return metaUrl;
    }
  }

  const imgRegex = /<img\b[^>]*>/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const tag = match[0];
    const src = pickFirstMatch(tag, [
      /data-src=["']([^"']+)["']/i,
      /src=["']([^"']+)["']/i
    ]);
    const candidate = makeAbsoluteUrl(pageUrl, src);
    if (isLikelyNewsImage(candidate, tag)) {
      return candidate;
    }
  }

  return '';
}

function formatDate(ts) {
  const date = new Date(ts || Date.now());
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function createBaseNewsItem({ title, link, source }) {
  const publishTime = Date.now();
  const tag = inferTag(title);
  const theme = scoreTheme(title);

  return {
    title,
    link,
    source,
    summary: buildSummaryFromParagraphs([], title),
    content: '',
    contentText: '',
    contentBlocks: [],
    time: formatDate(publishTime),
    publishTime,
    tag,
    tagType: inferTagType(tag),
    themeCategory: theme.primaryScore > 0 ? 'migratory-bird' : 'ecology',
    themeScore: theme.total,
    extractionStatus: 'pending'
  };
}

function parseNews(html, source) {
  const newsItems = [];
  const seen = new Set();
  const linkRegex = /<a[^>]*href\s*=\s*['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const href = (match[1] || '').trim();
    const title = normalizeText(stripHtml(match[2]));
    if (!isRelevantTitle(title)) continue;

    const link = makeAbsoluteUrl(source.url, href);
    if (!link || !/^https?:\/\//i.test(link)) continue;

    const dedupeKey = `${source.name}::${title}::${link}`;
    if (seen.has(dedupeKey)) continue;

    seen.add(dedupeKey);
    newsItems.push(createBaseNewsItem({
      title,
      link,
      source: source.name
    }));
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

function isQualifiedArticle(item, contentBlocks) {
  const text = `${item.title}\n${contentBlocks.join('\n')}`;
  const theme = scoreTheme(text);

  if (theme.primaryScore > 0) {
    return {
      passed: true,
      themeCategory: 'migratory-bird',
      themeScore: theme.total
    };
  }

  if (theme.secondaryScore > 0 || theme.total >= config.highPriorityThreshold) {
    return {
      passed: true,
      themeCategory: 'ecology',
      themeScore: theme.total
    };
  }

  return {
    passed: false,
    themeCategory: '',
    themeScore: theme.total
  };
}

function buildEnrichedNewsItem(item, detailHtml) {
  const article = pickBestArticle(detailHtml, item.title);
  if (!article) {
    return null;
  }

  const contentBlocks = cleanupParagraphs(article.paragraphs);
  const contentText = normalizeText(contentBlocks.join('\n\n'));
  if (contentText.length < config.minArticleTextLength) {
    return null;
  }

  const qualify = isQualifiedArticle(item, contentBlocks);
  if (!qualify.passed) {
    return null;
  }

  const publishTime = extractMetaPublishTime(detailHtml) || item.publishTime || Date.now();
  return {
    ...item,
    cover: extractCover(detailHtml, item.link),
    summary: buildSummaryFromParagraphs(contentBlocks, item.title),
    content: buildArticleHtml(contentBlocks),
    contentText,
    contentBlocks,
    paragraphCount: contentBlocks.length,
    contentLength: contentText.length,
    time: formatDate(publishTime),
    publishTime,
    themeCategory: qualify.themeCategory,
    themeScore: qualify.themeScore,
    extractionStatus: 'fulltext'
  };
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

    return buildEnrichedNewsItem(item, detailHtml);
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
        message: '未找到生态相关新闻'
      };
    }

    const enrichedNews = await enrichNewsItems(uniqueNews);
    if (!enrichedNews.length) {
      return {
        success: false,
        message: '详情页抽取后没有符合主题的新闻'
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
        migratoryBirdCount: enrichedNews.filter((item) => item.themeCategory === 'migratory-bird').length,
        ecologyCount: enrichedNews.filter((item) => item.themeCategory === 'ecology').length,
        coverCount: enrichedNews.filter((item) => item.cover).length,
        fullTextCount: enrichedNews.filter((item) => item.extractionStatus === 'fulltext').length,
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
