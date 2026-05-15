<template>
  <div class="date-picker-wrapper">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">{{ label }}</label>
    <input 
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      type="date" 
      :class="['input-field w-full', inputClass]"
      :disabled="disabled"
    >
  </div>
</template>

<script>
export default {
  name: 'DatePicker',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    inputClass: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue']
};
</script>

<style scoped>
.input-field {
  @apply px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm;
}
</style>