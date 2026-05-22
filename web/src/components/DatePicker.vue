<template>
  <div class="date-picker-wrapper">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">{{ label }}</label>
    <input 
      :value="modelValue"
      @input="(e: Event) => $emit('update:modelValue', (e.target as HTMLInputElement).value)"
      type="date" 
      :class="['input-field w-full', inputClass]"
      :disabled="disabled"
    >
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DatePicker',
  props: {
    modelValue: {
      type: String as () => string,
      default: ''
    },
    label: {
      type: String as () => string,
      default: ''
    },
    disabled: {
      type: Boolean as () => boolean,
      default: false
    },
    inputClass: {
      type: String as () => string,
      default: ''
    }
  },
  emits: ['update:modelValue']
});
</script>

<style scoped>
.input-field {
  @apply px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm;
}
</style>