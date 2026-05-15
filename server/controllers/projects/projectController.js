// controllers/projects/projectController.js - 项目控制器
import { ProjectService } from '../../services/index.js';

const ProjectController = {
  /**
   * 获取所有项目
   */
  getAllProjects: async (req, res) => {
    try {
      const projects = await ProjectService.getAllProjects(req.db);
      res.json(projects);
    } catch (error) {
      console.error('获取项目列表失败:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * 获取单个项目
   */
  getProjectById: async (req, res) => {
    try {
      const project = await ProjectService.getProjectById(req.db, req.params.id);
      if (!project) {
        return res.status(404).json({ error: '项目不存在' });
      }
      res.json(project);
    } catch (error) {
      console.error('获取项目失败:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * 创建项目
   */
  createProject: async (req, res) => {
    try {
      const project = await ProjectService.createProject(req.db, req.body);
      res.status(201).json(project);
    } catch (error) {
      console.error('创建项目失败:', error);
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * 更新项目
   */
  updateProject: async (req, res) => {
    try {
      const project = await ProjectService.updateProject(req.db, req.params.id, req.body);
      res.json(project);
    } catch (error) {
      console.error('更新项目失败:', error);
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * 删除项目
   */
  deleteProject: async (req, res) => {
    try {
      const result = await ProjectService.deleteProject(req.db, req.params.id);
      res.json(result);
    } catch (error) {
      console.error('删除项目失败:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

export default ProjectController;