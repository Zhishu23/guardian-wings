// 新闻爬虫云函数
'use strict';

const https = require('https');

// 配置
const config = {
  // 爬取源配置
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
  // 关键词过滤
  keywords: [
    '候鸟', '鸟类', '保护', '湿地', '生态', '野生动物',
    '迁徙', '栖息地', '保护区', '环保', '自然保护'
  ],
  // 爬取间隔（毫秒）
  crawlInterval: 1000
};

// HTTP请求函数
function httpGet(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
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
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (error) => {
      reject(error);
    }).on('timeout', () => {
      reject(new Error('请求超时'));
    });
  });
}

// 简单的HTML解析函数（不依赖cheerio）
function parseNews(html, source) {
  const newsItems = [];
  
  // 使用更健壮的正则表达式提取链接和标题
  const linkRegex = /<a[^>]*href\s*=\s*['"]([^'"]+)['"][^>]*>([^<]+)<\/a>/gi;
  let match;
  
  while ((match = linkRegex.exec(html)) !== null) {
    let href = match[1].trim();
    let title = match[2].trim();
    
    // 清理标题中的HTML标签
    title = title.replace(/<[^>]+>/g, '').trim();
    
    // 构建完整的URL
    let fullLink = href;
    if (!href.startsWith('http')) {
      if (href.startsWith('/')) {
        fullLink = `${source.url.replace(/\/$/, '')}${href}`;
      } else {
        fullLink = `${source.url.replace(/\/$/, '')}/${href}`;
      }
    }
    
    // 过滤关键词
    const hasKeyword = config.keywords.some(keyword => 
      title.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (title && title.length > 10 && hasKeyword) {
      newsItems.push({
        title,
        link: fullLink,
        source: source.name,
        time: new Date().toISOString().split('T')[0],
        tag: '新闻'
      });
    }
  }
  
  return newsItems;
}

// 爬取单个网站
async function crawlSource(source) {
  try {
    console.log(`开始爬取: ${source.name}`);
    
    const html = await httpGet(source.url);
    const newsItems = parseNews(html, source);
    
    console.log(`爬取完成: ${source.name}, 找到 ${newsItems.length} 条相关新闻`);
    return newsItems;
  } catch (error) {
    console.error(`爬取 ${source.name} 失败:`, error.message);
    return [];
  }
}

// 生成候鸟保护早报
function generateMorningReport(newsItems) {
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  // 按来源分组
  const newsBySource = {};
  newsItems.forEach(news => {
    if (!newsBySource[news.source]) {
      newsBySource[news.source] = [];
    }
    newsBySource[news.source].push(news);
  });
  
  // 生成HTML内容
  let content = `<h2>候鸟保护早报 - ${dateStr}</h2>`;
  content += '<p>每日精选候鸟保护相关资讯，为您呈现最新动态。</p>';
  
  Object.keys(newsBySource).forEach(source => {
    content += `<h3>${source}</h3>`;
    content += '<ul>';
    
    newsBySource[source].forEach(news => {
      content += `<li><a href="${news.link}" target="_blank">${news.title}</a> - ${news.time}</li>`;
    });
    
    content += '</ul>';
  });
  
  content += `<p><small>本早报由系统自动生成，内容来自各官方媒体</small></p>`;
  
  return {
    title: `候鸟保护早报 ${dateStr}`,
    content: content,
    source: '系统自动生成',
    time: dateStr,
    tag: '新闻'
  };
}

// 主函数
exports.main = async (event, context) => {
  console.log('开始执行新闻爬虫任务');
  
  try {
    // 爬取所有源
    let allNews = [];
    
    for (const source of config.sources) {
      const news = await crawlSource(source);
      allNews = allNews.concat(news);
      
      // 避免请求过快
      await new Promise(resolve => setTimeout(resolve, config.crawlInterval));
    }
    
    // 去重
    const uniqueNews = allNews.filter((item, index, self) =>
      index === self.findIndex(t => t.title === item.title)
    );
    
    console.log(`共找到 ${uniqueNews.length} 条相关新闻`);
    
    if (uniqueNews.length > 0) {
      // 生成早报
      const morningReport = generateMorningReport(uniqueNews);
      
      // 保存到数据库
      const db = uniCloud.database();
      const result = await db.collection('news').add(morningReport);
      
      console.log('早报生成成功:', result);
      
      return {
        success: true,
        message: '候鸟保护早报生成成功',
        data: {
          newsCount: uniqueNews.length,
          reportId: result.id
        }
      };
    } else {
      return {
        success: false,
        message: '未找到相关新闻'
      };
    }
    
  } catch (error) {
    console.error('新闻爬虫执行失败:', error);
    return {
      success: false,
      message: error.message
    };
  }
};
