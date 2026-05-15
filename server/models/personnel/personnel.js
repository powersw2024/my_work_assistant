// models/personnel/personnel.js - 人员模型
const Personnel = {
  /**
   * 查找所有人员
   * @param {object} db - 数据库连接对象
   * @returns {Promise} - 返回查询结果的Promise
   */
  findAll: async (db) => {
    return await db.all('SELECT name FROM person ORDER BY name ASC');
  },

  /**
   * 根据姓名查找人员
   * @param {object} db - 数据库连接对象
   * @param {string} name - 人员姓名
   * @returns {Promise} - 返回查询结果的Promise
   */
  findByName: async (db, name) => {
    return await db.get('SELECT * FROM person WHERE name = ?', name);
  },

  /**
   * 创建人员
   * @param {object} db - 数据库连接对象
   * @param {string} name - 人员姓名
   * @returns {Promise} - 返回插入结果的Promise
   */
  create: async (db, name) => {
    // 检查人员姓名是否已存在
    const existingPerson = await Personnel.findByName(db, name);
    if (existingPerson) {
      throw new Error('人员姓名已存在');
    }
    
    const result = await db.run('INSERT INTO person (name) VALUES (?)', name);
    return result.lastID;
  },

  /**
   * 批量创建人员
   * @param {object} db - 数据库连接对象
   * @param {string[]} names - 人员姓名数组
   * @returns {Promise} - 返回插入结果的Promise
   */
  createBatch: async (db, names) => {
    let insertedCount = 0;
    let duplicateCount = 0;
    
    for (const name of names) {
      try {
        await Personnel.create(db, name);
        insertedCount++;
      } catch (error) {
        if (error.message === '人员姓名已存在') {
          duplicateCount++;
        } else {
          throw error; // 抛出其他错误
        }
      }
    }
    
    return {
      inserted: insertedCount,
      duplicates: duplicateCount
    };
  },

  /**
   * 更新人员
   * @param {object} db - 数据库连接对象
   * @param {string} oldName - 原始姓名
   * @param {string} newName - 新姓名
   * @returns {Promise} - 返回更新结果的Promise
   */
  update: async (db, oldName, newName) => {
    // 检查新姓名是否已存在
    const existingPerson = await db.get('SELECT * FROM person WHERE name = ? AND name != ?', newName, oldName);
    if (existingPerson) {
      throw new Error('人员姓名已存在');
    }
    
    const result = await db.run('UPDATE person SET name = ? WHERE name = ?', newName, oldName);
    return result.changes;
  },

  /**
   * 删除人员
   * @param {object} db - 数据库连接对象
   * @param {string} name - 人员姓名
   * @returns {Promise} - 返回删除结果的Promise
   */
  delete: async (db, name) => {
    const result = await db.run('DELETE FROM person WHERE name = ?', name);
    return result.changes;
  }
};

export default Personnel;