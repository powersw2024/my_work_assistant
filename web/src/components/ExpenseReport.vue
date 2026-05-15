<template>
  <div class="p-4">
    <h2 class="text-xl font-bold text-gray-800 mb-6">费用报表</h2>
    
    <!-- 总体费用统计 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white p-6 rounded-xl shadow border-l-4 border-blue-500">
        <h3 class="text-lg font-semibold text-gray-700 mb-2">总费用</h3>
        <p class="text-2xl font-bold text-gray-900">¥{{ totalExpenses | currency }}</p>
      </div>
      <div class="bg-white p-6 rounded-xl shadow border-l-4 border-green-500">
        <h3 class="text-lg font-semibold text-gray-700 mb-2">有发票金额</h3>
        <p class="text-2xl font-bold text-gray-900">¥{{ totalWithInvoice | currency }}</p>
      </div>
      <div class="bg-white p-6 rounded-xl shadow border-l-4 border-yellow-500">
        <h3 class="text-lg font-semibold text-gray-700 mb-2">零星材料费</h3>
        <p class="text-2xl font-bold text-gray-900">¥{{ miscellaneousTotal | currency }}</p>
      </div>
    </div>

    <!-- 费用大类统计图表和有发票费用大类统计图表并排显示 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- 费用大类统计图表 -->
      <div class="bg-white p-6 rounded-xl shadow">
        <h3 class="text-lg font-semibold text-gray-800 mb-6">各费用大类金额统计</h3>
        <div class="chart-container" style="height: 400px;">
          <canvas ref="categoryChartCanvas" width="400" height="400"></canvas>
        </div>
      </div>

      <!-- 有发票费用大类统计图表 -->
      <div class="bg-white p-6 rounded-xl shadow">
        <h3 class="text-lg font-semibold text-gray-800 mb-6">各费用大类有发票金额统计</h3>
        <div class="chart-container" style="height: 400px;">
          <canvas ref="invoiceChartCanvas" width="400" height="400"></canvas>
        </div>
      </div>
    </div>

    <!-- 自动添加伙食补贴说明 -->
    <div class="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h4 class="font-medium text-blue-800 mb-2">自动计算说明</h4>
      <p class="text-blue-700 text-sm">根据项目开始日至今日，系统自动计算了伙食补贴（每日90元），该费用不计入费用报销表格中。</p>
    </div>
  </div>
</template>

<script>
// 仅在需要时动态导入 Chart.js
let Chart = null;

