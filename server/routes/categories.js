// routes/categories.js - 费用类别相关路由
import express from 'express';
import { ExpenseCategoryController, VoucherTypeController } from '../controllers/index.js';

const router = express.Router();

// 获取所有费用类别 - 直接使用根路径，因为路由会被挂载到 /categories 下
router.get('/', ExpenseCategoryController.getAllCategories);

// 获取所有主类别
router.get('/main-categories', ExpenseCategoryController.getMainCategories);

// 根据主类别ID获取子类别
router.get('/sub-categories/:parentId', ExpenseCategoryController.getSubCategoriesByParentId);

// 根据名称查找类别
router.get('/category/:name', ExpenseCategoryController.getCategoryByName);

// 创建费用类别
router.post('/category', ExpenseCategoryController.createCategory);

// 更新费用类别
router.put('/category/:id', ExpenseCategoryController.updateCategory);

// 删除费用类别
router.delete('/category/:id', ExpenseCategoryController.deleteCategory);

// 获取所有凭证类型
router.get('/voucher-types', VoucherTypeController.getAllVoucherTypes);

// 根据ID获取凭证类型
router.get('/voucher-type/:id', VoucherTypeController.getVoucherTypeById);

// 根据名称获取凭证类型
router.get('/voucher-type/name/:name', VoucherTypeController.getVoucherTypeByName);

// 创建凭证类型
router.post('/voucher-type', VoucherTypeController.createVoucherType);

// 更新凭证类型
router.put('/voucher-type/:id', VoucherTypeController.updateVoucherType);

// 删除凭证类型
router.delete('/voucher-type/:id', VoucherTypeController.deleteVoucherType);

export default router;