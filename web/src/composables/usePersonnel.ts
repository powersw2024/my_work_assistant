// composables/usePersonnel.ts - 人员管理相关的组合式函数
import { ref } from 'vue';
import { personApi } from '../utils/tauriApi';
import type { Person } from '../utils/tauriApi';

export function usePersonnel() {
  const personnelList = ref<Person[]>([]);

  // 加载人员列表
  const loadPersonnel = async (): Promise<Person[]> => {
    try {
      const list = await personApi.getPersons();
      personnelList.value = list;
      return list;
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