export default {
  name: 'ExpenseReport',
  props: {
    expenses: {
      type: Array,
      default: () => []
    },
    categories: {
      type: Object,
      default: () => ({})
    },
    project: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      categoryChart: null,
      invoiceChart: null
    };
  },
  computed: {
    // 计算项目天数
    projectDays() {
      if (!this.project || !this.project.start_date) return 0;
      
      const startDate = new Date(this.project.start_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let endDate = today;
      if (this.project.end_date) {
        const projectEnd = new Date(this.project.end_date);
        projectEnd.setHours(0, 0, 0, 0);
        if (projectEnd < today) {
          endDate = projectEnd;
        }
      }
      
      const timeDiff = endDate.getTime() - startDate.getTime();
      return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // 包含开始当天
    },
    
    // 伙食补贴总额
    mealAllowance() {
      return this.projectDays * 90;
    },
    
    // 按大类分组的费用统计
    categorizedExpenses() {
      const result = {};
      
      // 过滤掉伙食补贴类型的费用
      const filteredExpenses = this.expenses.filter(e => e.main_category && e.main_category.name !== '伙食补贴');
      
      filteredExpenses.forEach(expense => {
        const mainCatName = expense.main_category ? expense.main_category.name : '未分类';
        if (!result[mainCatName]) {
          result[mainCatName] = 0;
        }
        result[mainCatName] += parseFloat(expense.amount) || 0;
      });
      
      return result;
    },
    
    // 按大类分组的有发票费用统计
    categorizedExpensesWithInvoice() {
      const result = {};
      
      // 过滤掉伙食补贴类型的费用
      const filteredExpenses = this.expenses.filter(e => {
        return e.main_category && 
               e.main_category.name !== '伙食补贴' && 
               e.voucher_types && 
               e.voucher_types.length > 0;
      });
      
      filteredExpenses.forEach(expense => {
        const mainCatName = expense.main_category ? expense.main_category.name : '未分类';
        if (!result[mainCatName]) {
          result[mainCatName] = 0;
        }
        result[mainCatName] += parseFloat(expense.amount) || 0;
      });
      
      // 计算零星材料费（没有发票的费用）
      const totalWithoutInvoice = this.getTotalWithoutInvoice();
      if (totalWithoutInvoice > 0) {
        result['零星材料费'] = totalWithoutInvoice;
      }
      
      return result;
    },
    
    // 总费用
    totalExpenses() {
      return Object.values(this.categorizedExpenses).reduce((sum, val) => sum + val, 0);
    },
    
    // 有发票的总费用
    totalWithInvoice() {
      const result = {};
      const filteredExpenses = this.expenses.filter(e => {
        return e.main_category && 
               e.main_category.name !== '伙食补贴' && 
               e.voucher_types && 
               e.voucher_types.length > 0;
      });
      
      filteredExpenses.forEach(expense => {
        const mainCatName = expense.main_category ? expense.main_category.name : '未分类';
        if (!result[mainCatName]) {
          result[mainCatName] = 0;
        }
        result[mainCatName] += parseFloat(expense.amount) || 0;
      });
      
      return Object.values(result).reduce((sum, val) => sum + val, 0);
    },
    
    // 零星材料费总额
    miscellaneousTotal() {
      return this.getTotalWithoutInvoice();
    }
  },
  async mounted() {
    // 动态导入 Chart.js
    try {
      const ChartModule = await import('chart.js/auto');
      Chart = ChartModule.default;
    } catch (error) {
      console.error('Failed to load Chart.js:', error);
      return;
    }
    
    this.renderCharts();
  },
  watch: {
    categorizedExpenses: {
      handler() {
        this.$nextTick(() => {
          this.renderCharts();
        });
      },
      deep: true
    },
    categorizedExpensesWithInvoice: {
      handler() {
        this.$nextTick(() => {
          this.renderCharts();
        });
      },
      deep: true
    }
  },
  methods: {
    renderCharts() {
      // 销毁之前的图表实例
      if (this.categoryChart) {
        this.categoryChart.destroy();
      }
      
      if (this.invoiceChart) {
        this.invoiceChart.destroy();
      }
      
      // 渲染费用大类统计图表
      const categoryCtx = this.$refs.categoryChartCanvas.getContext('2d');
      const categoryData = Object.entries(this.categorizedExpenses);
      const categoryLabels = categoryData.map(item => item[0]);
      const categoryValues = categoryData.map(item => item[1]);
      
      this.categoryChart = new Chart(categoryCtx, {
        type: 'bar',
        data: {
          labels: categoryLabels,
          datasets: [{
            label: '费用金额 (¥)',
            data: categoryValues,
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '¥' + value.toLocaleString();
                }
              }
            }
          }
        }
      });
      
      // 渲染有发票费用大类统计图表
      const invoiceCtx = this.$refs.invoiceChartCanvas.getContext('2d');
      const invoiceData = Object.entries(this.categorizedExpensesWithInvoice);
      const invoiceLabels = invoiceData.map(item => item[0]);
      const invoiceValues = invoiceData.map(item => item[1]);
      
      this.invoiceChart = new Chart(invoiceCtx, {
        type: 'bar',
        data: {
          labels: invoiceLabels,
          datasets: [{
            label: '有发票金额 (¥)',
            data: invoiceValues,
            backgroundColor: 'rgba(16, 185, 129, 0.6)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '¥' + value.toLocaleString();
                }
              }
            }
          }
        }
      });
    },
    
    // 获取没有发票的费用总额（归为零星材料费）
    getTotalWithoutInvoice() {
      const totalWithInvoice = this.expenses
        .filter(e => e.main_category && e.main_category.name !== '伙食补贴')
        .filter(e => e.voucher_types && e.voucher_types.length > 0)
        .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
      
      const totalAll = this.expenses
        .filter(e => e.main_category && e.main_category.name !== '伙食补贴')
        .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
      
      return totalAll - totalWithInvoice;
    }
  },
  filters: {
    currency(value) {
      if (typeof value !== 'number') {
        value = parseFloat(value) || 0;
      }
      return value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
  }
};
</script>

<style scoped>
.chart-container {
  position: relative;
}
</style>