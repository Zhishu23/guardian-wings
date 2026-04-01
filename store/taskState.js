// store/taskState.js
// 警务端任务中心状态管理（响应式对象 + actions）
import Vue from 'vue'

// ─────────────────────────────────────────────
// 响应式状态
// ─────────────────────────────────────────────
const taskState = Vue.observable({
  activeTab: 'all',
  loading: false,
  pullDownRefresh: false,

  taskList: [],
  warningList: [],

  statistics: {
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0
  },

  // 分页
  page: 1,
  pageSize: 15,
  hasMore: true
})

// ─────────────────────────────────────────────
// 从 Vuex store 获取当前警员信息
// ─────────────────────────────────────────────
function getPoliceInfo() {
  try {
    const raw = uni.getStorageSync('gw_police_info')
    return raw ? JSON.parse(raw) : {}
  } catch (e) {
    return {}
  }
}

// ─────────────────────────────────────────────
// 调用 gw-police 云函数
// ─────────────────────────────────────────────
async function callPolice(action, params = {}) {
  return new Promise((resolve) => {
    uniCloud.callFunction({
      name: 'gw-police',
      data: { action, params }
    }).then(res => {
      resolve(res.result)
    }).catch(e => {
      console.error(`gw-police/${action} error:`, e)
      resolve({ code: 500, msg: '网络异常' })
    })
  })
}

// ─────────────────────────────────────────────
// 本地模拟数据（云函数无数据时使用）
// ─────────────────────────────────────────────
function getMockTasks() {
  return [
    {
      id: 'MOCK-001',
      title: '东城区湿地非法捕猎举报核查',
      description: '群众举报发现有人在东城区湿地保护区内设置捕猎装置，需前往现场核查并取证。',
      status: 'pending',
      priority: 'high',
      location: '东城区湿地保护区',
      reporter: '张警官',
      time: '2025-12-25',
      report_id: ''
    },
    {
      id: 'MOCK-002',
      title: '候鸟迁徙路线巡逻任务',
      description: '按照季节性保护计划，对候鸟主要迁徙路线进行日常巡逻，记录鸟类活动情况。',
      status: 'processing',
      priority: 'medium',
      location: '城北湿地走廊',
      reporter: '李队长',
      time: '2025-12-26',
      report_id: ''
    },
    {
      id: 'MOCK-003',
      title: '非法鸟类交易市场排查',
      description: '根据情报线索，对辖区内可疑市场进行例行排查，重点关注受保护鸟类的非法交易。',
      status: 'pending',
      priority: 'high',
      location: '花鸟市场周边区域',
      reporter: '王队长',
      time: '2025-12-24',
      report_id: ''
    },
    {
      id: 'MOCK-004',
      title: '栖息地破坏现场勘查',
      description: '接到举报，某建筑工地疑似侵占保护鸟类栖息地，需现场勘查取证。',
      status: 'completed',
      priority: 'low',
      location: '南区建设路工地',
      reporter: '赵警官',
      time: '2025-12-22',
      report_id: ''
    }
  ]
}

function getMockWarnings() {
  return [
    {
      id: 'W001',
      level: 'high',
      title: '非法捕猎警报',
      content: '东城区湿地发现疑似非法捕猎装置，请立即前往处置。',
      time: '10分钟前',
      expireTime: '2025-12-25 23:59:00'
    }
  ]
}

