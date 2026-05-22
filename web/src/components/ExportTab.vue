<template>
  <div class="p-4">
    <h2 class="text-xl font-bold text-gray-800 mb-6">数据导出</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 报销数据导出卡片 -->
      <div class="bg-white p-6 rounded-xl shadow border-l-4 border-green-500">
        <h3 class="text-lg font-semibold text-gray-800 mb-3">报销数据导出</h3>
        <p class="text-gray-600 mb-4">导出当前项目的报销明细数据</p>
        <button @click="exportExpenses"
          class="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
          导出报销数据
        </button>
      </div>

      <!-- 日志数据导出卡片 -->
      <div class="bg-white p-6 rounded-xl shadow border-l-4 border-blue-500">
        <h3 class="text-lg font-semibold text-gray-800 mb-3">日志数据导出</h3>
        <p class="text-gray-600 mb-4">导出当前项目的工作日志数据</p>
        <button @click="exportLogs"
          class="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          导出日志数据
        </button>
      </div>

      <div class="bg-white p-6 rounded-xl shadow border-l-4 border-purple-500">
        <h3 class="text-lg font-semibold text-gray-800 mb-3">项目汇总导出</h3>
        <p class="text-gray-600 mb-4">功能开发中...</p>
        <button disabled
          class="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-400 cursor-not-allowed">
          导出汇总数据
        </button>
      </div>

      <div class="bg-white p-6 rounded-xl shadow border-l-4 border-yellow-500">
        <h3 class="text-lg font-semibold text-gray-800 mb-3">全量数据导出</h3>
        <p class="text-gray-600 mb-4">功能开发中...</p>
        <button disabled
          class="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-yellow-400 cursor-not-allowed">
          导出全部数据
        </button>
      </div>
    </div>
    
    <!-- 导出信息提示模态框 -->
    <div v-if="showExportInfoModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-800">{{ exportType === 'expenses' ? '导出报销数据' : '导出日志数据' }}</h3>
            <button @click="showExportInfoModal = false" class="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="space-y-4">
            <div class="bg-blue-50 p-4 rounded-lg">
              <p class="text-sm text-blue-800">
                <span class="font-medium">文件名:</span> 
                <span class="ml-2">{{ exportType === 'expenses' ? `Project_${projectId}_Expenses.xlsx` : `Project_${projectId}_Logs.xlsx` }}</span>
              </p>
              <p class="text-sm text-blue-800 mt-2">
                <span class="font-medium">保存位置:</span> 
                <span class="ml-2">{{ downloadLocation }}</span>
              </p>
            </div>
            
            <div class="text-sm text-gray-600">
              <p>文件将自动下载到您的默认下载文件夹。</p>
              <p class="mt-2">{{ downloadHint }}</p>
            </div>
          </div>
          
          <div class="flex justify-end space-x-3 mt-6">
            <button 
              @click="showExportInfoModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              取消
            </button>
            <button 
              @click="confirmExport"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              开始导出
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
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
    return {
      showExportInfoModal: false,
      downloadLocation: '',
      downloadHint: '',
      exportType: 'expenses' // 'expenses' or 'logs'
    };
  },
  methods: {
    exportExpenses() {
      // 获取下载位置信息
      const downloadInfo = this.getDownloadLocationInfo();
      this.downloadLocation = downloadInfo.location;
      this.downloadHint = downloadInfo.hint;
      this.exportType = 'expenses';
      
      // 显示导出信息模态框
      this.showExportInfoModal = true;
    },
    
    exportLogs() {
      // 获取下载位置信息
      const downloadInfo = this.getDownloadLocationInfo();
      this.downloadLocation = downloadInfo.location;
      this.downloadHint = downloadInfo.hint;
      this.exportType = 'logs';
      
      // 显示导出信息模态框
      this.showExportInfoModal = true;
    },
    
    confirmExport() {
      this.showExportInfoModal = false;
      if (this.exportType === 'expenses') {
        this.$emit('export-expenses');
      } else {
        this.$emit('export-logs');
      }
    },
    
    getDownloadLocationInfo() {
      const userAgent = navigator.userAgent.toLowerCase();
      let location = '默认下载文件夹';
      let hint = '';
      
      if (userAgent.includes('win')) {
        location = 'C:\\Users\\[用户名]\\Downloads\\';
        hint = '您可以在文件资源管理器中按 Ctrl+J 快速打开下载文件夹。';
      } else if (userAgent.includes('mac')) {
        location = '~/Downloads/';
        hint = '您可以在 Finder 中按 Cmd+Shift+L 快速打开下载文件夹。';
      } else if (userAgent.includes('linux')) {
        location = '~/Downloads/';
        hint = '文件通常保存在 ~/Downloads 目录中。';
      } else {
        hint = '您可以在浏览器的下载管理器中查看和管理下载的文件。';
      }
      
      return { location, hint };
    }
  }
})
</script>
