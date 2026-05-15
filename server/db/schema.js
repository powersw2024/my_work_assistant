import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 数据库初始化函数
 * @param {string} dbPath - 数据库路径
 * @returns {Promise<Database>} - 返回数据库连接实例
 */
export async function initDatabase(dbPath = './database.sqlite') {
  console.log('Initializing database...');

  // 强制使用文件数据库，不允许使用内存数据库
  if (dbPath === ':memory:' || !dbPath) {
    dbPath = './database.sqlite'; // 默认路径
  }

  const dbFilePath = path.resolve(dbPath);

  // 确保目录存在
  const dbDir = path.dirname(dbFilePath);
  await fs.mkdir(dbDir, { recursive: true });

  // Open a database connection
  const db = await open({
    filename: dbFilePath,
    driver: sqlite3.Database
  });

  // Enable foreign keys
  await db.run('PRAGMA foreign_keys = ON;');

  // Create projects table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      start_date DATE NOT NULL,
      end_date DATE,
      status TEXT DEFAULT '进行中' CHECK(status IN ('进行中', '已结束')),
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users (id)
    )
  `);

  // Create work_logs table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS work_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      log_date DATE NOT NULL,
      author TEXT NOT NULL,
      executor TEXT,  -- 新增字段，存储多选人员（逗号分隔）
      weather TEXT DEFAULT '晴',
      location TEXT,
      content TEXT NOT NULL,
      next_day_plan TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
    )
  `);

  // Create expense_categories table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS expense_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      parent_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES expense_categories (id)
    )
  `);

  // Create voucher_types table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS voucher_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create expense_records table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS expense_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      main_category_id INTEGER,
      sub_category_id INTEGER,
      voucher_type_id INTEGER NOT NULL,
      description TEXT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      file_paths TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
      FOREIGN KEY (main_category_id) REFERENCES expense_categories (id),
      FOREIGN KEY (sub_category_id) REFERENCES expense_categories (id),
      FOREIGN KEY (voucher_type_id) REFERENCES voucher_types (id)
    )
  `);

  // Create users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      email TEXT,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create person table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS person (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create system_settings table 
  await db.exec(`
    CREATE TABLE IF NOT EXISTS system_settings (
      id INTEGER PRIMARY KEY,
      db_location TEXT,
      upload_folder TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('所有表创建成功或已存在');
  return db;
}

// 使用 import.meta.url 检查是否直接运行此模块
const currentFileUrl = import.meta.url;
const currentFilePath = fileURLToPath(currentFileUrl);

// 检查是否直接运行此文件
if (process.argv[1] === currentFilePath) {
  initDatabase()
    .then(() => {
      console.log('Database setup completed');
    })
    .catch(err => {
      console.error('Failed to initialize database:', err);
      process.exit(1);
    });
}