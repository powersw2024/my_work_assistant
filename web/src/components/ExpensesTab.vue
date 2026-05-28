<template>
  <div class="p-2 md:p-4">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-extrabold text-gray-900 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        费用报销
      </h2>
      <button @click="showNewExpenseModal = true" class="btn btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        添加费用
      </button>
    </div>

    <ExpenseList :expenses="expenses" :projectId="projectId" @edit-expense="editExpense"
      @delete-expense="handleDeleteExpense" />
      
    <!-- 新增/编辑费用模态框 -->
    <NewExpenseModal v-if="showNewExpenseModal" :projectId="projectId" :categories="categories" :initialData="editingExpense"
      @close="showNewExpenseModal = false" @save="handleSaveExpense" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { Expense } from '../utils/tauriApi';
import NewExpenseModal from './NewExpenseModal.vue';
import ExpenseList from './ExpenseList.vue';

export default defineComponent({
  name: 'ExpensesTab',
  components: {
    ExpenseList,
    NewExpenseModal
  },
  props: {
    projectId: {
      type: Number,
      required: true
    },
    expenses: {
      type: Array as () => Expense[],
      default: () => []
    },
    categories: {
      type: Object as () => { mainCategories: string[]; categoriesByParent: Record<string, string[]> },
      default: () => ({ mainCategories: [], categoriesByParent: {} })
    }
  },
  emits: ['save-expense', 'delete-expense', 'edit-expense'],
  data() {
    return {
      showNewExpenseModal: false,
      editingExpense: null
    };
  },
  methods: {
    editExpense(expense) {
      this.editingExpense = { ...expense };
      this.showNewExpenseModal = true;
    },

    handleSaveExpense(expenseData) {
      this.$emit('save-expense', expenseData);
    },

    handleDeleteExpense(id) {
      this.$emit('delete-expense', id);
    }
  }
})
</script>
