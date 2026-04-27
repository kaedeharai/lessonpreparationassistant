import ChatContainerComponent from './components/chat-container/chat-container.component.js';

class App {
  constructor() {
    this.chatContainer = new ChatContainerComponent();
  }

  initialize() {
    console.log('[App] 启动 AI Chat...');
    this.chatContainer.initialize();
    console.log('[App] 启动完成');
  }
}

const app = new App();
export default app;