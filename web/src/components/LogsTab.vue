<template>
  <div class="flex flex-col md:flex-row gap-8">
    <!-- 时间轴列 -->
    <div class="w-full md:w-1/4 time-axis-container">
      <div class="sticky top-6">
        <!-- 时间轴连接线 -->
        <div class="time-axis-line hidden md:block"></div>

        <div :style="{ minHeight: `${Math.min(projectDays.length * 50, 600)}px` }"
          class="space-y-1.5 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          <div v-for="(day, index) in projectDays" :key="index" :class="[
            'py-2.5 px-4 md:pl-10 rounded-xl cursor-pointer flex items-center time-axis-item transition-all duration-300 transform',
            hasLogOnDate(logs, day.date)
              ? 'bg-primary-50 text-primary-700 shadow-sm hover:shadow-md border border-primary-100 hover:-translate-y-0.5'
              : 'text-gray-500 hover:bg-surface-100 border border-transparent'
          ]" @click="jumpToLogOnDate(day.date)" @dblclick="handleDateDoubleClick($event, day.date)"
            :title="`${day.date} ${day.dayOfWeek}`">
            <div :class="[
              'time-axis-dot hidden md:block',
              hasLogOnDate(logs, day.date) ? 'has-log' : ''
            ]"></div>
            <div class="flex flex-col md:ml-3">
              <span class="text-sm font-bold tracking-tight">{{ formatDateShort(day.date) }}</span>
              <span class="text-xs font-medium opacity-70 mt-0.5">{{ day.dayOfWeek }}</span>
            </div>

            <div v-if="hasLogOnDate(logs, day.date)" class="ml-auto">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary-500" viewBox="0 0 20 20"
                fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 日志列表列 -->
    <div class="w-full md:w-3/4">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-extrabold text-gray-900 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          工作日志
        </h2>
      </div>

      <LogList :logs="logs" :projectId="projectId" :personnel="settings?.personnel || []" @edit-log="editLog"
        @delete-log="handleDeleteLog" />
    </div>

    <!-- 新增/编辑日志模态框 -->
    <NewLogModal v-if="showNewLogModal" :projectId="projectId" :initialData="editingLog"
      @close="showNewLogModal = false" @save="handleSaveLog" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import LogList from './LogList.vue';
import NewLogModal from './NewLogModal.vue';
import { formatDateShort, hasLogOnDate, jumpToLogOnDate, handleDateDoubleClick } from '../utils/projectDetailUtils';
import { reportApi } from '../utils/tauriApi';
import type { ProjectStatistics, WorkLog, Project } from '../utils/tauriApi';

export default defineComponent({
  name: 'LogsTab',
  components: {
    LogList,
    NewLogModal
  },
  props: {
    projectId: {
      type: Number,
      required: true
    },
    project: {
      type: Object,
      default: () => null
    },
    logs: {
      type: Array as () => WorkLog[],
      default: () => []
    },
    settings: {
      type: Object,
      default: () => ({ personnel: [] })
    }
  },
  emits: ['save-log', 'delete-log', 'edit-log'],
  data() {
    return {
      showNewLogModal: false,
      editingLog: null as any,
      statistics: {
        project_days: 0,
        meal_allowance: 0
      } as ProjectStatistics
    };
  },
  computed: {
    // 生成时间轴上的日期列表（基于项目实际日期范围）
    projectDays() {
      if (!this.project?.start_date) return [];

      const startDate = new Date(this.project.start_date + 'T00:00:00');

      let endDateStr = this.project.end_date;
      if (!endDateStr) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        endDateStr = `${year}-${month}-${day}`;
      }
      const endDate = new Date(endDateStr + 'T00:00:00');

      let currentDate = new Date(startDate);

      const days = [];

      while (currentDate <= endDate) {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        const dayOfWeek = currentDate.toLocaleDateString('zh-CN', { weekday: 'short' });
        days.push({ date: dateStr, dayOfWeek });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return days.reverse();
    }
  },
  async mounted() {
    try {
      const stats = await reportApi.getProjectStatistics(this.projectId);
      this.statistics = stats;
    } catch (error) {
      console.error('Failed to fetch project statistics:', error);
    }
  },
  methods: {
    async loadStatistics() {
      try {
        const stats = await reportApi.getProjectStatistics(this.projectId);
        this.statistics = stats;
      } catch (error) {
        console.error('Failed to fetch project statistics:', error);
      }
    },
    formatDateShort,
    hasLogOnDate,
    jumpToLogOnDate,

    handleDateDoubleClick(event: MouseEvent, date: string) {
      handleDateDoubleClick(event, date, this.editLog, this.project, this.logs);
    },

    editLog(log: any) {
      this.editingLog = { ...log };
      this.showNewLogModal = true;
    },

    async handleSaveLog(logData: any) {
      this.$emit('save-log', logData);
    },

    handleDeleteLog(id: number) {
      this.$emit('delete-log', id);
    }
  },
  watch: {
    'project.id': {
      handler(newVal: number | undefined) {
        if (newVal) {
          this.loadStatistics();
        }
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
  left: 24px;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #e2e8f0;
  z-index: 1;
}

.time-axis-item {
  position: relative;
}

.time-axis-dot {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #cbd5e1;
  border: 2px solid white;
  z-index: 2;
  transition: all 0.3s ease-in-out;
}

.time-axis-dot.has-log {
  background-color: #3b82f6;
  width: 12px;
  height: 12px;
  left: 19px;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
</style>