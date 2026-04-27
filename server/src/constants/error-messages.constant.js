const ERROR_MESSAGES = {
  MESSAGE_REQUIRED: '消息内容不能为空',
  MESSAGE_TOO_LONG: '消息内容过长，最大支持4000字符',
  LLM_SERVICE_UNAVAILABLE: '本地模型服务未启动，请确保Ollama正在运行',
  LLM_MODEL_NOT_FOUND: '模型未找到，请确认模型已下载',
  LLM_REQUEST_FAILED: '模型请求失败，请检查Ollama服务状态',
  LLM_RESPONSE_EMPTY: '模型返回内容为空，请重试',
  INTERNAL_SERVER_ERROR: '服务器内部错误',
  RATE_LIMIT_EXCEEDED: '请求过于频繁，请稍后再试',
};

Object.freeze(ERROR_MESSAGES);
module.exports = ERROR_MESSAGES;