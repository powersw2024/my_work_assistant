// services/index.js - 整合所有服务
import ProjectService from './projects/projectService.js';
import WorkLogService from './worklogs/workLogService.js';
import ExpenseService from './expenses/expenseService.js';
import ExpenseCategoryService from './expenses/expenseCategoryService.js';
import VoucherTypeService from './expenses/voucherTypeService.js';
import SettingService from './settings/settingService.js';
import PersonnelService from './personnelService.js';

export {
  ProjectService,
  WorkLogService,
  ExpenseService,
  ExpenseCategoryService,
  VoucherTypeService,
  SettingService,
  PersonnelService
};