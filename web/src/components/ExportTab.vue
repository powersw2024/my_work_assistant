<template>
  <div class="p-2 md:p-4">
    <h2 class="text-xl font-extrabold text-gray-900 mb-6 flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24"
        stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      数据导出
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 报销数据导出卡片 -->
      <div class="card p-6 border-l-4 border-l-emerald-500 hover:-translate-y-1 transition-transform duration-300">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-lg font-bold text-gray-900 mb-1">报销数据导出</h3>
            <p class="text-sm text-gray-500">导出当前项目的报销明细数据及相关附件</p>
          </div>
          <div class="p-3 bg-emerald-50 rounded-xl text-emerald-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
        <button @click="exportExpenses" class="btn btn-success w-full mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          打包导出报销数据
        </button>
      </div>

      <!-- 日志数据导出卡片 -->
      <div class="card p-6 border-l-4 border-l-primary-500 hover:-translate-y-1 transition-transform duration-300">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-lg font-bold text-gray-900 mb-1">日志数据导出</h3>
            <p class="text-sm text-gray-500">导出当前项目的工作日志统计数据</p>
          </div>
          <div class="p-3 bg-primary-50 rounded-xl text-primary-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
        <button @click="exportLogs" class="btn btn-primary w-full mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          导出工作日志
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { exportExpensesFile, exportLogsFile } from '../utils/exportUtils';

export default defineComponent({
  name: 'ExportTab',
  props: {
    projectId: {
      type: Number,
      required: true
    }
  },
  emits: ['export-expenses', 'export-logs'],
  data() {
    return {};
  },
  methods: {
    exportExpenses() {
      exportExpensesFile(this.projectId).catch(err => {
        console.error('导出报销数据失败:', err);
        alert('导出失败，请检查网络或刷新重试。');
      });
    },

    exportLogs() {
      exportLogsFile(this.projectId).catch(err => {
        console.error('导出日志数据失败:', err);
        alert('导出失败，请检查网络或刷新重试。');
      });
    }
  }
})
</script>
