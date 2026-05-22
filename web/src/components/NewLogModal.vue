<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <h2 class="text-xl font-bold mb-4">{{ logData.id ? '编辑日志' : '新建日志' }}</h2>
        
        <LogForm 
          ref="logFormRef"
          :log="logData"
          :personnel="personnelList"
          :recentLogs="recentLogs"
          :project-name="projectName"
          @submit="handleLogSubmit"
        />
        
        <div class="flex justify-end space-x-3 mt-4">
          <button
            type="button"
            @click="onModalClose"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
            取消
          </button>
          <button 
            @click="submitForm" 
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import LogForm from './LogForm.vue';
import { personApi } from '../utils/tauriApi';
import type { Person } from '../utils/tauriApi';

export interface NewLogModalData {
  projectId: number;
  initialData?: {
    id?: number | null;
    project_id?: number;
    log_date?: string;
    executor?: any[];
    weather?: string;
    location?: string;
    content?: string;
    next_day_plan?: string;
    author?: string;
  };
}

export default defineComponent({
  name: 'NewLogModal',
  components: {
    LogForm
  },
  props: {
    projectId: {
      type: Number,
      required: true
    },
    initialData: {
      type: Object as () => NewLogModalData['initialData'],
      default: () => ({})
    }
  },
  data() {
    return {
      logData: {
        id: null as number | null,
        project_id: null as number | null,
        log_date: '' as string,
        executor: [] as any[],
        weather: '晴' as string,
        location: '' as string,
        content: '' as string,
        next_day_plan: '' as string,
        author: '系统用户' as string
      },
      personnelList: [] as string[],
      recentLogs: [] as any[],
      projectName: '' as string
    };
  },
  async mounted() {
    await this.loadPersonnel();
    await this.loadRecentLogs();
    await this.loadProjectName();
  },
  watch: {
    initialData: {
      handler(newVal) {
        if (newVal && Object.keys(newVal).length > 0) {
          // 复制初始数据，确保包含ID
          this.logData = { 
            id: newVal.id || null,
            project_id: newVal.project_id || this.projectId,
            log_date: newVal.log_date || new Date().toISOString().split('T')[0],
            executor: newVal.executor ? (Array.isArray(newVal.executor) ? newVal.executor.join(',') : newVal.executor) : '',
            weather: newVal.weather || '晴',
            location: newVal.location || '',
            content: newVal.content || '',
            next_day_plan: newVal.next_day_plan || '',
            author: newVal.author || '系统用户'
          };
        } else {
          // 如果没有传入初始数据，则清空并设置为新建状态
          this.logData = {
            id: null,
            project_id: this.projectId,
            log_date: new Date().toISOString().split('T')[0], // 默认今天
            executor: '',
            weather: '晴',
            location: '',
            content: '',
            next_day_plan: '',
            author: '系统用户'
          };
          
          // 重要：如果是在新建模式下，确保重置表单数据
          if (this.$refs.logFormRef && (this.$refs.logFormRef as any).resetFormForNewLog) {
            this.$nextTick(() => {
              (this.$refs.logFormRef as any).resetFormForNewLog();
            });
          }
        }
      },

      immediate: true
    },
    projectId: {
      handler(newId) {
        // 只有在不是编辑模式时才更新项目ID
        if (!this.initialData || !this.initialData.id) {
          this.logData.project_id = newId;
        }
      },
      immediate: true
    }
  },
  methods: {
    async loadPersonnel() {
      try {
        const persons: Person[] = await personApi.getPersons();
        // 从 Person 对象中提取 name 字段
        this.personnelList = persons.map(p => p.name);
      } catch (error) {
        console.error('加载人员列表失败:', error);
        this.personnelList = [];
      }
    },
    async loadRecentLogs() {
      // TODO: 使用 Tauri API 而不是 fetch
      // const response = await fetch(`/api/worklogs/project/${this.projectId}?limit=10`);
      // if (response.ok) {
      //   this.recentLogs = await response.json();
      // }
      this.recentLogs = [];
    },
    async loadProjectName() {
      // TODO: 使用 Tauri API 而不是 fetch
      // const response = await fetch(`/api/projects/${this.projectId}`);
      // if (response.ok) {
      //   const project = await response.json();
      //   this.projectName = project.name;
      // }
      this.projectName = '';
    },
    handleLogSubmit(formData: any) {
      // 确保项目ID包含在提交的数据中
      const logData = {
        ...formData,
        project_id: this.projectId
      };
      this.$emit('save', logData);
    },
    // 提交表单的方法
    submitForm() {
      // 手动触发LogForm中的submitLog方法
      (this.$refs.logFormRef as any)?.submitLog();
    },
    // 当模态框关闭时，如果是新建模式，清理草稿数据
    onModalClose() {
      // 只有在新建模式下才清理草稿数据
      if (!this.logData.id) {
        (this.$refs.logFormRef as any)?.clearFormDataFromLocalStorage();
      }
      this.$emit('close');
    }
  },
  emits: ['save', 'close']
});
</script>
