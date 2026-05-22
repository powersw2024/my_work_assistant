<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold text-gray-800">费用报销</h2>
      <button @click="showNewExpenseModal = true"
        class="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
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
