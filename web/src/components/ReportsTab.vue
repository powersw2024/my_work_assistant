<template>
  <div class="p-2 md:p-4">
    <h2 class="text-xl font-extrabold text-gray-900 mb-6 flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 002-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      项目报表
    </h2>
    <ExpenseReport :expenses="expenses" :categories="categories" :project="project" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ExpenseReport from './ExpenseReport.vue';

export default defineComponent({
  name: 'ReportsTab',
  components: {
    ExpenseReport
  },
  props: {
    expenses: {
      type: Array,
      default: () => []
    },
    categories: {
      type: Object,
      default: () => ({ mainCategories: [], categoriesByParent: {} })
    },
    project: {
      type: Object,
      default: () => null
    }
  }
});
</script>
