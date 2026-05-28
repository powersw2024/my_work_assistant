<template>
  <div class="modal-backdrop p-4">
    <div class="modal-panel w-full max-w-6xl">
      <div class="modal-header">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-500">Expense</p>
          <h2 class="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{{ expenseData.id ? '编辑费用' : '新建费用' }}
          </h2>
        </div>
        <button @click="$emit('close')"
          class="rounded-full p-2 text-gray-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
          aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="modal-body">

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
            <!-- 左侧：基础信息与金额 -->
            <div class="w-full lg:w-1/2">
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
              </div>
            </div>

            <!-- 右侧：凭证信息 -->
            <div class="w-full lg:w-1/2">
              <h3 class="font-bold text-lg text-gray-900 mb-4 flex items-center">
                <span class="w-1.5 h-5 bg-emerald-500 rounded-full mr-2"></span>
                凭证类型
              </h3>

              <div class="space-y-5 bg-surface-50 p-5 rounded-xl border border-surface-200">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">选择凭证类型 <span
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

                <!-- 文件上传区恢复显示 -->
                <div v-for="vtId in selectedVoucherTypes" :key="vtId" class="pt-4 mt-4 border-t border-surface-200">
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    {{ getVoucherTypeName(vtId) }}文件 <span
                      class="text-primary-500 text-xs font-normal bg-primary-50 px-1.5 py-0.5 rounded">(可选)</span>
                  </label>
                  <button type="button" @click="openFilePicker(vtId)"
                    class="group/upload flex w-full items-center justify-center rounded-2xl border border-dashed border-primary-200 bg-primary-50/50 px-4 py-4 text-left transition-all hover:border-primary-400 hover:bg-primary-50">
                    <div class="flex items-center justify-center w-full">
                      <svg xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 text-primary-400 mr-2 group-hover/upload:text-primary-600" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <div class="flex flex-col items-start">
                        <span class="text-sm font-medium text-primary-700">点击选择文件</span>
                        <span class="mt-1 text-xs text-primary-500">支持一次选择多个文件，自动归类到当前凭证类型</span>
                      </div>
                    </div>
                  </button>

                  <div v-if="selectedFiles[vtId] && selectedFiles[vtId].length > 0" class="mt-3">
                    <ul class="space-y-2">
                      <li v-for="(file, idx) in selectedFiles[vtId]" :key="`new-${vtId}-${idx}`"
                        class="flex items-center justify-between bg-white p-3 rounded-xl border border-surface-200 shadow-sm cursor-pointer hover:border-primary-300 transition-colors group/file">
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
                              file.split(/[\\/]/).pop() }}</span>
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
                </div>

                <!-- 已上传文件列表 -->
                <div v-if="uploadedFiles.length > 0" class="pt-4 mt-4 border-t border-surface-200">
                  <h4 class="font-bold text-sm text-gray-700 mb-3 flex items-center">
                    <span class="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded mr-2 text-xs">已存文件</span>
                  </h4>
                  <div class="space-y-3">
                    <div v-for="(files, voucherTypeName) in groupedUploadedFiles" :key="`stored-${voucherTypeName}`"
                      class="rounded-xl border border-surface-200 bg-white p-3 shadow-sm">
                      <div class="mb-2 flex items-center justify-between">
                        <span class="tag tag-green">{{ voucherTypeName }}</span>
                        <span class="text-xs text-slate-400">{{ files.length }} 个文件</span>
                      </div>
                      <ul class="space-y-2">
                        <li v-for="file in files" :key="file.id || file.file_path"
                          class="flex items-center overflow-hidden rounded-xl border border-surface-100 bg-surface-50 px-3 py-2">
                          <div
                            class="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                              stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <span class="truncate text-sm font-medium text-slate-700">{{ file.file_name }}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </form>
      </div>

      <div class="modal-footer">
        <button type="button" @click="$emit('close')" class="btn btn-secondary">
          取消
        </button>
        <button type="button" @click="saveExpense" class="btn btn-primary" :disabled="!isFormValid">
          {{ expenseData.id ? '更新费用' : '保存费用' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { expenseApi } from '../utils/tauriApi';
import { defineComponent } from 'vue';
import { open } from '@tauri-apps/plugin-dialog';
import type { ExpenseDTO, ExpenseFile, VoucherType } from '../utils/tauriApi';

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
      selectedVoucherTypes: [] as Array<number | string>, // 多选凭证类型
      selectedFiles: {} as Record<string, string[]>, // 存储按凭证类型分类的文件
      uploadedFiles: [] as ExpenseFile[], // 存储已上传的文件路径
      voucherTypes: [] as VoucherType[], // 从后端加载
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
    groupedUploadedFiles() {
      return this.uploadedFiles.reduce((groups: Record<string, ExpenseFile[]>, file: ExpenseFile) => {
        const key = file.voucher_type_name || '未分类凭证';
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(file);
        return groups;
      }, {});
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
          if (newVal.files && Array.isArray(newVal.files)) {
            this.uploadedFiles = newVal.files;
            this.selectedVoucherTypes = Array.from(
              new Set(
                newVal.files
                  .map((file: ExpenseFile) => file.voucher_type_id)
                  .filter((id: number | undefined): id is number => typeof id === 'number')
              )
            );
          } else {
            this.uploadedFiles = [];
            this.selectedVoucherTypes = [];
          }

          if (this.selectedVoucherTypes.length === 0 && newVal.voucher_type_id) {
            this.selectedVoucherTypes = [newVal.voucher_type_id];
          }

          this.selectedFiles = {};
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
    async openFilePicker(voucherTypeId: number | string) {
      try {
        const selected = await open({
          multiple: true,
          filters: [{
            name: 'Documents',
            extensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png']
          }]
        });

        if (selected) {
          const files = Array.isArray(selected) ? selected : [selected];
          const voucherKey = String(voucherTypeId);

          if (!this.selectedFiles[voucherKey]) {
            this.selectedFiles[voucherKey] = [];
          }

          files.forEach(path => {
            if (typeof path !== 'string') {
              return;
            }

            const existingIndex = this.selectedFiles[voucherKey].findIndex((filePath: string) => filePath === path);
            if (existingIndex === -1) {
              this.selectedFiles[voucherKey].push(path);
            }
          });
        }
      } catch (err) {
        console.error('选择文件失败:', err);
      }
    },
    getVoucherTypeName(voucherTypeId: number | string) {
      const voucherType = this.voucherTypes.find((vt: VoucherType) => vt.id == Number(voucherTypeId));
      return voucherType ? voucherType.name : '未知类型';
    },
    removeFile(voucherTypeId: number | string, index: number) {
      const voucherKey = String(voucherTypeId);
      this.selectedFiles[voucherKey].splice(index, 1);
      // 如果该类型下没有文件了，删除该类型键
      if (this.selectedFiles[voucherKey].length === 0) {
        delete this.selectedFiles[voucherKey];
      }
    },
    async checkDuplicateExpense() {
      // 检查是否为重复费用
      if (!this.expenseData.amount || !this.expenseData.date || !this.expenseData.sub_category_id) {
        return '';
      }

      try {
        // TODO: 实现实际的重复检查 API 调用
        // const params = new URLSearchParams({
        //   project_id: String(this.projectId),
        //   amount: String(this.expenseData.amount),
        //   date: String(this.expenseData.date),
        //   sub_category_id: String(this.expenseData.sub_category_id)
        // });
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
      const expenseDto: ExpenseDTO = {
        project_id: this.projectId,
        amount: Number(this.expenseData.amount),
        main_category_id: parseInt(this.selectedMainCategory),
        sub_category_id: parseInt(this.expenseData.sub_category_id),
        description: this.expenseData.description,
        date: this.expenseData.date,
        voucher_type_ids: this.selectedVoucherTypes.map((id: number | string) => parseInt(String(id), 10))
      };

      try {
        let result: { id?: number } | null = null;
        if (this.expenseData.id) {
          result = await expenseApi.updateExpense(this.expenseData.id, expenseDto);
        } else {
          result = await expenseApi.createExpense(expenseDto);
        }

        // 上传文件逻辑
        if (result && result.id) {
          const expenseId = result.id;

          for (const voucherTypeId in this.selectedFiles) {
            for (const filePath of this.selectedFiles[voucherTypeId]) {
              const dateStr = this.expenseData.date.replace(/-/g, '');
              const desc = this.expenseData.description ? `-${this.expenseData.description}` : '';

              const subCatObj = this.subCategories.find((c: { id?: number; name: string }) => c.id === parseInt(this.expenseData.sub_category_id as string));
              const subCatName = subCatObj ? `-${subCatObj.name}` : '';

              const ext = filePath.split('.').pop() || '';
              const newFileName = `${dateStr}-${expenseId}${desc}${subCatName}.${ext}`;

              try {
                await expenseApi.uploadExpenseFile(expenseId, filePath, newFileName, Number(voucherTypeId));
              } catch (e) {
                console.error(`上传文件 ${filePath} 失败:`, e);
              }
            }
          }

          this.uploadedFiles = await expenseApi.getExpenseFiles(expenseId);
          this.selectedFiles = {};
        }

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
