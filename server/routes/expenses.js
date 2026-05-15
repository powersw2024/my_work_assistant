// routes/expenses.js - 费用相关路由
import express from 'express';
import { ExpenseController } from '../controllers/index.js';

const router = express.Router();

// 获取项目的所有费用记录
router.get('/project/:projectId', ExpenseController.getExpensesByProject);

// 获取单条费用记录
router.get('/:id', ExpenseController.getExpenseById);

// 创建费用记录
router.post('/', ExpenseController.createExpense);

// 更新费用记录
router.put('/:id', ExpenseController.updateExpense);

// 删除费用记录
router.delete('/:id', ExpenseController.deleteExpense);

// 导出项目费用记录为Excel
router.get('/export/:projectId', ExpenseController.exportExpensesToExcel);

// 注意：已移除发票解析端点

export default router;