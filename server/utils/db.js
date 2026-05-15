// utils/db.js - 数据库工具函数
// With better-sqlite3, we don't need the dbQuery wrapper since operations are synchronous
// This function is kept for compatibility with async/await pattern if needed

const dbQuery = (db, queryFn) => {
  return new Promise((resolve, reject) => {
    try {
      if (!db) {
        reject(new Error('数据库未连接'));
        return;
      }
      
      // For better-sqlite3, operations are synchronous
      // We simulate async behavior for compatibility
      setImmediate(() => {
        try {
          const result = queryFn();
          resolve(result);
        } catch (err) {
          console.error('数据库查询错误:', err);
          reject(err);
        }
      });
    } catch (error) {
      console.error('数据库操作错误:', error);
      reject(error);
    }
  });
};

module.exports = { dbQuery };