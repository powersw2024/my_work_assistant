<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-800">{{ expenseData.id ? '编辑费用' : '新建费用' }}</h2>
          <div class="absolute top-4 right-4">
            <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700" aria-label="Close">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- 重复数据警告 -->
        <div v-if="duplicateWarning" class="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 rounded">
          <div class="flex justify-between items-start">
            <div>
              <p class="font-bold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                检测到可能重复的费用
              </p>
              <p class="text-sm">{{ duplicateWarning }}</p>
            </div>
            <button type="button" @click="confirmDuplicateSave"
              class="ml-4 px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600">
              仍要保存
            </button>
          </div>
        </div>

        <form @submit.prevent="saveExpense">
          <div class="flex flex-wrap gap-6">
            <!-- 左侧：日期、费用大类、费用子类 -->
            <div class="w-1/4">
              <h3 class="font-semibold text-lg text-gray-700 mb-4 pb-2 border-b">基础信息</h3>

              <div class="space-y-5">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">费用日期</label>
                  <input v-model="expenseData.date" type="date"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    费用大类 <span class="text-red-500">*</span>
                  </label>
                  <select v-model="selectedMainCategory" @change="onMainCategoryChange"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required>
                    <option value="">选择大类</option>
                    <option v-for="cat in categories.mainCategories" :key="cat.id" :value="cat.id">
                      {{ cat.name }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    费用子类 <span class="text-red-500">*</span>
                  </label>
                  <select v-model="expenseData.sub_category_id"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :disabled="!selectedMainCategory" required>
                    <option value="">选择子类</option>
                    <option v-for="subCat in subCategories" :key="subCat.id" :value="subCat.id">
                      {{ subCat.name }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 中间：费用说明、金额、凭证类型 -->
            <div class="w-1/3">
              <h3 class="font-semibold text-lg text-gray-700 mb-4 pb-2 border-b">凭证信息</h3>
              
              <div class="space-y-5">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">费用说明</label>
                  <input
                    v-model="expenseData.description"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入费用说明"
                  >
                </div>
                
                <!-- 金额移到费用说明后面 -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    金额 <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model.number="expenseData.amount"
                    type="number"
                    step="0.01"
                    min="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :class="{ 'border-red-500': error.amount }"
                    placeholder="0.00"
                    required
                  />
                  <p v-if="error.amount" class="mt-1 text-sm text-red-600">{{ error.amount }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    凭证类型 <span class="text-red-500">*</span>
                  </label>
                  <div class="space-y-2 max-h-60 overflow-y-auto pr-2">
                    <div 
                      v-for="vt in voucherTypes" 
                      :key="vt.id"
                      class="flex items-center"
                    >
                      <input
                        type="checkbox"
                        :id="'voucher-' + vt.id"
                        :value="vt.id"
                        v-model="selectedVoucherTypes"
                        class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      >
                      <label 
                        :for="'voucher-' + vt.id" 
                        class="ml-2 text-sm text-gray-700 flex-1"
                      >
                        {{ vt.name }}
                      </label>
                    </div>
                  </div>
                </div>
                
                <!-- 文件上传区 -->
                <div v-for="vtId in selectedVoucherTypes" :key="vtId" class="pt-2 border-t border-gray-200">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    {{ getVoucherTypeName(vtId) }}文件 <span class="text-blue-500 text-xs">(可选)</span>
                  </label>
                  <input
                    type="file"
                    multiple
                    @change="onFileChange($event, vtId)"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div v-if="selectedFiles[vtId] && selectedFiles[vtId].length > 0" class="mt-1 text-sm text-gray-600">
                    已选择 {{ selectedFiles[vtId].length }} 个{{ getVoucherTypeName(vtId) }}文件
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 右侧：上传的文件 -->
            <div class="w-1/3">
              <h3 class="font-semibold text-lg text-gray-700 mb-4 pb-2 border-b">已上传文件</h3>
              
              <div class="max-h-[400px] overflow-y-auto pr-2">
                <div v-for="(files, vtId) in selectedFiles" :key="`new-${vtId}`" class="mb-4">
                  <h4 class="font-medium text-gray-700 mb-2">{{ getVoucherTypeName(vtId) }} (新)</h4>
                  <ul class="space-y-2">
                    <li 
                      v-for="(file, idx) in files" 
                      :key="`new-${vtId}-${idx}`"
                      class="flex items-center justify-between bg-gray-50 p-2 rounded cursor-pointer hover:bg-blue-50"
                      @dblclick="previewFile(file)"
                    >
                      <div class="flex items-center truncate">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span class="text-sm text-gray-600 truncate max-w-xs">{{ file.name }}</span>
                      </div>
                      <button 
                        type="button" 
                        @click="removeFile(vtId, idx)"
                        class="text-red-500 hover:text-red-700 text-sm"
                      >
                        删除
                      </button>
                    </li>
                  </ul>
                </div>
                
                <!-- 已上传文件列表 -->
                <div v-if="uploadedFiles.length > 0" class="pt-4 border-t border-gray-200">
                  <h4 class="font-medium text-gray-700 mb-2">已存文件</h4>
                  <ul class="space-y-2">
                    <li 
                      v-for="(file, index) in uploadedFiles" 
                      :key="`stored-${index}`" 
                      class="flex items-center justify-between bg-gray-50 p-2 rounded cursor-pointer"
                      @dblclick="previewStoredFile(file)"
                    >
                      <div class="flex items-center truncate">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span class="text-sm text-gray-600 truncate max-w-xs">{{ getFileNameFromPath(file) }}</span>
                      </div>
                      <button 
                        type="button" 
                        @click="removeUploadedFile(index)"
                        class="text-red-500 hover:text-red-700 text-sm"
                      >
                        删除
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div class="mt-6 flex justify-end space-x-3">
            <button type="button" @click="$emit('close')"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
              取消
            </button>
            <button type="submit"
              class="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
              :disabled="!isFormValid">
              {{ expenseData.id ? '更新费用' : '保存费用' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { expenseApi } from '../utils/tauriApi';
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'NewExpenseModal',
  props: {
    projectId: {
      type: Number,
      required: true
    },
    categories: {
      type: Object,
      default: () => ({})
    },
    initialData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      expenseData: {
        id: null,
        project_id: null,
        amount: '',
        main_category_id: '',
        sub_category_id: '',
        description: '',
        file_paths: null,
        date: new Date().toISOString().split('T')[0] // 格式化为 YYYY-MM-DD
      },
      selectedMainCategory: '',
      selectedVoucherTypes: [], // 多选凭证类型
      selectedFiles: {}, // 存储按凭证类型分类的文件
      uploadedFiles: [], // 存储已上传的文件路径
      voucherTypes: [], // 从后端加载
      error: {
        amount: ''
      },
      duplicateWarning: ''
    };
  },
  computed: {
    subCategories() {
      if (!this.selectedMainCategory) return [];
      return this.categories.categoriesByParent[this.selectedMainCategory] || [];
    },
    isFormValid() {
      return this.expenseData.amount > 0 &&
        this.selectedMainCategory &&
        this.expenseData.sub_category_id &&
        this.selectedVoucherTypes.length > 0 &&
        this.expenseData.date;
    }
  },
  async mounted() {
    await this.loadVoucherTypes();
    this.expenseData.project_id = this.projectId;
  },
  watch: {
    initialData: {
      handler(newVal) {
        if (newVal && Object.keys(newVal).length > 0) {
          // 复制初始数据，确保包含ID
          this.expenseData = {
            id: newVal.id || null,
            project_id: newVal.project_id || this.projectId,
            amount: newVal.amount || '',
            main_category_id: newVal.main_category_id || '',
            sub_category_id: newVal.sub_category_id || '',
            description: newVal.description || '',
            file_paths: newVal.file_paths || null,
            date: newVal.date ? newVal.date.substring(0, 10) : new Date().toISOString().split('T')[0]
          };
          // 设置选中的主类别
          this.selectedMainCategory = newVal.main_category_id || '';

          // 设置凭证类型
          if (newVal.voucher_type_id) {
            this.selectedVoucherTypes = [newVal.voucher_type_id]; // 单个ID
          }

          // 解析已存在的文件路径
          if (newVal.file_paths) {
            try {
              this.uploadedFiles = JSON.parse(newVal.file_paths);
            } catch (e) {
              this.uploadedFiles = [newVal.file_paths]; // 如果不是JSON格式，则作为单一路径
            }
          } else {
            this.uploadedFiles = [];
          }
          
          // 如果有files属性（从expense_files表获取的文件），则合并到uploadedFiles
          if (newVal.files && Array.isArray(newVal.files)) {
            // 合并已存在的文件路径和从expense_files表获取的文件
            this.uploadedFiles = [...new Set([...this.uploadedFiles, ...newVal.files])];
          }
        } else {
          // 如果没有传入初始数据，则清空并设置项目ID
          this.expenseData = {
            id: null,
            project_id: this.projectId,
            amount: '',
            main_category_id: '',
            sub_category_id: '',
            description: '',
            file_paths: null,
            date: new Date().toISOString().split('T')[0]
          };
          this.selectedMainCategory = '';
          this.selectedVoucherTypes = [];
          this.selectedFiles = {};
          this.uploadedFiles = [];
        }
      },
      immediate: true
    },
    projectId: {
      handler(newId) {
        // 只有在不是编辑模式时才更新项目ID
        if (!this.initialData || !this.initialData.id) {
          this.expenseData.project_id = newId;
        }
      },
      immediate: true
    }
  },
  methods: {
    async loadVoucherTypes() {
      try {
        this.voucherTypes = await expenseApi.getVoucherTypes();
      } catch (error) {
        console.error('加载凭证类型失败:', error);
        this.voucherTypes = [];
      }
    },
    onMainCategoryChange() {
      this.expenseData.sub_category_id = ''; // 重置子类别
    },
    onFileChange(event: Event, voucherTypeId: string) {
      // 获取文件列表
      const files = Array.from((event.target as HTMLInputElement).files || []);

      // 初始化对应凭证类型的文件数组
      if (!this.selectedFiles[voucherTypeId]) {
        this.selectedFiles[voucherTypeId] = [];
      }

      // 添加新文件，避免重复
      files.forEach((file: File) => {
        const existingIndex = this.selectedFiles[voucherTypeId].findIndex(f => f.name === file.name);
        if (existingIndex === -1) {
          this.selectedFiles[voucherTypeId].push(file);
        } else {
          console.warn(`文件 ${file.name} 已存在，跳过添加`);
        }
      });

      // 清空input，以便可以重复选择相同文件
      (event.target as HTMLInputElement).value = '';
    },
    getVoucherTypeName(voucherTypeId) {
      const voucherType = this.voucherTypes.find(vt => vt.id == voucherTypeId);
      return voucherType ? voucherType.name : '未知类型';
    },
    removeFile(voucherTypeId, index) {
      this.selectedFiles[voucherTypeId].splice(index, 1);
      // 如果该类型下没有文件了，删除该类型键
      if (this.selectedFiles[voucherTypeId].length === 0) {
        delete this.selectedFiles[voucherTypeId];
      }
    },
    removeUploadedFile(index) {
      this.uploadedFiles.splice(index, 1);
    },
    getFileNameFromPath(filePath) {
      // 从完整路径中提取文件名
      return filePath.split('\\').pop().split('/').pop();
    },
    previewFile(file) {
      // 创建一个对象URL来预览文件
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, '_blank');

      // 记得释放对象URL以避免内存泄漏
      setTimeout(() => URL.revokeObjectURL(fileURL), 1000);
    },
    previewStoredFile(filePath) {
      // 根据后端的路径规则构建访问URL
      const pathParts = filePath.split('/');
      if (pathParts.length >= 2) {
        const projectName = encodeURIComponent(pathParts[pathParts.length - 2] || 'default');
        const fileName = encodeURIComponent(pathParts[pathParts.length - 1]);
        const apiUrl = `/api/uploads/${projectName}/${fileName}`;
        
        // 尝试预览已存储的文件
        window.open(apiUrl, '_blank');
      } else {
        const fileName = this.getFileNameFromPath(filePath);
        const apiUrl = `/api/uploads/default/${encodeURIComponent(fileName)}`;
        
        // 尝试预览已存储的文件
        window.open(apiUrl, '_blank');
      }
    },
    async checkDuplicateExpense() {
      // 检查是否为重复费用
      if (!this.expenseData.amount || !this.expenseData.date || !this.expenseData.sub_category_id) {
        return '';
      }

      try {
        const params = new URLSearchParams({
          project_id: this.projectId,
          amount: this.expenseData.amount,
          date: this.expenseData.date,
          sub_category_id: this.expenseData.sub_category_id
        });

        // TODO: 实现实际的重复检查 API 调用
        // const response = await fetch(`/api/expenses/check-duplicate?${params.toString()}`);
        // if (response.ok) {
        //   const data = await response.json();
        //   return data.warning || '';
        // }

        return '';
      } catch (error) {
        console.error('检查重复费用时出错:', error);
        return '';
      }
    },
    async saveExpense() {
      // 清除之前的错误和警告
      this.error.amount = '';
      
      // 基本验证
      if (!this.expenseData.amount || this.expenseData.amount <= 0) {
        this.error.amount = '请输入有效的金额';
        return;
      }
      
      if (!this.isFormValid) {
        alert('请填写所有必填字段');
        return;
      }

      // 如果不是忽略警告后的保存，则检查重复
      if (!this.duplicateWarning) {
        const warningMsg = await this.checkDuplicateExpense();
        if (warningMsg) {
          this.duplicateWarning = warningMsg;
          return;
        }
      }

      // 创建 FormData 对象来处理文件上传
      const formData = new FormData();
      
      // 添加费用数据
      const expenseDataToSend = {
        ...this.expenseData,
        main_category_id: parseInt(this.selectedMainCategory),
        project_id: this.projectId,
        // 使用选中的凭证类型 - 支持多个
        voucher_type_ids: this.selectedVoucherTypes,
        // 传递已存在的文件路径，以便后端合并或保留
        existing_files: this.uploadedFiles
      };
      
      formData.append('expenseData', JSON.stringify(expenseDataToSend));

      // 添加所有新选择的文件
      for (const voucherTypeId in this.selectedFiles) {
        for (const file of this.selectedFiles[voucherTypeId]) {
          formData.append('files', file);
        }
      }

      try {
        let response;
        if (this.expenseData.id) {
          // 更新费用
          response = await fetch(`/api/expenses/${this.expenseData.id}`, {
            method: 'PUT',
            body: formData
          });
        } else {
          // 创建费用
          response = await fetch('/api/expenses', {
            method: 'POST',
            body: formData
          });
        }

        if (response.ok) {
          const result = await response.json();
          this.$emit('save', result); // 发送保存事件
        } else {
          const error = await response.json();
          alert(`操作失败: ${error.error}`);
        }
      } catch (error) {
        console.error('保存费用时出错:', error);
        alert('保存费用时出错，请检查网络连接或稍后重试');
      }
    },
    confirmDuplicateSave() {
      // 用户确认重复，直接保存
      this.duplicateWarning = '';
      this.saveExpense();
    }
  }
});
</script>
