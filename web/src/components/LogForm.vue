<template>
  <div class="card p-6 shadow-card">
    <h4 class="font-semibold text-lg text-gray-800 mb-4 flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
        stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg> 添加工作日志
    </h4>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 左侧：基本信息 -->
      <div class="space-y-4">
        <DatePicker :model-value="formState.localLog.log_date"
          @update:model-value="formState.localLog.log_date = $event" label="日志日期" />

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">人员（可多选）</label>
          <div class="border rounded-lg p-2 max-h-40 overflow-y-auto">
            <div v-for="person in personnel" :key="person" class="flex items-center p-2 hover:bg-gray-100 rounded">
              <input type="checkbox" :id="'person_' + person" :value="person" v-model="formState.selectedPersonnel"
                class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
              <label :for="'person_' + person" class="ml-2 text-gray-700 cursor-pointer">{{ person }}</label>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">地点</label>
          <input v-model="formState.localLog.location" type="text" placeholder="请输入工作地点" class="input-field w-full">
        </div>

        <Selector v-model="formState.localLog.weather" label="天气" :options="weatherOptions" />
      </div>

      <!-- 右侧：工作内容 -->
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">今日工作</label>
          <textarea v-model="formState.localLog.content" placeholder="请输入详细工作内容" rows="10" class="input-field w-full"
            style="font-family: monospace;"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">明日计划</label>
          <textarea v-model="formState.localLog.next_day_plan" placeholder="请输入明日工作计划" rows="6"
            class="input-field w-full" style="font-family: monospace;"></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import DatePicker from './DatePicker.vue';
import Selector from './Selector.vue';
import type { WorkLog } from '../utils/tauriApi';

export interface LogFormData {
  id: number | null;
  project_id?: number;
  log_date: string;
  executor: any[];
  weather: string;
  location: string;
  content: string;
  next_day_plan: string;
  author: string;
}

export interface WeatherOption {
  value: string;
  label: string;
}

export interface LogFormProps {
  log: Partial<WorkLog>;
  personnel: string[];
  recentLogs: any[];
  projectName?: string;
}

interface FormState {
  localLog: LogFormData;
  selectedPersonnel: string[];
  weatherTypes: string[];
}

