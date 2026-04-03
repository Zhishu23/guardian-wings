'use strict';

const db = uniCloud.database();
const collection = db.collection('news');

async function triggerCrawler() {
  const result = await uniCloud.callFunction({
    name: 'gw-news-crawler'
  });

  return result.result || {
    success: false,
    message: '新闻更新失败'
  };
}

async function getNewsList(event) {
  const page = Math.max(Number(event.page) || 1, 1);
  const pageSize = Math.min(Math.max(Number(event.pageSize) || 10, 1), 50);
  const tag = event.tag || '';

  let query = collection.orderBy('createTime', 'desc');
  let countQuery = collection;

  if (tag) {
    const condition = { tag };
    query = query.where(condition);
    countQuery = countQuery.where(condition);
  }

  const [listRes, countRes] = await Promise.all([
    query.skip((page - 1) * pageSize).limit(pageSize).get(),
    countQuery.count()
  ]);

  const data = (listRes.result && listRes.result.data) || listRes.data || [];
  const total = (countRes.result && countRes.result.total) || countRes.total || 0;

  return {
    success: true,
    data,
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total
  };
}

async function deleteNews(event) {
  const id = event.id;
  if (!id) {
    throw new Error('缺少新闻 ID');
  }

  await collection.doc(id).remove();

  return {
    success: true,
    message: '新闻删除成功'
  };
}

exports.main = async (event) => {
  const action = event.action;

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
    console.error('news admin failed:', error);
    return {
      success: false,
      message: error.message || '操作失败'
    };
  }
};

