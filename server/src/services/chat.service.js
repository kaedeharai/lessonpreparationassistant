const { v4: uuidv4 } = require('uuid');
const { ProviderFactory } = require('../providers');

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
    if (!message || message.trim().length === 0) throw new Error('消息内容不能为空');
    if (message.length > 4000) throw new Error('消息内容过长');
    return message.trim();
  }

  async sendMessage(userMessage, conversationId = null) {
    this.validateMessage(userMessage);
    if (!this.isAvailable) throw new Error('模型服务不可用');

    const conversation = this.getOrCreateConversation(conversationId);
    const userMsg = {
      id: uuidv4(),
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    conversation.messages.push(userMsg);

    const history = conversation.messages.slice(0, -1).map(m => ({
      role: m.role,
      content: m.content,
    }));

    // 使用统一的 chat 接口
    const llmResponse = await this.provider.chat([
      { role: 'system', content: '你是一个有帮助的AI助手。' },
      ...history,
      { role: 'user', content: userMessage },
    ]);

    const assistantMsg = {
      id: uuidv4(),
      role: 'assistant',
      content: llmResponse.content,
      timestamp: new Date().toISOString(),
    };
    conversation.messages.push(assistantMsg);
    conversation.updatedAt = new Date().toISOString();

    return { conversationId: conversation.id, message: assistantMsg };
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
}

const chatService = new ChatService();
module.exports = chatService;