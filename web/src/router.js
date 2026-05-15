import { createRouter, createWebHistory } from 'vue-router';

const routes = [
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
      projectId: parseInt(route.params.id) 
    })
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;