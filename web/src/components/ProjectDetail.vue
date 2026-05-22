<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="loading" class="flex justify-center items-center h-64">
      <p class="text-lg">加载中...</p>
    </div>

    <div v-else-if="loadError" class="flex justify-center items-center h-64">
      <div class="text-center">
        <p class="text-lg text-red-500 mb-4">{{ loadError }}</p>
        <button @click="goBack" class="btn btn-primary">返回</button>
      </div>
    </div>

    <div v-else-if="!project" class="flex justify-center items-center h-64">
      <p class="text-lg text-red-500">项目不存在</p>
    </div>

    <div v-else class="flex flex-col">
      <div class="mb-6">
        <button @click="goBack" class="flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回项目列表
        </button>

        <!-- 分栏导航 -->
        <div class="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
          <div class="flex border-b border-gray-100">
            <button v-for="tab in tabs" :key="tab.name" @click="activeTab = tab.name" :class="[
              'flex-1 py-4 px-1 font-medium text-base transition-all duration-300 ease-in-out',
              activeTab === tab.name
                ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-500 pb-3'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 pb-3'
            ]">
              <div class="flex items-center justify-center">
                <span class="flex items-center">
                  <svg v-if="tab.name === 'logs'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <svg v-if="tab.name === 'expenses'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <svg v-if="tab.name === 'reports'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 002-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <svg v-if="tab.name === 'files'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <svg v-if="tab.name === 'export'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {{ tab.label }}
                </span>
              </div>
            </button>
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="bg-white rounded-lg shadow p-6">
          <!-- 日志标签页 -->
          <LogsTab 
            v-if="activeTab === 'logs'" 
            :projectId="projectId"
            :project="project"
            :logs="logs"
            :settings="settings"
            @save-log="handleSaveLog"
            @delete-log="handleDeleteLog"
            @edit-log="editLog"
          />

          <!-- 报销标签页 -->
          <ExpensesTab 
            v-if="activeTab === 'expenses'" 
            :projectId="projectId"
            :expenses="expenses"
            :categories="categories"
            @save-expense="handleSaveExpense"
            @delete-expense="handleDeleteExpense"
            @edit-expense="editExpense"
          />

          <!-- 报表标签页 -->
          <ReportsTab 
            v-if="activeTab === 'reports'" 
            :expenses="expenses"
            :categories="categories"
            :project="project"
          />

          <!-- 文件标签页 -->
          <FilesTab v-if="activeTab === 'files'" />

          <!-- 导出标签页 -->
          <ExportTab 
            v-if="activeTab === 'export'" 
            :projectId="projectId"
            @export-expenses="exportExpenses"
            @export-logs="exportLogs"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import LogsTab from './LogsTab.vue';
import ExpensesTab from './ExpensesTab.vue';
import ReportsTab from './ReportsTab.vue';
import FilesTab from './FilesTab.vue';
import ExportTab from './ExportTab.vue';
import { projectApi, workLogApi, expenseApi, settingsApi, reportApi } from '../utils/tauriApi';
import type { Project, WorkLog, Expense, Settings, Category, ExpenseSummary, ProjectStatistics } from '../utils/tauriApi';

interface Tab {
  name: string;
  label: string;
}

interface CategoriesData {
  mainCategories: string[]; // 主类别名称数组
  categoriesByParent: Record<string, string[]>; // 父类别到子类别名称的映射
}

