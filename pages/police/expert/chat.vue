<template>
  <view class="chat-page">
    <!-- 状态栏 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }" />

    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-left">
        <view class="back-btn" @click="goBack">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18l-6-6 6-6" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
          </svg>
        </view>
        <view class="expert-info">
          <view class="expert-avatar-small">
            <view class="avatar-placeholder-small">
              <text class="avatar-text-small">{{ expertName.charAt(0) }}</text>
            </view>
            <view class="status-dot online" />
          </view>
          <view class="info-text">
            <text class="expert-name-nav">{{ expertName }}</text>
            <text class="expert-status">在线</text>
          </view>
        </view>
      </view>
      <view class="navbar-actions">
        <view class="action-icon" @click="showMenu">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="5" r="2" fill="#FFFFFF"/>
            <circle cx="12" cy="12" r="2" fill="#FFFFFF"/>
            <circle cx="12" cy="19" r="2" fill="#FFFFFF"/>
          </svg>
        </view>
      </view>
    </view>

    <!-- 消息列表 -->
    <scroll-view 
      class="message-list"
      scroll-y
      :scroll-into-view="scrollToView"
      :show-scrollbar="false"
    >
      <view 
        v-for="(msg, index) in messageList" 
        :key="index"
        :id="'msg-' + index"
        class="message-item"
        :class="msg.type"
      >
        <view v-if="msg.type === 'time'" class="time-divider">
          <text>{{ msg.content }}</text>
        </view>

        <view v-else-if="msg.type === 'received'" class="message-wrapper received">
          <view class="avatar">
            <view class="avatar-placeholder-msg">
              <text class="avatar-text-msg">{{ expertName.charAt(0) }}</text>
            </view>
          </view>
          <view class="message-content">
            <view class="message-bubble received-bubble">
              <text class="message-text">{{ msg.content }}</text>
            </view>
            <text class="message-time">{{ msg.time }}</text>
          </view>
        </view>

        <view v-else-if="msg.type === 'sent'" class="message-wrapper sent">
          <view class="message-content">
            <view class="message-bubble sent-bubble">
              <text class="message-text">{{ msg.content }}</text>
            </view>
            <text class="message-time">{{ msg.time }}</text>
          </view>
          <view class="avatar">
            <view class="avatar-placeholder-msg user-avatar">
              <text class="avatar-text-msg">我</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 占位元素，用于滚动到底部 -->
      <view id="msg-bottom" class="message-bottom" />
    </scroll-view>

    <!-- 快捷问题 -->
    <view class="quick-questions" v-if="showQuickQuestions">
      <text class="quick-title">快捷问题</text>
      <scroll-view class="questions-scroll" scroll-x :show-scrollbar="false">
        <view 
          v-for="(question, index) in quickQuestions" 
          :key="index"
          class="question-chip"
          @click="sendQuickQuestion(question)"
        >
          <text>{{ question }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 输入区域 -->
    <view class="input-area">
      <view class="input-wrapper">
        <input 
          class="message-input"
          v-model="inputMessage"
          placeholder="输入您的问题..."
          confirm-type="send"
          @confirm="sendMessage"
        />
        <view class="input-actions">
          <view class="action-btn" @click="showEmoji">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="none" stroke="#9CA3AF" stroke-width="2"/>
              <circle cx="8" cy="10" r="1.5" fill="#9CA3AF"/>
              <circle cx="16" cy="10" r="1.5" fill="#9CA3AF"/>
              <path d="M8 14c1 2 3 3 4 3s3-1 4-3" stroke="#9CA3AF" stroke-width="2" fill="none" stroke-linecap="round"/>
            </svg>
          </view>
          <view class="action-btn" @click="chooseImage">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="#9CA3AF"/>
            </svg>
          </view>
        </view>
      </view>
      <view 
        class="send-btn"
        :class="{ 'active': inputMessage.length > 0 }"
        @click="sendMessage"
      >
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/>
        </svg>
      </view>
    </view>
  </view>
</template>

<script>
import aliyunBailianService from '@/utils/aliyunBailian.js';

export default {
  name: 'ExpertChat',
  
  data() {
    return {
      statusBarHeight: 0,
      expertId: '',
      expertName: '',
      isAgent: false,
      inputMessage: '',
      scrollToView: '',
      showQuickQuestions: true,
      isLoading: false,
      conversationId: null,
      
      quickQuestions: [
        '如何处理现场证据？',
        '法律程序咨询',
        '案件分析建议',
        '技术支持'
      ],
      
      messageList: [
        {
          type: 'time',
          content: '12:10'
        },
        {
          type: 'received',
          content: '您好！我是张伟专家，高级刑侦顾问。很高兴为您提供服务，请问有什么可以帮助您的？',
          time: '12:10'
        }
      ]
    }
  },
  
  onLoad(options) {
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight
    
    this.expertId = options.expertId || 'E001'
    this.expertName = decodeURIComponent(options.expertName || '专家')
    this.isAgent = options.isAgent === 'true'
    
    // 根据专家类型设置初始消息
    this.setInitialMessage()
    
    // 延迟滚动到底部
    setTimeout(() => {
      this.scrollToBottom()
    }, 300)
  },
  
  methods: {
    goBack() {
      uni.navigateBack()
    },
    
    scrollToBottom() {
      this.scrollToView = 'msg-bottom'
      setTimeout(() => {
        this.scrollToView = ''
      }, 100)
    },
    
    async sendMessage() {
      if (!this.inputMessage.trim()) {
        return
      }
      
      this.showQuickQuestions = false
      
      // 添加用户消息
      this.messageList.push({
        type: 'sent',
        content: this.inputMessage,
        time: this.getCurrentTime()
      })
      
      const userMessage = this.inputMessage
      this.inputMessage = ''
      
      this.$nextTick(() => {
        this.scrollToBottom()
      })
      
      // 如果是AI智能体，调用阿里云百炼API
      if (this.isAgent) {
        await this.callAIAPI(userMessage)
      } else {
        // 真人专家使用模拟回复
        setTimeout(() => {
          this.messageList.push({
            type: 'received',
            content: this.getAutoReply(userMessage),
            time: this.getCurrentTime()
          })
          
          this.$nextTick(() => {
            this.scrollToBottom()
          })
        }, 1000)
      }
    },
    
    // 设置初始消息
    setInitialMessage() {
      if (this.isAgent) {
        const welcomeMessages = {
          'A001': '您好！我是法律助手，专注于野生动物保护法和刑事程序咨询。有什么法律问题需要帮助吗？',
          'A002': '您好！我是生态助手，擅长鸟类鉴别和生态分析。请问有什么生态相关的问题需要咨询？'
        }
        
        this.messageList = [
          {
            type: 'time',
            content: this.getCurrentTime()
          },
          {
            type: 'received',
            content: welcomeMessages[this.expertId] || '您好！我是AI助手，很高兴为您提供服务。请问有什么可以帮助您的？',
            time: this.getCurrentTime()
          }
        ]
      }
    },
    
    // 调用阿里云百炼API
    async callAIAPI(message) {
      this.isLoading = true
      
      try {
        // 调用阿里云百炼API
        const result = await aliyunBailianService.sendMessage(
          this.expertId,
          message,
          this.conversationId
        )
        
        if (result.success) {
          // 更新会话ID
          this.conversationId = result.conversationId
          
          // 添加AI回复
          this.messageList.push({
            type: 'received',
            content: result.data,
            time: this.getCurrentTime()
          })
        } else {
          // API调用失败，使用备用回复
          this.messageList.push({
            type: 'received',
            content: '抱歉，AI服务暂时不可用。请稍后再试，或尝试其他问题。',
            time: this.getCurrentTime()
          })
        }
      } catch (error) {
        console.error('AI API调用失败:', error)
        this.messageList.push({
          type: 'received',
          content: '抱歉，服务出现异常。请稍后再试。',
          time: this.getCurrentTime()
        })
      } finally {
        this.isLoading = false
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      }
    },
    
    sendQuickQuestion(question) {
      this.inputMessage = question
      this.sendMessage()
    },
    
    getCurrentTime() {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      return hours + ':' + minutes
    },
    
    getAutoReply(message) {
      const replies = {
        '证据': '关于现场证据处理，建议您：1. 及时封存现场 2. 拍摄全景照片 3. 标记关键证物 4. 填写证据采集表。具体操作可参考《现场勘查规范》。',
        '法律': '根据《刑事诉讼法》相关规定，建议您先确认案件性质，然后按照标准流程进行。如需详细法律条文，我可以为您查询。',
        '分析': '案件分析需要综合多方面信息。请提供：1. 案发时间地点 2. 涉案人员情况 3. 现有证据清单。我会为您进行专业分析。',
        '技术': '技术支持方面，我们可以协助：1. 电子取证 2. 数据恢复 3. 视频分析。请详细说明您遇到的技术问题。'
      }
      
      for (let key in replies) {
        if (message.includes(key)) {
          return replies[key]
        }
      }
      
      return '收到您的问题，我正在为您分析。如果需要更详细的解答，请提供更多案件信息。您也可以直接拨打技术支持热线：12345。'
    },
    
    showEmoji() {
      uni.showToast({
        title: '表情功能开发中',
        icon: 'none'
      })
    },
    
    chooseImage() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          uni.showToast({
            title: '图片已选择',
            icon: 'success'
          })
          
          // 添加图片消息
          this.messageList.push({
            type: 'sent',
            content: '[图片]',
            time: this.getCurrentTime(),
            image: res.tempFilePaths[0]
          })
          
          this.$nextTick(() => {
            this.scrollToBottom()
          })
        }
      })
    },
    
    showMenu() {
      uni.showActionSheet({
        itemList: ['查看专家资料', '结束咨询', '评价专家'],
        success: (res) => {
          if (res.tapIndex === 1) {
            this.endConsultation()
          }
        }
      })
    },
    
    endConsultation() {
      uni.showModal({
        title: '结束咨询',
        content: '确定要结束本次咨询吗？',
        success: (res) => {
          if (res.confirm) {
            uni.navigateBack()
          }
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.chat-page {
  min-height: 100vh;
  background: #0F172A;
  display: flex;
  flex-direction: column;
}

.status-bar {
  background: transparent;
}

/* 导航栏 */
.custom-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 24rpx;
  background: linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%);
  box-shadow: 0 4rpx 16rpx rgba(30,58,138,0.3);
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
}

.back-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.15);
  border-radius: 50%;
}

