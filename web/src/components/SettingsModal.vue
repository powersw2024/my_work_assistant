<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl w-full max-w-6xl mx-4 max-h-[90vh] flex flex-col">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-2xl font-bold text-gray-800">系统设置</h2>
      </div>
      
      <div class="flex-1 overflow-y-auto">
        <div class="p-6 space-y-8">
          <!-- 人员配置 -->
          <section class="bg-gray-50 rounded-xl p-6 shadow-sm">
            <div class="flex items-center mb-6">
              <div class="bg-blue-100 p-2 rounded-lg mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-800">人员配置</h3>
            </div>
            
            <div class="flex flex-col sm:flex-row gap-4 mb-6">
              <input
                v-model="newPerson"
                type="text"
                placeholder="输入人员姓名"
                class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                @keyup.enter="addPerson"
              />
              <button
                @click="addPerson"
                class="px-5 py-3 text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                添加人员
              </button>
            </div>
            
            <div class="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-100">
                  <tr>
                    <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">人员姓名</th>
                    <th scope="col" class="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(person, index) in settings.personnel" :key="'person-'+index" class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">{{ person }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        @click="removePerson(index)"
                        class="text-red-600 hover:text-red-800 font-medium transition-colors px-3 py-1 rounded hover:bg-red-50 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        删除
                      </button>
                    </td>
                  </tr>
                  <tr v-if="settings.personnel.length === 0">
                    <td colspan="2" class="px-6 py-8 text-center text-gray-500 text-sm">
                      <p>暂无人员数据，请添加</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- 费用类别配置 -->
          <section class="bg-gray-50 rounded-xl p-6 shadow-sm">
            <div class="flex items-center mb-6">
              <div class="bg-green-100 p-2 rounded-lg mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-800">费用类别配置</h3>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <!-- 主类别 -->
              <div class="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                <h4 class="text-lg font-medium text-gray-700 mb-4">主类别</h4>
                <div class="flex flex-col sm:flex-row gap-3 mb-5">
                  <input
                    v-model="newMainCategory"
                    type="text"
                    placeholder="输入主类别名称"
                    class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    @keyup.enter="addMainCategory"
                  />
                  <button
                    @click="addMainCategory"
                    class="px-4 py-3 text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
                  >
                    添加主类别
                  </button>
                </div>
                
                <div class="overflow-hidden rounded-lg border border-gray-200">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">主类别</th>
                        <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">操作</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                      <tr v-for="(category, index) in settings.expense_categories.mainCategories" :key="'main-'+index" class="hover:bg-gray-50 transition-colors">
                        <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{{ category }}</td>
                        <td class="px-4 py-3 whitespace-nowrap text-right text-sm">
                          <button
                            @click="removeMainCategory(index)"
                            class="text-red-600 hover:text-red-800 font-medium transition-colors px-2 py-1 rounded hover:bg-red-50"
                          >
                            删除
                          </button>
                        </td>
                      </tr>
                      <tr v-if="settings.expense_categories.mainCategories.length === 0">
                        <td colspan="2" class="px-4 py-6 text-center text-gray-500 text-sm">
                          <p>暂无主类别数据，请添加</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- 子类别 -->
              <div class="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                <h4 class="text-lg font-medium text-gray-700 mb-4">子类别</h4>
                <div class="mb-5">
                  <label class="block text-sm font-medium text-gray-700 mb-2">选择主类别</label>
                  <select
                    v-model="selectedMainCategory"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="" disabled>请选择主类别</option>
                    <option v-for="(category, index) in settings.expense_categories.mainCategories" :key="'sel-main-'+index" :value="category">
                      {{ category }}
                    </option>
                  </select>
                </div>
                
                <div class="flex flex-col sm:flex-row gap-3 mb-5">
                  <input
                    v-model="newSubCategory"
                    type="text"
                    placeholder="输入子类别名称"
                    class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    :disabled="!selectedMainCategory"
                    @keyup.enter="addSubCategory"
                  />
                  <button
                    @click="addSubCategory"
                    :disabled="!selectedMainCategory"
                    class="px-4 py-3 text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50"
                  >
                    添加子类别
                  </button>
                </div>
                
                <div v-if="selectedMainCategory" class="mt-4">
                  <h5 class="font-medium text-gray-700 mb-3">{{ selectedMainCategory }} 的子类别</h5>
                  <div class="overflow-hidden rounded-lg border border-gray-200">
                    <table class="min-w-full divide-y divide-gray-200">
                      <tbody class="divide-y divide-gray-200">
                        <tr v-for="(subcategory, index) in settings.expense_categories.categoriesByParent[selectedMainCategory] || []" :key="'sub-'+index" class="hover:bg-gray-50 transition-colors">
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{{ subcategory }}</td>
                          <td class="px-4 py-3 whitespace-nowrap text-right text-sm">
                            <button
                              @click="removeSubCategory(selectedMainCategory, index)"
                              class="text-red-600 hover:text-red-800 font-medium transition-colors px-2 py-1 rounded hover:bg-red-50"
                            >
                              删除
                            </button>
                          </td>
                        </tr>
                        <tr v-if="!(settings.expense_categories.categoriesByParent[selectedMainCategory] && 
                                 settings.expense_categories.categoriesByParent[selectedMainCategory].length > 0)">
                          <td colspan="2" class="px-4 py-6 text-center text-gray-500 text-sm">
                            <p>此主类别下暂无子类别</p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div v-if="settings.expense_categories.mainCategories.length === 0" class="mt-4 text-center py-4 text-gray-500">
                  <p>请先添加主类别</p>
                </div>
              </div>
            </div>
          </section>

          <!-- 凭证类别配置 -->
          <section class="bg-gray-50 rounded-xl p-6 shadow-sm">
            <div class="flex items-center mb-6">
              <div class="bg-purple-100 p-2 rounded-lg mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.167 1.414.414l2.586 2.586c.39.39.586.902.586 1.414V11h.01M10 14H7m4 3h3m0 0h.01M7 17h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-800">凭证类别配置</h3>
            </div>
            
            <div class="flex flex-col sm:flex-row gap-4 mb-6">
              <input
                v-model="newVoucherType"
                type="text"
                placeholder="输入凭证类型名称"
                class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                @keyup.enter="addVoucherType"
              />
              <button
                @click="addVoucherType"
                class="px-5 py-3 text-white bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                添加凭证类型
              </button>
            </div>
            
            <div class="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-100">
                  <tr>
                    <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">凭证类型</th>
                    <th scope="col" class="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(type, index) in settings.voucher_types" :key="'voucher-'+index" class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">{{ type }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        @click="removeVoucherType(index)"
                        class="text-red-600 hover:text-red-800 font-medium transition-colors px-3 py-1 rounded hover:bg-red-50"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                  <tr v-if="settings.voucher_types.length === 0">
                    <td colspan="2" class="px-6 py-8 text-center text-gray-500 text-sm">
                      <p>暂无凭证类型数据，请添加</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
        <button
          type="button"
          @click="$emit('close')"
          class="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          取消
        </button>
        <button
          type="button"
          @click="saveSettings"
          class="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          保存设置
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { personApi, expenseApi, settingsApi } from '../utils/tauriApi';

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
    removePerson(index) {
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
    removeMainCategory(index) {
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
    removeSubCategory(mainCategory, index) {
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
    removeVoucherType(index) {
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
          const parentId = currentMainCategories.get(parentName);
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