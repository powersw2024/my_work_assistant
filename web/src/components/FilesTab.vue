<template>
  <div class="p-4">
    <h2 class="text-xl font-bold text-gray-800 mb-6">项目文件</h2>

    <!-- 功能开发中提示 -->
    <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-yellow-700">
            <span class="font-medium">文件管理功能正在开发中</span>
            - 目前暂不支持文件上传和管理功能。
          </p>
        </div>
      </div>
    </div>

    <!-- 特殊功能区域 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white p-6 rounded-xl shadow border-l-4 border-blue-500">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">维护单页面</h3>
        <p class="text-gray-600 mb-4">功能开发中...</p>
      </div>

      <div class="bg-white p-6 rounded-xl shadow border-l-4 border-green-500">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">应变安装记录</h3>
        <p class="text-gray-600 mb-4">功能开发中...</p>
      </div>

      <div class="bg-white p-6 rounded-xl shadow border-l-4 border-purple-500">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">GNSS安装记录制作</h3>
        <p class="text-gray-600 mb-4">功能开发中...</p>
      </div>
    </div>

    <!-- 文件列表 - 显示空状态 -->
    <div class="bg-white p-6 rounded-xl shadow">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-800">项目文件</h3>
        <p class="text-gray-600">共 0 个文件</p>
      </div>

      <div class="text-gray-500 text-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none"
          viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p>文件管理功能暂未开放</p>
        <p class="text-sm text-gray-400 mt-2">请稍后关注功能更新</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'FilesTab',
  // 移除props和emits，因为暂时不需要文件管理功能
  // props: {
  //   uploadedFiles: {
  //     type: Array,
  //     default: () => []
  //   }
  // },
  // emits: ['rename-file', 'delete-file'],
  methods: {
    // 临时注释掉这些方法
    // formatFileSize(bytes) {
    //   if (bytes === 0) return '0 Bytes';
    //   const k = 1024;
    //   const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    //   const i = Math.floor(Math.log(bytes) / Math.log(k));
    //   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    // },

    // renameFile(file) {
    //   this.$emit('rename-file', file);
    // },

    // deleteFile(file) {
    //   this.$emit('delete-file', file);
    // }
  }
})
</script>
