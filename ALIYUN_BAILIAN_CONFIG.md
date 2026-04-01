# 阿里云百炼API配置指南

## 配置步骤

### 1. 获取阿里云百炼API Key
1. 访问阿里云百炼官网：https://bailian.aliyun.com/
2. 登录您的阿里云账号
3. 创建或选择一个应用
4. 在应用管理中获取API Key

### 2. 配置API密钥
编辑 `utils/aliyunBailian.js` 文件，填写您的API Key：

```javascript
this.config = {
  // 阿里云百炼应用信息
  appKey: '', // 应用Key（可选）
  appSecret: '', // 应用Secret（可选）
  apiKey: 'your-api-key-here', // 在这里填写您的API Key
  // API接口地址
  apiUrl: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
  // 模型配置
  model: 'qwen-plus', // 可以根据需要选择不同的模型
  temperature: 0.7,
  top_p: 0.8
};
```

### 3. 模型选择
阿里云百炼支持多种模型，您可以根据需要选择：
- `qwen-plus`: 通义千问Plus模型
- `qwen-turbo`: 通义千问Turbo模型（更快）
- `qwen-max`: 通义千问Max模型（更强大）

### 4. 系统提示词配置
系统提示词已经根据不同的AI智能体类型进行了配置：
- 法律助手（A001）：专注于野生动物保护法和刑事程序咨询
- 生态助手（A002）：擅长鸟类鉴别和生态分析

您可以根据需要修改 `utils/aliyunBailian.js` 文件中的 `systemPrompts` 对象。

### 5. 测试API
配置完成后，您可以在专家咨询页面选择AI智能体进行测试。

## 注意事项

1. **API密钥安全**：请妥善保管您的API密钥，不要在代码仓库中公开
2. **API调用限制**：请注意阿里云百炼的API调用限制和计费规则
3. **错误处理**：系统已经实现了基本的错误处理，如果API调用失败会显示友好的错误提示
4. **会话管理**：系统会自动管理会话历史，确保对话的连贯性

## 故障排除

如果遇到API调用失败的情况，请检查：
1. API Key是否正确配置
2. 网络连接是否正常
3. 阿里云百炼服务是否正常
4. 查看控制台日志获取详细错误信息
