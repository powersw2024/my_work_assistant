// services/expenses/expenseCategoryService.js - 费用类别服务
import { ExpenseCategory } from '../../models/index.js';

const ExpenseCategoryService = {
  /**
   * 获取所有费用类别（包括主类别和子类别）
   * @param {object} db - 数据库连接对象
   * @returns {Promise} - 返回查询结果的Promise
   */
  getAllCategories: async (db) => {
    try {
      const allCategories = await ExpenseCategory.findAll(db);
      
      // 按主类别分组返回数据
      const mainCategories = allCategories.filter(cat => cat.parent_id === null);
      const categoriesByParent = {};
      
      mainCategories.forEach(mainCat => {
        categoriesByParent[mainCat.id] = allCategories
          .filter(cat => cat.parent_id === mainCat.id)
          .map(subCat => ({ id: subCat.id, name: subCat.name }));
      });
      
      return {
        mainCategories: mainCategories.map(cat => ({ id: cat.id, name: cat.name })),
        categoriesByParent
      };
    } catch (error) {
      console.error('获取费用类别失败:', error);
      throw error;
    }
  },

  /**
   * 获取所有主类别
   * @param {object} db - 数据库连接对象
   * @returns {Promise} - 返回查询结果的Promise
   */
  getMainCategories: async (db) => {
    try {
      return await ExpenseCategory.findMainCategories(db);
    } catch (error) {
      console.error('获取主类别失败:', error);
      throw error;
    }
  },

  /**
   * 根据主类别ID获取子类别
   * @param {object} db - 数据库连接对象
   * @param {number} parentId - 主类别ID
   * @returns {Promise} - 返回查询结果的Promise
   */
  getSubCategoriesByParentId: async (db, parentId) => {
    try {
      return await ExpenseCategory.findSubCategoriesByParentId(db, parentId);
    } catch (error) {
      console.error(`获取主类别 ${parentId} 的子类别失败:`, error);
      throw error;
    }
  },

  /**
   * 根据名称查找类别
   * @param {object} db - 数据库连接对象
   * @param {string} name - 类别名称
   * @returns {Promise} - 返回查询结果的Promise
   */
  getCategoryByName: async (db, name) => {
    try {
      return await ExpenseCategory.findByName(db, name);
    } catch (error) {
      console.error(`查找类别 ${name} 失败:`, error);
      throw error;
    }
  },

  /**
   * 创建费用类别
   * @param {object} db - 数据库连接对象
   * @param {object} categoryData - 类别数据
   * @returns {Promise} - 返回创建结果的Promise
   */
  createCategory: async (db, categoryData) => {
    try {
      // 验证必要字段
      if (!categoryData.name) {
        throw new Error('类别名称是必填项');
      }

      // 根据是否有parent_id来判断是创建主类别还是子类别
      if (!categoryData.parent_id) {
        // 创建主类别
        const categoryId = await ExpenseCategory.createMainCategory(db, categoryData);
        return await ExpenseCategory.findById(db, categoryId);
      } else {
        // 创建子类别
        const categoryId = await ExpenseCategory.createChildCategory(db, categoryData);
        return await ExpenseCategory.findById(db, categoryId);
      }
    } catch (error) {
      console.error('创建费用类别失败:', error);
      throw error;
    }
  },

  /**
   * 更新费用类别
   * @param {object} db - 数据库连接对象
   * @param {number} id - 类别ID
   * @param {object} categoryData - 类别数据
   * @returns {Promise} - 返回更新结果的Promise
   */
  updateCategory: async (db, id, categoryData) => {
    try {
      // 验证必要字段
      if (!categoryData.name) {
        throw new Error('类别名称是必填项');
      }

      const changes = await ExpenseCategory.update(db, id, categoryData);
      if (changes === 0) {
        throw new Error(`费用类别 ${id} 不存在`);
      }
      
      return await ExpenseCategory.findById(db, id);
    } catch (error) {
      console.error(`更新费用类别 ${id} 失败:`, error);
      throw error;
    }
  },

  /**
   * 删除费用类别
   * @param {object} db - 数据库连接对象
   * @param {number} id - 类别ID
   * @returns {Promise} - 返回删除结果的Promise
   */
  deleteCategory: async (db, id) => {
    try {
      const changes = await ExpenseCategory.delete(db, id);
      if (changes === 0) {
        throw new Error(`费用类别 ${id} 不存在`);
      }
      return { message: '费用类别删除成功' };
    } catch (error) {
      console.error(`删除费用类别 ${id} 失败:`, error);
      throw error;
    }
  }
};

export default ExpenseCategoryService;