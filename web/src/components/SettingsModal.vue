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

<script>
export default {
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
      settings: { ...this.initialSettings },
      newPerson: '',
      newMainCategory: '',
      newSubCategory: '',
      newVoucherType: '',
      selectedMainCategory: ''
    };
  },
  async mounted() {
    // 页面加载完成后获取设置数据
    await this.loadSettings();
  },
  methods: {
    async loadSettings() {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          this.settings = await response.json();
        } else {
          console.error('加载设置失败:', response.statusText);
        }
      } catch (error) {
        console.error('加载设置时出错:', error);
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
      try {
        const response = await fetch('/api/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.settings)
        });
        
        if (response.ok) {
          this.$emit('save-settings', { ...this.settings });
          // 成功保存后，刷新页面上的数据显示
          await this.loadSettings();
        } else {
          const error = await response.json();
          alert(`保存失败: ${error.error}`);
        }
      } catch (error) {
        console.error('保存设置时出错:', error);
        alert('保存设置时出错');
      }
    }
  }
};
</script>