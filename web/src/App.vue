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

<script lang="ts">
import { defineComponent } from 'vue';
import NewProjectModal from './components/NewProjectModal.vue';
import LogEditModal from './components/LogEditModal.vue';
import SettingsModal from './components/SettingsModal.vue';

interface Settings {
  [key: string]: any;
}

export default defineComponent({
  name: 'App',
  components: {
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
      editingLog: {} as Record<string, any>
    }
  },
  methods: {
    createProject(projectData: any) {
      // 这里可以处理创建项目的逻辑
      console.log('创建项目:', projectData);
    },
    saveLog(logData: any) {
      // 这里可以处理保存日志的逻辑
      console.log('保存日志:', logData);
    },
    saveSettings(settings: Settings) {
      // 将设置保存到 localStorage
      localStorage.setItem('projectAppSettings', JSON.stringify(settings));
      
      alert('设置已保存');
      this.showSettingsModal = false;
    }
  }
});
</script>

<style>
#app {
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiasing;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>