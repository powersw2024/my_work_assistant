import { projectApi, workLogApi, expenseApi, settingsApi } from './tauriApi';
import type { Project, WorkLog, Expense, Settings } from './tauriApi';

export interface ProjectDetailData {
  project: Project | null;
  logs: WorkLog[];
  expenses: Expense[];
  settings: Settings;
}

/**
 * 加载项目详情数据的通用函数（简化版，只负责数据加载）
 * @param projectId - 项目ID
 * @returns 包含项目、日志、费用等数据的对象
 */
export async function loadProjectDetailData(
  projectId: number
): Promise<ProjectDetailData> {
  // 并行加载项目、日志、费用和设置数据
  const [project, logs, expenses, settingsData] = await Promise.all([
    projectApi.getProject(projectId).catch(err => {
      console.error('加载项目失败:', err);
      return null;
    }),
    workLogApi.getWorkLogs(projectId).catch(err => {
      console.error('加载日志失败:', err);
      return [];
    }),
    expenseApi.getExpenses(projectId).catch(err => {
      console.error('加载费用失败:', err);
      return [];
    }),
    settingsApi.getSettings().catch(err => {
      console.error('加载系统设置失败:', err);
      return { id: 0, key: '', value: '', description: '' };
    })
  ]);

  return {
    project,
    logs,
    expenses,
    settings: settingsData
  };
}

/**
 * 获取天气 emoji
 * @param weather - 天气描述
 * @returns 对应的 emoji
 */
export function getWeatherEmoji(weather?: string): string {
  if (!weather || typeof weather !== 'string') {
    return '🌈'; // 默认表情
  }

  const emojiMap: Record<string, string> = {
    '晴': '☀️',
    '雨': '🌧️',
    '大雨': '⛈️',
    '雪': '❄️',
    '阴': '☁️'
  };
  return emojiMap[weather] || '🌈';
}

/**
 * 格式化日期为 YYYY-MM-DD 格式
 * @param dateString - 日期字符串
 * @returns 格式化后的日期
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

/**
 * 格式化日期为短格式 (MM-DD)
 * @param dateStr - 日期字符串
 * @returns 格式化后的短日期
 */
export function formatDateShort(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${month}-${day}`;
}

/**
 * 检查指定日期是否有日志
 * @param logs - 日志列表
 * @param date - 日期字符串
 * @returns 是否存在日志
 */
export function hasLogOnDate(logs: WorkLog[] | null | undefined, date: string): boolean {
  if (!logs || !Array.isArray(logs)) {
    console.warn('logs 参数不是一个数组，返回 false:', logs);
    return false;
  }
  // 使用 log_date 字段（匹配后端 Rust 模型）
  return logs.some(log => log.log_date === date);
}

/**
 * 跳转到指定日期的日志
 * @param date - 日期字符串
 */
export function jumpToLogOnDate(date: string): void {
  const logElement = document.querySelector(`[data-date="${date}"]`);
  if (logElement) {
    logElement.scrollIntoView({ behavior: 'smooth' });
  }
}

export interface NewWorkLogData {
  project_id: number;
  log_date: string;
  description?: string;
  next_day_plan?: string;
  weather?: string;
  location?: string;
  executor?: string;  // 使用字符串格式以匹配后端
}

/**
 * 处理双击日期事件
 * @param event - 事件对象
 * @param date - 日期字符串
 * @param editLog - 编辑日志的回调函数
 * @param project - 项目对象
 * @param logs - 日志列表
 */
export function handleDateDoubleClick(
  event: MouseEvent, 
  date: string, 
  editLog: (log: WorkLog | NewWorkLogData) => void,
  project: Project | null, 
  logs: WorkLog[]
): void {
  // 阻止双击导致的默认浏览器行为
  event.preventDefault();
  event.stopPropagation();
  
  // 添加视觉反馈
  const title = `${date} ${new Date(date).toLocaleDateString('zh-CN', { weekday: 'short' })}`;
  const dateElements = document.querySelectorAll(`.time-axis-item[title="${title}"]`);
  dateElements.forEach(el => {
    (el as HTMLElement).classList.add('animate-pulse');
    setTimeout(() => (el as HTMLElement).classList.remove('animate-pulse'), 500);
  });
  
  // 无论是否有日志，都打开编辑/新建模态框
  if (!project) return;
  
  if (hasLogOnDate(logs, date)) {
    // 如果有日志，找到对应的日志并编辑
    const log = logs.find(l => l.log_date === date);
    if (log) {
      editLog(log);
    }
  } else {
    // 如果没有日志，创建新日志，预设日期
    const newLog: NewWorkLogData = {
      project_id: project.id || 0,
      log_date: date,  // 这里设置的日期会传递到 LogForm
      description: '',
      next_day_plan: '',
      weather: '晴',
      location: '',
      executor: ''  // 使用空字符串以匹配后端类型
    };
    editLog(newLog);
  }
}
