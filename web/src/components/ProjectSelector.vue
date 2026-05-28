<template>
  <div class="glass-panel p-5 sm:p-6">
    <div class="mb-6 flex items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">项目总览</h2>
        <p class="mt-1 text-sm text-slate-500">支持双击进入项目详情，保留编辑、删除和台账查看能力。</p>
      </div>
    </div>

    <div v-if="projects.length > 0" class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      <article v-for="project in projects" :key="project.id"
        class="group relative overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-6 shadow-soft ring-1 ring-slate-950/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
        @dblclick="goToProjectDetail(project.id)" @click="selectProject(project.id)">
        <div class="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-primary-100/90 via-white/0 to-emerald-100/70">
        </div>
        <div class="relative z-10 flex h-full flex-col">
          <div class="mb-5 flex items-start justify-between gap-3">
            <div class="flex min-w-0 items-center gap-3">
              <div
                class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-lg font-semibold text-white shadow-sm">
                {{ project.name.charAt(0).toUpperCase() }}
              </div>
              <div class="min-w-0">
                <h3 class="truncate text-lg font-semibold text-slate-950" :title="project.name">{{ project.name }}</h3>
                <p class="mt-1 max-h-12 overflow-hidden text-sm leading-6 text-slate-500">
                  {{ project.description || '暂无项目描述，双击进入详情页查看日志、费用与导出数据。' }}
                </p>
              </div>
            </div>

            <div class="flex space-x-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <button @click.stop="editProject(project.id)"
                class="rounded-xl p-2 text-slate-400 transition-colors hover:bg-primary-50 hover:text-primary-600"
                title="编辑项目">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button @click.stop="deleteProject(project.id)"
                class="rounded-xl p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                title="删除项目">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <div class="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <div class="rounded-2xl border border-surface-200 bg-surface-50/90 p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">开始日期</p>
              <p class="mt-2 font-medium text-slate-900">{{ formatDate(project.start_date) }}</p>
            </div>
            <div class="rounded-2xl border border-surface-200 bg-surface-50/90 p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">结束日期</p>
              <p class="mt-2 font-medium text-slate-900">{{ project.end_date ? formatDate(project.end_date) : '-' }}</p>
            </div>
          </div>

          <div class="mt-5 flex items-center justify-between border-t border-surface-200/80 pt-4 text-sm">
            <span :class="projectStatusClass(project.id)" class="tag">
              {{ projectStatus(project.id) }}
            </span>
            <div class="flex items-center gap-4 text-slate-500">
              <span class="inline-flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {{ getProjectLogCount(project.id) }}
              </span>
              <span class="inline-flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ getProjectExpenseCount(project.id) }}
              </span>
            </div>
          </div>
        </div>
      </article>
    </div>

    <div v-else class="text-center py-20 bg-white/95 rounded-3xl border border-dashed border-surface-300 shadow-soft">
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
      this.$router.push(`/project/${projectId}`).catch((err: unknown) => {
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
      const project = this.projects.find((item: Project) => item.id === projectId);
      return project?.status || '进行中';
    },
    projectStatusClass(projectId: number | string): string {
      const status = this.projectStatus(projectId);
      if (status === '已结束') return 'tag-yellow';
      return 'tag-green';
    },
    getProjectLogCount(_projectId: number | string): number {
      // TODO: 从 API 获取实际的日志数量
      return 0;
    },
    getProjectExpenseCount(_projectId: number | string): number {
      // TODO: 从 API 获取实际的费用数量
      return 0;
    }
  }
})
</script>
