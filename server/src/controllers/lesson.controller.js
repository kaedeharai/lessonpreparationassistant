const { lessonService, STRUCTURE } = require('../services/lesson.service');
const { getKnowledgePoints, getSubjectsByGrade } = require('../data/knowledge-points');
const ResponseUtil = require('../utils/response.util');

class LessonController {
  // 获取结构列表
  getStructure(req, res) {
    return ResponseUtil.success(res, STRUCTURE, '获取成功');
  }

  // 根据年级获取学科
  getSubjects(req, res) {
    const { grade } = req.query;
    if (!grade) return ResponseUtil.badRequest(res, '请提供年级');

    const subjects = getSubjectsByGrade(grade);
    return ResponseUtil.success(res, { grade, subjects }, '获取成功');
  }

  // 获取知识点
  getKnowledgePoints(req, res) {
    const { grade, subject } = req.query;
    if (!grade || !subject) return ResponseUtil.badRequest(res, '请提供年级和学科');

    const points = getKnowledgePoints(grade, subject);
    return ResponseUtil.success(res, { grade, subject, points }, '获取成功');
  }

  // 批量获取多学科知识点
  getMultiSubjectPoints(req, res) {
    const { grade, subjects } = req.body;
    if (!grade || !subjects || !subjects.length) {
      return ResponseUtil.badRequest(res, '请提供年级和学科列表');
    }

    const result = {};
    subjects.forEach(subject => {
      result[subject] = getKnowledgePoints(grade, subject);
    });

    return ResponseUtil.success(res, { grade, knowledgePoints: result }, '获取成功');
  }

  // 创建课程会话
  createSession(req, res) {
    const { topic, grade, subjects, knowledgePoints, structureIds } = req.body;

    if (!topic || !grade || !subjects || !knowledgePoints) {
      return ResponseUtil.badRequest(res, '请填写完整的课程信息');
    }

    const session = lessonService.createSession({
      topic, grade, subjects, knowledgePoints, structureIds,
    });

    return ResponseUtil.created(res, {
      sessionId: session.id,
      topic: session.topic,
      grade: session.grade,
      subjects: session.subjects,
      knowledgePoints: session.knowledgePoints,
      structureIds: session.structureIds,
    }, '课程创建成功');
  }

  // 生成单个结构
  async generateStructure(req, res, next) {
    try {
      const { sessionId, structureId, teacherPrompt } = req.body;
      if (!sessionId || !structureId) {
        return ResponseUtil.badRequest(res, '缺少参数');
      }

      const result = await lessonService.generateStructure(
        sessionId, structureId, teacherPrompt
      );

      return ResponseUtil.success(res, result, '生成成功');
    } catch (error) {
      next(error);
    }
  }

  // 优化结构内容
  async refineStructure(req, res, next) {
    try {
      const { sessionId, structureId, message } = req.body;
      if (!sessionId || !structureId || !message) {
        return ResponseUtil.badRequest(res, '缺少参数');
      }

      const result = await lessonService.refineStructure(
        sessionId, structureId, message
      );

      return ResponseUtil.success(res, result, '优化成功');
    } catch (error) {
      next(error);
    }
  }

  // 获取历史版本
  getHistory(req, res) {
    const { sessionId, structureId } = req.params;
    const history = lessonService.getHistory(sessionId, structureId);
    return ResponseUtil.success(res, { structureId, history }, '获取成功');
  }

  // 获取课程会话
  getSession(req, res) {
    const { sessionId } = req.params;
    const session = lessonService.getSession(sessionId);
    
    if (!session) {
      return ResponseUtil.error(res, '会话不存在', 404);
    }

    return ResponseUtil.success(res, session, '获取成功');
  }
}

const lessonController = new LessonController();

const errorHandler = (err, req, res, next) => {
  console.error(`[LessonController Error] ${err.message}`);
  const statusCode = err.message.includes('不存在') ? 404 : 500;
  return ResponseUtil.error(res, err.message, statusCode);
};

module.exports = { lessonController, errorHandler };