<template>
  <div
    class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
    <div
      class="bg-white rounded-2xl shadow-2xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden flex flex-col transform transition-all duration-300 scale-100 opacity-100">
      <div class="p-6 flex-1 overflow-y-auto">
        <div class="flex justify-between items-center mb-6 pb-4 border-b border-surface-100">
          <h2 class="text-2xl font-extrabold text-gray-900">{{ expenseData.id ? '编辑费用' : '新建费用' }}</h2>
          <button @click="$emit('close')"
            class="text-gray-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition-colors"
            aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 重复数据警告 -->
        <div v-if="duplicateWarning"
          class="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex justify-between items-start shadow-sm">
          <div class="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-amber-500 mt-0.5" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p class="font-bold">检测到可能重复的费用</p>
              <p class="text-sm mt-1 opacity-90">{{ duplicateWarning }}</p>
            </div>
          </div>
          <button type="button" @click="confirmDuplicateSave"
            class="btn btn-primary bg-amber-500 hover:bg-amber-600 text-white whitespace-nowrap ml-4">
            仍要保存
          </button>
        </div>

        <form @submit.prevent="saveExpense">
          <div class="flex flex-col lg:flex-row gap-8">
            <!-- 左侧：日期、费用大类、费用子类 -->
            <div class="w-full lg:w-1/4">
              <h3 class="font-bold text-lg text-gray-900 mb-4 flex items-center">
                <span class="w-1.5 h-5 bg-primary-500 rounded-full mr-2"></span>
                基础信息
              </h3>

              <div class="space-y-5 bg-surface-50 p-5 rounded-xl border border-surface-200">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1.5">费用日期 <span
                      class="text-rose-500">*</span></label>
                  <input v-model="expenseData.date" type="date" class="input-field" required />
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1.5">费用大类 <span
                      class="text-rose-500">*</span></label>
                  <select v-model="selectedMainCategory" @change="onMainCategoryChange" class="input-field" required>
                    <option value="">选择大类</option>
                    <option v-for="cat in categories.mainCategories" :key="cat.id" :value="cat.id">
                      {{ cat.name }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1.5">费用子类 <span
                      class="text-rose-500">*</span></label>
                  <select v-model="expenseData.sub_category_id" class="input-field" :disabled="!selectedMainCategory"
                    required>
                    <option value="">选择子类</option>
                    <option v-for="subCat in subCategories" :key="subCat.id" :value="subCat.id">
                      {{ subCat.name }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 中间：费用说明、金额、凭证类型 -->
            <div class="w-full lg:w-1/3">
              <h3 class="font-bold text-lg text-gray-900 mb-4 flex items-center">
                <span class="w-1.5 h-5 bg-emerald-500 rounded-full mr-2"></span>
                凭证信息
              </h3>

              <div class="space-y-5 bg-surface-50 p-5 rounded-xl border border-surface-200">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1.5">费用说明</label>
                  <input v-model="expenseData.description" type="text" class="input-field" placeholder="请输入费用说明">
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1.5">金额 <span
                      class="text-rose-500">*</span></label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span class="text-gray-500 font-medium">¥</span>
                    </div>
                    <input v-model.number="expenseData.amount" type="number" step="0.01" min="0"
                      class="input-field pl-8 font-medium"
                      :class="{ 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/50': error.amount }"
                      placeholder="0.00" required />
                  </div>
                  <p v-if="error.amount" class="mt-1.5 text-sm text-rose-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {{ error.amount }}
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">凭证类型 <span
                      class="text-rose-500">*</span></label>
                  <div
                    class="space-y-2.5 max-h-48 overflow-y-auto pr-2 custom-scrollbar p-3 bg-white rounded-lg border border-surface-200">
                    <div v-for="vt in voucherTypes" :key="vt.id" class="flex items-center group/checkbox">
                      <input type="checkbox" :id="'voucher-' + vt.id" :value="vt.id" v-model="selectedVoucherTypes"
                        class="h-4.5 w-4.5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer">
                      <label :for="'voucher-' + vt.id"
                        class="ml-2.5 text-sm text-gray-700 flex-1 cursor-pointer group-hover/checkbox:text-primary-600 transition-colors">
                        {{ vt.name }}
                      </label>
                    </div>
                  </div>
                </div>

                <!-- 文件上传区 -->
                <div v-for="vtId in selectedVoucherTypes" :key="vtId" class="pt-4 mt-4 border-t border-surface-200">
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    {{ getVoucherTypeName(vtId) }}文件 <span
                      class="text-primary-500 text-xs font-normal bg-primary-50 px-1.5 py-0.5 rounded">(可选)</span>
                  </label>
                  <div class="relative group/upload">
                    <input type="file" multiple @change="onFileChange($event, vtId)"
                      class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div
                      class="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-primary-200 rounded-xl bg-primary-50/50 group-hover/upload:bg-primary-50 group-hover/upload:border-primary-400 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 text-primary-400 mr-2 group-hover/upload:text-primary-600" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span class="text-sm font-medium text-primary-600">点击或拖拽文件至此上传</span>
                    </div>
                  </div>
                  <div v-if="selectedFiles[vtId] && selectedFiles[vtId].length > 0"
                    class="mt-2 text-xs font-medium text-emerald-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20"
                      fill="currentColor">
                      <path fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd" />
                    </svg>
                    已选择 {{ selectedFiles[vtId].length }} 个文件
                  </div>
                </div>
              </div>
            </div>

            <!-- 右侧：上传的文件 -->
            <div class="w-full lg:w-[41.666667%]">
              <h3 class="font-bold text-lg text-gray-900 mb-4 flex items-center">
                <span class="w-1.5 h-5 bg-amber-500 rounded-full mr-2"></span>
                附件管理
              </h3>

              <div class="bg-surface-50 p-5 rounded-xl border border-surface-200 h-[calc(100%-2rem)] flex flex-col">
                <div class="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-[300px]">
                  <div v-if="Object.keys(selectedFiles).length === 0 && uploadedFiles.length === 0"
                    class="h-full flex flex-col items-center justify-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-2 opacity-50" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    <p class="text-sm">暂无附件</p>
                  </div>

                  <div v-for="(files, vtId) in selectedFiles" :key="`new-${vtId}`" class="mb-6 last:mb-0">
                    <h4 class="font-bold text-sm text-gray-700 mb-3 flex items-center">
                      <span class="px-2 py-0.5 bg-primary-100 text-primary-700 rounded mr-2 text-xs">{{
                        getVoucherTypeName(vtId) }}</span>
                      <span class="text-xs font-normal text-gray-500">待上传</span>
                    </h4>
                    <ul class="space-y-2">
                      <li v-for="(file, idx) in files" :key="`new-${vtId}-${idx}`"
                        class="flex items-center justify-between bg-white p-3 rounded-xl border border-surface-200 shadow-sm cursor-pointer hover:border-primary-300 transition-colors group/file"
                        @dblclick="previewFile(file)">
                        <div class="flex items-center overflow-hidden pr-2">
                          <div
                            class="w-8 h-8 rounded bg-primary-50 flex items-center justify-center text-primary-500 mr-3 flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                              stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <span
                            class="text-sm font-medium text-gray-700 truncate group-hover/file:text-primary-700 transition-colors">{{
                            file.name }}</span>
                        </div>
                        <button type="button" @click="removeFile(vtId, idx)"
                          class="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0"
                          title="移除">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </li>
                    </ul>
                  </div>

                  <!-- 已上传文件列表 -->
                  <div v-if="uploadedFiles.length > 0"
                    :class="{ 'pt-6 border-t border-surface-200': Object.keys(selectedFiles).length > 0 }">
                    <h4 class="font-bold text-sm text-gray-700 mb-3 flex items-center">
                      <span class="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded mr-2 text-xs">已存文件</span>
                    </h4>
                    <ul class="space-y-2">
                      <li v-for="(file, index) in uploadedFiles" :key="`stored-${index}`"
                        class="flex items-center justify-between bg-white p-3 rounded-xl border border-surface-200 shadow-sm cursor-pointer hover:border-emerald-300 transition-colors group/file"
                        @dblclick="previewStoredFile(file)">
                        <div class="flex items-center overflow-hidden pr-2">
                          <div
                            class="w-8 h-8 rounded bg-emerald-50 flex items-center justify-center text-emerald-500 mr-3 flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                              stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <span
                            class="text-sm font-medium text-gray-700 truncate group-hover/file:text-emerald-700 transition-colors">{{
                            getFileNameFromPath(file) }}</span>
                        </div>
                        <button type="button" @click="removeUploadedFile(index)"
                          class="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0"
                          title="删除">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-8 pt-6 border-t border-surface-100 flex justify-end space-x-3">
            <button type="button" @click="$emit('close')" class="btn btn-secondary">
              取消
            </button>
            <button type="submit" class="btn btn-primary" :disabled="!isFormValid">
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
      if (!this.expenseData.amount || Number(this.expenseData.amount) <= 0) {
        this.error.amount = '请输入有效的金额';
        return;
      }

      if (!this.isFormValid) {
        alert('请填写所有必填字段');
        return;
      }

      // 准备DTO数据
      const expenseDto = {
        project_id: this.projectId,
        amount: Number(this.expenseData.amount),
        main_category_id: parseInt(this.selectedMainCategory),
        sub_category_id: parseInt(this.expenseData.sub_category_id),
        description: this.expenseData.description,
        expense_date: this.expenseData.date,
        voucher_type_ids: this.selectedVoucherTypes.map(id => parseInt(id as any))
      };

      try {
        let result;
        if (this.expenseData.id) {
          result = await expenseApi.updateExpense(this.expenseData.id, expenseDto);
        } else {
          result = await expenseApi.createExpense(expenseDto);
        }

        // 注意：这里的实现中忽略了文件上传逻辑，因为后端需要相应的处理支持
        // 如果后端有处理文件的接口，可以在这里调用

        this.$emit('save', result);
      } catch (error: any) {
        console.error('保存费用时出错:', error);
        alert(`保存费用时出错: ${error}`);
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
