<template>
  <div class="flex">
    <!-- 时间轴列 -->
    <div class="w-1/4 pr-6 border-r time-axis-container">
      <!-- 时间轴连接线 -->
      <div class="time-axis-line"></div>

      <div :style="{ height: `${projectDays.length * 50}px` }" class="space-y-1">
        <div v-for="(day, index) in projectDays" :key="index" :class="[
          'py-2 px-3 rounded-lg cursor-pointer flex items-center time-axis-item transition-all duration-200 transform hover:scale-105',
          hasLogOnDate(logs, day.date)
            ? 'bg-blue-100 text-blue-800 shadow-md'
            : 'text-gray-500 hover:bg-gray-100'
        ]" @click="jumpToLogOnDate(day.date)" @dblclick="handleDateDoubleClick($event, day.date)"
          :title="`${day.date} ${day.dayOfWeek}`">
          <div :class="[
            'time-axis-dot',
            hasLogOnDate(logs, day.date) ? 'has-log' : ''
          ]"></div>
          <div class="flex flex-col ml-2">
            <span class="text-sm font-medium">{{ formatDateShort(day.date) }}</span>
            <span class="text-xs opacity-70">{{ day.dayOfWeek }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 日志列表列 -->
    <div class="w-3/4 pl-6">
      <div class="mb-6">
        <h2 class="text-xl font-bold text-gray-800">工作日志</h2>
      </div>

      <LogList 
        :logs="logs" 
        :projectId="projectId" 
        :personnel="settings?.personnel || []" 
        @edit-log="editLog"
        @delete-log="handleDeleteLog" 
      />
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

      const startDate = new Date(this.project.start_date);
      const endDate = this.project.end_date ? new Date(this.project.end_date) : null;
      
      let currentDate = new Date(startDate);
      currentDate.setHours(0, 0, 0, 0);
      
      const days = [];
      
      while (endDate === null || currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
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