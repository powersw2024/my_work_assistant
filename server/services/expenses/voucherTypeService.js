/**
 * 凭证类型服务
 */
import VoucherTypeModel from '../../models/expenses/voucherType.js';

const VoucherTypeService = {
  /**
   * 获取所有凭证类型
   * @param {object} db - 数据库连接对象
   * @returns {Promise} - 返回凭证类型的Promise
   */
  getAllVoucherTypes: async (db) => {
    try {
      return await VoucherTypeModel.findAll(db);
    } catch (error) {
      throw new Error(`获取凭证类型失败: ${error.message}`);
    }
  },

  /**
   * 根据ID获取凭证类型
   * @param {object} db - 数据库连接对象
   * @param {number} id - 凭证类型ID
   * @returns {Promise} - 返回凭证类型的Promise
   */
  getVoucherTypeById: async (db, id) => {
    try {
      const type = await VoucherTypeModel.findById(db, id);
      if (!type) {
        throw new Error('凭证类型不存在');
      }
      return type;
    } catch (error) {
      throw new Error(`获取凭证类型失败: ${error.message}`);
    }
  },

  /**
   * 根据名称获取凭证类型
   * @param {object} db - 数据库连接对象
   * @param {string} name - 凭证类型名称
   * @returns {Promise} - 返回凭证类型的Promise
   */
  getVoucherTypeByName: async (db, name) => {
    try {
      const type = await VoucherTypeModel.findByName(db, name);
      if (!type) {
        throw new Error('凭证类型不存在');
      }
      return type;
    } catch (error) {
      throw new Error(`获取凭证类型失败: ${error.message}`);
    }
  },

  /**
   * 创建凭证类型
   * @param {object} db - 数据库连接对象
   * @param {object} voucherTypeData - 凭证类型数据
   * @returns {Promise} - 返回创建的凭证类型的Promise
   */
  createVoucherType: async (db, voucherTypeData) => {
    try {
      const id = await VoucherTypeModel.create(db, voucherTypeData);
      return await VoucherTypeModel.findById(db, id);
    } catch (error) {
      throw new Error(`创建凭证类型失败: ${error.message}`);
    }
  },

  /**
   * 更新凭证类型
   * @param {object} db - 数据库连接对象
   * @param {number} id - 凭证类型ID
   * @param {object} voucherTypeData - 凭证类型数据
   * @returns {Promise} - 返回更新的凭证类型的Promise
   */
  updateVoucherType: async (db, id, voucherTypeData) => {
    try {
      const affectedRows = await VoucherTypeModel.update(db, id, voucherTypeData);
      if (affectedRows === 0) {
        throw new Error('凭证类型不存在或未被更新');
      }
      return await VoucherTypeModel.findById(db, id);
    } catch (error) {
      throw new Error(`更新凭证类型失败: ${error.message}`);
    }
  },

  /**
   * 删除凭证类型
   * @param {object} db - 数据库连接对象
   * @param {number} id - 凭证类型ID
   * @returns {Promise} - 返回操作结果的Promise
   */
  deleteVoucherType: async (db, id) => {
    try {
      const affectedRows = await VoucherTypeModel.delete(db, id);
      if (affectedRows === 0) {
        throw new Error('凭证类型不存在或未被删除');
      }
      return { message: '凭证类型删除成功' };
    } catch (error) {
      throw new Error(`删除凭证类型失败: ${error.message}`);
    }
  }
};

export default VoucherTypeService;