// composables/useLogs.js - 日志相关的组合式函数
import { ref, reactive } from 'vue';
import { buildApiUrl } from '../utils/apiConfig.js';

export function useLogs() {
  // 日志列表状态
  const logs = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // 获取项目日志
  const fetchLogsByProject = async (projectId) => {
    loading.value = true;
    error.value = null;

    try {
      const url = buildApiUrl(`/api/worklogs/project/${projectId}`);
      const response = await fetch(url);
      if (response.ok) {
        logs.value = await response.json();
      } else {
        const errorData = await response.json();
        error.value = errorData.error || '获取日志失败';
      }
    } catch (err) {
      error.value = err.message || '网络错误';
    } finally {
      loading.value = false;
    }
  };

  // 创建或更新日志
  const saveLog = async (logData) => {
    try {
      let response;
      if (logData.id) {
        // 更新日志
        const url = buildApiUrl(`/api/worklogs/${logData.id}`);
        response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(logData)
        });
      } else {
        // 创建日志
        const url = buildApiUrl('/api/worklogs');
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(logData)
        });
      }

      if (response.ok) {
        return await response.json();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || '保存日志失败');
      }
    } catch (err) {
      throw new Error(err.message || '网络错误');
    }
  };

  // 删除日志
  const deleteLog = async (logId) => {
    try {
      const url = buildApiUrl(`/api/worklogs/${logId}`);
      const response = await fetch(url, {
        method: 'DELETE'
      });

      if (response.ok) {
        logs.value = logs.value.filter(log => log.id !== logId);
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || '删除日志失败');
      }
    } catch (err) {
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