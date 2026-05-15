// services/personnelService.js - 人员服务
import { Personnel } from '../models/index.js';

const PersonnelService = {
  /**
   * 获取所有人员
   * @param {object} db - 数据库连接对象
   * @returns {Promise} - 返回查询结果的Promise
   */
  getAllPersonnel: async (db) => {
    try {
      // 查询person表获取所有人员
      const personnel = await db.all('SELECT name FROM person ORDER BY name ASC');
      return personnel.map(p => p.name);
    } catch (error) {
      // 检查是否是由于表不存在导致的错误
      if (error.message.includes('no such table') || error.message.includes('has no column')) {
        console.warn('人员表不存在，将返回空数组。请考虑更新数据库结构。');
        return [];
      }
      console.error('获取人员列表失败:', error);
      throw error;
    }
  }
};

export default PersonnelService;