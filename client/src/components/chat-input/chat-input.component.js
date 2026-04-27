class ChatInputComponent {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    this.onSendMessage = null;
    this.isDisabled = false;
  }

  initialize(onSendMessage) {
    this.onSendMessage = onSendMessage;
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="chat-input-wrapper">
        <textarea id="message-input" class="chat-textarea" 
          placeholder="输入消息... (Enter发送, Shift+Enter换行)"
          rows="1" maxlength="4000"></textarea>
        <button id="send-button" class="send-button">
          <span class="send-icon">➤</span>
        </button>
      </div>
    `;
  }

  bindEvents() {
    const input = this.container.querySelector('#message-input');
    const btn = this.container.querySelector('#send-button');

    btn.addEventListener('click', () => this.handleSend());
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSend();
      }
    });
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 150) + 'px';
    });
  }

  handleSend() {
    const input = this.container.querySelector('#message-input');
    const message = input.value.trim();

    if (!message || this.isDisabled) return;

    if (this.onSendMessage) {
      this.onSendMessage(message);
    }

    input.value = '';
    input.style.height = 'auto';
    input.focus();
  }

  setDisabled(disabled) {
    this.isDisabled = disabled;
    const btn = this.container.querySelector('#send-button');
    const input = this.container.querySelector('#message-input');
    if (btn) btn.disabled = disabled;
    if (input) input.disabled = disabled;
  }
}

export default ChatInputComponent;