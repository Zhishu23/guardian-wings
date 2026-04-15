// 阿里云百炼AI助手云函数
'use strict';

const axios = require('axios');

// 阿里云百炼配置
const config = {
  apiKey: 'sk-d5c974ac53884dd3800221e909fbff82', // 阿里云百炼API Key
  apiUrl: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
  model: 'qwen-plus',
  temperature: 0.7,
  top_p: 0.8,
  max_tokens: 1024
};

// 根据专家ID设置不同的系统提示词
const systemPrompts = {
  'A001': '你是一名专业的法律助手，专注于野生动物保护法和刑事程序咨询。请提供专业、准确的法律建议。',
  'A002': '你是一名专业的生态助手，擅长鸟类鉴别和生态分析。请提供专业、准确的生态相关信息。',
  'A003': '你是一名案情推理助手，服务对象是一线警务人员。请基于用户提供的事实、证据、时间地点和人员关系进行结构化推理：先提炼已知事实与待证事实；再梳理时间线并标注冲突点；评估证据链完整性与可信度；给出2-4条最可能的案情假设并说明依据；最后给出可执行的下一步侦查建议。禁止编造证据，信息不足时请明确列出缺口与补充取证清单。'
};

exports.main = async (event, context) => {
  // 设置云函数不等待事件循环为空
  context.callbackWaitsForEmptyEventLoop = false;
  
  const startTime = Date.now();
  const { expertId, message, conversationId } = event;
  
  console.log('云函数开始执行:', { expertId, message, conversationId, startTime });
  
  try {
    // 验证必要参数
    if (!expertId || !message) {
      console.error('参数验证失败:', { expertId, message });
      return {
        success: false,
        error: '缺少必要参数'
      };
    }

    // 获取系统提示词
    const systemPrompt = systemPrompts[expertId] || '你是一名专业的助手，提供准确、专业的回答。';

    // 构建请求数据
    const requestData = {
      model: config.model,
      input: {
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ]
      },
      parameters: {
        temperature: config.temperature,
        top_p: config.top_p,
        max_tokens: config.max_tokens
      }
    };

    console.log('发送请求到阿里云百炼API...');
    
    // 发送请求到阿里云百炼API，设置更长的超时时间
    const apiStartTime = Date.now();
    const response = await axios({
      url: config.apiUrl,
      method: 'POST',
      timeout: 30000, // 30秒超时
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      data: requestData,
      // 添加网络配置
      proxy: false,
      maxRedirects: 5,
      validateStatus: function (status) {
        return status >= 200 && status < 300;
      },
      // 添加网络连接配置
      httpAgent: new (require('http').Agent)({ keepAlive: true }),
      httpsAgent: new (require('https').Agent)({ keepAlive: true })
    });
    
    const apiEndTime = Date.now();
    console.log('API响应状态:', response.status);
    console.log('API调用耗时:', apiEndTime - apiStartTime, 'ms');

    if (response.status === 200) {
      const result = response.data;
      console.log('API响应数据:', JSON.stringify(result, null, 2));
      
      if (result.output && result.output.text) {
        console.log('API调用成功，返回结果');
        const endTime = Date.now();
        console.log('云函数执行完成，总耗时:', endTime - startTime, 'ms');
        return {
          success: true,
          data: result.output.text,
          conversationId: conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
      } else if (result.code) {
        console.error('API返回错误:', result.code, result.message);
        return {
          success: false,
          error: `API错误: ${result.code} - ${result.message || '未知错误'}`
        };
      } else {
        console.error('API响应格式错误:', result);
        return {
          success: false,
          error: 'API响应格式错误'
        };
      }
    } else {
      console.error('API请求失败:', response.status, response.statusText);
      return {
        success: false,
        error: `API请求失败: ${response.status} - ${response.statusText}`
      };
    }
  } catch (error) {
    console.error('阿里云百炼API调用失败:', error);
    console.error('错误详情:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    // 根据错误类型返回不同的错误信息
    if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        error: 'API请求超时，请稍后重试'
      };
    } else if (error.response) {
      return {
        success: false,
        error: `API请求失败: ${error.response.status} - ${error.response.statusText}`
      };
    } else if (error.request) {
      return {
        success: false,
        error: '无法连接到API服务器，请检查网络连接'
      };
    } else {
      return {
        success: false,
        error: error.message || '未知错误'
      };
    }
  }
};
