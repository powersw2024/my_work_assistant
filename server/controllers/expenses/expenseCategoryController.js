// controllers/expenses/expenseCategoryController.js - 费用类别控制器
import { ExpenseCategoryService } from '../../services/index.js';

const ExpenseCategoryController = {
  /**
   * 获取所有费用类别
   */
  getAllCategories: async (req, res) => {
    try {
      const categories = await ExpenseCategoryService.getAllCategories(req.db);
      res.json(categories);
    } catch (error) {
      console.error('获取费用类别失败:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * 获取所有主类别
   */
  getMainCategories: async (req, res) => {
    try {
      const categories = await ExpenseCategoryService.getMainCategories(req.db);
      res.json(categories);
    } catch (error) {
      console.error('获取主类别失败:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * 根据主类别ID获取子类别
   */
  getSubCategoriesByParentId: async (req, res) => {
    try {
      const categories = await ExpenseCategoryService.getSubCategoriesByParentId(req.db, req.params.parentId);
      res.json(categories);
    } catch (error) {
      console.error('获取子类别失败:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * 根据名称查找类别
   */
  getCategoryByName: async (req, res) => {
    try {
      const category = await ExpenseCategoryService.getCategoryByName(req.db, req.params.name);
      if (!category) {
        return res.status(404).json({ error: '费用类别不存在' });
      }
      res.json(category);
    } catch (error) {
      console.error('查找费用类别失败:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * 创建费用类别
   */
  createCategory: async (req, res) => {
    try {
      const category = await ExpenseCategoryService.createCategory(req.db, req.body);
      res.status(201).json(category);
    } catch (error) {
      console.error('创建费用类别失败:', error);
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * 更新费用类别
   */
  updateCategory: async (req, res) => {
    try {
      const category = await ExpenseCategoryService.updateCategory(req.db, req.params.id, req.body);
      res.json(category);
    } catch (error) {
      console.error('更新费用类别失败:', error);
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * 删除费用类别
   */
  deleteCategory: async (req, res) => {
    try {
      const result = await ExpenseCategoryService.deleteCategory(req.db, req.params.id);
      res.json(result);
    } catch (error) {
      console.error('删除费用类别失败:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

export default ExpenseCategoryController;