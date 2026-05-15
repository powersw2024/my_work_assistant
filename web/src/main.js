import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import MainContent from './components/MainContent.vue';
import ProjectDetail from './components/ProjectDetail.vue';
import './style.css'; // 导入Tailwind CSS

// 定义路由
const routes = [
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
      projectId: parseInt(route.params.id) 
    })
  }
];

// 创建路由器实例
const router = createRouter({
  history: createWebHistory(),
  routes
});

// 创建Vue应用并使用路由器
createApp(App).use(router).mount('#app');