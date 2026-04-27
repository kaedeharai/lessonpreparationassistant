const chatService = require('../services/chat.service');
const skillService = require('../services/skill.service');
const ResponseUtil = require('../utils/response.util');

class ChatController {
  async sendMessage(req, res, next) {
    try {
      const { message, conversationId } = req.body;

      if (!message) {
        return ResponseUtil.badRequest(res, '消息内容不能为空');
      }

      const result = await chatService.sendMessage(message, conversationId);
      return ResponseUtil.created(res, result, '消息发送成功');
    } catch (error) {
      next(error);
    }
  }

  async getConversation(req, res, next) {
    try {
      const { conversationId } = req.params;
      const messages = chatService.getConversationMessages(conversationId);

      return ResponseUtil.success(res, {
        conversationId,
        messages,
        messageCount: messages.length,
      }, '获取成功');
    } catch (error) {
      next(error);
    }
  }

  async listSkills(req, res, next) {
    try {
      const skills = await skillService.listSkills();
      return ResponseUtil.success(res, { skills }, '获取成功');
    } catch (error) {
      next(error);
    }
  }

  async searchSkills(req, res, next) {
    try {
      const { query } = req.query;
      if (!query) return ResponseUtil.badRequest(res, '请提供搜索关键词');

      const result = await skillService.searchSkills(query);
      return ResponseUtil.success(res, { result }, '搜索完成');
    } catch (error) {
      next(error);
    }
  }

  async installSkill(req, res, next) {
    try {
      const { skillName } = req.body;
      if (!skillName) return ResponseUtil.badRequest(res, '请提供技能名称');

      const result = await skillService.installSkill(skillName);
      return ResponseUtil.success(res, { result }, '安装成功');
    } catch (error) {
      next(error);
    }
  }
}

const chatController = new ChatController();

// 错误处理中间件
const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${err.message}`);

  const errorMap = {
    '消息内容不能为空': 400,
    '消息内容过长': 400,
    '模型服务不可用': 503,
  };

  const statusCode = errorMap[err.message] || 500;
  const message = statusCode === 500 ? '服务器内部错误' : err.message;

  return ResponseUtil.error(res, message, statusCode);
};

module.exports = { chatController, errorHandler };