export default defineComponent({
  name: 'ProjectDetail',
  components: {
    LogsTab,
    ExpensesTab,
    ReportsTab,
    FilesTab,
    ExportTab
  },
  props: {
    projectId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      project: null as Project | null,
      logs: [] as WorkLog[],
      expenses: [] as Expense[],
      loading: true,
      loadError: null as string | null,
      settings: null as any, // 系统设置
      summary: {
        total_expenses: 0,
        total_with_invoice: 0,
        miscellaneous_total: 0,
        category_breakdown: [],
        invoice_category_breakdown: []
      } as ExpenseSummary,
      statistics: {
        project_days: 0,
        meal_allowance: 0
      } as ProjectStatistics,
      categories: {} as CategoriesData,
      activeTab: 'logs' as string,
      tabs: [
        { name: 'logs', label: '日志' },
        { name: 'expenses', label: '报销' },
        { name: 'reports', label: '报表' },
        { name: 'files', label: '文件' },
        { name: 'export', label: '导出' }
      ] as Tab[]
    };
  },
  async mounted() {
    await this.loadData();
  },
  methods: {
    async loadData() {
      this.loading = true;
      this.loadError = null;
      try {
        const [project, logs, expenses] = await Promise.all([
          projectApi.getProject(this.projectId),
          workLogApi.getWorkLogs(this.projectId),
          expenseApi.getExpenses(this.projectId)
        ]);

        this.project = project;
        this.logs = logs;
        this.expenses = expenses;
        
        // 加载费用类别
        try {
          const categories = await expenseApi.getCategories();
          const mainCategoriesMap = new Map<string, number>();
          const mainCategories: Category[] = [];
          const categoriesByParent: Record<string, Category[]> = {};
          
          categories.forEach((cat: Category) => {
            if (!cat.parent_id) {
              mainCategoriesMap.set(cat.name, cat.id);
              mainCategories.push(cat);
              categoriesByParent[cat.name] = [];
            }
          });
          
          categories.forEach((cat: Category) => {
            if (cat.parent_id) {
              const parent = categories.find(c => c.id === cat.parent_id);
              if (parent && categoriesByParent[parent.name]) {
                categoriesByParent[parent.name].push(cat);
              }
            }
          });
          
          this.categories = {
            mainCategories: mainCategories as unknown as string[], // 强制类型转换
            categoriesByParent
          };

        } catch (error) {
          console.error('加载类别失败:', error);
          this.categories = { mainCategories: [], categoriesByParent: {} };
        }
        
        // 获取系统设置
        try {
          const settingsData = await settingsApi.getSettings();
          this.settings = settingsData || { id: 0, key: '', value: '', description: '' };
        } catch (error) {
          console.warn('获取系统设置失败:', error);
          this.settings = { id: 0, key: '', value: '', description: '' };
        }
        
      } catch (error: any) {
        console.error('加载项目详情失败:', error);
        this.loadError = `加载项目详情失败: ${error.message || '未知错误'}`;
      } finally {
        this.loading = false;
      }
    },

    goBack() {
      this.$router.push('/');
    },

    // 日志相关方法
    async handleSaveLog(logData: Partial<WorkLog>) {
      try {
        if (logData.id) {
          await workLogApi.updateWorkLog(logData.id, logData as any);
        } else {
          await workLogApi.createWorkLog(logData as any);
        }
        await this.loadData();
      } catch (error: any) {
        console.error('保存日志时出错:', error);
        alert(`操作失败: ${error.message}`);
      }
    },
    
    async handleDeleteLog(id: number) {
      if (confirm('确定要删除这条日志吗？')) {
        try {
          await workLogApi.deleteWorkLog(id);
          await this.loadData();
        } catch (error: any) {
          console.error('删除日志时出错:', error);
          alert(`删除失败: ${error.message}`);
        }
      }
    },
    
    editLog(log: WorkLog) {
      // 这个方法现在由LogsTab组件内部处理
    },

    // 费用相关方法
    async handleSaveExpense(expenseData: Partial<Expense>) {
      try {
        if (expenseData.id) {
          await expenseApi.updateExpense(expenseData.id, expenseData as any);
        } else {
          await expenseApi.createExpense(expenseData as any);
        }
        await this.loadData();
      } catch (error: any) {
        console.error('保存费用时出错:', error);
        alert(`操作失败: ${error.message}`);
      }
    },
    
    async handleDeleteExpense(id: number) {
      if (confirm('确定要删除这笔费用吗？')) {
        try {
          await expenseApi.deleteExpense(id);
          await this.loadData();
        } catch (error: any) {
          console.error('删除费用时出错:', error);
          alert(`删除失败: ${error.message}`);
        }
      }
    },
    
    editExpense(expense: Expense) {
      // 这个方法现在由ExpensesTab组件内部处理
    },

    // 导出相关方法
    async exportExpenses() {
      try {
        alert('费用导出功能待实现（需要 Tauri 文件系统支持）');
      } catch (error: any) {
        console.error('导出报销数据时发生错误:', error);
        alert('导出报销数据时发生错误');
      }
    },
    
    async exportLogs() {
      try {
        alert('日志导出功能待实现（需要 Tauri 文件系统支持）');
      } catch (error: any) {
        console.error('导出日志数据时发生错误:', error);
        alert('导出日志数据时发生错误');
      }
    }
  },
  watch: {
    projectId: {
      handler() {
        this.loadData();
      },
      immediate: true
    },
    activeTab: {
      handler(newTab: string) {
        // 标签切换时的处理逻辑
      }
    }
  }
});
</script>

<style scoped>
/* 时间轴容器样式 */
.time-axis-container {
  position: relative;
  overflow: hidden;
}

.time-axis-line {
  position: absolute;
  left: 16px;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #e5e7eb;
  z-index: 1;
}

.time-axis-item {
  position: relative;
  padding-left: 32px;
}

.time-axis-dot {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #e5e7eb;
  z-index: 2;
  transition: all 0.2s ease-in-out;
}

.time-axis-dot.has-log {
  background-color: #3b82f6;
  transform: translateY(-50%) scale(1.2);
}
</style>