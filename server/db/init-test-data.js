/**
 * 初始化测试数据
 * 包含项目、费用记录等测试数据
 */

export const insertTestData = async (db) => {
  console.log('开始插入测试数据...');
  
  // 插入测试项目
  try {
    // 检查是否已经有测试项目
    const existingProject = await db.get('SELECT COUNT(*) as count FROM projects WHERE name LIKE ?', '%测试项目%');
    
    if (existingProject.count === 0) {
      const testProjects = [
        { name: '项目A', description: '第一个测试项目', start_date: '2024-01-01', end_date: '2024-12-31', status: '进行中' },
        { name: '项目B', description: '第二个测试项目', start_date: '2024-02-01', end_date: '2024-11-30', status: '进行中' },
        { name: '项目C', description: '已完成的测试项目', start_date: '2023-01-01', end_date: '2023-12-31', status: '已结束' }
      ];
      
      for (const project of testProjects) {
        try {
          await db.run(
            'INSERT INTO projects (name, description, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)',
            project.name,
            project.description,
            project.start_date,
            project.end_date,
            project.status
          );
          console.log(`测试项目 "${project.name}" 插入成功`);
        } catch (error) {
          console.warn(`插入测试项目 "${project.name}" 时出错:`, error);
        }
      }
      
      console.log('测试项目插入完成');
    } else {
      console.log('测试项目已存在，跳过插入');
    }
  } catch (error) {
    console.error('插入测试项目失败:', error);
  }

  // 插入测试人员
  try {
    const testPersons = ['张三', '李四', '王五', '赵六', '钱七'];
    
    for (const person of testPersons) {
      try {
        await db.run(
          'INSERT OR IGNORE INTO person (name) VALUES (?)',
          person
        );
      } catch (error) {
        console.warn(`插入测试人员 "${person}" 时出错:`, error);
      }
    }
    
    console.log('测试人员插入完成');
  } catch (error) {
    console.error('插入测试人员失败:', error);
  }

  // 插入更多凭证类型
  try {
    const additionalVoucherTypes = [
      { name: '合同', description: '合同类型' },
      { name: '验收单', description: '验收单类型' },
      { name: '采购单', description: '采购单类型' }
    ];
    
    for (const type of additionalVoucherTypes) {
      try {
        await db.run(
          'INSERT OR IGNORE INTO voucher_types (name, description) VALUES (?, ?)',
          type.name,
          type.description
        );
      } catch (error) {
        console.warn(`插入凭证类型 "${type.name}" 时出错:`, error);
      }
    }
    
    console.log('额外凭证类型插入完成');
  } catch (error) {
    console.error('插入额外凭证类型失败:', error);
  }

  // 插入测试费用记录
  try {
    // 获取现有项目的ID
    const projects = await db.all('SELECT id, name FROM projects');
    
    if (projects && projects.length > 0) {
      // 获取现有的费用类别
      const mainCategory = await db.get('SELECT id FROM expense_categories WHERE name = ? AND parent_id IS NULL', '餐费');
      const subCategory = await db.get('SELECT id FROM expense_categories WHERE name = ? AND parent_id IS NOT NULL', '餐费');
      const voucherType = await db.get('SELECT id FROM voucher_types WHERE name = ?', '发票');
      
      if (mainCategory && subCategory && voucherType) {
        const testExpenses = [
          { project_id: projects[0].id, amount: 298.50, main_category_id: mainCategory.id, sub_category_id: sub_category.id, description: '团队午餐', voucher_type_id: voucherType.id, date: '2024-03-15' },
          { project_id: projects[0].id, amount: 156.00, main_category_id: mainCategory.id, sub_category_id: sub_category.id, description: '客户晚餐', voucher_type_id: voucherType.id, date: '2024-03-16' },
          { project_id: projects[1].id, amount: 45.00, main_category_id: mainCategory.id, sub_category_id: sub_category.id, description: '加班餐费', voucher_type_id: voucherType.id, date: '2024-03-17' },
          { project_id: projects[1].id, amount: 120.00, main_category_id: mainCategory.id, sub_category_id: sub_category.id, description: '早餐', voucher_type_id: voucherType.id, date: '2024-03-18' },
        ];
        
        for (const expense of testExpenses) {
          try {
            await db.run(
              'INSERT INTO expense_records (project_id, amount, main_category_id, sub_category_id, description, voucher_type_id, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
              expense.project_id,
              expense.amount,
              expense.main_category_id,
              expense.sub_category_id,
              expense.description,
              expense.voucher_type_id,
              expense.date
            );
            console.log(`测试费用记录 (项目${expense.project_id}, 金额${expense.amount}) 插入成功`);
          } catch (error) {
            console.warn(`插入测试费用记录时出错:`, error);
          }
        }
        
        console.log('测试费用记录插入完成');
      } else {
        console.log('缺少必要的费用类别或凭证类型，跳过测试费用记录插入');
      }
    } else {
      console.log('没有找到项目，跳过测试费用记录插入');
    }
  } catch (error) {
    console.error('插入测试费用记录失败:', error);
  }

  // 插入测试工作日志
  try {
    const projects = await db.all('SELECT id, name FROM projects');
    
    if (projects && projects.length > 0) {
      const testLogs = [
        { project_id: projects[0].id, log_date: '2024-03-15', author: '张三', content: '今天完成了需求分析', next_day_plan: '开始设计数据库结构' },
        { project_id: projects[0].id, log_date: '2024-03-16', author: '李四', content: '数据库设计完成，开始编写后端API', next_day_plan: '完成API开发' },
        { project_id: projects[1].id, log_date: '2024-03-17', author: '王五', content: '前端界面设计初稿完成', next_day_plan: '开始前端开发' },
        { project_id: projects[1].id, log_date: '2024-03-18', author: '赵六', content: '前端开发进展顺利', next_day_plan: '与后端对接接口' }
      ];
      
      for (const log of testLogs) {
        try {
          await db.run(
            'INSERT INTO work_logs (project_id, log_date, author, content, next_day_plan) VALUES (?, ?, ?, ?, ?)',
            log.project_id,
            log.log_date,
            log.author,
            log.content,
            log.next_day_plan
          );
          console.log(`测试工作日志 (项目${log.project_id}, 日期${log.log_date}) 插入成功`);
        } catch (error) {
          console.warn(`插入测试工作日志时出错:`, error);
        }
      }
      
      console.log('测试工作日志插入完成');
    } else {
      console.log('没有找到项目，跳过测试工作日志插入');
    }
  } catch (error) {
    console.error('插入测试工作日志失败:', error);
  }

  console.log('测试数据插入完成');
};