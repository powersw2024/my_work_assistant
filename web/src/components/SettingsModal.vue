<template>
  <div
    class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-opacity duration-300 pointer-events-auto">
    <div
      class="bg-white rounded-2xl shadow-2xl w-full max-w-6xl mx-4 max-h-[90vh] flex flex-col transform transition-all duration-300 scale-100 opacity-100 relative z-[101]">
      <div class="px-6 py-5 border-b border-surface-200 flex justify-between items-center">
        <h2 class="text-2xl font-extrabold text-gray-900 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          系统设置
        </h2>
        <button @click="$emit('close')"
          class="text-gray-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition-colors relative z-10 pointer-events-auto">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div v-if="error" class="mx-6 mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        <div class="flex items-start justify-between gap-4">
          <span>{{ error }}</span>
          <button @click="loadSettings"
            class="shrink-0 rounded-lg bg-white px-3 py-1.5 text-rose-700 shadow-sm transition-colors hover:bg-rose-100">
            重试
          </button>
        </div>
      </div>

      <div v-if="loading" class="flex-1 flex items-center justify-center bg-surface-50/50 px-6 py-16 text-gray-500">
        正在加载系统配置...
      </div>

      <div v-else class="flex-1 overflow-y-auto custom-scrollbar bg-surface-50/50">
        <div class="p-6 space-y-8">
          <!-- 人员配置 -->
          <section class="bg-white rounded-2xl p-6 shadow-sm border border-surface-200">
            <div class="flex items-center mb-6 pb-4 border-b border-surface-100">
              <div class="bg-primary-50 p-2 rounded-xl mr-3 text-primary-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-gray-900">人员配置</h3>
            </div>

            <div class="flex flex-col sm:flex-row gap-3 mb-6">
              <input v-model="newPerson" type="text" placeholder="输入人员姓名" class="input-field flex-1"
                @keyup.enter="addPerson" />
              <button @click="addPerson" class="btn btn-primary whitespace-nowrap">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                添加人员
              </button>
            </div>

            <div class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th>人员姓名</th>
                    <th class="text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(person, index) in settings.personnel" :key="'person-' + index" class="group">
                    <td><span class="font-medium text-gray-900">{{ person }}</span></td>
                    <td class="text-right">
                      <button @click="removePerson(index)"
                        class="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="删除">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                  <tr v-if="settings.personnel.length === 0">
                    <td colspan="2" class="py-8 text-center text-gray-400 italic">暂无人员数据，请添加</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- 费用类别配置 -->
          <section class="bg-white rounded-2xl p-6 shadow-sm border border-surface-200">
            <div class="flex items-center mb-6 pb-4 border-b border-surface-100">
              <div class="bg-emerald-50 p-2 rounded-xl mr-3 text-emerald-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-gray-900">费用类别配置</h3>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <!-- 主类别 -->
              <div class="bg-surface-50/50 rounded-xl p-5 border border-surface-200">
                <h4 class="text-base font-bold text-gray-800 mb-4 flex items-center">
                  <span class="w-1.5 h-4 bg-emerald-500 rounded-full mr-2"></span>主类别
                </h4>
                <div class="flex flex-col sm:flex-row gap-3 mb-5">
                  <input v-model="newMainCategory" type="text" placeholder="输入主类别名称" class="input-field flex-1"
                    @keyup.enter="addMainCategory" />
                  <button @click="addMainCategory" class="btn btn-success whitespace-nowrap">
                    添加
                  </button>
                </div>

                <div class="table-container">
                  <table class="table">
                    <thead class="bg-surface-100/50">
                      <tr>
                        <th>主类别名称</th>
                        <th class="text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(category, index) in settings.expense_categories.mainCategories" :key="'main-' + index"
                        class="group">
                        <td><span class="tag-gray">{{ category }}</span></td>
                        <td class="text-right">
                          <button @click="removeMainCategory(index)"
                            class="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="删除">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                              stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                      <tr v-if="settings.expense_categories.mainCategories.length === 0">
                        <td colspan="2" class="py-6 text-center text-gray-400 italic text-sm">暂无主类别，请添加</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- 子类别 -->
              <div class="bg-surface-50/50 rounded-xl p-5 border border-surface-200">
                <h4 class="text-base font-bold text-gray-800 mb-4 flex items-center">
                  <span class="w-1.5 h-4 bg-emerald-400 rounded-full mr-2"></span>子类别
                </h4>
                <div class="mb-4">
                  <select v-model="selectedMainCategory" class="input-field">
                    <option value="" disabled>请选择所属主类别</option>
                    <option v-for="(category, index) in settings.expense_categories.mainCategories"
                      :key="'sel-main-' + index" :value="category">
                      {{ category }}
                    </option>
                  </select>
                </div>

                <div class="flex flex-col sm:flex-row gap-3 mb-5">
                  <input v-model="newSubCategory" type="text" placeholder="输入子类别名称" class="input-field flex-1"
                    :disabled="!selectedMainCategory" @keyup.enter="addSubCategory" />
                  <button @click="addSubCategory" :disabled="!selectedMainCategory"
                    class="btn btn-success whitespace-nowrap">
                    添加
                  </button>
                </div>

                <div v-if="selectedMainCategory" class="mt-4">
                  <h5 class="text-sm font-semibold text-gray-600 mb-3 px-1">{{ selectedMainCategory }} 的子类别列表</h5>
                  <div class="table-container">
                    <table class="table">
                      <tbody class="divide-y divide-surface-100">
                        <tr
                          v-for="(subcategory, index) in settings.expense_categories.categoriesByParent[selectedMainCategory] || []"
                          :key="'sub-' + index" class="group">
                          <td class="py-3 px-4"><span class="text-gray-700 font-medium text-sm">{{ subcategory }}</span>
                          </td>
                          <td class="py-3 px-4 text-right">
                            <button @click="removeSubCategory(selectedMainCategory, index)"
                              class="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              title="删除">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                        <tr
                          v-if="!(settings.expense_categories.categoriesByParent[selectedMainCategory] && settings.expense_categories.categoriesByParent[selectedMainCategory].length > 0)">
                          <td colspan="2" class="py-6 text-center text-gray-400 italic text-sm">该主类别下暂无子类别</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div v-else
                  class="mt-6 text-center p-6 border border-dashed border-surface-300 rounded-xl text-gray-400 text-sm">
                  请先在上方选择一个主类别
                </div>
              </div>
            </div>
          </section>

          <!-- 凭证类别配置 -->
          <section class="bg-white rounded-2xl p-6 shadow-sm border border-surface-200">
            <div class="flex items-center mb-6 pb-4 border-b border-surface-100">
              <div class="bg-indigo-50 p-2 rounded-xl mr-3 text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M7 7h.01M7 3h5c.512 0 1.024.167 1.414.414l2.586 2.586c.39.39.586.902.586 1.414V11h.01M10 14H7m4 3h3m0 0h.01M7 17h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-gray-900">凭证类别配置</h3>
            </div>

            <div class="flex flex-col sm:flex-row gap-3 mb-6">
              <input v-model="newVoucherType" type="text" placeholder="输入凭证类型名称" class="input-field flex-1"
                @keyup.enter="addVoucherType" />
              <button @click="addVoucherType"
                class="btn bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow">
                添加凭证类型
              </button>
            </div>

            <div class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th>凭证类型</th>
                    <th class="text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(type, index) in settings.voucher_types" :key="'voucher-' + index" class="group">
                    <td>
                      <span class="tag-blue">{{ type }}</span>
                    </td>
                    <td class="text-right">
                      <button @click="removeVoucherType(index)"
                        class="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="删除">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                  <tr v-if="settings.voucher_types.length === 0">
                    <td colspan="2" class="py-8 text-center text-gray-400 italic">暂无凭证类型数据，请添加</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      <div class="px-6 py-5 bg-white border-t border-surface-200 flex justify-end space-x-3 rounded-b-2xl">
        <button @click="$emit('close')" class="btn btn-secondary">
          取消
        </button>
        <button @click="saveSettings" class="btn btn-primary" :disabled="loading">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          {{ loading ? '保存中...' : '保存所有设置' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { personApi, expenseApi } from '../utils/tauriApi';

export default defineComponent({
  name: 'SettingsModal',
  props: {
    initialSettings: {
      type: Object,
      default: () => ({
        personnel: [],
        expense_categories: {
          mainCategories: [],
          categoriesByParent: {}
        },
        voucher_types: []
      })
    }
  },
  emits: ['close', 'save-settings'],
  data() {
    return {
      settings: {
        personnel: [] as string[],
        expense_categories: {
          mainCategories: [] as string[],
          categoriesByParent: {} as Record<string, string[]>
        },
        voucher_types: [] as string[]
      },
      newPerson: '',
      newMainCategory: '',
      newSubCategory: '',
      newVoucherType: '',
      selectedMainCategory: '',
      loading: false,
      error: null as string | null
    };
  },
  async mounted() {
    await this.loadSettings();
  },
  methods: {
    async loadSettings() {
      this.loading = true;
      this.error = null;
      try {
        // 加载人员列表
        const persons = await personApi.getPersons();
        this.settings.personnel = persons.map(p => p.name);

        // 加载费用类别
        const categories = await expenseApi.getCategories();
        const mainCategoriesMap = new Map<string, number>();
        const mainCategories: string[] = [];
        const categoriesByParent: Record<string, string[]> = {};

        categories.forEach(cat => {
          if (!cat.parent_id) {
            mainCategoriesMap.set(cat.name, cat.id);
            mainCategories.push(cat.name);
            categoriesByParent[cat.name] = [];
          }
        });

        categories.forEach(cat => {
          if (cat.parent_id) {
            const parent = categories.find(c => c.id === cat.parent_id);
            if (parent && categoriesByParent[parent.name]) {
              categoriesByParent[parent.name].push(cat.name);
            }
          }
        });

        this.settings.expense_categories.mainCategories = mainCategories;
        this.settings.expense_categories.categoriesByParent = categoriesByParent;

        // 加载凭证类型
        const voucherTypes = await expenseApi.getVoucherTypes();
        this.settings.voucher_types = voucherTypes.map(vt => vt.name);

      } catch (err: any) {
        console.error('加载设置失败:', err);
        this.error = '加载设置失败: ' + err.message;
      } finally {
        this.loading = false;
      }
    },
    addPerson() {
      if (this.newPerson.trim() && !this.settings.personnel.includes(this.newPerson.trim())) {
        this.settings.personnel.push(this.newPerson.trim());
        this.newPerson = '';
      } else if (this.settings.personnel.includes(this.newPerson.trim())) {
        alert('该人员已存在');
      }
    },
    removePerson(index: number) {
      this.settings.personnel.splice(index, 1);
    },
    addMainCategory() {
      if (this.newMainCategory.trim() &&
        !this.settings.expense_categories.mainCategories.includes(this.newMainCategory.trim())) {
        this.settings.expense_categories.mainCategories.push(this.newMainCategory.trim());
        this.settings.expense_categories.categoriesByParent[this.newMainCategory.trim()] = [];
        this.newMainCategory = '';
      } else if (this.settings.expense_categories.mainCategories.includes(this.newMainCategory.trim())) {
        alert('该主类别已存在');
      }
    },
    removeMainCategory(index: number) {
      const removedCategory = this.settings.expense_categories.mainCategories[index];
      this.settings.expense_categories.mainCategories.splice(index, 1);
      delete this.settings.expense_categories.categoriesByParent[removedCategory];
    },
    addSubCategory() {
      if (this.selectedMainCategory && this.newSubCategory.trim()) {
        const subcategories = this.settings.expense_categories.categoriesByParent[this.selectedMainCategory];
        if (!subcategories.includes(this.newSubCategory.trim())) {
          subcategories.push(this.newSubCategory.trim());
          this.newSubCategory = '';
        } else {
          alert('该子类别已存在');
        }
      }
    },
    removeSubCategory(mainCategory: string, index: number) {
      this.settings.expense_categories.categoriesByParent[mainCategory].splice(index, 1);
    },
    addVoucherType() {
      if (this.newVoucherType.trim() &&
        !this.settings.voucher_types.includes(this.newVoucherType.trim())) {
        this.settings.voucher_types.push(this.newVoucherType.trim());
        this.newVoucherType = '';
      } else if (this.settings.voucher_types.includes(this.newVoucherType.trim())) {
        alert('该凭证类型已存在');
      }
    },
    removeVoucherType(index: number) {
      this.settings.voucher_types.splice(index, 1);
    },
    async saveSettings() {
      this.loading = true;
      this.error = null;
      try {
        // 1. 保存人员列表 - 先删除所有再重新添加（简化方案）
        // TODO: 后续优化为增量更新

        // 获取当前数据库中的人员ID
        const currentPersons = await personApi.getPersons();
        const currentPersonMap = new Map<string, number>();
        currentPersons.forEach(p => {
          currentPersonMap.set(p.name, p.id);
        });

        // 删除不在新列表中的人员
        for (const person of currentPersons) {
          if (!this.settings.personnel.includes(person.name)) {
            await personApi.deletePerson(person.id);
          }
        }

        // 添加新人员或更新现有人员
        for (const personName of this.settings.personnel) {
          const existingId = currentPersonMap.get(personName);
          if (!existingId) {
            // 新增人员
            await personApi.createPerson({ name: personName });
          }
          // 如果存在且名称相同，则无需更新
        }

        // 2. 保存费用类别
        // 先获取现有的类别
        const currentCategories = await expenseApi.getCategories();
        const currentMainCategories = new Map<string, number>();
        const deletedCategoryIds: number[] = [];

        currentCategories.forEach(cat => {
          if (!cat.parent_id) {
            currentMainCategories.set(cat.name, cat.id);
          }
        });

        // 删除不再存在的主类别及其子类别
        for (const category of currentCategories) {
          const categoryName = category.name;
          const isMainCategory = !category.parent_id;

          if (isMainCategory) {
            if (!this.settings.expense_categories.mainCategories.includes(categoryName)) {
              // 主类别被删除，需要删除其所有子类别
              currentCategories.forEach(subCat => {
                if (subCat.parent_id === category.id) {
                  deletedCategoryIds.push(subCat.id);
                }
              });
              deletedCategoryIds.push(category.id);
            }
          } else {
            // 子类别
            const parent = currentCategories.find(c => c.id === category.parent_id);
            if (parent) {
              const parentName = parent.name;
              const mainCats = this.settings.expense_categories.categoriesByParent[parentName];
              if (!mainCats || !mainCats.includes(categoryName)) {
                deletedCategoryIds.push(category.id);
              }
            }
          }
        }

        // 执行删除
        for (const id of deletedCategoryIds) {
          await expenseApi.deleteCategory(id);
        }

        // 添加或更新主类别
        for (const mainCat of this.settings.expense_categories.mainCategories) {
          const existingId = currentMainCategories.get(mainCat);
          if (!existingId) {
            // 新增主类别
            await expenseApi.createCategory({
              name: mainCat,
              parent_id: null
            });
          }
        }

        // 添加或更新子类别
        for (const [parentName, subCategories] of Object.entries(this.settings.expense_categories.categoriesByParent as Record<string, string[]>)) {
          // 重新获取类别列表以获取最新的主类别ID
          const refreshedCategories = await expenseApi.getCategories();
          const freshMainCat = refreshedCategories.find(c => c.name === parentName && !c.parent_id);

          if (freshMainCat) {
            for (const subCat of subCategories) {
              const exists = refreshedCategories.some(c =>
                c.name === subCat && c.parent_id === freshMainCat.id
              );
              if (!exists) {
                await expenseApi.createCategory({
                  name: subCat,
                  parent_id: freshMainCat.id
                });
              }
            }
          }
        }

        // 3. 保存凭证类型
        const currentVoucherTypes = await expenseApi.getVoucherTypes();
        const currentVoucherTypeMap = new Map<string, number>();
        currentVoucherTypes.forEach(vt => {
          currentVoucherTypeMap.set(vt.name, vt.id);
        });

        // 删除不在新列表中的凭证类型
        for (const vt of currentVoucherTypes) {
          if (!this.settings.voucher_types.includes(vt.name)) {
            await expenseApi.deleteVoucherType(vt.id);
          }
        }

        // 添加新的凭证类型
        for (const vtName of this.settings.voucher_types) {
          const existingId = currentVoucherTypeMap.get(vtName);
          if (!existingId) {
            await expenseApi.createVoucherType({ name: vtName });
          }
        }

        // 保存成功，触发事件关闭弹窗
        this.$emit('save-settings', { ...this.settings });
        alert('设置保存成功！');
        this.$emit('close');

      } catch (error: any) {
        console.error('保存设置失败:', error);
        this.error = '保存设置失败: ' + error.message;
        alert('保存设置失败: ' + error.message);
      } finally {
        this.loading = false;
      }
    }
  }
});
</script>
