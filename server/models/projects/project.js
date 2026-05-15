// models/projects/project.js - 项目模型
const Project = {
  /**
   * 查找所有项目
   * @param {object} db - 数据库连接对象
   * @returns {Promise} - 返回查询结果的Promise
   */
  findAll: async (db) => {
    return await db.all('SELECT * FROM projects ORDER BY created_at DESC');
  },

  /**
   * 根据ID查找项目
   * @param {object} db - 数据库连接对象
   * @param {number} id - 项目ID
   * @returns {Promise} - 返回查询结果的Promise
   */
  findById: async (db, id) => {
    return await db.get('SELECT * FROM projects WHERE id = ?', id);
  },

  /**
   * 根据项目名称查找项目
   * @param {object} db - 数据库连接对象
   * @param {string} name - 项目名称
   * @returns {Promise} - 返回查询结果的Promise
   */
  findByName: async (db, name) => {
    return await db.get('SELECT * FROM projects WHERE name = ?', name);
  },

  /**
   * 创建项目
   * @param {object} db - 数据库连接对象
   * @param {object} projectData - 项目数据
   * @returns {Promise} - 返回插入结果的Promise
   */
  create: async (db, projectData) => {
    // 检查项目名称是否已存在
    const existingProject = await Project.findByName(db, projectData.name);
    if (existingProject) {
      throw new Error('项目名称已存在');
    }
    
    const result = await db.run(
      `INSERT INTO projects (name, description, start_date, end_date, status, created_by)
      VALUES (?, ?, ?, ?, ?, ?)`,
      projectData.name,
      projectData.description,
      projectData.start_date,
      projectData.end_date,
      projectData.status,
      projectData.created_by
    );
    return result.lastID;
  },

  /**
   * 更新项目
   * @param {object} db - 数据库连接对象
   * @param {number} id - 项目ID
   * @param {object} projectData - 项目数据
   * @returns {Promise} - 返回更新结果的Promise
   */
  update: async (db, id, projectData) => {
    // 检查项目名称是否已存在（排除当前项目）
    const existingProject = await db.get('SELECT * FROM projects WHERE name = ? AND id != ?', projectData.name, id);
    if (existingProject) {
      throw new Error('项目名称已存在');
    }
    
    const result = await db.run(
      `UPDATE projects 
      SET name = ?, description = ?, start_date = ?, end_date = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      projectData.name,
      projectData.description,
      projectData.start_date,
      projectData.end_date,
      projectData.status,
      id
    );
    return result.changes;
  },

  /**
   * 删除项目
   * @param {object} db - 数据库连接对象
   * @param {number} id - 项目ID
   * @returns {Promise} - 返回删除结果的Promise
   */
  delete: async (db, id) => {
    const result = await db.run('DELETE FROM projects WHERE id = ?', id);
    return result.changes;
  }
};

export default Project;