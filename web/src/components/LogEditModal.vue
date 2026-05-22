<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-gray-800">{{ logData.id ? '编辑工作日志' : '添加工作日志' }}</h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <LogForm 
          ref="logFormRef"
          :log="logData"
          :personnel="personnel"
          :recentLogs="recentLogs"
          @submit="handleLogSubmit"
        />

        <div class="flex justify-end space-x-3 mt-4">
          <button
            type="button"
            @click="$emit('close')"
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
import type { WorkLog } from '../utils/tauriApi';

export default defineComponent({
  name: 'LogEditModal',
  components: {
    LogForm
  },
  props: {
    logData: {
      type: Object as () => Partial<WorkLog>,
      required: true
    },
    selectedDate: {
      type: String as () => string,
      default: ''
    },
    personnel: {
      type: Array as () => string[],
      default: () => []
    },
    recentLogs: {
      type: Array as () => any[],
      default: () => []
    }
  },
  emits: ['close', 'save'],
  methods: {
    handleLogSubmit(formData: WorkLog) {
      // 触发保存事件
      this.$emit('save', formData);
    },
    // 提交表单的方法
    submitForm() {
      // 手动触发LogForm中的submitLog方法
      (this.$refs.logFormRef as any)?.submitLog();
    }
  }
})
</script>
