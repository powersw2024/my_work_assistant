<template>
  <div class="mb-8">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800 mb-1">项目管理</h2>
        <p class="text-sm text-gray-500">管理您的项目、日志和费用</p>
      </div>
      <div class="flex justify-end space-x-3">
        <button @click="$emit('open-settings')" class="btn btn-secondary flex items-center justify-center px-5 py-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          系统配置
        </button>
        <button @click="$emit('new-project')" class="btn btn-primary flex items-center justify-center px-5 py-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          新建项目
        </button>
      </div>
    </div>

    <!-- 项目卡片列表 -->
    <div v-if="projects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="project in projects" 
        :key="project.id"
        class="card p-6 shadow-card cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg bg-gradient-to-br from-white to-gray-50 flex flex-col justify-between min-h-[260px]"
        @dblclick="goToProjectDetail(project.id)"
        @click="selectProject(project.id)"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center mb-3">
              <h3 class="text-lg font-bold text-gray-800 truncate">{{ project.name }}</h3>
              <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-3">
                项目
              </span>
            </div>
            <div class="space-y-2.5">
              <div class="flex items-center text-sm text-gray-600">
                <span class="mr-2">📅</span>
                <span class="w-24 text-gray-500">开始时间:</span>
                <span>{{ formatDate(project.start_date) }}</span>
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <span class="mr-2">⏰</span>
                <span class="w-24 text-gray-500">结束时间:</span>
                <span class="text-gray-400">{{ project.end_date ? formatDate(project.end_date) : '-' }}</span>
              </div>
            </div>
          </div>
          <div class="flex space-x-1.5">
            <button 
              @click.stop="editProject(project.id)"
              class="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
              title="编辑项目"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button 
              @click.stop="deleteProject(project.id)"
              class="text-red-600 hover:text-red-800 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
              title="删除项目"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- 项目统计摘要 -->
        <div class="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-500">
          <div class="flex space-x-3">
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>日志: {{ getProjectLogCount(project.id) }}</span>
            </div>
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>费用: {{ getProjectExpenseCount(project.id) }}</span>
            </div>
          </div>
          <div class="text-right">
            <span :class="projectStatusClass(project.id)">状态: {{ projectStatus(project.id) }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div v-else class="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
      <div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <span class="text-4xl">📋</span>
      </div>
      <h3 class="mt-4 text-lg font-medium text-gray-900">暂无项目</h3>
      <p class="mt-1 text-gray-500">还没有创建任何项目</p>
      <div class="mt-6">
        <button 
          @click="$emit('new-project')" 
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <span class="mr-2">➕</span>
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
      return status === '进行中' ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium';
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