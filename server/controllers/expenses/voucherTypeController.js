// controllers/expenses/voucherTypeController.js - 凭证类型控制器
import { VoucherTypeService } from '../../services/index.js';

const VoucherTypeController = {
  /**
   * 获取所有凭证类型
   */
  getAllVoucherTypes: async (req, res) => {
    try {
      const types = await VoucherTypeService.getAllVoucherTypes(req.db);
      res.json(types);
    } catch (error) {
      console.error('获取凭证类型失败:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * 根据ID获取凭证类型
   */
  getVoucherTypeById: async (req, res) => {
    try {
      const type = await VoucherTypeService.getVoucherTypeById(req.db, req.params.id);
      if (!type) {
        return res.status(404).json({ error: '凭证类型不存在' });
      }
      res.json(type);
    } catch (error) {
      console.error('获取凭证类型失败:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * 根据名称获取凭证类型
   */
  getVoucherTypeByName: async (req, res) => {
    try {
      const type = await VoucherTypeService.getVoucherTypeByName(req.db, req.params.name);
      if (!type) {
        return res.status(404).json({ error: '凭证类型不存在' });
      }
      res.json(type);
    } catch (error) {
      console.error('获取凭证类型失败:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * 创建凭证类型
   */
  createVoucherType: async (req, res) => {
    try {
      const type = await VoucherTypeService.createVoucherType(req.db, req.body);
      res.status(201).json(type);
    } catch (error) {
      console.error('创建凭证类型失败:', error);
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * 更新凭证类型
   */
  updateVoucherType: async (req, res) => {
    try {
      const type = await VoucherTypeService.updateVoucherType(req.db, req.params.id, req.body);
      res.json(type);
    } catch (error) {
      console.error('更新凭证类型失败:', error);
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * 删除凭证类型
   */
  deleteVoucherType: async (req, res) => {
    try {
      const result = await VoucherTypeService.deleteVoucherType(req.db, req.params.id);
      res.json(result);
    } catch (error) {
      console.error('删除凭证类型失败:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

export default VoucherTypeController;