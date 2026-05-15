// routes/projects.js - 项目相关路由
import express from 'express';
import { ProjectController } from '../controllers/index.js';

const router = express.Router();

// 获取所有项目
router.get('/', ProjectController.getAllProjects);

// 获取单个项目
router.get('/:id', ProjectController.getProjectById);

// 创建项目
router.post('/', ProjectController.createProject);

// 更新项目
router.put('/:id', ProjectController.updateProject);

// 删除项目
router.delete('/:id', ProjectController.deleteProject);

export default router;