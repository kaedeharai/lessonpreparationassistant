const API_CONSTANTS = {
  BASE_URL: 'http://localhost:3000',
  ENDPOINTS: {
    SEND_MESSAGE: '/api/v1/chat/messages',
    GET_CONVERSATION: (id) => `/api/v1/chat/conversations/${id}`,
  },
  TIMEOUT: 120000,
};

Object.freeze(API_CONSTANTS);
export default API_CONSTANTS;