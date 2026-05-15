<template>
  <div class="container mx-auto px-4 py-8">
    <!-- 显示调试信息 -->
    <div class="mb-4 p-4 bg-blue-50 text-blue-700 rounded">
      <p>项目数量: {{ projects.length }}</p>
      <p v-if="loading">正在加载项目...</p>
      <p v-else-if="error" class="text-red-500">错误: {{ error }}</p>
    </div>

    <!-- 使用ProjectSelector组件显示项目卡片 -->
    <ProjectSelector 
      :projects="projects" 
      :selectedProjectId="0"
      @project-changed="selectProject"
      @new-project="showNewProjectModal = true"
      @open-settings="showSettingsModal = true"
      @edit-project="editProjectById"
      @delete-project="deleteProject"
      @select-project="goToProjectDetail"
    ></ProjectSelector>

    <!-- 新建项目弹窗 -->
    <NewProjectModal 
      v-if="showNewProjectModal"
      :initialData="editingProject"
      :isEditing="!!editingProject"
      @close="showNewProjectModal = false"
      @create="createProject"
      @update="updateProject"
    />
    
    <!-- 系统设置弹窗 -->
    <div v-if="showSettingsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <SettingsModal @close="showSettingsModal = false" />
      </div>
    </div>
  </div>
</template>

<script>
import NewProjectModal from './NewProjectModal.vue';
import ProjectSelector from './ProjectSelector.vue'; // 导入ProjectSelector组件
import SettingsModal from './SettingsModal.vue'; // 导入SettingsModal组件

export default {
  name: 'MainContent',
  components: {
    NewProjectModal,
    ProjectSelector, // 注册ProjectSelector组件
    SettingsModal // 注册SettingsModal组件
  },
  data() {
    return {
      projects: [],
      currentProject: null,
      showNewProjectModal: false,
      showSettingsModal: false, // 控制设置模态框显示
      editingProject: null,
      loading: true,
      error: null,
      statistics: {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0
      }
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
        const response = await fetch('/api/projects');
        if (response.ok) {
          this.projects = await response.json();
          console.log('加载的项目:', this.projects); // 调试信息
        } else {
          console.error('加载项目失败:', response.statusText);
          this.error = `加载项目失败: ${response.statusText}`;
          this.projects = []; // 确保projects是一个数组
        }
      } catch (error) {
        console.error('加载项目时出错:', error);
        this.error = `加载项目时出错: ${error.message}`;
        this.projects = []; // 确保projects是一个数组
      }
    },
    async loadStatistics() {
      try {
        const response = await fetch('/api/projects');
        if (response.ok) {
          const projects = await response.json();
          console.log('统计项目数:', projects.length); // 调试信息
          this.statistics.totalProjects = projects.length;
          this.statistics.activeProjects = projects.filter(p => p.status === '进行中').length;
          this.statistics.completedProjects = projects.filter(p => p.status === '已结束').length;
        } else {
          console.error('加载统计数据失败:', response.statusText);
        }
      } catch (error) {
        console.error('加载统计数据时出错:', error);
      }
    },
    async selectProject(projectId) {
      // 检查路由器是否存在
      if (this.$router) {
        this.$router.push(`/project/${projectId}`);
      } else {
        console.error('Vue Router 未正确初始化');
      }
    },
    async goToProjectDetail(projectId) {
      // 检查路由器是否存在
      if (this.$router) {
        this.$router.push(`/project/${projectId}`);
      } else {
        console.error('Vue Router 未正确初始化');
      }
    },
    async createProject(projectData) {
      try {
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(projectData)
        });

        if (response.ok) {
          this.showNewProjectModal = false;
          this.editingProject = null;
          await this.loadProjects();
          await this.loadStatistics();
        } else {
          const error = await response.json();
          alert(`创建失败: ${error.error}`);
        }
      } catch (error) {
        console.error('创建项目时出错:', error);
        alert('创建项目时出错');
      }
    },
    async updateProject(projectData) {
      try {
        const response = await fetch(`/api/projects/${projectData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: projectData.name,
            description: projectData.description,
            start_date: projectData.start_date,
            end_date: projectData.end_date,
            status: projectData.status
          })
        });

        if (response.ok) {
          this.showNewProjectModal = false;
          this.editingProject = null;
          await this.loadProjects();
          await this.loadStatistics();
        } else {
          const error = await response.json();
          alert(`更新失败: ${error.error}`);
        }
      } catch (error) {
        console.error('更新项目时出错:', error);
        alert('更新项目时出错');
      }
    },
    editProjectById(id) {
      // 根据ID获取项目信息并打开编辑模态框
      const project = this.projects.find(p => p.id == id);
      if (project) {
        this.editingProject = { ...project };
        this.showNewProjectModal = true;
      }
    },
    async deleteProject(id) {
      if (confirm('确定要删除这个项目吗？')) {
        try {
          const response = await fetch(`/api/projects/${id}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            await this.loadProjects();
            await this.loadStatistics();
          } else {
            const error = await response.json();
            alert(`删除失败: ${error.error}`);
          }
        } catch (error) {
          console.error('删除项目时出错:', error);
          alert('删除项目时出错');
        }
      }
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    }
  }
};
</script>