// services/worklogs/workLogService.js - 工作日志服务
import { WorkLog } from '../../models/index.js';

const WorkLogService = {
  /**
   * 根据项目ID获取工作日志
   * @param {object} db - 数据库连接对象
   * @param {number} projectId - 项目ID
   * @returns {Promise} - 返回查询结果的Promise
   */
  getLogsByProjectId: async (db, projectId) => {
    try {
      return await WorkLog.findByProjectId(db, projectId);
    } catch (error) {
      console.error(`获取项目 ${projectId} 的工作日志失败:`, error);
      throw error;
    }
  },

  /**
   * 根据ID获取工作日志
   * @param {object} db - 数据库连接对象
   * @param {number} id - 日志ID
   * @returns {Promise} - 返回查询结果的Promise
   */
  getLogById: async (db, id) => {
    try {
      return await WorkLog.findById(db, id);
    } catch (error) {
      console.error(`获取工作日志 ${id} 失败:`, error);
      throw error;
    }
  },

  /**
   * 创建工作日志
   * @param {object} db - 数据库连接对象
   * @param {object} logData - 日志数据
   * @returns {Promise} - 返回创建结果的Promise
   */
  createLog: async (db, logData) => {
    try {
      // 验证必要字段
      if (!logData.project_id || !logData.log_date || !logData.author || !logData.content) {
        throw new Error('项目ID、日志日期、作者和内容是必填项');
      }

      // 检查同一天是否已有日志
      const existingLog = await db.get(
        'SELECT id FROM work_logs WHERE project_id = ? AND log_date = ?',
        logData.project_id,
        logData.log_date
      );
      
      if (existingLog) {
        throw new Error(`项目 ${logData.project_id} 在 ${logData.log_date} 已有日志，请勿重复添加`);
      }

      const logId = await WorkLog.create(db, logData);
      return await WorkLog.findById(db, logId);
    } catch (error) {
      console.error('创建工作日志失败:', error);
      throw error;
    }
  },

  /**
   * 更新工作日志
   * @param {object} db - 数据库连接对象
   * @param {number} id - 日志ID
   * @param {object} logData - 日志数据
   * @returns {Promise} - 返回更新结果的Promise
   */
  updateLog: async (db, id, logData) => {
    try {
      // 验证必要字段
      if (!logData.log_date || !logData.author || !logData.content) {
        throw new Error('日志日期、作者和内容是必填项');
      }

      const changes = await WorkLog.update(db, id, logData);
      if (changes === 0) {
        throw new Error(`工作日志 ${id} 不存在`);
      }
      
      return await WorkLog.findById(db, id);
    } catch (error) {
      console.error(`更新工作日志 ${id} 失败:`, error);
      throw error;
    }
  },

  /**
   * 删除工作日志
   * @param {object} db - 数据库连接对象
   * @param {number} id - 日志ID
   * @returns {Promise} - 返回删除结果的Promise
   */
  deleteLog: async (db, id) => {
    try {
      const changes = await WorkLog.delete(db, id);
      if (changes === 0) {
        throw new Error(`工作日志 ${id} 不存在`);
      }
      return { message: '工作日志删除成功' };
    } catch (error) {
      console.error(`删除工作日志 ${id} 失败:`, error);
      throw error;
    }
  },
  
  /**
   * 导出项目工作日志数据为Excel
   * @param {object} db - 数据库连接对象
   * @param {number} projectId - 项目ID
   * @returns {Buffer} - 返回Excel文件的buffer
   */
  exportLogsToExcel: async (db, projectId) => {
    try {
      // 获取项目信息
      const project = await db.get('SELECT name FROM projects WHERE id = ?', projectId);
      if (!project) {
        throw new Error(`项目 ${projectId} 不存在`);
      }

      // 获取项目的所有工作日志
      const logs = await WorkLog.findByProjectId(db, projectId);
      
      // 获取人员信息用于显示姓名
      const personnelList = await db.all('SELECT id, name FROM person');
      const personnelMap = {};
      personnelList.forEach(p => {
        personnelMap[p.id] = p.name;
      });

      // 引入xlsx库
      const XLSX = await import('xlsx');

      // 准备Excel数据
      const workbook = XLSX.utils.book_new();

      // 准备工作表数据
      const sheetData = [];

      // 添加表头 - 只包含序号、日期、工作内容
      sheetData.push([
        '序号', '日期', '工作内容'
      ]);

      // 添加日志数据
      for (const [index, log] of logs.entries()) {
        // 获取执行人姓名（executor可能是ID或直接的姓名）
        let executorName = log.executor || '';
        
        // 如果executor看起来像数字ID，尝试从person表查询
        if (log.executor && !isNaN(log.executor)) {
          const executorPerson = personnelMap[log.executor];
          if (executorPerson) {
            executorName = executorPerson;
          }
        }
        
        // 如果executor是数组格式的字符串，转换为用顿号分隔
        if (typeof executorName === 'string' && executorName.includes(',')) {
          executorName = executorName.split(',').join('、');
        }
        
        // 格式化日期（YYYY-MM-DD）
        const formattedDate = log.log_date ? log.log_date.split('T')[0] : '';
        
        // 构建与复制到剪贴板完全一致的工作内容格式
        const locationPart = log.location || '';
        const weatherPart = log.weather || '';
        const executorPart = executorName;
        
        // 构建第一行：项目名称-地点（执行人）-天气
        let firstLine = project.name;
        if (locationPart) {
          firstLine += `-${locationPart}`;
        }
        if (executorPart) {
          firstLine += `（${executorPart}）`;
        } else {
          firstLine += `（）`;
        }
        if (weatherPart) {
          firstLine += `-${weatherPart}`;
        }
        
        // 解析内容和明日计划，按行分割并添加编号
        const parseContent = (content) => {
          if (!content) return [];
          return content.split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line !== '');
        };
        
        const contentLines = parseContent(log.content);
        const nextDayPlanLines = parseContent(log.next_day_plan);
        
        // 构建今日工作量部分
        let todayWork = '';
        if (contentLines.length > 0) {
          todayWork = '今日工作量：\n';
          contentLines.forEach((line, idx) => {
            todayWork += `\t${idx + 1}、${line}\n`;
          });
        }
        
        // 构建明日计划部分
        let tomorrowPlan = '';
        if (nextDayPlanLines.length > 0) {
          tomorrowPlan = '明日计划：\n';
          nextDayPlanLines.forEach((line, idx) => {
            tomorrowPlan += `\t${idx + 1}、${line}\n`;
          });
        }
        
        // 组合完整的工作内容
        const fullContent = `${firstLine}\n${todayWork}${tomorrowPlan}`;
        
        sheetData.push([
          index + 1,
          formattedDate,
          fullContent
        ]);
      }

      // 创建工作表
      const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

      // 设置列宽
      worksheet['!cols'] = [
        { wch: 8 },   // 序号
        { wch: 12 },  // 日期
        { wch: 60 }   // 工作内容（需要更宽以容纳完整格式）
      ];

      // 添加工作表到工作簿
      XLSX.utils.book_append_sheet(workbook, worksheet, '工作日志');

      // 生成Excel buffer
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

      return excelBuffer;
    } catch (error) {
      console.error(`导出工作日志失败:`, error);
      throw error;
    }
  }
};

export default WorkLogService;