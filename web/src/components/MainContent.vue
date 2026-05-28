<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
    <!-- 使用ProjectSelector组件显示项目卡片 -->
    <ProjectSelector :projects="projects" :selectedProjectId="0" @project-changed="selectProject"
      @new-project="showNewProjectModal = true" @open-settings="showSettingsModal = true"
      @edit-project="editProjectById" @delete-project="deleteProject" @select-project="goToProjectDetail">
    </ProjectSelector>

    <!-- 新建项目弹窗 -->
    <NewProjectModal v-if="showNewProjectModal" :initialData="editingProject" :isEditing="!!editingProject"
      @close="showNewProjectModal = false" @create="createProject" @update="updateProject" />

    <!-- 系统设置弹窗 -->
    <div v-if="showSettingsModal"
      class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div
        class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col transform transition-all duration-300 scale-100 opacity-100">
        <SettingsModal @close="showSettingsModal = false" class="flex-1 overflow-y-auto" />
      </div>
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
        await projectApi.createProject(projectData);
        this.showNewProjectModal = false;
        this.editingProject = null;
        await this.loadProjects();
        await this.loadStatistics();
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
          status: projectData.status
        };

        await projectApi.updateProject(projectData.id, dto);
        this.showNewProjectModal = false;
        this.editingProject = null;
        await this.loadProjects();
        await this.loadStatistics();
      } catch (error: any) {
        console.error('更新项目时出错:', error);
        alert(`更新失败: ${error.message}`);
      }
    },
    editProjectById(id: number) {
      // 根据ID获取项目信息并打开编辑模态框
      const project = this.projects.find(p => p.id === id);
      if (project) {
        this.editingProject = { ...project };
        this.showNewProjectModal = true;
      }
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