.back-btn svg {
  width: 32rpx;
  height: 32rpx;
}

.expert-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
}

.expert-avatar-small {
  width: 72rpx;
  height: 72rpx;
  position: relative;
}

.avatar-placeholder-small {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid rgba(255,255,255,0.3);
}

.avatar-text-small {
  font-size: 28rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.status-dot {
  position: absolute;
  bottom: 2rpx;
  right: 2rpx;
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  border: 2rpx solid #1E3A8A;
}

.status-dot.online {
  background: #10B981;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(16,185,129,0.7);
  }
  50% {
    box-shadow: 0 0 0 6rpx rgba(16,185,129,0);
  }
}

.info-text {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.expert-name-nav {
  font-size: 30rpx;
  font-weight: 600;
  color: #FFFFFF;
}

.expert-status {
  font-size: 22rpx;
  color: rgba(255,255,255,0.8);
}

.navbar-actions {
  display: flex;
  gap: 16rpx;
}

.action-icon {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.15);
  border-radius: 50%;
}

.action-icon svg {
  width: 28rpx;
  height: 28rpx;
}

/* 消息列表 */
.message-list {
  flex: 1;
  padding: 24rpx;
  height: calc(100vh - 300rpx);
}

.message-item {
  margin-bottom: 24rpx;
}

