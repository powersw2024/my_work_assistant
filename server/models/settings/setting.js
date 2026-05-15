// models/settings/setting.js - 系统设置模型

const Setting = {
  /**
   * 获取系统设置
   * @param {object} db - 数据库连接对象
   * @returns {Promise} - 返回查询结果的Promise
   */
  getSettings: async (db) => {
    // 获取人员列表
    const personnel = await db.all('SELECT name FROM person ORDER BY name ASC');
    
    // 获取费用类别列表
    const expenseCategories = await db.all(`
      SELECT DISTINCT ec.name, ec.parent_id, p.name as parent_name
      FROM expense_categories ec
      LEFT JOIN expense_categories p ON p.id = ec.parent_id
      ORDER BY ec.name ASC
    `);
    
    // 构建主类别和子类别映射
    const mainCategories = expenseCategories
      .filter(cat => cat.parent_id === null)
      .map(cat => cat.name);
    
    const categoriesByParent = {};
    mainCategories.forEach(parent => {
      categoriesByParent[parent] = expenseCategories
        .filter(cat => cat.parent_name === parent && cat.parent_id !== null)
        .map(cat => cat.name);
    });
    
    // 获取凭证类型列表
    const voucherTypes = await db.all('SELECT name FROM voucher_types ORDER BY name ASC');
    
    return {
      personnel: personnel.map(p => p.name),
      expense_categories: {
        mainCategories,
        categoriesByParent
      },
      voucher_types: voucherTypes.map(v => v.name)
    };
  },

  /**
   * 保存系统设置
   * @param {object} db - 数据库连接对象
   * @param {object} settings - 设置对象
   * @returns {Promise} - 返回操作结果的Promise
   */
  saveSettings: async (db, settings) => {
    // 更新人员列表
    if (settings.personnel && Array.isArray(settings.personnel)) {
      // 清空人员表（除了默认人员）
      await db.run('DELETE FROM person WHERE name NOT IN ("刘林焜")');
      
      // 批量插入新人员（带去重处理）
      for (const person of settings.personnel) {
        try {
          await db.run('INSERT OR IGNORE INTO person (name) VALUES (?)', person);
        } catch (error) {
          // 忽略重复数据错误，继续处理下一个
          console.warn(`人员 "${person}" 插入时出错:`, error.message);
        }
      }
    }
    
    // 更新费用类别
    if (settings.expense_categories && typeof settings.expense_categories === 'object') {
      // 清空费用类别表（保留默认类别）
      await db.run('DELETE FROM expense_categories WHERE id NOT IN (SELECT id FROM expense_categories WHERE name IN (\'长途交通\', \'市内车费\', \'车辆费\', \'邮电费\', \'餐费\', \'住宿费\', \'其他费\', \'零星材料费\', \'火车票\', \'机票\', \'出租车费\', \'公交费\', \'打车费\', \'客车费\', \'加油费\', \'租车费\', \'通行费\', \'快递费\', \'流量费\', \'餐费\', \'住宿费\', \'体检费\', \'税点\', \'临时占地费\', \'打印费\', \'工具费\'))');
      
      // 首先插入主类别
      const mainCategoryIds = {};
      for (const mainCat of settings.expense_categories.mainCategories) {
        // 检查是否已存在
        const existing = await db.get('SELECT id FROM expense_categories WHERE name = ? AND parent_id IS NULL', mainCat);
        if (existing) {
          mainCategoryIds[mainCat] = existing.id;
        } else {
          try {
            const result = await db.run('INSERT INTO expense_categories (name, parent_id) VALUES (?, NULL)', mainCat);
            mainCategoryIds[mainCat] = result.lastID || result.changes; // 兼容不同驱动返回
          } catch (error) {
            console.warn(`主类别 "${mainCat}" 插入失败:`, error.message);
          }
        }
      }
      
      // 然后插入子类别
      for (const [parentName, children] of Object.entries(settings.expense_categories.categoriesByParent)) {
        if (children && Array.isArray(children)) {
          // 获取父类别的ID，如果不存在则创建
          let parentId;
          if (mainCategoryIds[parentName]) {
            parentId = mainCategoryIds[parentName];
          } else {
            const existingParent = await db.get('SELECT id FROM expense_categories WHERE name = ? AND parent_id IS NULL', parentName);
            if (existingParent) {
              parentId = existingParent.id;
            } else {
              try {
                const result = await db.run('INSERT INTO expense_categories (name, parent_id) VALUES (?, NULL)', parentName);
                parentId = result.lastID || result.changes;
                mainCategoryIds[parentName] = parentId;
              } catch (error) {
                console.warn(`主类别 "${parentName}" 插入失败:`, error.message);
                continue; // 如果无法创建父类别，则跳过其子类别
              }
            }
          }
          
          for (const child of children) {
            // 检查是否已存在
            const existingChild = await db.get('SELECT id FROM expense_categories WHERE name = ? AND parent_id = ?', [child, parentId]);
            if (!existingChild) {
              try {
                await db.run('INSERT INTO expense_categories (name, parent_id) VALUES (?, ?)', child, parentId);
              } catch (error) {
                console.warn(`子类别 "${child}" 插入失败:`, error.message);
              }
            }
          }
        }
      }
    }
    
    // 更新凭证类型
    if (settings.voucher_types && Array.isArray(settings.voucher_types)) {
      // 清空凭证类型表（保留默认类型）
      await db.run('DELETE FROM voucher_types WHERE name NOT IN ("发票", "收据", "付款记录", "详单")');
      
      // 批量插入新凭证类型（带去重处理）
      for (const type of settings.voucher_types) {
        try {
          await db.run(
            'INSERT OR IGNORE INTO voucher_types (name, description) VALUES (?, ?)',
            type,
            `${type}类型`  // 默认描述
          );
        } catch (error) {
          console.warn(`凭证类型 "${type}" 插入失败:`, error.message);
        }
      }
    }
    
    return { message: '设置保存成功' };
  }
};

export default Setting;