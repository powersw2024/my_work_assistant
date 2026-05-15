<template>
  <div class="p-4">
    <ExpenseReport :expenses="expenses" :categories="categories" :project="project" />
  </div>
</template>

<script>
import ExpenseReport from './ExpenseReport.vue';

export default {
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
};
</script>