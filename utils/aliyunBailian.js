// 阿里云百炼API服务（通过云函数调用）
class AliyunBailianService {
  constructor() {
    this.conversationHistory = {};
  }

  // 发送消息到阿里云百炼（通过云函数）
  async sendMessage(expertId, message, conversationId = null) {
    try {
      // 如果没有conversationId，创建一个新的会话
      if (!conversationId) {
        conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }

      // 获取或初始化会话历史
      if (!this.conversationHistory[conversationId]) {
        this.conversationHistory[conversationId] = [];
      }

      // 添加用户消息到历史记录
      this.conversationHistory[conversationId].push({
        role: 'user',
        content: message
      });

      // 调用云函数，增加超时时间
      const result = await uniCloud.callFunction({
        name: 'gw-ai-assistant',
        data: {
          expertId,
          message,
          conversationId
        },
        timeout: 40000 // 40秒超时
      });

      // 处理云函数返回结果
      if (result.result && result.result.success) {
        // 添加AI回复到历史记录
        this.conversationHistory[conversationId].push({
          role: 'assistant',
          content: result.result.data
        });
        
        return {
          success: true,
          data: result.result.data,
          conversationId: result.result.conversationId
        };
      } else {
        throw new Error(result.result?.error || '云函数调用失败');
      }
    } catch (error) {
      console.error('阿里云百炼API调用失败:', error);
      return {
        success: false,
        error: error.message || '未知错误'
      };
    }
  }

  // 获取会话历史
  getConversationHistory(conversationId) {
    return this.conversationHistory[conversationId] || [];
  }

  // 清空会话历史
  clearConversationHistory(conversationId) {
    if (this.conversationHistory[conversationId]) {
      delete this.conversationHistory[conversationId];
    }
  }
}

// 创建单例实例
const aliyunBailianService = new AliyunBailianService();

export default aliyunBailianService;
