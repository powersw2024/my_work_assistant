<template>
  <div id="app" class="flex flex-col h-screen bg-gray-50">
    <!-- HeaderComponent 已被移除 -->
    <router-view />
    <NewProjectModal 
      v-if="showNewProjectModal" 
      @close="showNewProjectModal = false" 
      @create="createProject" 
    />
    <LogEditModal 
      v-if="showLogModal" 
      :log-data="editingLog" 
      :selected-date="selectedDate" 
      @close="showLogModal = false" 
      @save="saveLog" 
    />
    <SettingsModal 
      v-if="showSettingsModal" 
      @close="showSettingsModal = false" 
      @save-settings="saveSettings"
    />
  </div>
</template>

<script>
// import HeaderComponent from './components/HeaderComponent.vue'; // 已被删除
import NewProjectModal from './components/NewProjectModal.vue';
import LogEditModal from './components/LogEditModal.vue';
import SettingsModal from './components/SettingsModal.vue';

export default {
  name: 'App',
  components: {
    // HeaderComponent, // 已被移除
    NewProjectModal,
    LogEditModal,
    SettingsModal
  },
  data() {
    return {
      showNewProjectModal: false,
      showLogModal: false,
      showSettingsModal: false,
      selectedDate: '',
      editingLog: {}
    }
  },
  computed: {
    // 这里可以放置一些通用计算属性
  },
  methods: {
    // 这里可以放置一些跨组件的方法
    createProject(projectData) {
      // 这里可以处理创建项目的逻辑
    },
    saveLog(logData) {
      // 这里可以处理保存日志的逻辑
    },
    saveSettings(settings) {
      // 将设置保存到localStorage
      localStorage.setItem('projectAppSettings', JSON.stringify(settings));
      
      alert('设置已保存');
      this.showSettingsModal = false;
    }
  }
}
</script>

<style>
#app {
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiasing;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>