// ─────────────────────────────────────────────
// Actions
// ─────────────────────────────────────────────
export const taskActions = {

  // 初始化（首次加载）
  async initTasks() {
    if (taskState.loading) return
    taskState.loading = true
    taskState.page = 1

    try {
      const police = getPoliceInfo()

      // 并行请求：任务列表 + 统计数据
      const [listRes, dashRes] = await Promise.all([
        callPolice('getTaskList', {
          assignee_id: police.officer_id || '',
          page: 1,
          pageSize: taskState.pageSize
        }),
        callPolice('getDashboard', {
          officer_id: police.officer_id || 'GW-DEFAULT'
        })
      ])

      // 任务列表
      if (listRes.code === 0 && listRes.data && listRes.data.list && listRes.data.list.length > 0) {
        taskState.taskList = listRes.data.list.map(t => formatTask(t))
        taskState.hasMore = listRes.data.hasMore
      } else {
        // 无云端数据时使用模拟数据
        taskState.taskList = getMockTasks()
        taskState.hasMore = false
      }

      // 统计数据
      if (dashRes.code === 0 && dashRes.data) {
        taskState.statistics = {
          total: taskState.taskList.length,
          pending: dashRes.data.myPendingTasks || 0,
          processing: dashRes.data.myOngoingTasks || 0,
          completed: taskState.taskList.filter(t => t.status === 'completed').length
        }
      } else {
        // 本地统计
        recalcStats()
      }

      // 警报（暂用模拟数据，后续可接入gw-police警报接口）
      taskState.warningList = getMockWarnings()

    } catch (e) {
      console.error('initTasks error:', e)
      taskState.taskList = getMockTasks()
      taskState.warningList = getMockWarnings()
      recalcStats()
    } finally {
      taskState.loading = false
    }
  },

  // 下拉刷新
  async refreshTasks() {
    taskState.pullDownRefresh = true
    taskState.page = 1
    taskState.hasMore = true

    try {
      const police = getPoliceInfo()
      const res = await callPolice('getTaskList', {
        assignee_id: police.officer_id || '',
        page: 1,
        pageSize: taskState.pageSize
      })

      if (res.code === 0 && res.data && res.data.list && res.data.list.length > 0) {
        taskState.taskList = res.data.list.map(t => formatTask(t))
        taskState.hasMore = res.data.hasMore
      } else {
        taskState.taskList = getMockTasks()
        taskState.hasMore = false
      }
      recalcStats()
    } catch (e) {
      taskState.taskList = getMockTasks()
      recalcStats()
    } finally {
      taskState.pullDownRefresh = false
    }
  },

  // 上拉加载更多
  async loadMoreTasks() {
    if (!taskState.hasMore || taskState.loading) return
    taskState.loading = true

    try {
      const police = getPoliceInfo()
      const nextPage = taskState.page + 1
      const res = await callPolice('getTaskList', {
        assignee_id: police.officer_id || '',
        page: nextPage,
        pageSize: taskState.pageSize
      })

      if (res.code === 0 && res.data && res.data.list) {
        taskState.taskList = [...taskState.taskList, ...res.data.list.map(t => formatTask(t))]
        taskState.page = nextPage
        taskState.hasMore = res.data.hasMore
        recalcStats()
      }
    } catch (e) {
      console.error('loadMoreTasks error:', e)
    } finally {
      taskState.loading = false
    }
  },

  // 切换 Tab
  switchTab(tab) {
    taskState.activeTab = tab
  },

  // 更新任务状态（本地 + 云端）
  async updateTaskStatus(taskId, newStatus) {
    // 先更新本地
    const task = taskState.taskList.find(t => t.id === taskId)
    if (task) {
      task.status = newStatus
      recalcStats()
    }

    // 再同步到云端
    const statusMap = { 'pending': 0, 'processing': 1, 'completed': 2, 'closed': 3 }
    const statusNum = statusMap[newStatus]
    if (statusNum !== undefined) {
      await callPolice('updateTaskStatus', { taskId, status: statusNum })
    }
  }
}

// ─────────────────────────────────────────────
// 工具函数
// ─────────────────────────────────────────────

// 格式化云端任务数据 → 前端所需格式
function formatTask(t) {
  const statusMap = { 0: 'pending', 1: 'processing', 2: 'completed', 3: 'closed' }
  const priorityMap = { urgent: 'high', high: 'high', normal: 'medium', low: 'low' }

  return {
    id: t._id || t.id,
    title: t.title || '未命名任务',
    description: t.description || '',
    status: statusMap[t.status] || 'pending',
    priority: priorityMap[t.priority] || 'medium',
    location: t.location || '未指定地点',
    reporter: t.assignee_name || t.creator_name || '未分配',
    time: t.due_date ? formatDate(t.due_date) : formatDate(t.create_time),
    report_id: t.report_id || ''
  }
}

function formatDate(ts) {
  if (!ts) return '无截止日期'
  const d = new Date(ts)
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

function recalcStats() {
  const list = taskState.taskList
  taskState.statistics = {
    total: list.length,
    pending: list.filter(t => t.status === 'pending').length,
    processing: list.filter(t => t.status === 'processing').length,
    completed: list.filter(t => t.status === 'completed').length
  }
}

export default taskState