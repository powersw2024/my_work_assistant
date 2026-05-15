// models/expenses/expenseCategory.js - 费用类别模型
const ExpenseCategory = {
  /**
   * 查询所有费用类别
   * @param {object} db - 数据库连接对象
   * @returns {Promise} - 返回查询结果的Promise
   */
  findAll: async (db) => {
    return await db.all(`
      SELECT id, name, parent_id
      FROM expense_categories
      ORDER BY parent_id ASC, name ASC
    `);
  },

  /**
   * 查找所有主类别
   * @param {object} db - 数据库连接对象
   * @returns {Promise} - 返回查询结果的Promise
   */
  findMainCategories: async (db) => {
    return await db.all(`
      SELECT DISTINCT ec.name, ec.id, ec.parent_id, COUNT(ec2.id) as child_count
      FROM expense_categories ec
      LEFT JOIN expense_categories ec2 ON ec2.parent_id = ec.id
      WHERE ec.parent_id IS NULL
      GROUP BY ec.id
      ORDER BY ec.name ASC
    `);
  },

  /**
   * 根据父类别查找子类别
   * @param {object} db - 数据库连接对象
   * @param {number} parentId - 父类别ID
   * @returns {Promise} - 返回查询结果的Promise
   */
  findSubCategoriesByParentId: async (db, parentId) => {
    return await db.all('SELECT id, name FROM expense_categories WHERE parent_id = ? ORDER BY name ASC', parentId);
  },

  /**
   * 根据名称查找类别
   * @param {object} db - 数据库连接对象
   * @param {string} name - 类别名称
   * @returns {Promise} - 返回查询结果的Promise
   */
  findByName: async (db, name) => {
    return await db.get('SELECT * FROM expense_categories WHERE name = ?', name);
  },

  /**
   * 根据ID查找类别
   * @param {object} db - 数据库连接对象
   * @param {number} id - 类别ID
   * @returns {Promise} - 返回查询结果的Promise
   */
  findById: async (db, id) => {
    return await db.get('SELECT * FROM expense_categories WHERE id = ?', id);
  },

  /**
   * 根据名称查找类别
   * @param {object} db - 数据库连接对象
   * @param {string} name - 类别名称
   * @param {number} parentId - 父类别ID（可选）
   * @returns {Promise} - 返回查询结果的Promise
   */
  findByNameAndParent: async (db, name, parentId = null) => {
    if (parentId === null) {
      return await db.get('SELECT * FROM expense_categories WHERE name = ? AND parent_id IS NULL', name);
    } else {
      return await db.get('SELECT * FROM expense_categories WHERE name = ? AND parent_id = ?', name, parentId);
    }
  },

  /**
   * 创建主类别
   * @param {object} db - 数据库连接对象
   * @param {object} categoryData - 类别数据
   * @returns {Promise} - 返回插入结果的Promise
   */
  createMainCategory: async (db, categoryData) => {
    // 检查主类别名称是否已存在
    const existingCategory = await ExpenseCategory.findByNameAndParent(db, categoryData.name, null);
    if (existingCategory) {
      throw new Error('主类别名称已存在');
    }
    
    const result = await db.run(
      `INSERT INTO expense_categories (name, parent_id)
      VALUES (?, NULL)`,
      categoryData.name
    );
    return result.lastID;
  },

  /**
   * 创建子类别
   * @param {object} db - 数据库连接对象
   * @param {object} categoryData - 类别数据
   * @returns {Promise} - 返回插入结果的Promise
   */
  createChildCategory: async (db, categoryData) => {
    // 检查子类别名称是否已存在
    const existingCategory = await ExpenseCategory.findByNameAndParent(db, categoryData.name, categoryData.parent_id);
    if (existingCategory) {
      throw new Error('子类别名称已存在');
    }
    
    const result = await db.run(
      `INSERT INTO expense_categories (name, parent_id)
      VALUES (?, ?)`,
      categoryData.name,
      categoryData.parent_id
    );
    return result.lastID;
  },

  /**
   * 更新类别
   * @param {object} db - 数据库连接对象
   * @param {number} id - 类别ID
   * @param {object} categoryData - 类别数据
   * @returns {Promise} - 返回更新结果的Promise
   */
  update: async (db, id, categoryData) => {
    // 检查类别名称是否已存在（排除当前类别）
    let existingCategory;
    if (categoryData.parent_id === null) {
      existingCategory = await db.get(
        'SELECT * FROM expense_categories WHERE name = ? AND parent_id IS NULL AND id != ?',
        categoryData.name,
        id
      );
    } else {
      existingCategory = await db.get(
        'SELECT * FROM expense_categories WHERE name = ? AND parent_id = ? AND id != ?',
        categoryData.name,
        categoryData.parent_id,
        id
      );
    }
    
    if (existingCategory) {
      throw new Error('类别名称已存在');
    }
    
    const result = await db.run(
      `UPDATE expense_categories 
      SET name = ?
      WHERE id = ?`,
      categoryData.name,
      id
    );
    return result.changes;
  },

  /**
   * 删除类别
   * @param {object} db - 数据库连接对象
   * @param {number} id - 类别ID
   * @returns {Promise} - 返回删除结果的Promise
   */
  delete: async (db, id) => {
    const result = await db.run('DELETE FROM expense_categories WHERE id = ? OR parent_id = ?', id, id);
    return result.changes;
  }
};

export default ExpenseCategory;