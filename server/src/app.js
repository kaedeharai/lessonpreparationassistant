const express = require('express');
const cors = require('cors');
const CONFIG = require('./config');
const routes = require('./routes');
const errorHandlerMiddleware = require('./middlewares/error-handler.middleware');
const { errorHandler } = require('./controllers/chat.controller');
const chatService = require('./services/chat.service');

const app = express();

app.use(cors({ origin: CONFIG.CORS_ORIGIN, methods: ['GET', 'POST'] }));
app.use(express.static('../client/public'));
app.use(express.json({ limit: '1mb' }));

// 路由
app.use(`${CONFIG.API_BASE_PATH}/chat`, routes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    model: CONFIG.LLM_MODEL,
    provider: 'ollama',
    modelAvailable: chatService.isAvailable,
  });
});

app.use(errorHandler);
app.use(errorHandlerMiddleware);

async function startServer() {
  console.log('='.repeat(50));
  console.log('  AI Chat App - OpenClaw + 千问');
  console.log('='.repeat(50));

  const modelReady = await chatService.initialize();

  app.listen(CONFIG.PORT, () => {
    console.log(`\n✅ 服务器启动: http://localhost:${CONFIG.PORT}`);
    console.log(`   API: POST ${CONFIG.API_BASE_PATH}/chat/messages`);
    console.log(`   模型: ${CONFIG.LLM_MODEL} ${modelReady ? '✅' : '❌'}`);
    console.log(`   技能: GET ${CONFIG.API_BASE_PATH}/chat/skills`);
    console.log('='.repeat(50));
  });
}

startServer();
module.exports = app;