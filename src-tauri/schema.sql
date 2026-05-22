-- 数据库schema
-- 创建项目表
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
);

-- 创建工作日志表
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
);

-- 创建费用类别表
CREATE TABLE IF NOT EXISTS expense_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  parent_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES expense_categories (id)
);

-- 创建凭证类型表
CREATE TABLE IF NOT EXISTS voucher_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建费用记录表
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
);

-- 创建费用凭证类型关联表
CREATE TABLE IF NOT EXISTS expense_voucher_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  expense_record_id INTEGER NOT NULL,
  voucher_type_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (expense_record_id) REFERENCES expense_records (id) ON DELETE CASCADE,
  FOREIGN KEY (voucher_type_id) REFERENCES voucher_types (id),
  UNIQUE(expense_record_id, voucher_type_id)
);

-- 创建费用文件关联表
CREATE TABLE IF NOT EXISTS expense_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  expense_record_id INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (expense_record_id) REFERENCES expense_records (id) ON DELETE CASCADE
);

-- 创建人员表
CREATE TABLE IF NOT EXISTS person (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建系统设置表
CREATE TABLE IF NOT EXISTS system_settings (
  id INTEGER PRIMARY KEY,
  db_location TEXT,
  upload_folder TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 启用外键约束
PRAGMA foreign_keys = ON;
