// controllers/settings/settingController.js - 设置控制器
import { SettingService } from '../../services/index.js';

const SettingController = {
  /**
   * 获取系统设置
   */
  getSettings: async (req, res) => {
    try {
      const settings = await SettingService.getSettings(req.db);
      res.json(settings);
    } catch (error) {
      console.error('获取设置失败:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * 保存系统设置
   */
  saveSettings: async (req, res) => {
    try {
      const result = await SettingService.saveSettings(req.db, req.body);
      res.json(result);
    } catch (error) {
      console.error('保存设置失败:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

export default SettingController;