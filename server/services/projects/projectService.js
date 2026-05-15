// services/projects/projectService.js - 项目服务
import { Project } from '../../models/index.js';

const ProjectService = {
  /**
   * 获取所有项目
   * @param {object} db - 数据库连接对象
   * @returns {Promise} - 返回查询结果的Promise
   */
  getAllProjects: async (db) => {
    try {
      return await Project.findAll(db);
    } catch (error) {
      console.error('获取项目列表失败:', error);
      throw error;
    }
  },

  /**
   * 根据ID获取项目
   * @param {object} db - 数据库连接对象
   * @param {number} id - 项目ID
   * @returns {Promise} - 返回查询结果的Promise
   */
  getProjectById: async (db, id) => {
    try {
      return await Project.findById(db, id);
    } catch (error) {
      console.error(`获取项目 ${id} 失败:`, error);
      throw error;
    }
  },

  /**
   * 创建项目
   * @param {object} db - 数据库连接对象
   * @param {object} projectData - 项目数据
   * @returns {Promise} - 返回创建结果的Promise
   */
  createProject: async (db, projectData) => {
    try {
      // 验证必要字段
      if (!projectData.name || !projectData.start_date) {
        throw new Error('项目名称和开始日期是必填项');
      }

      // 如果没有提供状态，默认为'进行中'
      if (!projectData.status) {
        projectData.status = '进行中';
      }

      const projectId = await Project.create(db, projectData);
      return await Project.findById(db, projectId);
    } catch (error) {
      console.error('创建项目失败:', error);
      throw error;
    }
  },

  /**
   * 更新项目
   * @param {object} db - 数据库连接对象
   * @param {number} id - 项目ID
   * @param {object} projectData - 项目数据
   * @returns {Promise} - 返回更新结果的Promise
   */
  updateProject: async (db, id, projectData) => {
    try {
      // 验证必要字段
      if (!projectData.name || !projectData.start_date) {
        throw new Error('项目名称和开始日期是必填项');
      }

      const changes = await Project.update(db, id, projectData);
      if (changes === 0) {
        throw new Error(`项目 ${id} 不存在`);
      }
      
      return await Project.findById(db, id);
    } catch (error) {
      console.error(`更新项目 ${id} 失败:`, error);
      throw error;
    }
  },

  /**
   * 删除项目
   * @param {object} db - 数据库连接对象
   * @param {number} id - 项目ID
   * @returns {Promise} - 返回删除结果的Promise
   */
  deleteProject: async (db, id) => {
    try {
      const changes = await Project.delete(db, id);
      if (changes === 0) {
        throw new Error(`项目 ${id} 不存在`);
      }
      return { message: '项目删除成功' };
    } catch (error) {
      console.error(`删除项目 ${id} 失败:`, error);
      throw error;
    }
  }
};

export default ProjectService;