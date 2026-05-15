<template>
  <div class="card p-6 shadow-card">
    <h4 class="font-semibold text-lg text-gray-800 mb-4 flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg> 添加工作日志
    </h4>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 左侧：基本信息 -->
      <div class="space-y-4">
        <DatePicker 
          v-model="localLog.log_date"
          label="日期"
        />
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">人员（可多选）</label>
          <div class="border rounded-lg p-2 max-h-40 overflow-y-auto">
            <div v-for="person in personnel" :key="person" class="flex items-center p-2 hover:bg-gray-100 rounded">
              <input type="checkbox" :id="'person_' + person" :value="person" v-model="selectedPersonnel"
                class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
              <label :for="'person_' + person" class="ml-2 text-gray-700 cursor-pointer">{{ person }}</label>
            </div>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">地点</label>
          <input v-model="localLog.location" type="text" placeholder="请输入工作地点" class="input-field w-full">
        </div>
        
        <Selector 
          v-model="localLog.weather"
          label="天气"
          :options="weatherOptions"
        />
      </div>

      <!-- 右侧：工作内容 -->
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">今日工作</label>
          <textarea v-model="localLog.content" placeholder="请输入详细工作内容" rows="10"
            class="input-field w-full" style="font-family: monospace;"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">明日计划</label>
          <textarea v-model="localLog.next_day_plan" placeholder="请输入明日工作计划" rows="6"
            class="input-field w-full" style="font-family: monospace;"></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DatePicker from './DatePicker.vue';
import Selector from './Selector.vue';

