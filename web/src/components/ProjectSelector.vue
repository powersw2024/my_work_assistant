<template>
  <div class="mb-8">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
      <div>
        <h2 class="text-3xl font-extrabold text-gray-900 mb-2">项目管理</h2>
        <p class="text-base text-gray-500">管理您的项目、日志和费用</p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <button @click="$emit('open-settings')" class="btn btn-secondary flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          系统配置
        </button>
        <button @click="$emit('new-project')" class="btn btn-primary flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          新建项目
        </button>
      </div>
    </div>

    <!-- 项目卡片列表 -->
    <div v-if="projects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="project in projects" :key="project.id"
        class="card group cursor-pointer overflow-hidden bg-white hover:bg-surface-50"
        @dblclick="goToProjectDetail(project.id)" @click="selectProject(project.id)">
        <div class="p-6 flex-1 flex flex-col">
          <div class="flex justify-between items-start mb-4">
            <div class="flex items-center space-x-3 overflow-hidden">
              <div
                class="flex-shrink-0 w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg">
                {{ project.name.charAt(0).toUpperCase() }}
              </div>
              <h3 class="text-lg font-bold text-gray-900 truncate" :title="project.name">{{ project.name }}</h3>
            </div>

            <div class="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button @click.stop="editProject(project.id)"
                class="text-gray-400 hover:text-primary-600 p-1.5 rounded-lg hover:bg-primary-50 transition-colors"
                title="编辑项目">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button @click.stop="deleteProject(project.id)"
                class="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                title="删除项目">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <div class="space-y-3 mt-auto">
            <div class="flex items-center text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="text-gray-500 w-16">开始:</span>
              <span class="text-gray-900 font-medium">{{ formatDate(project.start_date) }}</span>
            </div>
            <div class="flex items-center text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-gray-500 w-16">结束:</span>
              <span class="text-gray-900 font-medium">{{ project.end_date ? formatDate(project.end_date) : '-' }}</span>
            </div>
          </div>
        </div>

        <!-- 项目统计摘要 -->
        <div class="px-6 py-4 bg-surface-50 border-t border-surface-200 flex justify-between items-center text-sm">
          <span :class="projectStatusClass(project.id)" class="tag">
            {{ projectStatus(project.id) }}
          </span>
          <div class="flex space-x-4 text-gray-500">
            <div class="flex items-center" title="日志数量">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5 text-gray-400" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span class="font-medium">{{ getProjectLogCount(project.id) }}</span>
            </div>
            <div class="flex items-center" title="费用数量">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5 text-gray-400" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="font-medium">{{ getProjectExpenseCount(project.id) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="text-center py-20 bg-white rounded-3xl border border-dashed border-surface-300">
      <div class="mx-auto w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-6 text-primary-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h3 class="mt-4 text-xl font-bold text-gray-900">暂无项目</h3>
      <p class="mt-2 text-base text-gray-500 max-w-sm mx-auto">点击下方按钮创建您的第一个项目，开始管理工作日志和费用报销。</p>
      <div class="mt-8">
        <button @click="$emit('new-project')" class="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          创建第一个项目
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
// 假设 Project 类型定义在此路径，如果不存在请根据实际项目结构调整或直接在下方定义 interface
import type { Project } from '../utils/tauriApi';

// 如果上述导入失败，可以使用本地定义：
// interface Project {
//   id: number | string;
//   name: string;
//   start_date?: string;
//   end_date?: string;
//   [key: string]: any;
// }

export default defineComponent({
  name: 'ProjectSelector',
  props: {
    projects: {
      type: Array as () => Project[],
      required: true
    },
    selectedProjectId: {
      type: [String, Number] as unknown as () => string | number,
      required: true
    }
  },
  emits: ['project-changed', 'new-project', 'edit-project', 'delete-project', 'select-project', 'open-settings'],
  methods: {
    formatDate(dateString?: string): string {
      if (!dateString) return '-';
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      } catch (error) {
        console.error('日期格式化失败:', error);
        return '-';
      }
    },
    goToProjectDetail(projectId: number) {
      // 双击时跳转到项目详情页
      console.log('Navigating to project:', projectId);
      this.$router.push(`/project/${projectId}`).catch(err => {
        console.error('Navigation error:', err);
      });
    },
    selectProject(projectId: number) {
      // 单击时选择项目
      this.$emit('project-changed', projectId);
    },
    editProject(projectId: number) {
      this.$emit('edit-project', projectId);
    },
    deleteProject(projectId: number) {
      if (confirm('确定要删除这个项目吗？此操作不可恢复。')) {
        this.$emit('delete-project', projectId);
      }
    },
    projectStatus(projectId: number | string): string {
      // 由于无法获取日志数据，暂时基于项目是否存在判断状态
      // 这里可以接入实际的逻辑来判断状态
      return '未开始';
    },
    projectStatusClass(projectId: number | string): string {
      const status = this.projectStatus(projectId);
      return status === '进行中' ? 'tag-green' : 'tag-yellow';
    },
    getProjectLogCount(projectId: number | string): number {
      // TODO: 从 API 获取实际的日志数量
      return 0;
    },
    getProjectExpenseCount(projectId: number | string): number {
      // TODO: 从 API 获取实际的费用数量
      return 0;
    }
  }
})
</script>