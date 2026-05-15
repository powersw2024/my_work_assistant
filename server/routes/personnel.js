// routes/personnel.js - 人员相关路由
import express from 'express';
import { PersonnelController } from '../controllers/index.js';

const router = express.Router();

// 获取所有人员
router.get('/', PersonnelController.getAllPersonnel);

export default router;