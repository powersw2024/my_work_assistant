<template>
  <div class="p-4">
    <h2 class="text-xl font-bold text-gray-800 mb-6">费用报表</h2>
    
    <!-- 总体费用统计 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white p-6 rounded-xl shadow border-l-4 border-blue-500">
        <h3 class="text-lg font-semibold text-gray-700 mb-2">总费用</h3>
        <p class="text-2xl font-bold text-gray-900">¥{{ totalExpensesFormatted }}</p>
      </div>
      <div class="bg-white p-6 rounded-xl shadow border-l-4 border-green-500">
        <h3 class="text-lg font-semibold text-gray-700 mb-2">有发票金额</h3>
        <p class="text-2xl font-bold text-gray-900">¥{{ totalWithInvoiceFormatted }}</p>
      </div>
      <div class="bg-white p-6 rounded-xl shadow border-l-4 border-yellow-500">
        <h3 class="text-lg font-semibold text-gray-700 mb-2">零星材料费</h3>
        <p class="text-2xl font-bold text-gray-900">¥{{ miscellaneousTotalFormatted }}</p>
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

    <!-- 伙食补贴说明 -->
    <div class="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h4 class="font-medium text-blue-800 mb-2">伙食补贴统计</h4>
      <p class="text-blue-700 text-sm">项目天数：{{ statistics.project_days }} 天，伙食补贴：¥{{ mealAllowanceFormatted }}（每日90元）</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
// 仅在需要时动态导入 Chart.js
let Chart: any = null;
import { reportApi } from '../utils/tauriApi';
import type { ExpenseSummary, ProjectStatistics, CategoryExpense } from '../utils/tauriApi';

export default defineComponent({
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
      summary: {
        total_expenses: 0,
        total_with_invoice: 0,
        miscellaneous_total: 0,
        category_breakdown: [],
        invoice_category_breakdown: []
      } as ExpenseSummary,
      statistics: {
        project_days: 0,
        meal_allowance: 0
      } as ProjectStatistics,
      categoryChart: null as any,
      invoiceChart: null as any
    };
  },
  computed: {
    totalExpensesFormatted(): string {
      return this.formatCurrency(this.summary.total_expenses);
    },
    totalWithInvoiceFormatted(): string {
      return this.formatCurrency(this.summary.total_with_invoice);
    },
    miscellaneousTotalFormatted(): string {
      return this.formatCurrency(this.summary.miscellaneous_total);
    },
    mealAllowanceFormatted(): string {
      return this.formatCurrency(this.statistics.meal_allowance);
    }
  },
  async mounted() {
    await this.loadStatistics();
    this.renderCharts();
  },
  watch: {
    project: {
      handler(newVal: any, oldVal: any) {
        if (newVal && oldVal?.id !== newVal?.id) {
          this.loadStatistics();
        }
      }
    }
  },
  methods: {
    formatCurrency(value: number): string {
      if (typeof value !== 'number') {
        value = parseFloat(value) || 0;
      }
      return value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    },
    // 加载统计数据
    async loadStatistics() {
      if (!this.project?.id) return;
      
      try {
        const [summary, stats] = await Promise.all([
          reportApi.getExpenseSummary(this.project.id),
          reportApi.getProjectStatistics(this.project.id)
        ]);
        
        this.summary = summary;
        this.statistics = stats;
      } catch (error) {
        console.error('加载统计数据失败:', error);
      }
    },
    
    renderCharts() {
      // 动态导入 Chart.js
      if (!Chart) {
        import('chart.js/auto').then((ChartModule) => {
          Chart = ChartModule.default;
          this.doRenderCharts();
        });
      } else {
        this.doRenderCharts();
      }
    },
    doRenderCharts() {
      // 销毁之前的图表实例
      if (this.categoryChart) {
        this.categoryChart.destroy();
      }
      
      if (this.invoiceChart) {
        this.invoiceChart.destroy();
      }
      
      // 渲染费用大类统计图表
      const categoryCtx = this.$refs.categoryChartCanvas.getContext('2d');
      const categoryData = this.summary.category_breakdown || [];
      const categoryLabels = categoryData.map((item: CategoryExpense) => item.category_name);
      const categoryValues = categoryData.map((item: CategoryExpense) => item.amount);
      
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
                callback: function(value: number) {
                  return '¥' + value.toLocaleString();
                }
              }
            }
          }
        }
      });
      
      // 渲染有发票费用大类统计图表
      const invoiceCtx = this.$refs.invoiceChartCanvas.getContext('2d');
      const invoiceData = this.summary.invoice_category_breakdown || [];
      const invoiceLabels = invoiceData.map((item: CategoryExpense) => item.category_name);
      const invoiceValues = invoiceData.map((item: CategoryExpense) => item.amount);
      
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
                callback: function(value: number) {
                  return '¥' + value.toLocaleString();
                }
              }
            }
          }
        }
      });
    }
  }
});
</script>

<style scoped>
.chart-container {
  position: relative;
}
</style>