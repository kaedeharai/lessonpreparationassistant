const { exec } = require('child_process');
const { promisify } = require('util');
const CONFIG = require('../config');

const execAsync = promisify(exec);

class SkillService {
  constructor() {
    this.cli = CONFIG.OPENCLAW_CLI;
  }

  async listSkills() {
    try {
      const { stdout } = await execAsync(`${this.cli} skills list`, {
        timeout: 10000,
      });
      return stdout.trim();
    } catch (error) {
      console.error('[SkillService] 获取技能列表失败:', error.message);
      throw new Error('获取技能列表失败');
    }
  }

  async searchSkills(query) {
    try {
      const { stdout } = await execAsync(`${this.cli} skills search "${query}"`, {
        timeout: 15000,
      });
      return stdout.trim();
    } catch (error) {
      console.error('[SkillService] 搜索技能失败:', error.message);
      throw new Error('搜索技能失败');
    }
  }

  async installSkill(skillName) {
    try {
      const { stdout } = await execAsync(`${this.cli} skills install "${skillName}"`, {
        timeout: 30000,
      });
      return stdout.trim();
    } catch (error) {
      console.error('[SkillService] 安装技能失败:', error.message);
      throw new Error('安装技能失败');
    }
  }

  async getInstalledSkills() {
    try {
      const { stdout } = await execAsync(`${this.cli} skills check`, {
        timeout: 10000,
      });
      return stdout.trim();
    } catch (error) {
      console.error('[SkillService] 检查技能失败:', error.message);
      return '[]';
    }
  }
}

module.exports = new SkillService();