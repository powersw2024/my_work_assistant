// controllers/expenses/expenseController.js - 费用控制器
import path from 'path';
import { ExpenseService } from '../../services/index.js';

const ExpenseController = {
  /**
   * 根据项目ID获取费用记录
   */
  getExpensesByProject: async (req, res) => {
    try {
      const expenses = await ExpenseService.getExpensesByProjectId(req.db, req.params.projectId);
      res.json(expenses);
    } catch (error) {
      console.error('获取费用记录失败:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * 获取单个费用记录
   */
  getExpenseById: async (req, res) => {
    try {
      const expense = await ExpenseService.getExpenseById(req.db, req.params.id);
      if (!expense) {
        return res.status(404).json({ error: '费用记录不存在' });
      }
      res.json(expense);
    } catch (error) {
      console.error('获取费用记录失败:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * 创建费用记录
   */
  createExpense: async (req, res) => {
    try {
      const expenseData = req.body.expenseData ? 
        (typeof req.body.expenseData === 'string' ? JSON.parse(req.body.expenseData) : req.body.expenseData) 
        : req.body;
      
      // 检查并处理上传的文件
      let filePaths = [];
      if (req.files) {
        // 确定项目名称用于构建文件路径
        const project = await req.db.get('SELECT name FROM projects WHERE id = ?', expenseData.project_id);
        const projectName = project ? project.name.replace(/[<>:"/\\|?*]/g, '_') : 'default';
        
        filePaths = req.files.map(file => {
          // 更改文件路径存储格式，移除项目名部分，保留相对路径
          return path.join('..', 'uploads', projectName, file.filename);
        });
      }
      
      // 创建费用记录，同时传递上传的文件信息
      const expense = await ExpenseService.createExpense(req.db, {
        ...expenseData,
        file_paths: JSON.stringify(filePaths),  // 存储文件路径数组
        files: req.files || []  // 传递上传的文件对象
      });
      
      res.status(201).json(expense);
    } catch (error) {
      console.error('创建费用记录失败:', error);
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * 更新费用记录
   */
  updateExpense: async (req, res) => {
    try {
      const expenseData = req.body.expenseData ? 
        (typeof req.body.expenseData === 'string' ? JSON.parse(req.body.expenseData) : req.body.expenseData) 
        : req.body;
      
      // 检查并处理上传的文件
      let filePaths = expenseData.existing_files || [];
      if (req.files) {
        // 确定项目名称用于构建文件路径
        const project = await req.db.get('SELECT name FROM projects WHERE id = ?', expenseData.project_id);
        const projectName = project ? project.name.replace(/[<>:"/\\|?*]/g, '_') : 'default';
        
        const newFilePaths = req.files.map(file => {
          // 更改文件路径存储格式，移除项目名部分，保留相对路径
          return path.join('..', 'uploads', projectName, file.filename);
        });
        
        // 合并现有文件和新上传的文件
        filePaths = [...filePaths, ...newFilePaths];
      }
      
      // 更新费用记录，同时传递上传的文件信息
      const expense = await ExpenseService.updateExpense(req.db, req.params.id, {
        ...expenseData,
        file_paths: JSON.stringify(filePaths),  // 存储文件路径数组
        files: req.files || []  // 传递上传的文件对象
      });
      
      res.json(expense);
    } catch (error) {
      console.error('更新费用记录失败:', error);
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * 删除费用记录
   */
  deleteExpense: async (req, res) => {
    try {
      const result = await ExpenseService.deleteExpense(req.db, req.params.id);
      res.json(result);
    } catch (error) {
      console.error('删除费用记录失败:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  /**
   * 导出项目报销数据为Excel并打包相关文件
   */
  exportExpensesToExcel: async (req, res) => {
    try {
      const projectId = req.params.projectId;
      
      // 调用服务层方法生成ZIP文件（包含Excel和相关文件）
      const zipBuffer = await ExpenseService.exportExpensesToExcel(req.db, projectId);
      
      // 设置响应头并返回ZIP文件
      res.setHeader(
        'Content-Type',
        'application/zip'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="Project_${projectId}_Expenses_with_Attachments.zip"`
      );
      
      res.send(zipBuffer);
    } catch (error) {
      console.error('导出费用记录失败:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

export default ExpenseController;