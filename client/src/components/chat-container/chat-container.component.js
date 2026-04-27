import ChatInputComponent from '../chat-input/chat-input.component.js';
import MessageListComponent from '../message-list/message-list.component.js';
import ChatApiService from '../../services/chat-api.service.js';

class ChatContainerComponent {
  constructor() {
    this.conversationId = null;
    this.isProcessing = false;
    this.messageList = new MessageListComponent('#message-list');
    this.chatInput = new ChatInputComponent('#chat-input');
  }

  initialize() {
    this.messageList.initialize();
    this.chatInput.initialize((message) => this.handleSendMessage(message));
    console.log('[ChatContainer] 初始化完成');
  }

  async handleSendMessage(message) {
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.chatInput.setDisabled(true);

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    this.messageList.addMessage(userMessage);
    this.messageList.showTypingIndicator();

    try {
      const response = await ChatApiService.sendMessage(message, this.conversationId);

      if (response.data.conversationId) {
        this.conversationId = response.data.conversationId;
      }

      this.messageList.hideTypingIndicator();

      if (response.data.message) {
        this.messageList.addMessage(response.data.message);
      }

      console.log('[ChatContainer] 消息发送成功');
    } catch (error) {
      console.error('[ChatContainer] 发送失败:', error);
      this.messageList.hideTypingIndicator();

      const errorMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `❌ 抱歉，发生了错误：${error.message}`,
        timestamp: new Date().toISOString(),
      };
      this.messageList.addMessage(errorMessage);
    } finally {
      this.isProcessing = false;
      this.chatInput.setDisabled(false);
    }
  }
}

export default ChatContainerComponent;