// models/expenses/expenseRecord.js - 费用记录模型

import ExpenseFile from './expenseFile.js';

const ExpenseRecord = {
  /**
   * 根据项目ID获取所有费用记录
   * @param {object} db - 数据库连接对象
   * @param {number} projectId - 项目ID
   * @returns {Promise} - 返回查询结果的Promise
   */
  findByProjectId: async (db, projectId) => {
    const records = await db.all(`
      SELECT er.*, ec1.name AS main_category, ec2.name AS sub_category
      FROM expense_records er
      JOIN expense_categories ec1 ON er.main_category_id = ec1.id
      JOIN expense_categories ec2 ON er.sub_category_id = ec2.id
      WHERE er.project_id = ?
      ORDER BY er.date DESC
    `, projectId);
    
    // 为每个费用记录添加关联的凭证类型和文件
    for (const record of records) {
      // 获取关联的凭证类型
      const voucherTypes = await db.all(`
        SELECT vt.name 
        FROM voucher_types vt
        JOIN expense_voucher_types evt ON vt.id = evt.voucher_type_id
        WHERE evt.expense_record_id = ?
      `, record.id);
      
      record.voucher_type = voucherTypes.map(vt => vt.name).join(', '); // 显示所有凭证类型
      
      // 获取关联的文件
      const files = await ExpenseFile.findByExpenseRecordId(db, record.id);
      record.files = files.map(f => f.file_path);
    }
    
    return records;
  },

  /**
   * 根据ID获取费用记录
   * @param {object} db - 数据库连接对象
   * @param {number} id - 记录ID
   * @returns {Promise} - 返回查询结果的Promise
   */
  findById: async (db, id) => {
    const record = await db.get(`
      SELECT er.*, ec1.name AS main_category, ec2.name AS sub_category
      FROM expense_records er
      JOIN expense_categories ec1 ON er.main_category_id = ec1.id
      JOIN expense_categories ec2 ON er.sub_category_id = ec2.id
      WHERE er.id = ?
    `, id);
    
    if (record) {
      // 获取关联的凭证类型
      const voucherTypes = await db.all(`
        SELECT vt.name 
        FROM voucher_types vt
        JOIN expense_voucher_types evt ON vt.id = evt.voucher_type_id
        WHERE evt.expense_record_id = ?
      `, id);
      
      record.voucher_types = voucherTypes.map(vt => vt.name); // 返回凭证类型数组
      record.voucher_type = voucherTypes.map(vt => vt.name).join(', '); // 保持原有格式兼容
      
      // 获取关联的文件
      const files = await ExpenseFile.findByExpenseRecordId(db, record.id);
      record.files = files.map(f => f.file_path);
    }
    
    return record;
  },

  /**
   * 创建费用记录
   * @param {object} db - 数据库连接对象
   * @param {object} expenseData - 费用数据
   * @returns {Promise} - 返回插入结果的Promise
   */
  create: async (db, expenseData) => {
    const result = await db.run(`
      INSERT INTO expense_records (
        project_id, amount, main_category_id, sub_category_id, description, 
        file_paths, date
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      expenseData.project_id,
      expenseData.amount,
      expenseData.main_category_id,
      expenseData.sub_category_id,
      expenseData.description,
      expenseData.file_paths,
      expenseData.date
    );
    
    const expenseId = result.lastID;
    
    // 如果有凭证类型，创建关联记录
    if (expenseData.voucher_type_ids && Array.isArray(expenseData.voucher_type_ids) && expenseData.voucher_type_ids.length > 0) {
      for (const voucherTypeId of expenseData.voucher_type_ids) {
        await db.run(
          `INSERT INTO expense_voucher_types (expense_record_id, voucher_type_id) VALUES (?, ?)`,
          expenseId,
          voucherTypeId
        );
      }
    } else if (expenseData.voucher_type_id) {
      // 兼容旧的数据格式
      await db.run(
        `INSERT INTO expense_voucher_types (expense_record_id, voucher_type_id) VALUES (?, ?)`,
        expenseId,
        expenseData.voucher_type_id
      );
    }
    
    // 如果有文件上传，创建文件关联记录
    if (expenseData.files && expenseData.files.length > 0) {
      const fileDataList = expenseData.files.map(file => ({
        expense_record_id: expenseId,
        file_path: file.path || file.file_path,
        file_name: file.originalname || file.file_name,
        file_size: file.size
      }));
      
      await ExpenseFile.batchCreate(db, fileDataList);
    }
    
    return expenseId;
  },

  /**
   * 更新费用记录
   * @param {object} db - 数据库连接对象
   * @param {number} id - 记录ID
   * @param {object} expenseData - 费用数据
   * @returns {Promise} - 返回更新结果的Promise
   */
  update: async (db, id, expenseData) => {
    const result = await db.run(`
      UPDATE expense_records 
      SET amount = ?, main_category_id = ?, sub_category_id = ?, description = ?, 
          file_paths = ?, date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      expenseData.amount,
      expenseData.main_category_id,
      expenseData.sub_category_id,
      expenseData.description,
      expenseData.file_paths,
      expenseData.date,
      id
    );
    
    // 更新凭证类型关联 - 先删除现有关联，再创建新关联
    if (result.changes > 0) {
      // 删除现有的凭证类型关联
      await db.run('DELETE FROM expense_voucher_types WHERE expense_record_id = ?', id);
      
      // 重新建立凭证类型关联
      if (expenseData.voucher_type_ids && Array.isArray(expenseData.voucher_type_ids) && expenseData.voucher_type_ids.length > 0) {
        for (const voucherTypeId of expenseData.voucher_type_ids) {
          await db.run(
            `INSERT INTO expense_voucher_types (expense_record_id, voucher_type_id) VALUES (?, ?)`,
            id,
            voucherTypeId
          );
        }
      } else if (expenseData.voucher_type_id) {
        // 兼容旧的数据格式
        await db.run(
          `INSERT INTO expense_voucher_types (expense_record_id, voucher_type_id) VALUES (?, ?)`,
          id,
          expenseData.voucher_type_id
        );
      }
    }
    
    // 如果有新上传的文件，创建文件关联记录
    if (result.changes > 0 && expenseData.files && expenseData.files.length > 0) {
      const fileDataList = expenseData.files.map(file => ({
        expense_record_id: id,
        file_path: file.path || file.file_path,
        file_name: file.originalname || file.file_name,
        file_size: file.size
      }));
      
      await ExpenseFile.batchCreate(db, fileDataList);
    }
    
    return result.changes;
  },

  /**
   * 删除费用记录
   * @param {object} db - 数据库连接对象
   * @param {number} id - 记录ID
   * @returns {Promise} - 返回删除结果的Promise
   */
  delete: async (db, id) => {
    // 获取关联的文件路径列表，用于删除物理文件
    const files = await ExpenseFile.findByExpenseRecordId(db, id);
    const filePathsToDelete = files.map(f => f.file_path);
    
    // 先删除关联的凭证类型记录
    await db.run('DELETE FROM expense_voucher_types WHERE expense_record_id = ?', id);
    
    // 再删除关联的文件记录
    await ExpenseFile.deleteByExpenseRecordId(db, id);
    
    // 删除物理文件
    if (filePathsToDelete.length > 0) {
      const fs = await import('fs').then(mod => mod.promises);
      const path = await import('path');
      
      for (const filePath of filePathsToDelete) {
        try {
          // 处理相对路径
          let absolutePath = filePath;
          if (filePath.startsWith('..')) {
            // 处理相对路径 ../uploads/...
            absolutePath = path.resolve(process.cwd(), filePath);
          } else if (!path.isAbsolute(filePath)) {
            // 处理相对路径 uploads/...
            absolutePath = path.resolve(process.cwd(), filePath);
          }
          
          // 检查文件是否存在并删除
          await fs.access(absolutePath);
          await fs.unlink(absolutePath);
          console.log(`已删除文件: ${absolutePath}`);
        } catch (error) {
          console.error(`删除文件 ${filePath} 失败:`, error.message);
          // 继续删除其他文件，不中断整个删除过程
        }
      }
    }
    
    const result = await db.run('DELETE FROM expense_records WHERE id = ?', id);
    return result.changes;
  }
};

export default ExpenseRecord;