const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const CONFIG = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_VERSION: process.env.API_VERSION || 'v1',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5500',
  API_BASE_PATH: `/api/${process.env.API_VERSION || 'v1'}`,

  LLM_BASE_URL: process.env.LLM_BASE_URL || 'http://localhost:11434/api',
  LLM_MODEL: process.env.LLM_MODEL || 'qwen2.5:7b',
  LLM_TEMPERATURE: parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
  LLM_MAX_TOKENS: parseInt(process.env.LLM_MAX_TOKENS || '2048'),

  OPENCLAW_CLI: process.env.OPENCLAW_CLI || 'openclaw',
};

module.exports = CONFIG;