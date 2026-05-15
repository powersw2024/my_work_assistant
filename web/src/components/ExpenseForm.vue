<template>
  <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
    <div class="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
      <h4 class="font-bold text-lg text-white flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg> 添加费用记录
      </h4>
      <p class="text-blue-100 text-sm mt-1">请填写以下信息完成费用报销申请</p>
    </div>
    
    <form @submit.prevent="submitExpense" class="p-6 space-y-6">
      <!-- 费用分类选择 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-gray-700 flex items-center">
            <span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> 费用大类
            <span class="ml-1 text-red-500">*</span>
          </label>
          <select 
            v-model="localExpense.main_category" 
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            @change="updateSubCategories"
            required
          >
            <option value="" disabled>请选择费用大类</option>
            <option 
              v-for="mainCategory in mainCategories" 
              :key="mainCategory" 
              :value="mainCategory"
            >
              {{ mainCategory }}
            </option>
          </select>
        </div>
        
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-gray-700 flex items-center">
            <span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> 费用子类
            <span class="ml-1 text-red-500">*</span>
          </label>
          <select 
            v-model="localExpense.sub_category" 
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            :disabled="!localExpense.main_category"
            required
          >
            <option value="" disabled>请选择费用子类</option>
            <option 
              v-for="subCategory in subCategories" 
              :key="subCategory" 
              :value="subCategory"
            >
              {{ subCategory }}
            </option>
          </select>
        </div>
      </div>
      
      <!-- 费用说明 -->
      <div class="space-y-2">
        <label class="block text-sm font-semibold text-gray-700 flex items-center">
          <span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> 费用说明
        </label>
        <input 
          v-model="localExpense.description" 
          type="text" 
          placeholder="简要描述费用用途..." 
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          maxlength="100"
        >
      </div>
      
      <!-- 金额输入 -->
      <div class="space-y-2">
        <label class="block text-sm font-semibold text-gray-700 flex items-center">
          <span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> 金额
          <span class="ml-1 text-red-500">*</span>
        </label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">¥</span>
          <input 
            v-model.number="localExpense.amount" 
            type="number" 
            step="0.01"
            placeholder="0.00" 
            class="pl-8 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            required
          >
        </div>
      </div>
      
      <!-- 凭证类型选择 -->
      <div class="space-y-2">
        <label class="block text-sm font-semibold text-gray-700 flex items-center">
          <span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> 凭证类型
          <span class="ml-1 text-red-500">*</span>
        </label>
        <select 
          v-model="selectedVoucherTypes" 
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          @change="updateRequiredFiles"
          required
          multiple
        >
          <option value="" disabled>请选择凭证类型（可多选）</option>
          <option 
            v-for="type in voucherTypes" 
            :key="type" 
            :value="type"
          >
            {{ type }}
          </option>
        </select>
      </div>
      
      <!-- 文件上传区域 -->
      <div class="space-y-4">
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-gray-700 flex items-center">
            <span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> 上传文件
          </label>
          
          <!-- 必需文件上传 -->
          <div class="space-y-3">
            <p class="text-xs font-medium text-red-500 flex items-center">
              <span class="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              {{ requiredFileType }} (必需)
            </p>
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors duration-200">
              <input 
                type="file" 
                ref="requiredFileInput"
                @change="onFileChange($event, requiredFileType)"
                class="w-full text-sm"
                :accept="getFileAccept(requiredFileType)"
                :multiple="true"
              >
              <p class="text-xs text-gray-500 mt-1">支持 JPG, PNG, PDF 等格式</p>
            </div>
          </div>
          
          <!-- 其他文件上传 -->
          <div class="space-y-3">
            <p class="text-xs font-medium text-green-500 flex items-center">
              <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              其他文件 (可选)
            </p>
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors duration-200">
              <input 
                type="file" 
                ref="otherFileInput"
                @change="onFileChange($event, 'other')"
                class="w-full text-sm"
                multiple
              >
              <p class="text-xs text-gray-500 mt-1">支持 JPG, PNG, PDF 等格式</p>
            </div>
          </div>
        </div>
        
        <!-- 已选文件列表 -->
        <div v-if="selectedFiles.length > 0" class="mt-4">
          <h5 class="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            已选择的文件 ({{ selectedFiles.length }})
          </h5>
          <div class="border rounded-lg bg-gray-50 overflow-hidden">
            <ul class="divide-y divide-gray-200">
              <li 
                v-for="(file, index) in selectedFiles" 
                :key="index"
                class="flex items-center justify-between p-3 hover:bg-white transition-colors duration-150"
              >
                <div class="flex items-center truncate">
                  <div class="flex-shrink-0 w-8 h-8 rounded-md bg-blue-100 flex items-center justify-center mr-3">
                    <div v-if="getFileIcon(file.file.type) === 'image'" class="h-5 w-5 text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div v-else-if="getFileIcon(file.file.type) === 'pdf'" class="h-5 w-5 text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div v-else class="h-5 w-5 text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div class="truncate">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ file.file.name }}</p>
                    <div class="flex text-xs text-gray-500">
                      <span>{{ formatFileSize(file.file.size) }}</span>
                      <span class="mx-1">•</span>
                      <span :class="{
                        'text-red-500': file.type === requiredFileType,
                        'text-green-500': file.type === 'other'
                      }">{{ file.type }}</span>
                    </div>
                  </div>
                </div>
                <button 
                  type="button" 
                  @click="removeFile(index)"
                  class="ml-4 flex-shrink-0 text-red-500 hover:text-red-700 p-1"
                  :title="`删除文件: ${file.file.name}`"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100 2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <!-- 提交按钮 -->
      <div class="pt-4">
        <button 
          type="submit"
          :disabled="!isFormValid"
          class="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <span class="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
            <span>提交费用报销</span>
          </span>
        </button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'ExpenseForm',
  props: {
    expense: {
      type: Object,
      required: true
    },
    mainCategories: {
      type: Array,
      default: () => []
    },
    subCategoriesByMain: {
      type: Object,
      default: () => {}
    },
    voucherTypes: {
      type: Array,
      default: () => ['发票', '收据', '白条', '付款记录']
    }
  },
  emits: ['submit-expense'],
  data() {
    return {
      localExpense: { 
        ...this.expense,
        main_category: '',
        sub_category: '',
        description: ''
      },
      subCategories: [],
      requiredFileType: '发票',
      selectedFiles: [], // 存储已选择的文件
      selectedVoucherTypes: [] // 存储选中的凭证类型
    }
  },
  computed: {
    isFormValid() {
      // 检查必需字段是否填写完整
      const hasMainCategory = !!this.localExpense.main_category;
      const hasSubCategory = !!this.localExpense.sub_category;
      const hasAmount = typeof this.localExpense.amount === 'number' && this.localExpense.amount > 0;
      const hasVoucherType = this.selectedVoucherTypes.length > 0;
      
      // 检查必需文件是否已上传
      const hasRequiredFile = this.selectedFiles.some(f => f.type === this.requiredFileType);
      
      return hasMainCategory && hasSubCategory && hasAmount && hasVoucherType && hasRequiredFile;
    }
  },
  methods: {
    updateSubCategories() {
      // 当选择了费用大类时，更新费用子类选项
      this.subCategories = [];
      this.localExpense.sub_category = '';
      
      if (this.localExpense.main_category && this.subCategoriesByMain[this.localExpense.main_category]) {
        this.subCategories = this.subCategoriesByMain[this.localExpense.main_category];
      }
    },
    
    updateRequiredFiles() {
      // 根据凭证类型更新必需上传的文件类型
      // 如果选择了"发票"，则必需上传发票类型的文件
      if (this.selectedVoucherTypes.includes('发票')) {
        this.requiredFileType = '发票';
      } else {
        this.requiredFileType = '付款记录';
      }
    },
    
    onFileChange(event, fileType) {
      const files = Array.from(event.target.files);
      
      files.forEach(file => {
        // 添加文件到列表前检查是否已经存在相同文件
        const fileNameExists = this.selectedFiles.some(f => f.file.name === file.name);
        if (!fileNameExists) {
          this.selectedFiles.push({
            file: file,
            type: fileType
          });
        }
      });
      
      // 清空input，以便可以重复选择相同文件
      event.target.value = '';
    },
    
    removeFile(index) {
      this.selectedFiles.splice(index, 1);
    },
    
    getFileAccept(fileType) {
      switch(fileType) {
        case '发票':
        case '付款记录':
          return '.jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx';
        default:
          return '.jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx';
      }
    },
    
    getFileIcon(fileType) {
      if (fileType.includes('image')) {
        return 'image';
      } else if (fileType.includes('pdf')) {
        return 'pdf';
      } else {
        return 'other';
      }
    },
    
    formatFileSize(size) {
      if (size === undefined) return '';
      if (size < 1024) return size + ' B';
      else if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
      else return (size / (1024 * 1024)).toFixed(1) + ' MB';
    },
    
    openFile(file) {
      // 创建一个隐藏的链接元素来触发文件下载/查看
      const link = document.createElement('a');
      const url = URL.createObjectURL(file);
      
      link.href = url;
      link.target = '_blank'; // 在新窗口中打开
      link.rel = 'noopener noreferrer'; // 安全性考虑
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 记得释放对象URL以避免内存泄漏
      URL.revokeObjectURL(url);
    },
    
    async submitExpense() {
      if (!this.isFormValid) {
        alert('请确保所有必填项都已填写，并且必需的文件已上传');
        return;
      }
      
      // 创建 FormData 对象来处理文件上传
      const formData = new FormData();
      
      // 添加费用数据，包括选中的凭证类型
      const expenseData = {
        ...this.localExpense,
        selectedVoucherTypes: this.selectedVoucherTypes // 添加选中的凭证类型
      };
      
      formData.append('expenseData', JSON.stringify(expenseData));
      
      // 添加所有选中的文件
      this.selectedFiles.forEach((fileObj, index) => {
        formData.append(`files`, fileObj.file);
      });
      
      // 发射事件，让父组件处理实际的API调用
      this.$emit('submit-expense', formData);
    }
  }
}
</script>