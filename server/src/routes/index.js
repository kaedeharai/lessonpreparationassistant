const express = require('express');
const router = express.Router();
const { chatController } = require('../controllers/chat.controller');
const { lessonController } = require('../controllers/lesson.controller');

// 结构配置
router.get('/structure', (req, res) => lessonController.getStructure(req, res));
router.get('/subjects', (req, res) => lessonController.getSubjects(req, res));
router.get('/knowledge-points', (req, res) => lessonController.getKnowledgePoints(req, res));
router.post('/knowledge-points/batch', (req, res) => lessonController.getMultiSubjectPoints(req, res));

// 课程会话
router.post('/sessions', (req, res) => lessonController.createSession(req, res));
router.get('/sessions/:sessionId', (req, res) => lessonController.getSession(req, res));

// 生成和优化
router.post('/generate', (req, res, next) => lessonController.generateStructure(req, res, next));
router.post('/refine', (req, res, next) => lessonController.refineStructure(req, res, next));

// 历史版本
router.get('/sessions/:sessionId/history/:structureId', (req, res) => lessonController.getHistory(req, res));

// 原有的聊天接口
router.post('/messages', (req, res, next) => chatController.sendMessage(req, res, next));
router.get('/conversations/:conversationId', (req, res, next) => chatController.getConversation(req, res, next));

module.exports = router;