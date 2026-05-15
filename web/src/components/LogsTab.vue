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
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-gray-800">工作日志</h2>
        <button @click="showNewLogModal = true"
          class="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          添加日志
        </button>
      </div>

      <LogList :logs="logs" :projectId="projectId" :personnel="settings.personnel || []" @edit-log="editLog"
        @delete-log="handleDeleteLog" />
    </div>
    
    <!-- 新增/编辑日志模态框 -->
    <NewLogModal v-if="showNewLogModal" :projectId="projectId" :initialData="editingLog"
      @close="showNewLogModal = false" @save="handleSaveLog" />
  </div>
</template>

<script>
import LogList from './LogList.vue';
import NewLogModal from './NewLogModal.vue';
import {
  getWeatherEmoji,
  formatDate,
  formatDateShort,
  hasLogOnDate,
  jumpToLogOnDate,
  handleDateDoubleClick
} from '../utils/projectDetailUtils';

export default {
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
      type: Array,
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
      editingLog: null
    };
  },
  computed: {
    projectDays() {
      if (!this.project || !this.project.start_date) return [];

      const startDate = new Date(this.project.start_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let endDate;

      if (this.project.end_date) {
        endDate = new Date(this.project.end_date);
        endDate.setHours(0, 0, 0, 0);
        endDate = endDate < today ? endDate : today;
      } else {
        endDate = today;
      }

      startDate.setHours(0, 0, 0, 0);

      if (endDate < startDate) {
        return [];
      }

      const days = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayOfWeek = currentDate.toLocaleDateString('zh-CN', { weekday: 'short' });

        days.push({
          date: dateStr,
          dayOfWeek: dayOfWeek
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return days.reverse();
    }
  },
  methods: {
    getWeatherEmoji,
    formatDate,
    formatDateShort,
    hasLogOnDate,
    jumpToLogOnDate,

    handleDateDoubleClick(event, date) {
      handleDateDoubleClick(event, date, this.editLog, this.project, this.logs);
    },

    editLog(log) {
      this.editingLog = { ...log };
      this.showNewLogModal = true;
    },

    async handleSaveLog(logData) {
      this.$emit('save-log', logData);
    },

    handleDeleteLog(id) {
      this.$emit('delete-log', id);
    }
  }
};
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