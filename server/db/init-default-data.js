/**
 * 初始化默认数据
 * 包含费用类别、凭证类型等默认数据
 */

export const insertDefaultData = async (db) => {
  console.log('开始检查并插入默认数据...');
  
  // 检查是否已经有默认人员
  const existingPerson = await db.get('SELECT COUNT(*) as count FROM person WHERE name = ?', '刘林焜');
  if (existingPerson.count === 0) {
    // 插入默认人员
    try {
      await db.run(
        'INSERT INTO person (name) VALUES (?)',
        '刘林焜'
      );
      console.log('默认人员插入完成');
    } catch (error) {
      console.error('插入默认人员失败:', error);
    }
  } else {
    console.log('默认人员已存在，跳过插入');
  }

  // 检查是否已经有默认费用类别
  const existingMainCategory = await db.get('SELECT COUNT(*) as count FROM expense_categories WHERE name = ? AND parent_id IS NULL', '长途交通');
  if (existingMainCategory.count === 0) {
    // 插入默认费用类别
    try {
      const defaultMainCategories = [
        '长途交通', '市内车费', '车辆费', '邮电费', 
        '餐费', '住宿费', '其他费', '零星材料费'
      ];
      
      const defaultSubCategoriesMap = {
        '长途交通': ['火车票', '机票'],
        '市内车费': ['出租车费', '公交费', '打车费', '客车费'],
        '车辆费': ['加油费', '租车费', '通行费'],
        '邮电费': ['快递费', '流量费'],
        '餐费': ['餐费'],
        '住宿费': ['住宿费'],
        '其他费': ['体检费', '税点', '临时占地费'],
        '零星材料费': ['打印费', '工具费']
      };
      
      // 首先插入所有主类别
      const mainCategoryIds = {};
      for (const mainCat of defaultMainCategories) {
        try {
          const result = await db.run(
            'INSERT INTO expense_categories (name, parent_id) VALUES (?, NULL)',
            mainCat
          );
          // 获取已存在的或新插入的ID
          const category = await db.get(
            'SELECT id FROM expense_categories WHERE name = ? AND parent_id IS NULL',
            mainCat
          );
          if (category) {
            mainCategoryIds[mainCat] = category.id;
          }
        } catch (error) {
          console.warn(`插入主类别 "${mainCat}" 时出错:`, error);
        }
      }
      
      // 然后插入子类别
      for (const [parentName, children] of Object.entries(defaultSubCategoriesMap)) {
        const parentId = mainCategoryIds[parentName];
        if (parentId) {
          for (const child of children) {
            try {
              await db.run(
                'INSERT INTO expense_categories (name, parent_id) VALUES (?, ?)',
                child,
                parentId
              );
            } catch (error) {
              console.warn(`插入子类别 "${child}" 到 "${parentName}" 时出错:`, error);
            }
          }
        }
      }
      
      console.log('默认费用类别插入完成');
    } catch (error) {
      console.error('插入默认费用类别失败:', error);
    }
  } else {
    console.log('默认费用类别已存在，跳过插入');
  }

  // 检查是否已经有默认凭证类型
  const existingVoucher = await db.get('SELECT COUNT(*) as count FROM voucher_types WHERE name = ?', '发票');
  if (existingVoucher.count === 0) {
    // 插入默认凭证类型
    try {
      const defaultVoucherTypes = [
        { name: '发票', description: '发票类型' },
        { name: '收据', description: '收据类型' },
        { name: '付款记录', description: '付款记录类型' },
        { name: '详单', description: '详单类型' }
      ];
      
      for (const type of defaultVoucherTypes) {
        try {
          await db.run(
            'INSERT INTO voucher_types (name, description) VALUES (?, ?)',
            type.name,
            type.description
          );
        } catch (error) {
          console.warn(`插入凭证类型 "${type.name}" 时出错:`, error);
        }
      }
      
      console.log('默认凭证类型插入完成');
    } catch (error) {
      console.error('插入默认凭证类型失败:', error);
    }
  } else {
    console.log('默认凭证类型已存在，跳过插入');
  }

  console.log('默认数据检查和插入完成');
};