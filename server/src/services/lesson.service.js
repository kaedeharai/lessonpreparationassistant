const { v4: uuidv4 } = require('uuid');
const { ProviderFactory } = require('../providers');
const { getKnowledgePoints } = require('../data/knowledge-points');

// 授课结构定义
const STRUCTURE = [
  { id: 'background',    name: '背景',         prompt: '引入项目背景，说明为什么做这个项目，与现实生活的联系，激发学生兴趣。要自然融入知识点，让学生感受到学以致用。' },
  { id: 'collaboration', name: '小组合作',     prompt: '设计分组策略，说明每组多少人合适、如何分工、协作方式。结合任务特点给出合理的团队结构建议。' },
  { id: 'problem',       name: '问题导入',     prompt: '明确本次课程要解决的核心问题，通过问题引导学生思考，让学生知道为什么要学、学了能解决什么。' },
  { id: 'task',          name: '任务',         prompt: '设计具体的动手实践任务，详细描述步骤、所需材料、时间安排。任务中要巧妙地融入知识点，让学生在实践中学习。' },
  { id: 'presentation',  name: '成果展示',     prompt: '设计学生展示成果的方式（如汇报、展览、演示等），明确展示要求和评分维度，鼓励创意表达。' },
  { id: 'evaluation',    name: '教师评价',     prompt: '给出教师评价标准，包括过程评价和结果评价，关注学生核心素养，给出具体可操作的反馈要点。' },
  { id: 'summary',       name: '总结',         prompt: '梳理本次课程涉及的所有知识点，帮学生建立知识框架。强调"不只玩不学"，确保学习目标达成。' },
  { id: 'value',         name: '特色价值',     prompt: '总结课程特色、创新点和延伸价值。说明如何与现实生活联系，培养学生的综合素养和跨学科思维能力。' },
];

class LessonService {
  constructor() {
    this.provider = ProviderFactory.create();
    this.sessions = new Map(); // 存储课程会话
  }

  /**
   * 创建新课程会话
   */
  createSession({ topic, grade, subjects, knowledgePoints, structureIds }) {
    const sessionId = uuidv4();
    const session = {
      id: sessionId,
      topic,
      grade,
      subjects,
      knowledgePoints,
      structureIds: structureIds || STRUCTURE.map(s => s.id),
      structures: {}, // { structureId: { content, history: [] } }
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 为每个结构初始化
    session.structureIds.forEach(id => {
      session.structures[id] = {
        content: null,
        history: [], // [{ role, content, timestamp }]
        isGenerating: false,
      };
    });

    this.sessions.set(sessionId, session);
    return session;
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  /**
   * 构建系统提示词
   */
  buildSystemPrompt(session) {
    const { topic, grade, subjects, knowledgePoints } = session;
    
    return `你是一位经验丰富的STEAM教育专家，擅长多学科融合的项目式学习(PBL)课程设计。
核心理念：让学生在实践中学习，动手又动脑，融合多学科知识。

当前课程信息：
- 课程主题：${topic}
- 适用年级：${grade}
- 涉及学科：${subjects.join('、')}
- 知识点：${knowledgePoints.join('、')}

设计要求：
1. 必须融入所有知识点，让学生在实践中自然习得
2. 强调动手实践，每个环节都要有可操作的任务
3. 多学科融合，体现STEAM教育理念
4. 语言适合${grade}学生的理解水平
5. 最后要总结知识点，确保"不只玩不学"
6. 输出内容要详实、具体、可直接用于教学`;
  }

  /**
   * 生成单个结构的内容
   */
  async generateStructure(sessionId, structureId, teacherPrompt = '') {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('会话不存在');

    const structure = STRUCTURE.find(s => s.id === structureId);
    if (!structure) throw new Error('未知的授课结构');

    if (!session.structureIds.includes(structureId)) {
      throw new Error('该结构不在当前课程中');
    }

    // 标记正在生成
    session.structures[structureId].isGenerating = true;

    try {
      const systemPrompt = this.buildSystemPrompt(session);
      
      const userPrompt = teacherPrompt 
        ? `请生成"${structure.name}"环节的内容。${structure.prompt}\n\n教师的额外要求：${teacherPrompt}`
        : `请生成"${structure.name}"环节的内容。${structure.prompt}`;

      const messages = [
        { role: 'system', content: systemPrompt },
        // 如果有其他已生成的结构，作为上下文
        ...this.buildContextMessages(session, structureId),
        { role: 'user', content: userPrompt },
      ];

      const response = await this.provider.chat(messages, {
        temperature: 0.7,
        maxTokens: 2048,
      });

      const content = response.content;

      // 保存结果和历史
      session.structures[structureId].content = content;
      session.structures[structureId].history.push({
        role: 'assistant',
        content,
        teacherPrompt: teacherPrompt || '初始生成',
        timestamp: new Date().toISOString(),
        version: session.structures[structureId].history.length + 1,
      });

      session.updatedAt = new Date().toISOString();

      return {
        structureId,
        structureName: structure.name,
        content,
        version: session.structures[structureId].history.length,
      };
    } finally {
      session.structures[structureId].isGenerating = false;
    }
  }

  /**
   * 对已生成内容进行对话优化
   */
  async refineStructure(sessionId, structureId, teacherMessage) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('会话不存在');

    const structure = STRUCTURE.find(s => s.id === structureId);
    const structData = session.structures[structureId];
    if (!structData || !structData.content) {
      throw new Error('请先生成该结构的内容');
    }

    const systemPrompt = this.buildSystemPrompt(session);

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'assistant', content: structData.content },
      { role: 'user', content: `请根据以下要求优化"${structure.name}"环节的内容：${teacherMessage}` },
    ];

    const response = await this.provider.chat(messages, {
      temperature: 0.7,
      maxTokens: 2048,
    });

    const newContent = response.content;

    // 保存到历史
    structData.content = newContent;
    structData.history.push({
      role: 'assistant',
      content: newContent,
      teacherPrompt: teacherMessage,
      timestamp: new Date().toISOString(),
      version: structData.history.length + 1,
    });

    session.updatedAt = new Date().toISOString();

    return {
      structureId,
      structureName: structure.name,
      content: newContent,
      version: structData.history.length,
    };
  }

  /**
   * 获取历史版本
   */
  getHistory(sessionId, structureId) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('会话不存在');
    return session.structures[structureId]?.history || [];
  }

  /**
   * 构建上下文消息（引用已生成的结构）
   */
  buildContextMessages(session, currentStructureId) {
    const contextMessages = [];
    const currentIndex = session.structureIds.indexOf(currentStructureId);

    // 引用前面已生成的结构内容作为上下文
    for (let i = 0; i < currentIndex; i++) {
      const prevId = session.structureIds[i];
      const prevData = session.structures[prevId];
      if (prevData && prevData.content) {
        const prevStructure = STRUCTURE.find(s => s.id === prevId);
        contextMessages.push({
          role: 'assistant',
          content: `【${prevStructure.name}】\n${prevData.content}`,
        });
      }
    }

    return contextMessages;
  }
}

const lessonService = new LessonService();
module.exports = { lessonService, STRUCTURE };