// ==================== 全局状态 ====================
const state = {
  topic: '',
  grade: '',
  subjects: [],
  knowledgePoints: {},
  selectedPoints: [],
  structureIds: STRUCTURE.map(s => s.id),
  sessionId: null,
  currentStructureId: null,
  structures: {},
  isGenerating: false,
};

// ==================== DOM 引用 ====================
let sidebarContent, structureTabs, welcome, contentArea, generatedContent, chatPanel, pageTitle;

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
  console.log('[App] 初始化开始');

  sidebarContent = document.getElementById('sidebarContent');
  structureTabs = document.getElementById('structureTabs');
  welcome = document.getElementById('welcome');
  contentArea = document.getElementById('contentArea');
  generatedContent = document.getElementById('generatedContent');
  chatPanel = document.getElementById('chatPanel');
  pageTitle = document.getElementById('pageTitle');

  document.getElementById('toggleSidebar').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
  });

  renderForm();
  console.log('[App] 初始化完成');
});

// ==================== 表单 ====================
function renderForm() {
  sidebarContent.innerHTML = `
    <div class="form-section">
      <h3>📝 课程信息</h3>
      <div class="form-group">
        <label for="inputTopic">课程主题</label>
        <input type="text" id="inputTopic" placeholder="例如：搭建书架管理图书" value="${escHtml(state.topic)}">
      </div>
    </div>

    <div class="form-section">
      <h3>🎓 年级</h3>
      <div class="form-group">
        <label for="selectGrade">选择年级</label>
        <select id="selectGrade">
          <option value="">选择年级</option>
          ${GRADES.map(g => `<option value="${g}" ${state.grade === g ? 'selected' : ''}>${g}</option>`).join('')}
        </select>
      </div>
    </div>

    <div class="form-section">
      <h3>📚 学科（点击选择）</h3>
      <div class="knowledge-tags" id="subjectTags">
        ${ALL_SUBJECTS.map(s => `
          <span class="knowledge-tag ${state.subjects.includes(s) ? 'selected' : ''}" data-subject="${s}">${s}</span>
        `).join('')}
      </div>
    </div>

    <div class="form-section" id="knowledgeSection">
      <h3>🔑 知识点（点击选择）</h3>
      <div id="knowledgeContainer">
        ${renderKnowledgeHtml()}
      </div>
    </div>

    <div class="form-section">
      <h3>📋 授课结构（点击选择）</h3>
      <div class="structure-checkboxes" id="structureChecks">
        ${STRUCTURE.map(s => `
          <span class="structure-check ${state.structureIds.includes(s.id) ? 'selected' : ''}" data-structure="${s.id}">
            ${s.icon} ${s.name}
          </span>
        `).join('')}
      </div>
    </div>

    <button class="btn btn-primary" id="btnStart">🚀 开始生成教案</button>
  `;

  bindEvents();
  updateStartBtn();
}

function renderKnowledgeHtml() {
  if (Object.keys(state.knowledgePoints).length === 0) {
    if (state.grade && state.subjects.length > 0) {
      return '<p style="color:var(--gray-400);font-size:.8rem">点击学科加载知识点中...</p>';
    }
    return '<p style="color:var(--gray-400);font-size:.8rem">请先选择年级和学科</p>';
  }

  let html = '';
  for (const [subject, points] of Object.entries(state.knowledgePoints)) {
    if (!points || points.length === 0) continue;
    html += `<div style="margin-bottom:4px"><strong style="font-size:.75rem;color:var(--primary-light)">${subject}:</strong></div>`;
    html += '<div class="knowledge-tags">';
    points.forEach(point => {
      const pointId = `${subject}:${point}`;
      const sel = state.selectedPoints.includes(pointId);
      html += `<span class="knowledge-tag ${sel ? 'selected' : ''}" data-point="${escHtml(pointId)}">${escHtml(point)}</span>`;
    });
    html += '</div>';
  }
  return html || '<p style="color:var(--gray-400);font-size:.8rem">该年级暂无知识点数据</p>';
}