.time-divider {
  display: flex;
  justify-content: center;
  margin: 32rpx 0;
}

.time-divider text {
  padding: 8rpx 20rpx;
  background: rgba(255,255,255,0.1);
  border-radius: 20rpx;
  font-size: 22rpx;
  color: rgba(255,255,255,0.6);
}

.message-wrapper {
  display: flex;
  gap: 16rpx;
}

.message-wrapper.received {
  justify-content: flex-start;
}

.message-wrapper.sent {
  justify-content: flex-end;
}

.avatar {
  width: 72rpx;
  height: 72rpx;
  flex-shrink: 0;
}

.avatar-placeholder-msg {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-placeholder-msg.user-avatar {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
}

.avatar-text-msg {
  font-size: 24rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.message-content {
  max-width: 480rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.message-wrapper.received .message-content {
  align-items: flex-start;
}

.message-wrapper.sent .message-content {
  align-items: flex-end;
}

.message-bubble {
  padding: 20rpx 24rpx;
  border-radius: 20rpx;
  animation: bubbleIn 0.3s ease-out;
}

@keyframes bubbleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.received-bubble {
  background: rgba(255,255,255,0.1);
  border-top-left-radius: 4rpx;
}

.sent-bubble {
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  border-top-right-radius: 4rpx;
}

.message-text {
  font-size: 28rpx;
  color: #FFFFFF;
  line-height: 1.6;
  word-break: break-all;
}

.message-time {
  font-size: 20rpx;
  color: rgba(255,255,255,0.5);
}

.message-bottom {
  height: 20rpx;
}

/* 快捷问题 */
.quick-questions {
  padding: 20rpx 24rpx;
  background: rgba(255,255,255,0.05);
  border-top: 1rpx solid rgba(255,255,255,0.1);
}

.quick-title {
  font-size: 22rpx;
  color: rgba(255,255,255,0.7);
  display: block;
  margin-bottom: 16rpx;
}

.questions-scroll {
  white-space: nowrap;
}

.question-chip {
  display: inline-block;
  padding: 16rpx 28rpx;
  background: rgba(59,130,246,0.2);
  border: 1rpx solid rgba(59,130,246,0.3);
  border-radius: 40rpx;
  margin-right: 16rpx;
  font-size: 24rpx;
  color: #93C5FD;
  transition: all 0.3s;
}

.question-chip:active {
  background: rgba(59,130,246,0.3);
  transform: scale(0.95);
}

/* 输入区域 */
.input-area {
  display: flex;
  align-items: flex-end;
  gap: 16rpx;
  padding: 20rpx 24rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: rgba(15,23,42,0.98);
  backdrop-filter: blur(20rpx);
  border-top: 1rpx solid rgba(255,255,255,0.1);
}

.input-wrapper {
  flex: 1;
  background: rgba(255,255,255,0.1);
  border-radius: 24rpx;
  padding: 16rpx 20rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.message-input {
  flex: 1;
  font-size: 28rpx;
  color: #FFFFFF;
  line-height: 1.5;
}

.input-actions {
  display: flex;
  gap: 12rpx;
}

.action-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn svg {
  width: 100%;
  height: 100%;
}

.send-btn {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.1);
  border-radius: 50%;
  color: rgba(255,255,255,0.5);
  transition: all 0.3s;
}

.send-btn.active {
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  color: #FFFFFF;
  box-shadow: 0 8rpx 24rpx rgba(59,130,246,0.4);
}

.send-btn svg {
  width: 40rpx;
  height: 40rpx;
}
</style>