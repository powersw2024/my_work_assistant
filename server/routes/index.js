// routes/index.js - 主路由文件
import express from 'express';
import projectRoutes from './projects.js';
import workLogRoutes from './worklogs.js';
import expenseRoutes from './expenses.js';
import categoryRoutes from './categories.js';
import personnelRoutes from './personnel.js';
import settingRoutes from './settings.js';  // 添加设置路由

const router = express.Router();

// 挂载子路由
router.use('/projects', projectRoutes);
router.use('/worklogs', workLogRoutes);
router.use('/expenses', expenseRoutes);
router.use('/categories', categoryRoutes);
router.use('/personnel', personnelRoutes);
router.use('/settings', settingRoutes);  // 添加设置路由

export default router;