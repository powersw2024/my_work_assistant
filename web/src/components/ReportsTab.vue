<template>
  <div class="p-4">
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
