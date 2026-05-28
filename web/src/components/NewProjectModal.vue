<template>
  <div class="modal-backdrop p-4">
    <div class="modal-panel w-full max-w-xl">
      <div class="modal-header">
        <div class="space-y-1">
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-primary-500">Project</p>
          <h3 class="text-2xl font-semibold tracking-tight text-slate-950">{{ isEditing ? '编辑项目' : '新建项目' }}</h3>
          <p class="text-sm text-slate-500">保留项目核心信息并同步到本地数据库。</p>
        </div>
        <button @click="$emit('close')"
          class="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-rose-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="modal-body space-y-5">
        <div class="rounded-2xl border border-surface-200 bg-surface-50/70 p-5">
          <div class="space-y-5">
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-slate-700">项目名称 <span class="text-rose-500">*</span></label>
              <input v-model="localProject.name" type="text" placeholder="请输入项目名称" class="input-field"
                :class="{ 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/50': error.name }"
                required>
              <p v-if="error.name" class="mt-1.5 flex items-center text-sm text-rose-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {{ error.name }}
              </p>
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-semibold text-slate-700">项目描述</label>
              <textarea
                v-model="localProject.description"
                rows="4"
                placeholder="输入项目简介、地点、负责人或里程碑信息"
                class="input-field min-h-[112px] resize-none"
              ></textarea>
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1.5 block text-sm font-semibold text-slate-700">开始日期 <span class="text-rose-500">*</span></label>
                <input v-model="localProject.start_date" type="date" class="input-field" required>
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-semibold text-slate-700">结束日期</label>
                <input v-model="localProject.end_date" type="date" class="input-field">
              </div>
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-semibold text-slate-700">项目状态</label>
              <select v-model="localProject.status" class="input-field">
                <option value="进行中">进行中</option>
                <option value="已结束">已结束</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="btn btn-secondary">
          取消
        </button>
        <button @click="submitProject" class="btn btn-primary">
          {{ isEditing ? '更新项目' : '创建项目' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { Project } from '../utils/tauriApi';

interface LocalProjectData {
  id?: number;
  name: string;
  description?: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
}

interface ProjectError {
  name: string;
}

const normalizeProjectStatus = (status?: string | null): string => {
  return status === '已结束' ? '已结束' : '进行中';
};

export default defineComponent({
  name: 'NewProjectModal',
  props: {
    initialData: {
      type: Object as () => Partial<Project> | null,
      default: () => null
    },
    isEditing: {
      type: Boolean as () => boolean,
      default: false
    },
    existingProjects: {
      type: Array as () => Project[],
      default: () => []
    }
  },
  emits: ['close', 'create', 'update'],
  data() {
    const getDefaultStartDate = (): string => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      localProject: {
        id: undefined as number | undefined,
        name: '',
        description: '',
        start_date: getDefaultStartDate(),
        end_date: null,
        status: '进行中'
      } as LocalProjectData,
      error: {
        name: ''
      } as ProjectError
    }
  },
  created() {
    if (this.initialData) {
      this.localProject = {
        ...this.initialData,
        status: normalizeProjectStatus(this.initialData.status)
      } as LocalProjectData;
    }
  },
  watch: {
    initialData: {
      handler(newVal) {
        if (newVal) {
          // 当有初始数据时，表示是编辑模式
          this.localProject = {
            ...newVal,
            status: normalizeProjectStatus(newVal.status)
          } as LocalProjectData;
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
      const getDefaultStartDate = (): string => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // 重置为默认值
      this.localProject = {
        id: undefined,
        name: '',
        description: '',
        start_date: getDefaultStartDate(),
        end_date: null,
        status: '进行中'
      } as LocalProjectData;
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
      const isDuplicate = this.existingProjects.some((p: Project) =>
        p.name === this.localProject.name &&
        (!this.isEditing || p.id !== this.localProject.id)
      );

      if (isDuplicate) {
        this.error.name = '该项目名称已存在';
        return;
      }

      if (this.isEditing) {
        this.$emit('update', {
          ...this.localProject,
          status: normalizeProjectStatus(this.localProject.status)
        } as Project);
      } else {
        this.$emit('create', {
          name: this.localProject.name,
          description: this.localProject.description || '',
          start_date: this.localProject.start_date || '',
          end_date: this.localProject.end_date || null,
          status: normalizeProjectStatus(this.localProject.status)
        });
      }

      // 提交后重置表单
      if (!this.isEditing) {
        this.resetLocalProject();
      }
    }
  }
});
</script>
