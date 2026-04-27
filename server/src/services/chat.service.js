const { v4: uuidv4 } = require('uuid');
const { ProviderFactory } = require('../providers');
const skillService = require('./skill.service');

class ChatService {
  constructor() {
    this.conversations = new Map();
    this.provider = ProviderFactory.create();
    this.isAvailable = false;
  }

  async initialize() {
    this.isAvailable = await this.provider.checkHealth();
    console.log(`[ChatService] 模型状态: ${this.isAvailable ? '✅ 就绪' : '❌ 不可用'}`);
    return this.isAvailable;
  }

  validateMessage(message) {
    if (!message || message.trim().length === 0) {
      throw new Error('消息内容不能为空');
    }
    if (message.length > 4000) {
      throw new Error('消息内容过长，最大支持4000字符');
    }
    return message.trim();
  }

  async sendMessage(userMessage, conversationId = null, options = {}) {
    this.validateMessage(userMessage);

    if (!this.isAvailable) {
      throw new Error('模型服务不可用，请检查Ollama是否运行');
    }

    const conversation = this.getOrCreateConversation(conversationId);

    // 保存用户消息
    const userMsg = {
      id: uuidv4(),
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    conversation.messages.push(userMsg);

    // 构建历史
    const history = conversation.messages
      .slice(0, -1)
      .map(m => ({ role: m.role, content: m.content }));

    // 调用模型
    const llmResponse = await this.provider.generateResponse(userMessage, history);

    // 保存 AI 回复
    const assistantMsg = {
      id: uuidv4(),
      role: 'assistant',
      content: llmResponse.content,
      timestamp: new Date().toISOString(),
      metadata: {
        model: llmResponse.model,
        usage: llmResponse.usage,
        responseTime: llmResponse.responseTime,
      },
    };
    conversation.messages.push(assistantMsg);
    conversation.updatedAt = new Date().toISOString();

    return {
      conversationId: conversation.id,
      message: assistantMsg,
    };
  }

  getOrCreateConversation(conversationId) {
    if (conversationId && this.conversations.has(conversationId)) {
      return this.conversations.get(conversationId);
    }

    const now = new Date().toISOString();
    const conv = {
      id: conversationId || uuidv4(),
      messages: [],
      createdAt: now,
      updatedAt: now,
    };

    this.conversations.set(conv.id, conv);
    return conv;
  }

  getConversationMessages(conversationId) {
    const conv = this.conversations.get(conversationId);
    return conv ? conv.messages : [];
  }

  async getSkills() {
    return await skillService.listSkills();
  }
}

const chatService = new ChatService();
module.exports = chatService;