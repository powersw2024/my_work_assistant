// models/worklogs/workLog.js - 工作日志模型
const WorkLog = {
  /**
   * 根据项目ID获取工作日志
   * @param {object} db - 数据库连接对象
   * @param {number} projectId - 项目ID
   * @returns {Promise} - 返回查询结果的Promise
   */
  findByProjectId: async (db, projectId) => {
    return await db.all(`
      SELECT id, project_id, log_date, author, executor, weather, location, content, next_day_plan, created_at, updated_at 
      FROM work_logs 
      WHERE project_id = ?
      ORDER BY log_date DESC
    `, projectId);
  },

  /**
   * 根据ID获取工作日志
   * @param {object} db - 数据库连接对象
   * @param {number} id - 日志ID
   * @returns {Promise} - 返回查询结果的Promise
   */
  findById: async (db, id) => {
    return await db.get(`
      SELECT id, project_id, log_date, author, executor, weather, location, content, next_day_plan, created_at, updated_at 
      FROM work_logs 
      WHERE id = ?
    `, id);
  },

  /**
   * 创建工作日志
   * @param {object} db - 数据库连接对象
   * @param {object} logData - 日志数据
   * @returns {Promise} - 返回插入结果的Promise
   */
  create: async (db, logData) => {
    const result = await db.run(`
      INSERT INTO work_logs (project_id, log_date, author, executor, weather, location, content, next_day_plan)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      logData.project_id,
      logData.log_date,
      logData.author,
      logData.executor,  // 支持存储多选人员（逗号分隔）
      logData.weather,
      logData.location,
      logData.content,
      logData.next_day_plan
    );
    return result.lastID;
  },

  /**
   * 更新工作日志
   * @param {object} db - 数据库连接对象
   * @param {number} id - 日志ID
   * @param {object} logData - 日志数据
   * @returns {Promise} - 返回更新结果的Promise
   */
  update: async (db, id, logData) => {
    const result = await db.run(`
      UPDATE work_logs 
      SET log_date = ?, author = ?, executor = ?, weather = ?, location = ?, content = ?, next_day_plan = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      logData.log_date,
      logData.author,
      logData.executor,  // 支持存储多选人员（逗号分隔）
      logData.weather,
      logData.location,
      logData.content,
      logData.next_day_plan,
      id
    );
    return result.changes;
  },

  /**
   * 删除工作日志
   * @param {object} db - 数据库连接对象
   * @param {number} id - 日志ID
   * @returns {Promise} - 返回删除结果的Promise
   */
  delete: async (db, id) => {
    const result = await db.run('DELETE FROM work_logs WHERE id = ?', id);
    return result.changes;
  }
};

export default WorkLog;