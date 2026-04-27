const API_BASE = '/api/v1/lesson';

const API = {
  // 获取结构
  getStructure() {
    return fetch(`${API_BASE}/structure`).then(r => r.json());
  },

  // 根据年级获取学科
  getSubjects(grade) {
    return fetch(`${API_BASE}/subjects?grade=${encodeURIComponent(grade)}`).then(r => r.json());
  },

  // 获取知识点
  getKnowledgePoints(grade, subject) {
    return fetch(`${API_BASE}/knowledge-points?grade=${encodeURIComponent(grade)}&subject=${encodeURIComponent(subject)}`).then(r => r.json());
  },

  // 批量获取知识点
  batchKnowledgePoints(grade, subjects) {
    return fetch(`${API_BASE}/knowledge-points/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grade, subjects }),
    }).then(r => r.json());
  },

  // 创建课程
  createSession(data) {
    return fetch(`${API_BASE}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json());
  },

  // 获取课程
  getSession(sessionId) {
    return fetch(`${API_BASE}/sessions/${sessionId}`).then(r => r.json());
  },

  // 生成结构
  generate(sessionId, structureId, teacherPrompt = '') {
    return fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, structureId, teacherPrompt }),
    }).then(r => r.json());
  },

  // 优化结构
  refine(sessionId, structureId, message) {
    return fetch(`${API_BASE}/refine`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, structureId, message }),
    }).then(r => r.json());
  },

  // 获取历史版本
  getHistory(sessionId, structureId) {
    return fetch(`${API_BASE}/sessions/${sessionId}/history/${structureId}`).then(r => r.json());
  },

  // 健康检查
  health() {
    return fetch('/health').then(r => r.json());
  },
};