<template>
  <div class="app-shell">
    <div class="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section class="hero-panel overflow-hidden">
        <div class="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div class="max-w-3xl space-y-4">
            <span class="eyebrow">Project Workspace</span>
            <div class="space-y-3">
              <h1 class="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">macOS 风格项目工作台</h1>
              <p class="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                统一管理项目台账、日志记录与报销数据，界面遵循 macOS 桌面应用的层次、留白与交互节奏。
              </p>
            </div>
          </div>

          <div class="flex flex-wrap gap-3">
            <button @click="showSettingsModal = true" class="btn btn-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              系统设置
            </button>
            <button @click="openCreateProjectModal" class="btn btn-primary">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 5v14m7-7H5" />
              </svg>
              新建项目
            </button>
          </div>
        </div>

        <div class="relative z-10 mt-8 grid gap-4 sm:grid-cols-3">
          <article class="stat-card">
            <p class="stat-label">项目总数</p>
            <p class="stat-value">{{ statistics.totalProjects }}</p>
            <p class="stat-meta">当前数据库中的全部项目</p>
          </article>
          <article class="stat-card">
            <p class="stat-label">进行中</p>
            <p class="stat-value text-primary-800">{{ statistics.activeProjects }}</p>
            <p class="stat-meta">可继续记录日志和费用</p>
          </article>
          <article class="stat-card">
            <p class="stat-label">已结束</p>
            <p class="stat-value text-amber-700">{{ statistics.completedProjects }}</p>
            <p class="stat-meta">保留归档信息与导出能力</p>
          </article>
        </div>
      </section>

      <section v-if="error" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {{ error }}
      </section>

      <section v-if="loading" class="glass-panel flex min-h-[320px] items-center justify-center">
        <div class="flex flex-col items-center gap-4 text-slate-500">
          <div class="h-10 w-10 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600"></div>
          <span class="text-sm font-medium">正在加载项目数据...</span>
        </div>
      </section>

      <ProjectSelector v-else :projects="projects" :selectedProjectId="0" @project-changed="selectProject"
        @new-project="openCreateProjectModal" @open-settings="showSettingsModal = true" @edit-project="editProjectById"
        @delete-project="deleteProject" @select-project="goToProjectDetail" />

      <NewProjectModal v-if="showNewProjectModal" :initialData="editingProject" :isEditing="!!editingProject"
        :existing-projects="projects" @close="closeProjectModal" @create="createProject" @update="updateProject" />

      <SettingsModal v-if="showSettingsModal" @close="showSettingsModal = false" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { RouteLocationRaw } from 'vue-router';
import { projectApi } from '../utils/tauriApi';
import type { Project, ProjectDTO } from '../utils/tauriApi';
import NewProjectModal from './NewProjectModal.vue';
import ProjectSelector from './ProjectSelector.vue';
import SettingsModal from './SettingsModal.vue';

interface Statistics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
}

export default defineComponent({
  name: 'MainContent',
  components: {
    NewProjectModal,
    ProjectSelector,
    SettingsModal
  },
  data() {
    return {
      projects: [] as Project[],
      currentProject: null as Project | null,
      showNewProjectModal: false,
      showSettingsModal: false,
      editingProject: null as Project | null,
      loading: true,
      error: null as string | null,
      statistics: {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0
      } as Statistics
    };
  },
  async mounted() {
    await this.loadProjects();
    await this.loadStatistics();
    this.loading = false;
  },
  methods: {
    async loadProjects() {
      try {
        this.projects = await projectApi.getProjects();
        console.log('加载的项目:', this.projects); // 调试信息
      } catch (error: any) {
        console.error('加载项目时出错:', error);
        this.error = `加载项目时出错: ${error.message}`;
        this.projects = []; // 确保 projects 是一个数组
      }
    },
    async loadStatistics() {
      try {
        const projects = await projectApi.getProjects();
        console.log('统计项目数:', projects.length); // 调试信息
        this.statistics.totalProjects = projects.length;
        this.statistics.activeProjects = projects.filter(p => p.status === '进行中').length;
        this.statistics.completedProjects = projects.filter(p => p.status === '已结束').length;
      } catch (error) {
        console.error('加载统计数据时出错:', error);
      }
    },
    async selectProject(projectId: number) {
      const route: RouteLocationRaw = { path: `/project/${projectId}` };
      this.$router.push(route);
    },
    async goToProjectDetail(projectId: number) {
      const route: RouteLocationRaw = { path: `/project/${projectId}` };
      this.$router.push(route);
    },
    async createProject(projectData: ProjectDTO) {
      try {
        const createdProject = await projectApi.createProject(projectData);
        this.closeProjectModal();
        await this.loadProjects();
        await this.loadStatistics();
        if (createdProject.id) {
          this.$router.push({ path: `/project/${createdProject.id}` });
        }
      } catch (error: any) {
        console.error('创建项目时出错:', error);
        alert(`创建失败: ${error.message}`);
      }
    },
    async updateProject(projectData: Project) {
      try {
        if (!projectData.id) return;

        const dto: ProjectDTO = {
          name: projectData.name,
          description: projectData.description,
          start_date: projectData.start_date || '',
          end_date: projectData.end_date || null,
          status: projectData.status
        };

        await projectApi.updateProject(projectData.id, dto);
        this.closeProjectModal();
        await this.loadProjects();
        await this.loadStatistics();
      } catch (error: any) {
        console.error('更新项目时出错:', error);
        alert(`更新失败: ${error.message}`);
      }
    },
    editProjectById(id: number) {
      // 根据ID获取项目信息并打开编辑模态框
      const project = this.projects.find((p: Project) => p.id === id);
      if (project) {
        this.editingProject = { ...project };
        this.showNewProjectModal = true;
      }
    },
    openCreateProjectModal() {
      this.editingProject = null;
      this.showNewProjectModal = true;
    },
    closeProjectModal() {
      this.showNewProjectModal = false;
      this.editingProject = null;
    },
    async deleteProject(id: number) {
      if (confirm('确定要删除这个项目吗？')) {
        try {
          await projectApi.deleteProject(id);
          await this.loadProjects();
          await this.loadStatistics();
        } catch (error: any) {
          console.error('删除项目时出错:', error);
          alert(`删除失败: ${error.message}`);
        }
      }
    },
    formatDate(dateString?: string): string {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    }
  }
});
</script>
