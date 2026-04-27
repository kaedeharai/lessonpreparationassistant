const CONFIG = require('../config');

class OllamaProvider {
  constructor() {
    this.baseUrl = CONFIG.LLM_BASE_URL;
    this.model = CONFIG.LLM_MODEL;
  }

  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * 统一聊天接口
   * @param {Array} messages - [{ role: 'system'|'user'|'assistant', content: '...' }]
   * @param {Object} options - { temperature, maxTokens }
   */
  async chat(messages, options = {}) {
    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages,
        stream: false,
        options: {
          temperature: options.temperature || CONFIG.LLM_TEMPERATURE,
          num_predict: options.maxTokens || CONFIG.LLM_MAX_TOKENS,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Ollama API 错误: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    return {
      content: data.message?.content || '',
      model: data.model || this.model,
      usage: {
        promptTokens: data.prompt_eval_count || 0,
        completionTokens: data.eval_count || 0,
      },
    };
  }

  // 保持向后兼容
  async generateResponse(userMessage, conversationHistory = []) {
    const systemPrompt = '你是一个有帮助的AI助手。';
    const messages = [{ role: 'system', content: systemPrompt }];
    
    const recentHistory = conversationHistory.slice(-10);
    recentHistory.forEach(msg => {
      messages.push({ role: msg.role, content: msg.content });
    });
    messages.push({ role: 'user', content: userMessage });

    return this.chat(messages);
  }
}

module.exports = OllamaProvider;