function bindEvents() {
  // 课题
  document.getElementById('inputTopic').addEventListener('input', e => {
    state.topic = e.target.value;
    updateStartBtn();
  });

  // 年级
  document.getElementById('selectGrade').addEventListener('change', e => {
    state.grade = e.target.value;
    state.subjects = [];
    state.selectedPoints = [];
    state.knowledgePoints = {};
    renderForm();
  });

  // 学科标签
  document.querySelectorAll('#subjectTags .knowledge-tag').forEach(tag => {
    tag.addEventListener('click', async function() {
      const subject = this.dataset.subject;
      const idx = state.subjects.indexOf(subject);
      
      if (idx > -1) {
        state.subjects.splice(idx, 1);
        state.selectedPoints = state.selectedPoints.filter(p => !p.startsWith(subject + ':'));
        delete state.knowledgePoints[subject];
      } else {
        state.subjects.push(subject);
      }

      // 加载知识点
      if (state.grade && state.subjects.length > 0) {
        try {
          const res = await API.batchKnowledgePoints(state.grade, state.subjects);
          if (res.success) {
            state.knowledgePoints = res.data.knowledgePoints || {};
          }
        } catch (err) {
          console.error('加载知识点失败:', err);
        }
      } else {
        state.knowledgePoints = {};
      }

      renderForm();
    });
  });

  // 知识点标签（事件委托）
  document.getElementById('knowledgeContainer').addEventListener('click', e => {
    const tag = e.target.closest('.knowledge-tag[data-point]');
    if (!tag) return;
    const pointId = tag.dataset.point;
    const idx = state.selectedPoints.indexOf(pointId);
    if (idx > -1) {
      state.selectedPoints.splice(idx, 1);
    } else {
      state.selectedPoints.push(pointId);
    }
    renderForm();
  });

  // 结构
  document.querySelectorAll('#structureChecks .structure-check').forEach(check => {
    check.addEventListener('click', function() {
      const sid = this.dataset.structure;
      const idx = state.structureIds.indexOf(sid);
      if (idx > -1) {
        if (state.structureIds.length > 1) state.structureIds.splice(idx, 1);
      } else {
        state.structureIds.push(sid);
      }
      renderForm();
    });
  });

  // 开始
  document.getElementById('btnStart').addEventListener('click', startLesson);
}

function updateStartBtn() {
  const btn = document.getElementById('btnStart');
  if (!btn) return;
  const ok = state.topic.trim() && state.grade && state.subjects.length > 0 
          && state.selectedPoints.length > 0 && state.structureIds.length > 0;
  btn.disabled = !ok;
  btn.style.opacity = ok ? '1' : '0.5';
}

// ==================== 课程 ====================
async function startLesson() {
  if (state.isGenerating) return;
  const btn = document.getElementById('btnStart');
  btn.disabled = true;
  btn.textContent = '⏳ 创建中...';

  try {
    const res = await API.createSession({
      topic: state.topic.trim(),
      grade: state.grade,
      subjects: state.subjects,
      knowledgePoints: state.selectedPoints.map(p => p.includes(':') ? p.split(':')[1] : p),
      structureIds: state.structureIds,
    });

    if (!res.success) { alert(res.message); return; }

    state.sessionId = res.data.sessionId;
    state.structureIds = res.data.structureIds;
    state.structures = {};
    state.structureIds.forEach(id => {
      state.structures[id] = { content: null, history: [], currentVersion: 0, isGenerating: false };
    });

    welcome.style.display = 'none';
    structureTabs.style.display = 'flex';
    contentArea.style.display = 'block';
    pageTitle.textContent = '📖 ' + state.topic;

    const firstId = state.structureIds[0];
    state.currentStructureId = firstId;
    renderTabs();
    renderContent();
    await doGenerate(firstId);
  } catch (err) {
    alert('创建失败: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = '🚀 开始生成教案';
  }
}

function renderTabs() {
  structureTabs.innerHTML = state.structureIds.map(id => {
    const s = STRUCTURE.find(x => x.id === id) || { name: id, icon: '' };
    const d = state.structures[id] || {};
    let cls = 'pending';
    if (d.isGenerating) cls = 'generating';
    else if (d.content) cls = 'done';
    return `<button class="structure-tab ${state.currentStructureId === id ? 'active' : ''}" data-sid="${id}">
      <span class="status-dot ${cls}"></span>${s.icon} ${s.name}</button>`;
  }).join('');

  structureTabs.querySelectorAll('.structure-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      state.currentStructureId = tab.dataset.sid;
      renderTabs();
      renderContent();
    });
  });
}

