// models/users/user.js - 用户模型
const User = {
  /**
   * 获取所有用户
   * @param {object} db - 数据库连接对象
   * @returns {Promise} - 返回查询结果的Promise
   */
  findAll: async (db) => {
    return await db.all('SELECT id, username, email, created_at, updated_at FROM users ORDER BY created_at DESC');
  },

  /**
   * 根据ID获取用户
   * @param {object} db - 数据库连接对象
   * @param {number} id - 用户ID
   * @returns {Promise} - 返回查询结果的Promise
   */
  findById: async (db, id) => {
    return await db.get('SELECT id, username, email, created_at, updated_at FROM users WHERE id = ?', id);
  },

  /**
   * 根据用户名查找用户
   * @param {object} db - 数据库连接对象
   * @param {string} username - 用户名
   * @returns {Promise} - 返回查询结果的Promise
   */
  findByUsername: async (db, username) => {
    return await db.get('SELECT id, username, password_hash, email, created_at, updated_at FROM users WHERE username = ?', username);
  },

  /**
   * 创建用户
   * @param {object} db - 数据库连接对象
   * @param {object} userData - 用户数据
   * @returns {Promise} - 返回插入结果的Promise
   */
  create: async (db, userData) => {
    const result = await db.run(
      `INSERT INTO users (username, password_hash, email)
      VALUES (?, ?, ?)`,
      userData.username,
      userData.password_hash,
      userData.email
    );
    return result.lastID;
  },

  /**
   * 更新用户
   * @param {object} db - 数据库连接对象
   * @param {number} id - 用户ID
   * @param {object} userData - 用户数据
   * @returns {Promise} - 返回更新结果的Promise
   */
  update: async (db, id, userData) => {
    const result = await db.run(
      `UPDATE users 
      SET username = COALESCE(?, username), 
          email = COALESCE(?, email), 
          password_hash = COALESCE(?, password_hash),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      userData.username,
      userData.email,
      userData.password_hash,
      id
    );
    return result.changes;
  },

  /**
   * 删除用户
   * @param {object} db - 数据库连接对象
   * @param {number} id - 用户ID
   * @returns {Promise} - 返回删除结果的Promise
   */
  delete: async (db, id) => {
    const result = await db.run('DELETE FROM users WHERE id = ?', id);
    return result.changes;
  }
};

export default User;