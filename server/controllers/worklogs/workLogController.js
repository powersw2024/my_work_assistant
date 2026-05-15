// controllers/worklogs/workLogController.js - 工作日志控制器
import { WorkLogService } from '../../services/index.js';

const WorkLogController = {
  /**
   * 根据项目ID获取工作日志
   */
  getLogsByProjectId: async (req, res) => {
    try {
      const logs = await WorkLogService.getLogsByProjectId(req.db, req.params.projectId);
      res.json(logs);
    } catch (error) {
      console.error('获取工作日志失败:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * 获取单个工作日志
   */
  getLogById: async (req, res) => {
    try {
      const log = await WorkLogService.getLogById(req.db, req.params.id);
      if (!log) {
        return res.status(404).json({ error: '工作日志不存在' });
      }
      res.json(log);
    } catch (error) {
      console.error('获取工作日志失败:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * 创建工作日志
   */
  createLog: async (req, res) => {
    try {
      const log = await WorkLogService.createLog(req.db, req.body);
      res.status(201).json(log);
    } catch (error) {
      console.error('创建工作日志失败:', error);
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * 更新工作日志
   */
  updateLog: async (req, res) => {
    try {
      const log = await WorkLogService.updateLog(req.db, req.params.id, req.body);
      res.json(log);
    } catch (error) {
      console.error('更新工作日志失败:', error);
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * 删除工作日志
   */
  deleteLog: async (req, res) => {
    try {
      const result = await WorkLogService.deleteLog(req.db, req.params.id);
      res.json(result);
    } catch (error) {
      console.error('删除工作日志失败:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  /**
   * 导出项目工作日志数据为Excel
   */
  exportLogsToExcel: async (req, res) => {
    try {
      const projectId = req.params.projectId;
      
      // 调用服务层方法生成Excel文件
      const excelBuffer = await WorkLogService.exportLogsToExcel(req.db, projectId);
      
      // 设置响应头并返回Excel文件
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="Project_${projectId}_Logs.xlsx"`
      );
      
      res.send(excelBuffer);
    } catch (error) {
      console.error('导出工作日志失败:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

export default WorkLogController;