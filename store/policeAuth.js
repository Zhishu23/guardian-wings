/**
 * @module PoliceAuth
 * @description 警务人员认证状态管理
 * @security 包含Token管理、权限验证、会话保持
 */

import Vue from 'vue'

const authState = Vue.observable({
  // 用户信息
  userInfo: null,
  
  // 认证Token
  token: '',
  
  // 是否已登录
  isLoggedIn: false,
  
  // 权限列表
  permissions: [],
  
  // 部门信息
  department: null
})

export const authActions = {
  /**
   * 登录
   */
  async login(credentials) {
    try {
      // 【安全区域】此处应使用国密算法加密传输
      // import { SM4Encrypt } from '@/utils/encryption.js'
      // const encryptedData = SM4Encrypt(JSON.stringify(credentials))
      
      // 模拟登录请求
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // 模拟返回数据
      const mockUserInfo = {
        id: 'P20240001',
        name: '张警官',
        policeId: credentials.policeId,
        department: credentials.department,
        rank: '三级警督',
        avatar: '/static/images/default-avatar.png',
        phone: '138****5678'
      }
      
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_token'
      
      authState.userInfo = mockUserInfo
      authState.token = mockToken
      authState.isLoggedIn = true
      authState.department = credentials.department
      authState.permissions = ['task:view', 'task:update', 'case:create']
      
      // 存储到本地
      uni.setStorageSync('police_token', mockToken)
      uni.setStorageSync('police_user', mockUserInfo)
      
      return { success: true, data: mockUserInfo }
      
    } catch (error) {
      console.error('[PoliceAuth] 登录失败:', error)
      return { success: false, message: '登录失败' }
    }
  },
  
  /**
   * 退出登录
   */
  logout() {
    authState.userInfo = null
    authState.token = ''
    authState.isLoggedIn = false
    authState.permissions = []
    authState.department = null
    
    uni.removeStorageSync('police_token')
    uni.removeStorageSync('police_user')
  },
  
  /**
   * 检查登录状态
   */
  checkAuth() {
    const token = uni.getStorageSync('police_token')
    const user = uni.getStorageSync('police_user')
    
    if (token && user) {
      authState.token = token
      authState.userInfo = user
      authState.isLoggedIn = true
      return true
    }
    
    return false
  },
  
  /**
   * 验证权限
   */
  hasPermission(permission) {
    return authState.permissions.includes(permission)
  }
}

export default authState