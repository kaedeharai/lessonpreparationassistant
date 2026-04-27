const OpenAI = require('openai');
const CONFIG = require('../config');
const ERROR_MESSAGES = require('../constants/error-messages.constant');

class LlmProviderService {
  constructor() {
    this.client = null;
    this.isAvailable = false;
    this.modelName = CONFIG.LLM_MODEL;
  }

  async initialize() {
    this.client = new OpenAI({
      apiKey: CONFIG.LLM_API_KEY,
      baseURL: CONFIG.LLM_BASE_URL,
      timeout: 120000,
      maxRetries: 2,
    });

    this.isAvailable = await this.checkHealth();

    if (this.isAvailable) {
      console.log('[LlmProvider] ✅ 本地模型连接成功');
    } else {
      console.warn('[LlmProvider] ⚠️  本地模型未就绪');
    }

    return this.isAvailable;
  }

  async checkHealth() {
    try {
      const response = await fetch(CONFIG.LLM_HEALTH_CHECK_URL);
      return response.ok;
    } catch {
      return false;
    }
  }

  async generateResponse(userMessage, conversationHistory = []) {
    if (!this.isAvailable) {
      throw new Error(ERROR_MESSAGES.LLM_SERVICE_UNAVAILABLE);
    }

    try {
      const messages = this.buildMessages(userMessage, conversationHistory);

      console.log(`[LlmProvider] 发送请求到 ${this.modelName}...`);
      const startTime = Date.now();

      const completion = await this.client.chat.completions.create({
        model: this.modelName,
        messages,
        max_tokens: CONFIG.LLM_MAX_TOKENS,
        temperature: CONFIG.LLM_TEMPERATURE,
        top_p: CONFIG.LLM_TOP_P,
        stream: false,
      });

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`[LlmProvider] 响应时间: ${elapsed}s`);

      const aiResponse = completion.choices[0]?.message?.content;
      if (!aiResponse) throw new Error(ERROR_MESSAGES.LLM_RESPONSE_EMPTY);

      return {
        content: aiResponse,
        model: this.modelName,
        usage: completion.usage || null,
        responseTime: parseFloat(elapsed),
      };
    } catch (error) {
      console.error('[LlmProvider] 请求失败:', error.message);

      if (error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET') {
        this.isAvailable = false;
        throw new Error(ERROR_MESSAGES.LLM_SERVICE_UNAVAILABLE);
      }

      throw new Error(ERROR_MESSAGES.LLM_REQUEST_FAILED);
    }
  }

  buildMessages(userMessage, conversationHistory = []) {
    const systemPrompt = `你是通义千问(Qwen)AI助手，运行在本地Ollama上。请用简洁清晰的中文回答用户问题。

规则：
- 回答准确、有帮助
- 不确定时诚实地表示不知道
- 友好自然的语气
- 代码示例完整可运行`;

    const messages = [{ role: 'system', content: systemPrompt }];

    const recentHistory = conversationHistory.slice(-20);
    recentHistory.forEach(msg => {
      messages.push({ role: msg.role, content: msg.content });
    });

    messages.push({ role: 'user', content: userMessage });

    return messages;
  }
}

const llmProviderService = new LlmProviderService();
module.exports = llmProviderService;