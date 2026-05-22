import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import App from './App.vue';
import MainContent from './components/MainContent.vue';
import ProjectDetail from './components/ProjectDetail.vue';
import './style.css'; // 导入 Tailwind CSS

// 定义路由
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: MainContent
  },
  {
    path: '/project/:id',
    name: 'ProjectDetail',
    component: ProjectDetail,
    props: route => ({ 
      projectId: parseInt(route.params.id as string) 
    })
  }
];

// 创建路由器实例
const router = createRouter({
  history: createWebHashHistory(),
  routes
});

// 创建 Vue 应用并使用路由器
createApp(App).use(router).mount('#app');