export default {
  name: 'LogForm',
  components: {
    DatePicker,
    Selector
  },
  props: {
    log: {
      type: Object,
      default: () => ({
        id: null,
        log_date: '',
        executor: [],
        weather: '晴',
        location: '',
        content: '',
        next_day_plan: '',
        author: '系统用户'
      })
    },
    personnel: {
      type: Array,
      default: () => []
    },
    recentLogs: {
      type: Array,
      default: () => []
    },
    projectName: {
      type: String,
      default: ''
    }
  },
  emits: ['submit'],
  data() {
    return {
      localLog: {
        id: null,
        log_date: this.getCurrentDate(),
        executor: [], // 改为数组以支持多选
        weather: '晴', // 默认为晴
        location: this.getMostRecentLogWithLocation()?.location || '', // 使用最近日志的位置
        content: '',
        next_day_plan: '',
        author: '系统用户' // 设置默认作者
      },
      selectedPersonnel: [], // 用于存储多选人员
      weatherTypes: ['晴', '雨', '大雨', '雪'] // 按照要求设定天气选项
    }
  },
  computed: {
    weatherOptions() {
      return this.weatherTypes.map(weather => ({
        value: weather,
        label: `${this.getWeatherEmoji(weather)} ${weather}`
      }));
    }
  },
  mounted() {
    // 初始化选中的人员
    if (this.log.executor) {
      this.selectedPersonnel = Array.isArray(this.log.executor) ?
        [...this.log.executor] :
        this.log.executor.split(',').map(item => item.trim());
    }

    // 只有在编辑现有日志时才使用传入的日志数据，否则从本地存储加载草稿数据
    if (this.log && this.log.id) {
      // 编辑现有日志时，同步prop数据到localLog
      this.syncLogToLocalLog(this.log);
    } else {
      // 新建日志时，从本地存储加载草稿数据，但如果传入了特定日期的初始化数据，则使用那个日期
      this.loadFormDataFromLocalStorage();
      // 如果props中有指定的日期，使用props中的日期而不是本地存储的日期
      if (this.log && this.log.log_date && this.log.log_date !== '') {
        this.localLog.log_date = this.log.log_date;
      }
    }
  },
  
  beforeUnmount() {
    // 组件卸载前，如果是新建模式，保存数据到本地存储
    if (!this.localLog.id) {
      this.saveFormDataToLocalStorage();
    }
  },
  
  watch: {
    log(newVal) {
      // 当log prop改变时，同步到localLog
      // 仅在编辑模式下同步，新建模式下不覆盖用户输入
      if (newVal && newVal.id) {
        this.syncLogToLocalLog(newVal);
      } else if (newVal && !newVal.id) {
        // 如果是新建模式但props更新了（比如改变了日期），则更新日期
        if (newVal.log_date && newVal.log_date !== this.localLog.log_date) {
          this.localLog.log_date = newVal.log_date;
        }
      }
    },
    // 监听表单数据变化并保存到本地存储
    'localLog.log_date'() {
      if (!this.localLog.id) { // 只在新建模式下保存到本地存储
        this.saveFormDataToLocalStorage();
      }
    },
    'localLog.content'() {
      if (!this.localLog.id) { // 只在新建模式下保存到本地存储
        this.saveFormDataToLocalStorage();
      }
    },
    'localLog.weather'() {
      if (!this.localLog.id) { // 只在新建模式下保存到本地存储
        this.saveFormDataToLocalStorage();
      }
    },
    'localLog.location'() {
      if (!this.localLog.id) { // 只在新建模式下保存到本地存储
        this.saveFormDataToLocalStorage();
      }
    },
    'localLog.next_day_plan'() {
      if (!this.localLog.id) { // 只在新建模式下保存到本地存储
        this.saveFormDataToLocalStorage();
      }
    },
    'localLog.author'() {
      if (!this.localLog.id) { // 只在新建模式下保存到本地存储
        this.saveFormDataToLocalStorage();
      }
    },
    selectedPersonnel: {
      handler(newVal) {
        // 将选中的人员转换为逗号分隔的字符串，保存到localLog.executor
        this.localLog.executor = newVal;
        if (!this.localLog.id) { // 只在新建模式下保存到本地存储
          this.saveFormDataToLocalStorage();
        }
      },
      deep: true
    }
  },
  methods: {
    syncLogToLocalLog(log) {
      if (!log) return;
      
      this.localLog = {
        ...log,
        next_day_plan: log.next_day_plan || '',
        executor: [], // 重置executor，由selectedPersonnel管理
        author: log.author || '系统用户'
      };

      // 初始化选中的人员
      if (log.executor) {
        this.selectedPersonnel = Array.isArray(log.executor) ?
          [...log.executor] :
          log.executor.split(',').map(item => item.trim());
      } else {
        this.selectedPersonnel = [];
      }
      
      // 如果是新建模式且没有ID，尝试从本地存储加载（防止prop更新覆盖用户输入）
      if (!log.id && !this.localLog.id) {
         // 这里可以根据需求决定是否重新加载，通常watch触发时意味着外部数据变化
         // 如果是新建模式，我们可能更希望保留用户在表单中的输入，除非是明确的重置操作
         // 暂不在此处重新load，依靠mounted时的初始load
      }
    },
    getWeatherEmoji(weather) {
      const emojiMap = {
        '晴': '☀️',
        '雨': '🌧️',
        '大雨': '⛈️',
        '雪': '❄️',
      };
      return emojiMap[weather] || '🌈';
    },
    getMostRecentLogWithLocation() {
      // 按日期降序排序，查找最近的有位置信息的日志
      const sortedLogs = [...this.recentLogs].sort((a, b) => new Date(b.log_date) - new Date(a.log_date));
      return sortedLogs.find(log => log.location && log.location.trim() !== '') || null;
    },
    parseContent(content) {
      if (!content) return [''];
      // 按换行符分割内容
      return content.split('\n').filter(line => line.trim() !== '');
    },
    // 保存当前表单数据到本地存储
    saveFormDataToLocalStorage() {
      const formData = {
        log_date: this.localLog.log_date,
        executor: this.selectedPersonnel,
        content: this.localLog.content,
        weather: this.localLog.weather,
        location: this.localLog.location,
        next_day_plan: this.localLog.next_day_plan,
        author: this.localLog.author // 包含作者字段
      };
      localStorage.setItem('logFormDraft', JSON.stringify(formData));
    },
    // 从本地存储恢复表单数据
    loadFormDataFromLocalStorage() {
      const savedData = localStorage.getItem('logFormDraft');
      if (savedData) {
        try {
          const formData = JSON.parse(savedData);
          this.localLog.log_date = formData.log_date || this.getCurrentDate();
          this.localLog.content = formData.content || '';
          this.localLog.weather = formData.weather || '晴';
          this.localLog.location = formData.location || '';
          this.localLog.next_day_plan = formData.next_day_plan || '';
          this.localLog.author = formData.author || '系统用户'; // 恢复作者字段

          // 恢复选中的人员
          if (Array.isArray(formData.executor)) {
            this.selectedPersonnel = formData.executor;
          } else if (typeof formData.executor === 'string') {
            this.selectedPersonnel = formData.executor.split(',').map(item => item.trim());
          } else {
            this.selectedPersonnel = [];
          }
        } catch (error) {
          console.error('解析本地存储的数据失败:', error);
        }
      }
    },
    // 清除本地存储的草稿
    clearFormDataFromLocalStorage() {
      localStorage.removeItem('logFormDraft');
    },
    submitLog() {
      // 验证必填字段
      if (!this.localLog.log_date || !this.selectedPersonnel || this.selectedPersonnel.length === 0 || !this.localLog.content) {
        alert('请填写必填字段：日期、人员和今日工作');
        return;
      }

      // 触发提交事件
      this.$emit('submit', {
        ...this.localLog,
        executor: this.selectedPersonnel.join(',') // 将多选人员转换为逗号分隔的字符串
      });

      // 如果是新建日志（没有ID），提交成功后清除本地存储的草稿
      if (!this.localLog.id) {
        this.clearFormDataFromLocalStorage();
      }

      // 重置表单为新建状态
      this.resetFormForNewLog();
    },
    
    resetFormForNewLog() {
      // 重置表单数据为初始状态
      const recentLogWithLocation = this.getMostRecentLogWithLocation();
      this.localLog = {
        id: null, // 确保ID为null表示新建状态
        log_date: this.getCurrentDate(), // 重置为当前日期
        executor: [], // 多选人员数组
        author: '系统用户', // 重置为默认作者
        content: '', // 清空内容
        weather: '晴', // 默认为晴
        location: recentLogWithLocation ? recentLogWithLocation.location : '', // 重置时也使用最近日志的位置
        next_day_plan: ''
      };
      this.selectedPersonnel = []; // 重置选中人员
    },
    getCurrentDate() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  },
  expose: ['submitLog', 'clearFormDataFromLocalStorage', 'loadFormDataFromLocalStorage', 'saveFormDataToLocalStorage']
}
</script>