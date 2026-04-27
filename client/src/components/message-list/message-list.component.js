class MessageListComponent {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    this.messages = [];
  }

  initialize() {
    console.log('[MessageList] 初始化完成');
  }

  addMessage(message) {
    this.messages.push(message);
    this.appendElement(message);
    this.scrollToBottom();
  }

  appendElement(message) {
    const wrapper = this.container.querySelector('.messages-wrapper');
    const emptyState = wrapper.querySelector('.empty-state');
    if (emptyState) emptyState.remove();

    const div = document.createElement('div');
    const isUser = message.role === 'user';

    div.className = `message-item message-${isUser ? 'user' : 'assistant'}`;
    div.innerHTML = `
      <div class="message-avatar">${isUser ? '👤' : '🤖'}</div>
      <div class="message-body">
        <div class="message-header">
          <span class="message-role">${isUser ? '你' : '千问AI'}</span>
          <span class="message-time">${new Date(message.timestamp).toLocaleTimeString()}</span>
        </div>
        <div class="message-content">${this.escapeHtml(message.content).replace(/\n/g, '<br>')}</div>
      </div>
    `;

    wrapper.appendChild(div);
  }

  showTypingIndicator() {
    const wrapper = this.container.querySelector('.messages-wrapper');
    const div = document.createElement('div');

    div.className = 'message-item message-assistant typing-indicator';
    div.id = 'typing-indicator';
    div.innerHTML = `
      <div class="message-avatar">🤖</div>
      <div class="message-body">
        <div class="typing-dots"><span></span><span></span><span></span></div>
      </div>
    `;

    wrapper.appendChild(div);
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    const indicator = this.container.querySelector('#typing-indicator');
    if (indicator) indicator.remove();
  }

  scrollToBottom() {
    const wrapper = this.container.querySelector('.messages-wrapper');
    if (wrapper) {
      setTimeout(() => {
        wrapper.scrollTop = wrapper.scrollHeight;
      }, 100);
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

export default MessageListComponent;