<template>
  <div class="space-y-4">
    <div v-if="logs.length === 0" class="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-surface-300">
      <div class="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p class="text-lg font-medium text-gray-900">暂无日志记录</p>
      <p class="text-sm text-gray-500 mt-1">双击左侧时间轴节点创建日志</p>
    </div>
    
    <div v-else v-for="(log, index) in logs" :key="log.id" 
         class="card p-5 group cursor-pointer" 
         :data-date="formatDate(log.log_date)"
         @dblclick="copyLogToClipboard(log)">
      <div class="flex justify-between items-start">
        <div class="flex-1 min-w-0">
          <div class="flex items-center mb-4 flex-wrap gap-2">
            <h3 class="text-lg font-bold text-gray-900 mr-2">{{ formatDate(log.log_date) }}</h3>
            <span class="tag-blue shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {{ formatExecutor(log.executor) }}
            </span>
            <span v-if="log.weather" class="tag-yellow shadow-sm">
              <span class="mr-1">{{ getWeatherEmoji(log.weather) }}</span> {{ log.weather }}
            </span>
            <span v-if="log.location" class="tag-green shadow-sm truncate max-w-[150px]" :title="log.location">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {{ log.location }}
            </span>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-2">
            <div class="bg-surface-50 rounded-xl p-4 border border-surface-100">
              <h4 class="font-semibold text-gray-900 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                今日工作
              </h4>
              <p class="text-gray-600 whitespace-pre-line text-sm leading-relaxed">{{ log.content }}</p>
            </div>
            
            <div v-if="log.next_day_plan" class="bg-primary-50/30 rounded-xl p-4 border border-primary-100/50">
              <h4 class="font-semibold text-gray-900 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                明日计划
              </h4>
              <p class="text-gray-600 whitespace-pre-line text-sm leading-relaxed">{{ log.next_day_plan }}</p>
            </div>
          </div>
        </div>

        <div class="flex flex-col space-y-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button 
            @click.stop="$emit('delete-log', log.id)"
            class="text-gray-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-colors"
            title="删除日志"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-surface-100 flex flex-wrap gap-x-4 gap-y-2 items-center justify-between">
        <div class="flex items-center text-xs text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="mr-4">创建于: {{ formatDateTime(log.created_at) }}</span>
          <span v-if="log.updated_at && log.updated_at !== log.created_at">更新于: {{ formatDateTime(log.updated_at) }}</span>
        </div>
        <div class="text-xs text-primary-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          双击复制
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { WorkLog } from '../utils/tauriApi';

export default defineComponent({
  name: 'LogList',
  props: {
    projectId: {
      type: Number,
      required: true
    },
    projectName: {
      type: String as () => string,
      default: ''
    },
    logs: {
      type: Array as () => WorkLog[],
      default: () => []
    }
  },
  emits: ['delete-log', 'edit-log'],
  methods: {
    formatDate(dateString?: string): string {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    },
    formatExecutor(executor?: string | string[]): string {
      if (!executor) return '未指定';
      if (Array.isArray(executor)) return executor.join(', ');
      return executor;
    },
    formatDateTime(dateString?: string): string {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    getWeatherEmoji(weather: string): string {
      const emojiMap: Record<string, string> = {
        '晴': '☀️',
        '雨': '🌧️',
        '雪': '❄️',
        '大雨': '🌧️',
        '小雨': '🌦️',
        '阴': '☁️'
      };
      return emojiMap[weather] || '🌈';
    },
    copyLogToClipboard(log: WorkLog) {
      // 构建日志格式
      const logText = `${this.projectName}-${log.location || ''}（${this.formatExecutor(log.executor)}）-${log.weather || ''}\n今日工作量：\n\t1、${this.parseContent(log.content).join('\n\t2、')}\n明日计划：\n\t1、${this.parseContent(log.next_day_plan || '').join('\n\t2、')}`;

      // 复制到剪贴板
      navigator.clipboard.writeText(logText).then(() => {
        // 复制成功，不显示提示
      }).catch(err => {
        console.error('复制失败:', err);
        // 如果原生 clipboard API 不可用，使用备用方案
        const textArea = document.createElement('textarea');
        textArea.value = logText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        // 复制成功，不显示提示
      });
    },
    parseContent(content: string): string[] {
      if (!content) return [];
      // 按换行符分割内容，过滤掉空行和只包含空白字符的行
      return content.split(/\r?\n/)
        .map(line => line.trim())  // 去除首尾空白
        .filter(line => line !== '');  // 过滤空行
    }
  }
});
</script>

<style scoped>
/* 隐藏按钮内的文本，只显示图标 */
button span {
  display: none;
}
</style>
