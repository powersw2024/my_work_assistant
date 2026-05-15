<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="loading" class="flex justify-center items-center h-64">
      <p class="text-lg">加载中...</p>
    </div>

    <div v-else-if="!project" class="flex justify-center items-center h-64">
      <p class="text-lg text-red-500">项目不存在</p>
    </div>

    <div v-else class="flex flex-col">
      <div class="mb-6">
        <button @click="goBack" class="flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回项目列表
        </button>

        <!-- 分栏导航 -->
        <div class="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
          <div class="flex border-b border-gray-100">
            <button v-for="tab in tabs" :key="tab.name" @click="activeTab = tab.name" :class="[
              'flex-1 py-4 px-1 font-medium text-base transition-all duration-300 ease-in-out',
              activeTab === tab.name
                ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-500 pb-3'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 pb-3'
            ]">
              <div class="flex items-center justify-center">
                <span class="flex items-center">
                  <svg v-if="tab.name === 'logs'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <svg v-if="tab.name === 'expenses'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <svg v-if="tab.name === 'reports'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 002-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <svg v-if="tab.name === 'files'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <svg v-if="tab.name === 'export'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {{ tab.label }}
                </span>
              </div>
            </button>
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="bg-white rounded-lg shadow p-6">
          <!-- 日志标签页 -->
          <LogsTab 
            v-if="activeTab === 'logs'" 
            :projectId="projectId"
            :project="project"
            :logs="logs"
            :settings="settings"
            @save-log="handleSaveLog"
            @delete-log="handleDeleteLog"
            @edit-log="editLog"
          />

          <!-- 报销标签页 -->
          <ExpensesTab 
            v-if="activeTab === 'expenses'" 
            :projectId="projectId"
            :expenses="expenses"
            :categories="categories"
            @save-expense="handleSaveExpense"
            @delete-expense="handleDeleteExpense"
            @edit-expense="editExpense"
          />

          <!-- 报表标签页 -->
          <ReportsTab 
            v-if="activeTab === 'reports'" 
            :expenses="expenses"
            :categories="categories"
            :project="project"
          />

          <!-- 文件标签页 -->
          <FilesTab v-if="activeTab === 'files'" />

          <!-- 导出标签页 -->
          <ExportTab 
            v-if="activeTab === 'export'" 
            :projectId="projectId"
            @export-expenses="exportExpenses"
            @export-logs="exportLogs"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LogsTab from './LogsTab.vue';
import ExpensesTab from './ExpensesTab.vue';
import ReportsTab from './ReportsTab.vue';
import ExportTab from './ExportTab.vue';

