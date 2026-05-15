// controllers/index.js - 整合所有控制器
import ProjectController from './projects/projectController.js';
import WorkLogController from './worklogs/workLogController.js';
import ExpenseController from './expenses/expenseController.js';
import ExpenseCategoryController from './expenses/expenseCategoryController.js';
import VoucherTypeController from './expenses/voucherTypeController.js';
import SettingController from './settings/settingController.js';
import PersonnelController from './personnelController.js';

export {
  ProjectController,
  WorkLogController,
  ExpenseController,
  ExpenseCategoryController,
  VoucherTypeController,
  SettingController,
  PersonnelController
};