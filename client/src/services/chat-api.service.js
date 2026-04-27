import API_CONSTANTS from '../constants/api.constant.js';

class ChatApiService {
  async sendMessage(message, conversationId = null) {
    const response = await fetch(`${API_CONSTANTS.BASE_URL}${API_CONSTANTS.ENDPOINTS.SEND_MESSAGE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, conversationId }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || '请求失败');
    }

    return data;
  }

  async getConversation(conversationId) {
    const response = await fetch(
      `${API_CONSTANTS.BASE_URL}${API_CONSTANTS.ENDPOINTS.GET_CONVERSATION(conversationId)}`
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || '获取失败');
    }

    return data;
  }
}

const chatApiService = new ChatApiService();
export default chatApiService;