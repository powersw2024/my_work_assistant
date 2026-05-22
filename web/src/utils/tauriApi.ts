import { invoke } from '@tauri-apps/api/core';

// ===== Type Definitions =====
export interface Project {
  id?: number;
  name: string;
  description?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectDTO {
  name: string;
  description?: string;
  status?: string;
}

export interface WorkLog {
  id?: number;
  project_id: number;
  log_date: string;
  author: string;
  executor?: string | string[]; // 支持字符串或字符串数组
  weather: string;
  location?: string;
  content: string;
  next_day_plan?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WorkLogDTO {
  project_id: number;
  log_date: string;
  author: string;
  executor?: string;
  weather?: string;
  location?: string;
  content: string;
  next_day_plan?: string;
}

export interface Expense {
  id?: number;
  project_id: number;
  person_id: number;
  main_category_id: number;
  sub_category_id: number;
  amount: number | string; // 支持 number 或 string 类型
  expense_date: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  
  // 以下字段来自关联查询
  date?: string; // expense_date 的别名，用于兼容前端显示
  main_category?: string; // 主类别名称
  sub_category?: string; // 子类别名称
  voucher_type?: string; // 凭证类型字符串（多个类型用逗号分隔）
  files?: Array<{ file_name: string; file_path: string }>; // 文件列表
  file_paths?: string[]; // 文件路径数组
}

export interface ExpenseDTO {
  project_id: number;
  amount: number;
  main_category_id: number;
  sub_category_id: number;
  description?: string;
  expense_date: string;
  voucher_type_ids?: number[]; // 改为数组以支持多个凭证类型
}

export interface Category {
  id?: number;
  name: string;
  parent_id?: number;
  description?: string;
  created_at?: string;
}

export interface CategoryDTO {
  name: string;
  description?: string;
  parent_id?: number | null; // 父类别ID，null 或省略表示主类别
}

export interface VoucherType {
  id?: number;
  name: string;
  description?: string;
  created_at?: string;
}

export interface VoucherTypeDTO {
  name: string;
  description?: string;
}

export interface ExpenseFile {
  id?: number;
  expense_id: number;
  file_name: string;
  file_path: string;
  file_size: number;
  created_at?: string;
}

export interface Person {
  id?: number;
  name: string;
  role?: string;
  daily_rate?: number;
  created_at?: string;
}

export interface PersonDTO {
  name: string;
  role?: string;
  daily_rate?: number;
}

export interface Settings {
  id?: number;
  key: string;
  value: string;
  description?: string;
}

export interface SettingsDTO {
  key: string;
  value: string;
  description?: string;
}

// ===== Report Types =====
export interface ProjectStatistics {
  project_days: number;
  meal_allowance: number;
}

export interface CategoryExpense {
  category_name: string;
  amount: number;
}

export interface ExpenseSummary {
  total_expenses: number;
  total_with_invoice: number;
  miscellaneous_total: number;
  category_breakdown: CategoryExpense[];
  invoice_category_breakdown: CategoryExpense[];
}

// ===== Project APIs =====
export const projectApi = {
  getProjects: (): Promise<Project[]> => invoke('get_projects'),
  getProject: (id: number): Promise<Project> => invoke('get_project', { id }),
  createProject: (dto: ProjectDTO): Promise<Project> => invoke('create_project', { dto }),
  updateProject: (id: number, dto: ProjectDTO): Promise<Project> => invoke('update_project', { id, dto }),
  deleteProject: (id: number): Promise<void> => invoke('delete_project', { id })
};

// ===== Work Log APIs =====
export const workLogApi = {
  getWorkLogs: (projectId: number): Promise<WorkLog[]> => invoke('get_work_logs', { projectId }),
  getWorkLog: (id: number): Promise<WorkLog> => invoke('get_work_log', { id }),
  createWorkLog: (dto: WorkLogDTO): Promise<WorkLog> => invoke('create_work_log', { dto }),
  updateWorkLog: (id: number, dto: WorkLogDTO): Promise<WorkLog> => invoke('update_work_log', { id, dto }),
  deleteWorkLog: (id: number): Promise<void> => invoke('delete_work_log', { id })
};

// ===== Expense APIs =====
export const expenseApi = {
  getExpenses: (projectId: number): Promise<Expense[]> => invoke('get_expenses', { projectId }),
  getExpense: (id: number): Promise<Expense> => invoke('get_expense', { id }),
  createExpense: (dto: ExpenseDTO): Promise<Expense> => invoke('create_expense', { dto }),
  updateExpense: (id: number, dto: ExpenseDTO): Promise<Expense> => invoke('update_expense', { id, dto }),
  deleteExpense: (id: number): Promise<void> => invoke('delete_expense', { id }),
  getCategories: (): Promise<Category[]> => invoke('get_categories'),
  createCategory: (dto: CategoryDTO): Promise<Category> => invoke('create_category', { dto }),
  deleteCategory: (id: number): Promise<void> => invoke('delete_category', { id }),
  getVoucherTypes: (): Promise<VoucherType[]> => invoke('get_voucher_types'),
  createVoucherType: (dto: VoucherTypeDTO): Promise<VoucherType> => invoke('create_voucher_type', { dto }),
  deleteVoucherType: (id: number): Promise<void> => invoke('delete_voucher_type', { id }),
  getExpenseFiles: (expenseId: number): Promise<ExpenseFile[]> => invoke('get_expense_files', { expenseId })
};

// ===== Person APIs =====
export const personApi = {
  getPersons: (): Promise<Person[]> => invoke('get_persons'),
  createPerson: (dto: PersonDTO): Promise<Person> => invoke('create_person', { dto }),
  deletePerson: (id: number): Promise<void> => invoke('delete_person', { id })
};

// ===== Settings APIs =====
export const settingsApi = {
  getSettings: (): Promise<Settings> => invoke('get_settings'),
  updateSettings: (dto: SettingsDTO): Promise<void> => invoke('update_settings', { dto })
};

// ===== Report APIs =====
export const reportApi = {
  getProjectStatistics: (projectId: number): Promise<ProjectStatistics> => invoke('get_project_statistics', { projectId }),
  getExpenseSummary: (projectId: number): Promise<ExpenseSummary> => invoke('get_expense_summary', { projectId })
};
