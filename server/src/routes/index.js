const express = require('express');
const router = express.Router();
const { chatController } = require('../controllers/chat.controller');

router.post('/messages', (req, res, next) => chatController.sendMessage(req, res, next));
router.get('/conversations/:conversationId', (req, res, next) => chatController.getConversation(req, res, next));
router.get('/skills', (req, res, next) => chatController.listSkills(req, res, next));
router.get('/skills/search', (req, res, next) => chatController.searchSkills(req, res, next));
router.post('/skills/install', (req, res, next) => chatController.installSkill(req, res, next));

module.exports = router;