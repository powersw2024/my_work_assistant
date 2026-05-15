// routes/worklogs.js - 工作日志相关路由
import express from 'express';
import { WorkLogController } from '../controllers/index.js';

const router = express.Router();

// 根据项目ID获取日志
router.get('/project/:projectId', WorkLogController.getLogsByProjectId);

// 获取单个日志
router.get('/:id', WorkLogController.getLogById);

// 创建日志
router.post('/', WorkLogController.createLog);

// 更新日志
router.put('/:id', WorkLogController.updateLog);

// 删除日志
router.delete('/:id', WorkLogController.deleteLog);

// 导出项目工作日志为Excel
router.get('/export/:projectId', WorkLogController.exportLogsToExcel);

export default router;