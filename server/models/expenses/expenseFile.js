// models/expenses/expenseFile.js - 费用文件关联模型
const ExpenseFile = {
  /**
   * 根据费用记录ID获取所有关联的文件
   * @param {object} db - 数据库连接对象
   * @param {number} expenseRecordId - 费用记录ID
   * @returns {Promise} - 返回查询结果的Promise
   */
  findByExpenseRecordId: async (db, expenseRecordId) => {
    return await db.all(`
      SELECT * FROM expense_files 
      WHERE expense_record_id = ?
      ORDER BY created_at DESC
    `, expenseRecordId);
  },

  /**
   * 根据ID获取费用文件记录
   * @param {object} db - 数据库连接对象
   * @param {number} id - 记录ID
   * @returns {Promise} - 返回查询结果的Promise
   */
  findById: async (db, id) => {
    return await db.get('SELECT * FROM expense_files WHERE id = ?', id);
  },

  /**
   * 创建费用文件关联记录
   * @param {object} db - 数据库连接对象
   * @param {object} fileData - 文件数据
   * @returns {Promise} - 返回插入结果的Promise
   */
  create: async (db, fileData) => {
    const result = await db.run(`
      INSERT INTO expense_files (
        expense_record_id, file_path, file_name, file_size
      ) VALUES (?, ?, ?, ?)
    `,
      fileData.expense_record_id,
      fileData.file_path,
      fileData.file_name,
      fileData.file_size
    );
    return result.lastID;
  },

  /**
   * 批量创建费用文件关联记录
   * @param {object} db - 数据库连接对象
   * @param {Array} fileDataList - 文件数据列表
   * @returns {Promise} - 返回插入结果的Promise
   */
  batchCreate: async (db, fileDataList) => {
    // 使用事务来确保批量操作的一致性
    const insertedIds = [];
    
    // 开始事务
    await db.run("BEGIN TRANSACTION");
    
    try {
      for (const fileData of fileDataList) {
        const result = await db.run(`
          INSERT INTO expense_files (
            expense_record_id, file_path, file_name, file_size
          ) VALUES (?, ?, ?, ?)
        `,
          fileData.expense_record_id,
          fileData.file_path,
          fileData.file_name,
          fileData.file_size
        );
        insertedIds.push(result.lastID);
      }
      
      // 提交事务
      await db.run("COMMIT");
    } catch (error) {
      // 如果发生错误，回滚事务
      await db.run("ROLLBACK");
      throw error;
    }
    
    return insertedIds;
  },

  /**
   * 删除费用记录的所有关联文件
   * @param {object} db - 数据库连接对象
   * @param {number} expenseRecordId - 费用记录ID
   * @returns {Promise} - 返回删除结果的Promise
   */
  deleteByExpenseRecordId: async (db, expenseRecordId) => {
    const result = await db.run('DELETE FROM expense_files WHERE expense_record_id = ?', expenseRecordId);
    return result.changes;
  },

  /**
   * 删除单个费用文件记录
   * @param {object} db - 数据库连接对象
   * @param {number} id - 记录ID
   * @returns {Promise} - 返回删除结果的Promise
   */
  delete: async (db, id) => {
    const result = await db.run('DELETE FROM expense_files WHERE id = ?', id);
    return result.changes;
  }
};

export default ExpenseFile;