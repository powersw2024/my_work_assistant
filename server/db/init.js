// 由于Electron打包问题，我们使用sqlite包，它会自动处理sqlite3依赖
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import fs from 'fs/promises';
import path from 'path';
import { insertDefaultData } from './init-default-data.js';

/**
 * 初始化数据库函数
 * @param {string} dbPath - 数据库路径
 * @param {boolean} includeTestData - 是否包含测试数据
 * @returns {Promise<Database>} - 返回数据库连接实例
 */
export async function initDatabase(dbPath = './database.sqlite', includeTestData = false) {
  console.log('正在初始化数据库...');

  // 强制使用文件数据库，不允许使用内存数据库
  if (dbPath === ':memory:' || !dbPath) {
    dbPath = './database.sqlite'; // 默认路径
  }

  const dbFilePath = path.resolve(dbPath);
  
  // 确保目录存在
  const dbDir = path.dirname(dbFilePath);
  await fs.mkdir(dbDir, { recursive: true });

  // 打开数据库连接
  const db = await open({
    filename: dbFilePath,
    driver: sqlite3.Database
  });

  try {
    // 创建用户表
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        email TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建项目表
    await db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        start_date DATE NOT NULL,
        end_date DATE,
        status TEXT DEFAULT '进行中' CHECK(status IN ('进行中', '已结束')),
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建工作日志表
    await db.exec(`
      CREATE TABLE IF NOT EXISTS work_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        log_date DATE NOT NULL,
        author TEXT NOT NULL,
        executor TEXT,
        weather TEXT DEFAULT '晴',
        location TEXT,
        content TEXT NOT NULL,
        next_day_plan TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
      )
    `);

    // 创建费用类别表
    await db.exec(`
      CREATE TABLE IF NOT EXISTS expense_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        parent_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES expense_categories (id)
      )
    `);

    // 创建凭证类型表
    await db.exec(`
      CREATE TABLE IF NOT EXISTS voucher_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建费用记录表
    await db.exec(`
      CREATE TABLE IF NOT EXISTS expense_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        main_category_id INTEGER NOT NULL,
        sub_category_id INTEGER NOT NULL,
        description TEXT,
        file_paths TEXT,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
        FOREIGN KEY (main_category_id) REFERENCES expense_categories (id),
        FOREIGN KEY (sub_category_id) REFERENCES expense_categories (id)
      )
    `);

    // 创建费用凭证类型关联表 (支持多对多关系)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS expense_voucher_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        expense_record_id INTEGER NOT NULL,
        voucher_type_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (expense_record_id) REFERENCES expense_records (id) ON DELETE CASCADE,
        FOREIGN KEY (voucher_type_id) REFERENCES voucher_types (id),
        UNIQUE(expense_record_id, voucher_type_id)
      )
    `);

    // 创建费用文件关联表
    await db.exec(`
      CREATE TABLE IF NOT EXISTS expense_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        expense_record_id INTEGER NOT NULL,
        file_path TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_size INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (expense_record_id) REFERENCES expense_records (id) ON DELETE CASCADE
      )
    `);

    // 创建人员表
    await db.exec(`
      CREATE TABLE IF NOT EXISTS person (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建系统设置表
    await db.exec(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id INTEGER PRIMARY KEY,
        db_location TEXT,
        upload_folder TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('数据库表结构创建成功!');

    // 插入默认数据或测试数据
    if (includeTestData) {
      // 假设 init-test-data.js 也有类似的导出函数，或者这里需要适配
      // 参考方案中使用 import，这里为了保持一致性且利用现有结构，
      // 如果 init-test-data.js 存在导出函数，应类似调用。
      // 此处暂按原逻辑调用默认数据，若需测试数据需确保对应函数存在
      const { insertTestData } = await import('./init-test-data.js');
      if (insertTestData) {
          await insertTestData(db);
      } else {
          //  fallback or error handling if specific function not found
          console.warn('init-test-data.js does not export insertTestData');
      }
      console.log('测试数据插入成功!');
    } else {
      await insertDefaultData(db);
      console.log('默认数据插入成功!');

      // 迁移旧数据到新表结构（如果有的话）
      try {
        // 检查是否存在旧的 expense_records 表中具有 voucher_type_id 的记录
        const recordsWithVoucherType = await db.all(`
          SELECT id, voucher_type_id FROM expense_records WHERE voucher_type_id IS NOT NULL
        `);
        
        if (recordsWithVoucherType.length > 0) {
          for (const record of recordsWithVoucherType) {
            await db.run(
              `INSERT OR IGNORE INTO expense_voucher_types (expense_record_id, voucher_type_id) VALUES (?, ?)`,
              record.id,
              record.voucher_type_id
            );
          }
          
          console.log(`迁移了 ${recordsWithVoucherType.length} 条费用记录的凭证类型关联`);
        }
      } catch (error) {
        // 如果列不存在（新数据库）或其他错误，忽略或记录
        if (!error.message.includes('no such column')) {
             console.error('迁移凭证类型数据时出错:', error);
        } else {
             console.log('未检测到旧的凭证类型列，跳过迁移。');
        }
      }
    }

    console.log('成功连接到文件数据库:', dbFilePath);
    console.log('数据库初始化成功！');
    return db;
  } catch (error) {
    console.error('数据库初始化失败:', error);
    try {
      await db.close();
    } catch (closeError) {
      console.error('关闭数据库连接时出错:', closeError);
    }
    throw error;
  }
}