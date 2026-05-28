<template>
  <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col transform transition-all duration-300 scale-100 opacity-100">
      <div class="p-6 flex-1 overflow-y-auto">
        <div class="flex justify-between items-center mb-6 pb-4 border-b border-surface-100">
          <h2 class="text-2xl font-extrabold text-gray-900">{{ logData.id ? '编辑日志' : '新建日志' }}</h2>
          <button 
            @click="onModalClose" 
            class="text-gray-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <LogForm 
          ref="logFormRef"
          :log="logData"
          :personnel="personnelList"
          :recentLogs="recentLogs"
          :project-name="projectName"
          @submit="handleLogSubmit"
        />
        
        <div class="flex justify-end space-x-3 mt-8 pt-6 border-t border-surface-100">
          <button
            type="button"
            @click="onModalClose"
            class="btn btn-secondary"
          >
            取消
          </button>
          <button 
            @click="submitForm" 
            class="btn btn-primary"
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
