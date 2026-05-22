<template>
  <div class="space-y-4">
    <div v-if="logs.length === 0" class="text-center py-8 text-gray-500">
      <p>暂无日志记录，点击"添加日志"按钮创建第一条记录</p>
    </div>
    <div v-else v-for="(log, index) in logs" :key="log.id" 
         class="border rounded-lg p-4 bg-white flex flex-col" 
         :data-date="formatDate(log.log_date)"
         @dblclick="copyLogToClipboard(log)">
      <div class="flex justify-between items-start">
        <div class="flex-1 min-w-0">
          <div class="flex items-center mb-2 flex-wrap gap-2">
            <h3 class="text-lg font-semibold text-gray-800">{{ formatDate(log.log_date) }}</h3>
            <span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded truncate max-w-[100px]">
              {{ formatExecutor(log.executor) }}
            </span>
            <span v-if="log.weather" class="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
              {{ getWeatherEmoji(log.weather) }} {{ log.weather }}
            </span>
            <span v-if="log.location"
              class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded truncate max-w-[100px]">
              {{ log.location }}
            </span>
          </div>

          <div class="mb-3">
            <h4 class="font-medium text-gray-700 mb-1">今日工作：</h4>
            <p class="text-gray-600 whitespace-pre-line text-sm">{{ log.content }}</p>
          </div>
          
          <div v-if="log.next_day_plan">
            <h4 class="font-medium text-gray-700 mb-1">明日计划：</h4>
            <p class="text-gray-600 whitespace-pre-line text-sm">{{ log.next_day_plan }}</p>
          </div>
        </div>

        <div class="flex flex-col space-y-2 ml-4">
          <button 
            @click="$emit('delete-log', log.id)"
            class="text-red-600 hover:text-red-900 text-sm p-1.5 rounded hover:bg-red-50 transition-colors whitespace-nowrap"
            title="删除日志"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <div class="mt-auto pt-3 border-t border-gray-100 text-xs text-gray-500 flex flex-wrap gap-x-4">
        <span>创建于: {{ formatDateTime(log.created_at) }}</span>
        <span v-if="log.updated_at && log.updated_at !== log.created_at">更新于: {{ formatDateTime(log.updated_at)
        }}</span>
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
