const CONFIG = require('../config');

class OllamaProvider {
  constructor() {
    this.baseUrl = CONFIG.LLM_BASE_URL;
    this.model = CONFIG.LLM_MODEL;
    console.log(`[OllamaProvider] 初始化: ${this.baseUrl}, 模型: ${this.model}`);
  }

  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async generateResponse(userMessage, conversationHistory = []) {
    const systemPrompt = `你是AI教学助手，通过OpenClaw框架运行在本地Ollama上。
请用简洁清晰的中文回答。如果不确定，诚实地说不知道。`;

    // 构建 Ollama 的 chat 格式
    const messages = [{ role: 'system', content: systemPrompt }];

    const recentHistory = conversationHistory.slice(-10);
    recentHistory.forEach(msg => {
      messages.push({ role: msg.role, content: msg.content });
    });

    messages.push({ role: 'user', content: userMessage });

    console.log(`[OllamaProvider] 发送请求...`);

    const startTime = Date.now();
    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages,
        stream: false,
        options: {
          temperature: CONFIG.LLM_TEMPERATURE,
          num_predict: CONFIG.LLM_MAX_TOKENS,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Ollama API 返回错误: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`[OllamaProvider] 响应: ${elapsed}s, tokens: ${data.eval_count || 0}`);

    return {
      content: data.message?.content || '',
      model: data.model || this.model,
      responseTime: parseFloat(elapsed),
      usage: {
        promptTokens: data.prompt_eval_count || 0,
        completionTokens: data.eval_count || 0,
        totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
      },
    };
  }
}

module.exports = OllamaProvider;