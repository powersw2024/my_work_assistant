import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

/**
 * 数据库迁移脚本：从旧的 voucher_type_id 结构迁移到新的多对多结构
 */
export const migrateVoucherTypes = async (dbPath = './database.sqlite') => {
  // 连接到 SQLite 数据库
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  try {
    // 检查是否已存在 expense_voucher_types 表
    const tableExists = await db.get(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='expense_voucher_types'
    `);

    if (tableExists) {
      console.log('expense_voucher_types 表已存在，跳过迁移');
      return;
    }

    // 创建新的关联表
    await db.exec(`
      CREATE TABLE expense_voucher_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        expense_record_id INTEGER NOT NULL,
        voucher_type_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (expense_record_id) REFERENCES expense_records (id) ON DELETE CASCADE,
        FOREIGN KEY (voucher_type_id) REFERENCES voucher_types (id),
        UNIQUE(expense_record_id, voucher_type_id)
      )
    `);

    // 检查旧的 expense_records 表是否有 voucher_type_id 列
    const columns = await db.all(`
      PRAGMA table_info(expense_records)
    `);
    
    const hasOldVoucherColumn = columns.some(col => col.name === 'voucher_type_id');
    
    if (hasOldVoucherColumn) {
      // 迁移旧数据
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
    }

    console.log('凭证类型多对多关系迁移完成');
  } catch (error) {
    console.error('迁移过程中出现错误:', error);
    throw error;
  } finally {
    await db.close();
  }
};