export default {
  name: 'ProjectDetail',
  components: {
    LogsTab,
    ExpensesTab,
    ReportsTab,
    ExportTab
  },
  props: {
    projectId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      project: null,
      logs: [],
      expenses: [],
      loading: true,
      settings: {
        personnel: []
      },
      categories: {
        mainCategories: [],
        categoriesByParent: {}
      },
      activeTab: 'logs',
      tabs: [
        { name: 'logs', label: '日志' },
        { name: 'expenses', label: '报销' },
        { name: 'reports', label: '报表' },
        { name: 'export', label: '导出' }
      ]
    };
  },
  async mounted() {
    await this.loadCategories();
    await this.loadData();
  },
  methods: {
    // 加载类别数据
    async loadCategories() {
      try {
        const categoriesRes = await fetch('/api/categories');
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          this.categories = {
            mainCategories: categoriesData.mainCategories || [],
            categoriesByParent: categoriesData.categoriesByParent || {}
          };
        } else {
          console.error('加载类别失败:', categoriesRes.statusText);
          this.categories = { mainCategories: [], categoriesByParent: {} };
        }
      } catch (error) {
        console.error('加载类别时出错:', error);
        this.categories = { mainCategories: [], categoriesByParent: {} };
      }
    },

    async loadData() {
      this.loading = true;
      try {
        const [projectRes, logsRes, expensesRes, settingsRes] = await Promise.all([
          fetch(`/api/projects/${this.projectId}`),
          fetch(`/api/worklogs/project/${this.projectId}`),
          fetch(`/api/expenses/project/${this.projectId}`),
          fetch('/api/settings')
        ]);

        if (projectRes.ok) {
          this.project = await projectRes.json();
        } else {
          console.error('加载项目失败:', projectRes.statusText);
        }

        if (logsRes.ok) {
          this.logs = await logsRes.json();
        } else {
          console.error('加载日志失败:', logsRes.statusText);
        }

        if (expensesRes.ok) {
          this.expenses = await expensesRes.json();
        } else {
          console.error('加载费用失败:', expensesRes.statusText);
        }

        if (settingsRes.ok) {
          this.settings = await settingsRes.json();
        } else {
          console.error('加载系统设置失败:', settingsRes.statusText);
        }
      } catch (error) {
        console.error('加载数据时出错:', error);
      } finally {
        this.loading = false;
      }
    },

    goBack() {
      this.$router.push('/');
    },

    // 日志相关方法
    async handleSaveLog(logData) {
      try {
        let response;
        if (logData.id) {
          response = await fetch(`/api/worklogs/${logData.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logData)
          });
        } else {
          response = await fetch('/api/worklogs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logData)
          });
        }

        if (response.ok) {
          await this.loadData();
        } else {
          const error = await response.json();
          alert(`操作失败: ${error.error}`);
        }
      } catch (error) {
        console.error('保存日志时出错:', error);
        alert('保存日志时出错');
      }
    },
    
    async handleDeleteLog(id) {
      if (confirm('确定要删除这条日志吗？')) {
        try {
          const response = await fetch(`/api/worklogs/${id}`, { method: 'DELETE' });
          if (response.ok) {
            await this.loadData();
          } else {
            const error = await response.json();
            alert(`删除成功: ${error.error}`);
          }
        } catch (error) {
          console.error('删除日志时出错:', error);
          alert('删除日志时出错');
        }
      }
    },
    
    editLog(log) {
      // 这个方法现在由LogsTab组件内部处理
    },

    // 费用相关方法
    async handleSaveExpense(expenseData) {
      try {
        let response;
        if (expenseData.id) {
          response = await fetch(`/api/expenses/${expenseData.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expenseData)
          });
        } else {
          response = await fetch('/api/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expenseData)
          });
        }

        if (response.ok) {
          await this.loadData();
        } else {
          const error = await response.json();
          alert(`操作失败: ${error.error}`);
        }
      } catch (error) {
        console.error('保存费用时出错:', error);
        alert('保存费用时出错');
      }
    },
    
    async handleDeleteExpense(id) {
      if (confirm('确定要删除这笔费用吗？')) {
        try {
          const response = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
          if (response.ok) {
            await this.loadData();
          } else {
            const error = await response.json();
            alert(`删除成功: ${error.error}`);
          }
        } catch (error) {
          console.error('删除费用时出错:', error);
          alert('删除费用时出错');
        }
      }
    },
    
    editExpense(expense) {
      // 这个方法现在由ExpensesTab组件内部处理
    },

    // 文件相关方法
    // async renameFile(file) {
    //   const newName = prompt('请输入新的文件名:', file.original_name);
    //   if (newName && newName !== file.original_name) {
    //     try {
    //       const response = await fetch(`/api/files/${file.id}/rename`, {
    //         method: 'PATCH',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ newName })
    //       });

    //       if (response.ok) {
    //         await this.loadUploadedFiles();
    //         alert('文件重命名成功');
    //       } else {
    //         const error = await response.json();
    //         alert(`重命名失败: ${error.message || '未知错误'}`);
    //       }
    //     } catch (error) {
    //       console.error('重命名文件时出错:', error);
    //       alert(`重命名过程中出现错误: ${error.message}`);
    //     }
    //   }
    // },

    // async deleteFile(file) {
    //   if (!confirm(`确定要删除文件 "${file.original_name}" 吗？`)) {
    //     return;
    //   }

    //   try {
    //     const response = await fetch(`/api/files/${file.id}`, { method: 'DELETE' });
    //     if (response.ok) {
    //       await this.loadUploadedFiles();
    //       alert('文件删除成功');
    //     } else {
    //       const errorData = await response.json();
    //       alert(`删除失败: ${errorData.error}`);
    //     }
    //   } catch (error) {
    //     console.error('删除文件时发生错误:', error);
    //     alert('删除文件时发生错误');
    //   }
    // },

    // async loadUploadedFiles() {
    //   try {
    //     const response = await fetch(`/api/projects/${this.projectId}/files`);
    //     if (response.ok) {
    //       const result = await response.json();
    //       this.uploadedFiles = result.files || [];
    //     } else {
    //       console.error('加载文件列表失败:', response.status);
    //     }
    //   } catch (error) {
    //     console.error('加载文件列表时出错:', error);
    //   }
    // },

    // 导出相关方法
    async exportExpenses() {
      try {
        const downloadMessage = document.createElement('div');
        downloadMessage.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
        downloadMessage.textContent = '正在导出报销数据，请稍候...';
        document.body.appendChild(downloadMessage);

        const response = await fetch(`/api/expenses/export/${this.projectId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        document.body.removeChild(downloadMessage);

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Project_${this.projectId}_Expenses_with_Attachments.zip`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          alert(`报销数据导出成功！\n\n文件已保存到您的默认下载文件夹。\n文件名: Project_${this.projectId}_Expenses_with_Attachments.zip\n\n该ZIP文件包含：\n- 报销明细Excel表格\n- 所有关联的附件文件`);
        } else {
          let errorMessage = response.statusText || '未知错误';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            errorMessage = response.statusText || '服务器响应错误';
          }
          alert(`导出失败: ${errorMessage}`);
        }
      } catch (error) {
        console.error('导出报销数据时发生错误:', error);
        alert('导出报销数据时发生错误');
      }
    },
    
    async exportLogs() {
      try {
        const downloadMessage = document.createElement('div');
        downloadMessage.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
        downloadMessage.textContent = '正在导出日志数据，请稍候...';
        document.body.appendChild(downloadMessage);

        const response = await fetch(`/api/worklogs/export/${this.projectId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        document.body.removeChild(downloadMessage);

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Project_${this.projectId}_Logs.xlsx`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          alert(`日志数据导出成功！\n\n文件已保存到您的默认下载文件夹。\n文件名: Project_${this.projectId}_Logs.xlsx`);
        } else {
          let errorMessage = response.statusText || '未知错误';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            errorMessage = response.statusText || '服务器响应错误';
          }
          alert(`导出失败: ${errorMessage}`);
        }
      } catch (error) {
        console.error('导出日志数据时发生错误:', error);
        alert('导出日志数据时发生错误');
      }
    }
  },
  watch: {
    projectId: {
      handler() {
        this.loadData();
      },
      immediate: true
    },
    activeTab: {
      handler(newTab) {
      }
    }
  }
};
</script>

<style scoped>
/* 时间轴容器样式 */
.time-axis-container {
  position: relative;
  overflow: hidden;
}

.time-axis-line {
  position: absolute;
  left: 16px;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #e5e7eb;
  z-index: 1;
}

.time-axis-item {
  position: relative;
  padding-left: 32px;
}

.time-axis-dot {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #e5e7eb;
  z-index: 2;
  transition: all 0.2s ease-in-out;
}

.time-axis-dot.has-log {
  background-color: #3b82f6;
  transform: translateY(-50%) scale(1.2);
}
</style>