function renderContent() {
  const sid = state.currentStructureId;
  const d = state.structures[sid] || { content: null, history: [], currentVersion: 0, isGenerating: false };
  const s = STRUCTURE.find(x => x.id === sid) || { name: sid, icon: '' };

  if (d.content) {
    generatedContent.className = 'generated-content';
    generatedContent.innerHTML = `<span class="version-badge">V${d.currentVersion}</span><div class="markdown-body" style="margin-top:.5rem">${renderMarkdown(d.content)}</div>`;
  } else if (d.isGenerating) {
    generatedContent.className = 'generated-content empty';
    generatedContent.innerHTML = '<p>⏳ AI 正在生成「' + s.name + '」...</p>';
  } else {
    generatedContent.className = 'generated-content empty';
    generatedContent.innerHTML = `<p>点击生成「${s.icon} ${s.name}」</p><button class="btn btn-primary" style="width:auto;margin-top:1rem" id="btnGen">▶ 生成</button>`;
    const btnGen = document.getElementById('btnGen');
    if (btnGen) btnGen.addEventListener('click', () => doGenerate(sid));
  }

  let verHtml = '';
  if (d.history.length > 0) {
    verHtml = '<div class="version-list">' + d.history.map(h =>
      `<span class="version-item ${d.currentVersion === h.version ? 'active' : ''}" data-ver="${h.version}">V${h.version}</span>`
    ).join('') + '</div>';
  }

  chatPanel.innerHTML = `
    ${verHtml}
    <div class="chat-messages" id="chatMsgs">
      ${d.history.filter(h => h.teacherPrompt).map(h => `<div class="chat-msg user"><div>💬 ${escHtml(h.teacherPrompt)}</div><div class="msg-time">V${h.version}</div></div>`).join('')}
    </div>
    <div class="chat-input-row">
      <input type="text" id="chatInput" placeholder="输入优化建议..." ${!d.content ? 'disabled' : ''}>
      <button id="btnSend" ${!d.content ? 'disabled' : ''}>发送</button>
    </div>
  `;

  // 版本切换
  chatPanel.querySelectorAll('.version-item').forEach(item => {
    item.addEventListener('click', () => {
      const ver = parseInt(item.dataset.ver);
      const h = d.history.find(x => x.version === ver);
      if (h) { d.content = h.content; d.currentVersion = ver; renderContent(); }
    });
  });

  // 对话
  if (d.content) {
    const input = document.getElementById('chatInput');
    const snd = document.getElementById('btnSend');
    const send = async () => {
      const msg = input.value.trim();
      if (!msg || state.isGenerating) return;
      input.value = '';
      await doRefine(sid, msg);
    };
    snd.addEventListener('click', send);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
  }
}

async function doGenerate(sid) {
  if (state.isGenerating) return;
  state.isGenerating = true;
  state.structures[sid].isGenerating = true;
  renderTabs();
  renderContent();

  try {
    const res = await API.generate(state.sessionId, sid);
    if (res.success) {
      state.structures[sid].content = res.data.content;
      state.structures[sid].currentVersion = res.data.version || 1;
      state.structures[sid].history.push({ version: res.data.version || 1, teacherPrompt: '', content: res.data.content, timestamp: new Date().toISOString() });
    }
  } catch (err) {
    alert('生成失败: ' + err.message);
  } finally {
    state.isGenerating = false;
    state.structures[sid].isGenerating = false;
    renderTabs();
    renderContent();
  }
}

async function doRefine(sid, msg) {
  if (state.isGenerating) return;
  state.isGenerating = true;
  state.structures[sid].isGenerating = true;
  renderTabs();

  try {
    const res = await API.refine(state.sessionId, sid, msg);
    if (res.success) {
      state.structures[sid].content = res.data.content;
      state.structures[sid].currentVersion = res.data.version || 1;
      state.structures[sid].history.push({ version: res.data.version || 1, teacherPrompt: msg, content: res.data.content, timestamp: new Date().toISOString() });
    }
  } catch (err) {
    alert('优化失败: ' + err.message);
  } finally {
    state.isGenerating = false;
    state.structures[sid].isGenerating = false;
    renderTabs();
    renderContent();
  }
}

function escHtml(s) {
  if (!s) return '';
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}