'use strict'

const db = uniCloud.database()
const dbCmd = db.command

exports.main = async (event, context) => {
  const { action, params = {} } = event

  switch (action) {
    case 'getBirdList':     return await getBirdList(params)
    case 'getBirdDetail':   return await getBirdDetail(params)
    case 'toggleFavorite':  return await toggleFavorite(params)
    case 'getMyFavorites':  return await getMyFavorites(params)
    case 'searchBirds':     return await searchBirds(params)
	case 'getLaws':         return await getLaws(params)
    default:
      return { code: 404, msg: `未知 action: ${action}` }
  }
}

// ─────────────────────────────────────────────
// 1. 获取鸟类列表（分页 + 保护级别筛选 + 关键词）
// ─────────────────────────────────────────────
async function getBirdList(params) {
  const { page = 1, pageSize = 20, protectionLevel, keyword } = params

  try {
    let whereClause = {}

    if (protectionLevel && protectionLevel !== 'all') {
      whereClause.protectionLevel = protectionLevel
    }

    if (keyword && keyword.trim()) {
      // uniCloud 支持正则模糊查询
      const reg = new RegExp(keyword.trim(), 'i')
      whereClause = dbCmd.or([
        { ...whereClause, name: dbCmd.regex({ regexp: keyword.trim(), options: 'i' }) },
        { ...whereClause, scientificName: dbCmd.regex({ regexp: keyword.trim(), options: 'i' }) }
      ])
    }

    const query = keyword && keyword.trim()
      ? db.collection('birds').where(whereClause)
      : db.collection('birds').where(whereClause)

    const countRes = await query.count()
    const total = countRes.total

    const listRes = await query
      .orderBy('protectionLevel', 'asc')
      .orderBy('name', 'asc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    return {
      code: 0,
      data: {
        list:    listRes.data,
        total,
        page,
        pageSize,
        hasMore: page * pageSize < total
      }
    }
  } catch (e) {
    console.error('getBirdList error:', e)
    return { code: 500, msg: '获取列表失败', error: e.message }
  }
}

// ─────────────────────────────────────────────
// 2. 获取鸟类详情
// ─────────────────────────────────────────────
async function getBirdDetail(params) {
  const { birdId } = params

  if (!birdId) return { code: 400, msg: '缺少 birdId' }

  try {
    const res = await db.collection('birds').doc(birdId).get()

    if (!res.data || res.data.length === 0) {
      return { code: 404, msg: '鸟类信息不存在' }
    }

    return { code: 0, data: res.data[0] }
  } catch (e) {
    console.error('getBirdDetail error:', e)
    return { code: 500, msg: '获取详情失败', error: e.message }
  }
}

// ─────────────────────────────────────────────
// 3. 收藏 / 取消收藏（toggle）
// ─────────────────────────────────────────────
async function toggleFavorite(params) {
  const { userId, birdId } = params

  if (!userId) return { code: 400, msg: '用户未登录' }
  if (!birdId) return { code: 400, msg: '缺少 birdId' }

  try {
    const existRes = await db.collection('user_favorites')
      .where({ userId, birdId })
      .limit(1)
      .get()

    if (existRes.data && existRes.data.length > 0) {
      // 已收藏 → 取消
      await db.collection('user_favorites').doc(existRes.data[0]._id).remove()
      return { code: 0, msg: '已取消收藏', isFavorite: false }
    } else {
      // 未收藏 → 添加
      await db.collection('user_favorites').add({
        userId,
        birdId,
        createTime: Date.now()
      })
      return { code: 0, msg: '收藏成功', isFavorite: true }
    }
  } catch (e) {
    console.error('toggleFavorite error:', e)
    return { code: 500, msg: '操作失败', error: e.message }
  }
}

// ─────────────────────────────────────────────
// 4. 获取我的收藏列表
// ─────────────────────────────────────────────
async function getMyFavorites(params) {
  const { userId, page = 1, pageSize = 20 } = params

  if (!userId) return { code: 400, msg: '用户未登录' }

  try {
    const countRes = await db.collection('user_favorites').where({ userId }).count()
    const total = countRes.total

    const favRes = await db.collection('user_favorites')
      .where({ userId })
      .orderBy('createTime', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    if (!favRes.data || favRes.data.length === 0) {
      return { code: 0, data: { list: [], total: 0, hasMore: false } }
    }

    // 批量查询鸟类详情
    const birdIds = favRes.data.map(item => item.birdId)
    const birdsRes = await db.collection('birds')
      .where({ _id: dbCmd.in(birdIds) })
      .get()

    // 合并收藏时间到鸟类数据
    const birdsMap = {}
    birdsRes.data.forEach(bird => { birdsMap[bird._id] = bird })

    const list = favRes.data.map(fav => ({
      favoriteId:  fav._id,
      createTime:  fav.createTime,
      ...( birdsMap[fav.birdId] || { _id: fav.birdId, name: '未知鸟类' } )
    }))

    return {
      code: 0,
      data: {
        list,
        total,
        page,
        pageSize,
        hasMore: page * pageSize < total
      }
    }
  } catch (e) {
    console.error('getMyFavorites error:', e)
    return { code: 500, msg: '获取收藏失败', error: e.message }
  }
}

// ─────────────────────────────────────────────
// 5. 搜索鸟类（名称 + 科学名 模糊匹配）
// ─────────────────────────────────────────────
    async function searchBirds(params) {
      const { keyword, page = 1, pageSize = 20 } = params
      if (!keyword || !keyword.trim()) {
        return { code: 400, msg: '请输入搜索关键词' }
      }
      try {
        const kw = keyword.trim().toLowerCase()
        // 先拉全部数据，再在JS里过滤（数据量小时完全够用）
        const res = await db.collection('birds').limit(100).get()
        const filtered = res.data.filter(bird =>
          (bird.name         && bird.name.toLowerCase().includes(kw)) ||
          (bird.scientificName && bird.scientificName.toLowerCase().includes(kw)) ||
          (bird.habitat      && bird.habitat.toLowerCase().includes(kw))
        )
        return {
          code: 0,
          data: { list: filtered, total: filtered.length, hasMore: false }
        }
      } catch (e) {
        console.error('searchBirds error:', e)
        return { code: 500, msg: '搜索失败', error: e.message }
      }
    }
	
	async function getLaws(params) {
	  const { page = 1, pageSize = 15, category, keyword } = params
	  try {
	    let query = db.collection('laws')
	    if (category && category !== 'all') {
	      query = query.where({ category })
	    }
	    const res = await query
	      .orderBy('articleNo', 'asc')
	      .skip((page - 1) * pageSize)
	      .limit(100)
	      .get()
	    let list = res.data
	    if (keyword && keyword.trim()) {
	      const kw = keyword.trim()
	      list = list.filter(l =>
	        (l.title && l.title.includes(kw)) ||
	        (l.content && l.content.includes(kw)) ||
	        (l.articleNo && l.articleNo.includes(kw))
	      )
	    }
	    return { code: 0, data: { list, total: list.length, hasMore: false } }
	  } catch (e) {
	    console.error('getLaws error:', e)
	    return { code: 500, msg: '获取法条失败', error: e.message }
	  }
	}