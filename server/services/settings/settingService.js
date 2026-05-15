// services/settings/settingService.js - 设置服务
import { Setting } from '../../models/index.js';

const SettingService = {
  /**
   * 获取系统设置
   * @param {object} db - 数据库连接对象
   * @returns {Promise} - 返回查询结果的Promise
   */
  getSettings: async (db) => {
    try {
      return await Setting.getSettings(db);
    } catch (error) {
      console.error('获取设置失败:', error);
      throw error;
    }
  },

  /**
   * 保存系统设置
   * @param {object} db - 数据库连接对象
   * @param {object} settings - 设置对象
   * @returns {Promise} - 返回操作结果的Promise
   */
  saveSettings: async (db, settings) => {
    try {
      return await Setting.saveSettings(db, settings);
    } catch (error) {
      console.error('保存设置失败:', error);
      throw error;
    }
  }
};

export default SettingService;