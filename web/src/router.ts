import { createRouter, createWebHashHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('./components/MainContent.vue')
  },
  {
    path: '/project/:id',
    name: 'ProjectDetail',
    component: () => import('./components/ProjectDetail.vue'),
    props: route => ({ 
      projectId: parseInt(route.params.id as string) 
    })
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
