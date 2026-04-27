const express = require('express');
const cors = require('cors');
const path = require('path');
const CONFIG = require('./config');
const routes = require('./routes');
const errorHandlerMiddleware = require('./middlewares/error-handler.middleware');
const { errorHandler } = require('./controllers/lesson.controller');
const chatService = require('./services/chat.service');

const app = express();

app.use(cors({ origin: CONFIG.CORS_ORIGIN, methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
app.use(express.json({ limit: '1mb' }));

// 托管前端静态文件
app.use(express.static(path.resolve(__dirname, '../../client/public')));

// API 路由
app.use(`${CONFIG.API_BASE_PATH}/lesson`, routes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    model: CONFIG.LLM_MODEL,
    modelAvailable: chatService.isAvailable,
  });
});

app.use(errorHandler);
app.use(errorHandlerMiddleware);

async function startServer() {
  console.log('='.repeat(50));
  console.log('  📚 智能备课助手 - STEAM融合教育');
  console.log('='.repeat(50));

  const modelReady = await chatService.initialize();

  app.listen(CONFIG.PORT, () => {
    console.log(`\n✅ 服务器启动: http://localhost:${CONFIG.PORT}`);
    console.log(`   模型: ${CONFIG.LLM_MODEL} ${modelReady ? '✅' : '❌'}`);
    console.log(`   访问 http://localhost:${CONFIG.PORT} 开始使用`);
    console.log('='.repeat(50));
  });
}

startServer();
module.exports = app;