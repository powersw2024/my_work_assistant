// models/index.js - 整合所有模型
import User from './users/user.js';
import Project from './projects/project.js';
import WorkLog from './worklogs/workLog.js';
import ExpenseRecord from './expenses/expenseRecord.js';
import ExpenseCategory from './expenses/expenseCategory.js';
import VoucherType from './expenses/voucherType.js';
import Setting from './settings/setting.js';
import Personnel from './personnel/personnel.js';

export {
  User,
  Project,
  WorkLog,
  ExpenseRecord,
  ExpenseCategory,
  VoucherType,
  Setting,
  Personnel
};

// 导出一个对象，方便按需访问
export const models = {
  User,
  Project,
  WorkLog,
  ExpenseRecord,
  ExpenseCategory,
  VoucherType,
  Setting,
  Personnel
};