// routes/settings.js - 设置路由
import express from 'express';
import { SettingController } from '../controllers/index.js';

const router = express.Router();

// 获取系统设置
router.get('/', SettingController.getSettings);

// 保存系统设置
router.post('/', SettingController.saveSettings);

export default router;