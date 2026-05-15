<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">费用大类</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">费用子类</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金额</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">凭证类型</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">费用说明</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">文件</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="expense in expenses" :key="expense.id">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">{{ formatDate(expense.date) }}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">{{ expense.main_category }}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">{{ expense.sub_category }}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900">¥{{ parseFloat(expense.amount).toFixed(2) }}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">
              <span :class="voucherTypeClass(expense.voucher_type)">
                {{ expense.voucher_type }}
              </span>
            </div>
          </td>
          <td class="px-6 py-4">
            <div class="text-sm text-gray-900 max-w-xs truncate" :title="expense.description">{{ expense.description }}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div v-if="expense.files && expense.files.length > 0">
              <div v-for="(file, index) in expense.files" :key="index" class="mb-1 last:mb-0 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <a :href="generateFileUrl(file)" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm">
                  文件{{ index + 1 }}
                </a>
              </div>
            </div>
            <div v-else-if="expense.file_paths">
              <div v-for="(filePath, index) in parseFilePaths(expense.file_paths)" :key="index" class="mb-1 last:mb-0 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <a :href="generateFileUrl(filePath)" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm">
                  文件{{ index + 1 }}
                </a>
              </div>
            </div>
            <div v-else class="text-gray-400">
              无文件
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <button 
              @click="$emit('edit-expense', expense)"
              class="text-indigo-600 hover:text-indigo-900 mr-3"
              title="编辑费用"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button 
              @click="$emit('delete-expense', expense.id)"
              class="text-red-600 hover:text-red-900"
              title="删除费用"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    
    <div v-if="expenses.length === 0" class="text-center py-8 text-gray-500">
      <p>暂无费用记录，点击"添加费用"按钮创建第一条记录</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExpenseList',
  props: {
    projectId: {
      type: Number,
      required: true
    },
    expenses: {
      type: Array,
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
      // 如果是多个凭证类型组成的字符串，取第一个类型作为样式依据
      const firstType = voucherType.split(',')[0].trim();
      switch(firstType) {
        case '发票':
          return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800';
        case '收据':
          return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800';
        case '白条':
          return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800';
        case '付款记录':
          return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800';
        default:
          return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800';
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
};
</script>