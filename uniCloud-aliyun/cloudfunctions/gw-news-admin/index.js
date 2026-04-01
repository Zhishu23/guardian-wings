// 新闻管理云函数
'use strict';

// 手动触发爬虫任务
async function triggerCrawler() {
  try {
    const result = await uniCloud.callFunction({
      name: 'gw-news-crawler'
    });
    return result.result;
  } catch (error) {
    throw new Error(`触发爬虫任务失败: ${error.message}`);
  }
}

// 获取新闻列表
async function getNewsList(event) {
  try {
    const db = uniCloud.database();
    const { page = 1, pageSize = 10, tag } = event;
    
    let query = db.collection('news').orderBy('createTime', 'desc');
    
    if (tag) {
      query = query.where({ tag });
    }
    
    const result = await query.skip((page - 1) * pageSize).limit(pageSize).get();
    
    return {
      success: true,
      data: result.result.data,
      total: result.result.total || 0
    };
  } catch (error) {
    throw new Error(`获取新闻列表失败: ${error.message}`);
  }
}

// 删除新闻
async function deleteNews(event) {
  try {
    const db = uniCloud.database();
    const { id } = event;
    
    if (!id) {
      throw new Error('缺少新闻ID');
    }
    
    const result = await db.collection('news').doc(id).remove();
    
    return {
      success: true,
      message: '新闻删除成功'
    };
  } catch (error) {
    throw new Error(`删除新闻失败: ${error.message}`);
  }
}

// 主函数
exports.main = async (event, context) => {
  const { action } = event;
  
  try {
    switch (action) {
      case 'triggerCrawler':
        return await triggerCrawler();
      case 'getNewsList':
        return await getNewsList(event);
      case 'deleteNews':
        return await deleteNews(event);
      default:
        throw new Error('未知操作');
    }
  } catch (error) {
    console.error('新闻管理操作失败:', error);
    return {
      success: false,
      message: error.message
    };
  }
};
