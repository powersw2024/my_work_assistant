// composables/useLogs.ts - 日志相关的组合式函数
import { ref } from 'vue';
import { workLogApi } from '../utils/tauriApi';
import type { WorkLog } from '../utils/tauriApi';

export function useLogs() {
  // 日志列表状态
  const logs = ref<WorkLog[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // 获取项目日志
  const fetchLogsByProject = async (projectId: number) => {
    loading.value = true;
    error.value = null;

    try {
      logs.value = await workLogApi.getWorkLogs(projectId);
    } catch (err: any) {
      error.value = err.message || '网络错误';
    } finally {
      loading.value = false;
    }
  };

  // 创建或更新日志
  const saveLog = async (logData: Partial<WorkLog> & { id?: number }): Promise<WorkLog> => {
    try {
      if (logData.id) {
        // 更新日志
        return await workLogApi.updateWorkLog(logData.id, logData as any);
      } else {
        // 创建日志
        return await workLogApi.createWorkLog(logData as any);
      }
    } catch (err: any) {
      throw new Error(err.message || '网络错误');
    }
  };

  // 删除日志
  const deleteLog = async (logId: number): Promise<boolean> => {
    try {
      await workLogApi.deleteWorkLog(logId);
      logs.value = logs.value.filter(log => log.id !== logId);
      return true;
    } catch (err: any) {
      throw new Error(err.message || '网络错误');
    }
  };

  return {
    logs,
    loading,
    error,
    fetchLogsByProject,
    saveLog,
    deleteLog
  };
}
