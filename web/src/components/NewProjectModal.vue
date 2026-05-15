<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md">
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-gray-800">{{ isEditing ? '编辑项目' : '新建项目' }}</h3>
          <button 
            @click="$emit('close')" 
            class="text-gray-400 hover:text-gray-500 text-2xl"
          >
            ✕
          </button>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">项目名称 <span class="text-red-500">*</span></label>
            <input 
              v-model="localProject.name" 
              type="text" 
              placeholder="请输入项目名称" 
              class="input-field"
              :class="{ 'border-red-500': error.name }"
              required
            >
            <p v-if="error.name" class="mt-1 text-sm text-red-600">{{ error.name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
            <input 
              v-model="localProject.start_date" 
              type="date" 
              class="input-field"
              required
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
            <input 
              v-model="localProject.end_date" 
              type="date" 
              class="input-field"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">项目状态</label>
            <select 
              v-model="localProject.status" 
              class="input-field"
            >
              <option value="进行中">进行中</option>
              <option value="已结束">已结束</option>
              <option value="未开始">未开始</option>
            </select>
          </div>
        </div>
        
        <div class="mt-6 flex justify-end space-x-3">
          <button 
            @click="$emit('close')" 
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
          <button 
            @click="submitProject" 
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {{ isEditing ? '更新项目' : '创建项目' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 定义一个函数供data使用，因为data函数中无法访问this
function getDefaultStartDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default {
  name: 'NewProjectModal',
  props: {
    initialData: {
      type: Object,
      default: () => null
    },
    isEditing: {
      type: Boolean,
      default: false
    },
    existingProjects: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close', 'create', 'update'],
  data() {
    return {
      localProject: {
        name: '',
        start_date: getDefaultStartDate(), // 使用外部函数
        end_date: null,
        status: '进行中'
      },
      error: {
        name: ''
      }
    }
  },
  created() {
    if (this.initialData) {
      this.localProject = { ...this.initialData };
    }
  },
  watch: {
    initialData: {
      handler(newVal) {
        if (newVal) {
          // 当有初始数据时，表示是编辑模式
          this.localProject = { ...newVal };
        } else {
          // 当没有初始数据时，重置为默认值
          this.resetLocalProject();
        }
      },
      deep: true
    }
  },
  methods: {
    resetLocalProject() {
      // 重置为默认值
      this.localProject = {
        name: '',
        start_date: getDefaultStartDate(),
        end_date: null,
        status: '进行中'
      };
    },
    submitProject() {
      // 清除之前的错误
      this.error.name = '';

      // 验证项目名称是否为空
      if (!this.localProject.name || !this.localProject.name.trim()) {
        this.error.name = '项目名称不能为空';
        return;
      }

      // 验证项目名称是否重复
      const isDuplicate = this.existingProjects.some(p => 
        p.name === this.localProject.name && 
        (!this.isEditing || p.id !== this.localProject.id)
      );

      if (isDuplicate) {
        this.error.name = '该项目名称已存在';
        return;
      }

      if (this.isEditing) {
        this.$emit('update', { ...this.localProject });
      } else {
        this.$emit('create', { ...this.localProject });
      }
      
      // 提交后重置表单
      if (!this.isEditing) {
        this.resetLocalProject();
      }
    }
  }
}
</script>