import { buildApiUrl } from './apiConfig.js';
import { generateMealAllowanceRecords, mergeExpenses } from './expenseUtils';

/**
 * 加载项目详情数据的通用函数
 * @param {Number} projectId - 项目ID
 * @param {Object} categories - 费用类别数据
 * @returns {Promise<Object>} 包含项目、日志、费用等数据的对象
 */
export async function loadProjectDetailData(projectId, categories) {
  // 并行加载项目、日志、费用、类别和设置数据
  const [projectRes, logsRes, expensesRes, settingsRes] = await Promise.all([
    fetch(buildApiUrl(`/api/projects/${projectId}`)),
    fetch(buildApiUrl(`/api/worklogs/project/${projectId}`)),
    fetch(buildApiUrl(`/api/expenses/project/${projectId}`)),
    fetch(buildApiUrl('/api/settings'))
  ]);

  let project = null;
  let logs = [];
  let expenses = [];
  let settings = { personnel: [] };

  if (projectRes.ok) {
    project = await projectRes.json();
  } else {
    console.error('加载项目失败:', projectRes.statusText);
  }

  if (logsRes.ok) {
    logs = await logsRes.json();
  } else {
    console.error('加载日志失败:', logsRes.statusText);
  }

  if (expensesRes.ok) {
    let originalExpenses = await expensesRes.json();
    
    // 为项目自动生成伙食补贴记录
    const mealAllowanceExpenses = generateMealAllowanceRecords(project, categories);
    
    // 合并原始费用和自动生成的伙食补贴
    expenses = mergeExpenses(originalExpenses, mealAllowanceExpenses);
  } else {
    console.error('加载费用失败:', expensesRes.statusText);
  }

  if (settingsRes.ok) {
    settings = await settingsRes.json();
  } else {
    console.error('加载系统设置失败:', settingsRes.statusText);
  }

  return {
    project,
    logs,
    expenses,
    settings
  };
}

/**
 * 获取天气emoji
 * @param {String} weather - 天气描述
 * @returns {String} 对应的emoji
 */
export function getWeatherEmoji(weather) {
  // 添加类型检查，确保weather是字符串
  if (!weather || typeof weather !== 'string') {
    return '🌈'; // 默认表情
  }

  const emojiMap = {
    '晴': '☀️',
    '雨': '🌧️',
    '大雨': '⛈️',
    '雪': '❄️',
    '阴': '☁️'
  };
  return emojiMap[weather] || '🌈';
}

/**
 * 格式化日期为YYYY-MM-DD格式
 * @param {String} dateString - 日期字符串
 * @returns {String} 格式化后的日期
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

/**
 * 格式化日期为短格式 (MM-DD)
 * @param {String} dateStr - 日期字符串
 * @returns {String} 格式化后的短日期
 */
export function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${month}-${day}`;
}

/**
 * 检查指定日期是否有日志
 * @param {Array} logs - 日志列表
 * @param {String} date - 日期字符串
 * @returns {Boolean} 是否存在日志
 */
export function hasLogOnDate(logs, date) {
  if (!logs || !Array.isArray(logs)) {
    console.warn('logs参数不是一个数组，返回false:', logs);
    return false;
  }
  return logs.some(log => log.log_date === date);
}

/**
 * 跳转到指定日期的日志
 * @param {String} date - 日期字符串
 */
export function jumpToLogOnDate(date) {
  const logElement = document.querySelector(`[data-date="${date}"]`);
  if (logElement) {
    logElement.scrollIntoView({ behavior: 'smooth' });
  }
}

/**
 * 处理双击日期事件
 * @param {Event} event - 事件对象
 * @param {String} date - 日期字符串
 * @param {Function} editLog - 编辑日志的回调函数
 * @param {Object} project - 项目对象
 * @param {Array} logs - 日志列表
 */
export function handleDateDoubleClick(event, date, editLog, project, logs) {
  // 阻止双击导致的默认浏览器行为
  event.preventDefault();
  event.stopPropagation();
  
  const hasLog = hasLogOnDate(logs, date);
  
  // 添加视觉反馈
  const dateElements = document.querySelectorAll(`.time-axis-item[title="${date} ${new Date(date).toLocaleDateString('zh-CN', { weekday: 'short' })}"]`);
  dateElements.forEach(el => {
      el.classList.add('animate-pulse');
      setTimeout(() => el.classList.remove('animate-pulse'), 500);
  });
  
  if (hasLog) {
      // 如果有日志，找到对应的日志并编辑
      const log = logs.find(l => l.log_date === date);
      if (log) {
          editLog(log);
      }
  } else {
      // 如果没有日志，创建新日志，预设日期
      const newLog = {
          project_id: project.id,
          log_date: date,
          content: '',
          next_day_plan: '',
          weather: '晴',
          location: '',
          executor: []
      };
      editLog(newLog);
  }
}