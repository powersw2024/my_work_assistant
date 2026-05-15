// composables/usePersonnel.js - 人员管理相关的组合式函数
import { ref } from 'vue';
import { buildApiUrl } from '../utils/apiConfig.js';

export function usePersonnel() {
  const personnelList = ref([]);

  // 加载人员列表
  const loadPersonnel = async () => {
    try {
      const url = buildApiUrl('/api/personnel');
      const response = await fetch(url);
      if (response.ok) {
        personnelList.value = await response.json();
        return personnelList.value;
      } else {
        console.error('加载人员列表失败:', response.statusText);
        return [];
      }
    } catch (error) {
      console.error('加载人员列表失败:', error);
      return [];
    }
  };

  return {
    personnelList,
    loadPersonnel
  };
}