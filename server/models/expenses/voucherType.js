// models/expenses/voucherType.js - 凭证类型模型
const VoucherType = {
  /**
   * 查找所有凭证类型
   * @param {object} db - 数据库连接对象
   * @returns {Promise} - 返回查询结果的Promise
   */
  findAll: async (db) => {
    return await db.all('SELECT id, name, description, created_at FROM voucher_types ORDER BY name ASC');
  },

  /**
   * 根据ID查找凭证类型
   * @param {object} db - 数据库连接对象
   * @param {number} id - 凭证类型ID
   * @returns {Promise} - 返回查询结果的Promise
   */
  findById: async (db, id) => {
    return await db.get('SELECT * FROM voucher_types WHERE id = ?', id);
  },

  /**
   * 根据名称查找凭证类型
   * @param {object} db - 数据库连接对象
   * @param {string} name - 凭证类型名称
   * @returns {Promise} - 返回查询结果的Promise
   */
  findByName: async (db, name) => {
    return await db.get('SELECT * FROM voucher_types WHERE name = ?', name);
  },

  /**
   * 创建凭证类型
   * @param {object} db - 数据库连接对象
   * @param {object} voucherTypeData - 凭证类型数据
   * @returns {Promise} - 返回插入结果的Promise
   */
  create: async (db, voucherTypeData) => {
    // 检查明细账类型名称是否已存在
    const existingVoucherType = await VoucherType.findByName(db, voucherTypeData.name);
    if (existingVoucherType) {
      throw new Error('凭证类型名称已存在');
    }
    
    const result = await db.run(
      `INSERT INTO voucher_types (name, description)
      VALUES (?, ?)`,
      voucherTypeData.name,
      voucherTypeData.description
    );
    return result.lastID;
  },

  /**
   * 更新凭证类型
   * @param {object} db - 数据库连接对象
   * @param {number} id - 凭证类型ID
   * @param {object} voucherTypeData - 凭证类型数据
   * @returns {Promise} - 返回更新结果的Promise
   */
  update: async (db, id, voucherTypeData) => {
    // 检查明细账类型名称是否已存在（排除当前类型）
    const existingVoucherType = await db.get('SELECT * FROM voucher_types WHERE name = ? AND id != ?', voucherTypeData.name, id);
    if (existingVoucherType) {
      throw new Error('凭证类型名称已存在');
    }
    
    const result = await db.run(
      `UPDATE voucher_types 
      SET name = ?, description = ?
      WHERE id = ?`,
      voucherTypeData.name,
      voucherTypeData.description,
      id
    );
    return result.changes;
  },

  /**
   * 删除凭证类型
   * @param {object} db - 数据库连接对象
   * @param {number} id - 凭证类型ID
   * @returns {Promise} - 返回删除结果的Promise
   */
  delete: async (db, id) => {
    const result = await db.run('DELETE FROM voucher_types WHERE id = ?', id);
    return result.changes;
  }
};

export default VoucherType;