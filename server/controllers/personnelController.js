// controllers/personnelController.js - 人员控制器
import { PersonnelService } from '../services/index.js';

const PersonnelController = {
  /**
   * 获取所有人员
   */
  getAllPersonnel: async (req, res) => {
    try {
      const personnel = await PersonnelService.getAllPersonnel(req.db);
      res.json(personnel);
    } catch (error) {
      console.error('获取人员列表失败:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

export default PersonnelController;