export default defineComponent({
  name: 'LogForm',
  components: {
    DatePicker,
    Selector
  },
  props: {
    log: {
      type: Object as () => Partial<WorkLog>,
      default: () => ({
        id: null,
        log_date: '',
        executor: [],
        weather: '晴',
        location: '',
        content: '',
        next_day_plan: '',
        author: '系统用户'
      })
    },
    personnel: {
      type: Array as () => string[],
      default: () => []
    },
    recentLogs: {
      type: Array as () => any[],
      default: () => []
    },
    projectName: {
      type: String as () => string,
      default: ''
    }
  },
  emits: ['submit', 'error'],
  setup(props, { emit }) {
    // 响应式表单状态
    const formState = reactive<FormState>({
      localLog: {
        id: null,
        log_date: '',
        executor: [],
        weather: '晴',
        location: '',
        content: '',
        next_day_plan: '',
        author: '系统用户'
      } as LogFormData,
      selectedPersonnel: [],
      weatherTypes: ['晴', '雨', '大雨', '雪', '阴', '多云', '雾']
    });

    // 计算天气选项
    const weatherOptions = computed(() => {
      return formState.weatherTypes.map(weather => {
        const emojis: Record<string, string> = {
          '晴': '☀️',
          '雨': '🌧️',
          '大雨': '⛈️',
          '雪': '❄️'
        };
        const emoji = emojis[weather] || '☀️';
        return { value: weather, label: `${emoji} ${weather}` };
      });
    });

    // 获取当前日期
    const getCurrentDate = (): string => {
      return new Date().toISOString().split('T')[0];
    };

    // 获取最近有地点的日志
    const getMostRecentLogWithLocation = () => {
      return props.recentLogs.find((log: any) => log.location) || null;
    };

    // 同步日志数据到localLog
    const syncLogToLocalLog = (log: Partial<WorkLog>) => {
      if (!log) return;

      formState.localLog.id = log.id;
      formState.localLog.log_date = log.log_date || '';
      formState.localLog.weather = log.weather || '晴';
      formState.localLog.location = log.location || '';
      formState.localLog.content = log.content || '';
      formState.localLog.next_day_plan = log.next_day_plan || '';
      formState.localLog.author = log.author || '系统用户';
      formState.localLog.executor = []; // 重置executor，由selectedPersonnel管理

      // 初始化选中的人员
      if (log.executor) {
        formState.selectedPersonnel = Array.isArray(log.executor) ?
          [...log.executor] :
          (log.executor as string).split(',').map(item => item.trim());
      } else {
        formState.selectedPersonnel = [];
      }
    };

    // 验证表单
    const validateForm = (): boolean => {
      if (!formState.localLog.log_date) {
        emit('error', '请选择日期');
        return false;
      }
      if (formState.selectedPersonnel.length === 0) {
        emit('error', '请至少选择一名参与人员');
        return false;
      }
      if (!formState.localLog.content.trim()) {
        emit('error', '请填写工作量内容');
        return false;
      }

      // 更新executor数据
      formState.localLog.executor = [...formState.selectedPersonnel];

      return true;
    };

    // 提交表单
    const submitForm = () => {
      if (!validateForm()) {
        return;
      }

      const formData = {
        ...formState.localLog,
        executor: [...formState.selectedPersonnel]
      };

      emit('submit', formData);

      // 提交成功后清除缓存
      clearFormDataFromLocalStorage();
    };

    // 保存当前表单数据到本地存储
    const saveFormDataToLocalStorage = () => {
      const formData = {
        log_date: formState.localLog.log_date,
        executor: formState.selectedPersonnel,
        content: formState.localLog.content,
        weather: formState.localLog.weather,
        location: formState.localLog.location,
        next_day_plan: formState.localLog.next_day_plan,
        author: formState.localLog.author
      };
      localStorage.setItem('logFormDraft', JSON.stringify(formData));
    };

    // 从本地存储恢复表单数据
    const loadFormDataFromLocalStorage = () => {
      const savedData = localStorage.getItem('logFormDraft');
      if (savedData) {
        try {
          const formData = JSON.parse(savedData);
          formState.localLog.log_date = formData.log_date || getCurrentDate();
          formState.localLog.content = formData.content || '';
          formState.localLog.weather = formData.weather || '晴';
          formState.localLog.location = formData.location || '';
          formState.localLog.next_day_plan = formData.next_day_plan || '';
          formState.localLog.author = formData.author || '系统用户';

          // 恢复选中的人员
          if (Array.isArray(formData.executor)) {
            formState.selectedPersonnel = formData.executor;
          } else if (typeof formData.executor === 'string') {
            formState.selectedPersonnel = formData.executor.split(',').map(item => item.trim());
          } else {
            formState.selectedPersonnel = [];
          }
        } catch (error) {
          console.error('解析本地存储的数据失败:', error);
        }
      }
    };

    // 清除本地存储的草稿
    const clearFormDataFromLocalStorage = () => {
      localStorage.removeItem('logFormDraft');
    };

    // 重置表单用于新建日志
    const resetFormForNewLog = () => {
      const recentLogWithLocation = getMostRecentLogWithLocation();
      formState.localLog.id = null;
      formState.localLog.log_date = getCurrentDate();
      formState.localLog.executor = [];
      formState.localLog.author = '系统用户';
      formState.localLog.content = '';
      formState.localLog.weather = '晴';
      formState.localLog.location = recentLogWithLocation ? recentLogWithLocation.location : '';
      formState.localLog.next_day_plan = '';
      formState.selectedPersonnel = [];
    };

    // 兼容旧版调用
    const submitLog = () => {
      submitForm();
    };

    // 监听log prop变化
    watch(
      () => props.log,
      (newVal) => {
        // 如果是新创建（没有id），不从缓存加载
        if (!newVal || !newVal.id) {
          // 清空本地存储中的草稿数据
          clearFormDataFromLocalStorage();

          formState.localLog = {
            id: null,
            log_date: getCurrentDate(),
            executor: [],
            weather: '晴',
            location: '',
            content: '',
            next_day_plan: '',
            author: '系统用户'
          } as LogFormData;
          formState.selectedPersonnel = [];

          // 如果传入了部分初始值(如日期)，则覆盖
          if (newVal) {
            if (newVal.log_date) formState.localLog.log_date = newVal.log_date;
            if (newVal.project_id) formState.localLog.project_id = newVal.project_id;
            if (newVal.author) formState.localLog.author = newVal.author;
            // 处理 executor 数组
            if (newVal.executor) {
              if (Array.isArray(newVal.executor)) {
                formState.selectedPersonnel = [...newVal.executor];
              } else if (typeof newVal.executor === 'string' && newVal.executor) {
                formState.selectedPersonnel = (newVal.executor as string).split(',').map(e => e.trim()).filter(e => e);
              }
              formState.localLog.executor = [...formState.selectedPersonnel];
            }
          }
          return;
        }

        // 如果是编辑模式，正常加载
        syncLogToLocalLog(newVal);
      },
      { deep: true }
    );

    // 监听表单数据变化并保存到本地存储
    watch(
      () => formState.localLog,
      () => {
        if (!formState.localLog.id) {
          saveFormDataToLocalStorage();
        }
      },
      { deep: true }
    );

    //  mounted生命周期
    onMounted(() => {
      // 初始化选中的人员
      if (props.log.executor) {
        formState.selectedPersonnel = Array.isArray(props.log.executor) ?
          [...props.log.executor] :
          (props.log.executor as string).split(',').map(item => item.trim());
      }

      // 编辑现有日志时，同步prop数据到localLog
      if (props.log && props.log.id) {
        syncLogToLocalLog(props.log);
      } else {
        // 新建日志时，从本地存储加载草稿数据
        loadFormDataFromLocalStorage();
        // 如果props中有指定的日期，使用props中的日期
        if (props.log && props.log.log_date && props.log.log_date !== '') {
          formState.localLog.log_date = props.log.log_date;
        }
      }
    });

    // beforeUnmount生命周期
    onBeforeUnmount(() => {
      // 组件卸载前，如果是新建模式，保存数据到本地存储
      if (!formState.localLog.id) {
        saveFormDataToLocalStorage();
      }
    });

    // 暴露方法给父组件
    return {
      formState,
      weatherOptions,
      submitLog,
      submitForm,
      clearFormDataFromLocalStorage,
      loadFormDataFromLocalStorage,
      saveFormDataToLocalStorage,
      resetFormForNewLog
    };
  }
});
</script>
