const { v4: uuidv4 } = require('uuid');

class TaskModel {
  constructor() {
    this.tasks = [];
    this.initializeMockData();
  }

  initializeMockData() {
    this.tasks = [
      {
        id: uuidv4(),
        title: '完成项目初始化',
        description: '搭建项目基础架构和开发环境配置',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: '编写API文档',
        description: '使用Swagger编写完整的API接口文档',
        status: 'TODO',
        priority: 'MEDIUM',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  findAll() {
    return [...this.tasks];
  }

  findById(id) {
    return this.tasks.find(task => task.id === id) || null;
  }

  create(taskData) {
    const newTask = {
      id: uuidv4(),
      ...taskData,
      status: taskData.status || 'TODO',
      priority: taskData.priority || 'MEDIUM',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.tasks.push(newTask);
    return newTask;
  }

  update(id, taskData) {
    const index = this.tasks.findIndex(task => task.id === id);
    if (index === -1) return null;

    this.tasks[index] = {
      ...this.tasks[index],
      ...taskData,
      id: this.tasks[index].id,
      createdAt: this.tasks[index].createdAt,
      updatedAt: new Date().toISOString()
    };
    return this.tasks[index];
  }

  delete(id) {
    const index = this.tasks.findIndex(task => task.id === id);
    if (index === -1) return false;
    
    this.tasks.splice(index, 1);
    return true;
  }

  findByFilter({ status, priority, searchTerm }) {
    let filteredTasks = [...this.tasks];

    if (status) {
      filteredTasks = filteredTasks.filter(task => task.status === status);
    }
    if (priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === priority);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(term) ||
        task.description.toLowerCase().includes(term)
      );
    }

    return filteredTasks;
  }
}

module.exports = new TaskModel();