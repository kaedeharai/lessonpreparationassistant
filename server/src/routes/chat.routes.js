const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const rateLimiterMiddleware = require('../middlewares/rate-limiter.middleware');

router.post('/messages', rateLimiterMiddleware, chatController.sendMessage.bind(chatController));
router.get('/conversations/:conversationId', chatController.getConversation.bind(chatController));

module.exports = router;