<template>
  <div class="table-container shadow-sm border-surface-200">
    <table class="table">
      <thead>
        <tr>
          <th>日期</th>
          <th>费用大类</th>
          <th>费用子类</th>
          <th>金额</th>
          <th>凭证类型</th>
          <th>费用说明</th>
          <th>文件</th>
          <th class="text-right">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="expense in expenses" :key="expense.id" class="group">
          <td>
            <div class="font-medium text-gray-900">{{ formatDate(expense.date) }}</div>
          </td>
          <td>
            <span class="tag-gray">{{ expense.main_category }}</span>
          </td>
          <td>
            <span class="text-gray-600">{{ expense.sub_category }}</span>
          </td>
          <td>
            <div class="font-bold text-gray-900">¥{{ (typeof expense.amount === 'number' ? expense.amount :
              parseFloat(expense.amount)).toFixed(2) }}</div>
          </td>
          <td>
            <span :class="voucherTypeClass(expense.voucher_type)">
              {{ expense.voucher_type }}
            </span>
          </td>
          <td class="max-w-[200px]">
            <div class="truncate text-gray-600" :title="expense.description">{{ expense.description || '-' }}</div>
          </td>
          <td>
            <div v-if="expense.files && expense.files.length > 0" class="flex flex-col gap-1">
              <div v-for="(file, index) in expense.files" :key="index" class="flex items-center group/link">
                <svg xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 mr-1 text-primary-400 group-hover/link:text-primary-600" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <a :href="generateFileUrl(file)" target="_blank"
                  class="text-primary-600 hover:text-primary-700 hover:underline text-sm font-medium">
                  附件 {{ index + 1 }}
                </a>
              </div>
            </div>
            <div v-else-if="expense.file_paths" class="flex flex-col gap-1">
              <div v-for="(filePath, idx) in parseFilePaths(expense.file_paths)" :key="idx"
                class="flex items-center group/link">
                <svg xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 mr-1 text-primary-400 group-hover/link:text-primary-600" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <a :href="generateFileUrl(filePath)" target="_blank"
                  class="text-primary-600 hover:text-primary-700 hover:underline text-sm font-medium">
                  附件 {{ parseInt(String(idx)) + 1 }}
                </a>
              </div>
            </div>
            <div v-else class="text-gray-400 text-sm italic">无附件</div>
          </td>
          <td class="text-right">
            <div
              class="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button @click="$emit('edit-expense', expense)"
                class="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                title="编辑">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <button @click="$emit('delete-expense', expense.id)"
                class="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="删除">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="expenses.length === 0" class="flex flex-col items-center justify-center py-16 bg-white">
      <div class="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p class="text-lg font-medium text-gray-900">暂无费用记录</p>
      <p class="text-sm text-gray-500 mt-1">点击右上角"添加费用"按钮创建</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { Expense } from '../utils/tauriApi';

export default defineComponent({
  name: 'ExpenseList',
  props: {
    projectId: {
      type: Number,
      required: true
    },
    expenses: {
      type: Array as () => Expense[],
      default: () => []
    }
  },
  emits: ['delete-expense', 'edit-expense'],
  methods: {
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString();
    },
    voucherTypeClass(voucherType) {
      if (!voucherType) return 'tag-gray';
      const firstType = voucherType.split(',')[0].trim();
      switch (firstType) {
        case '发票':
          return 'tag-green';
        case '收据':
          return 'tag-blue';
        case '白条':
          return 'tag-yellow';
        case '付款记录':
          return 'tag-blue';
        default:
          return 'tag-gray';
      }
    },
    parseFilePaths(filePaths) {
      try {
        return JSON.parse(filePaths) || [];
      } catch (e) {
        console.error('解析文件路径失败:', e);
        return [];
      }
    },
    generateFileUrl(filePath) {
      // 从完整路径中提取项目名称和文件名
      const pathParts = filePath.split('/');
      if (pathParts.length >= 2) {
        const projectName = encodeURIComponent(pathParts[pathParts.length - 2] || 'default');
        const fileName = encodeURIComponent(pathParts[pathParts.length - 1]);
        // 构造API路径，使用URL编码处理特殊字符
        return `/api/uploads/${projectName}/${fileName}`;
      } else {
        const fileName = filePath.split('/').pop();
        return `/api/uploads/default/${encodeURIComponent(fileName)}`;
      }
    }
  }
});
</script>
