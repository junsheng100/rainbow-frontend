<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- 左侧目录列表 -->
      <el-col :span="10">
        <category-component @select-category="handleSelectCategory" ref="categoryRef" />
      </el-col>

      <!-- 右侧接口列表 -->
      <el-col :span="14">
        <interface-component :category-id="currentCategoryId" ref="interfaceRef" />
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import CategoryComponent from './category.vue'
import InterfaceComponent from './interface.vue'

// 当前选中的目录ID
const currentCategoryId = ref<string>('')

// 组件引用
const categoryRef = ref()
const interfaceRef = ref()

// 处理目录选择事件
const handleSelectCategory = (categoryId: string) => {
  currentCategoryId.value = categoryId
}

// 页面加载时自动选择第一个目录
onMounted(() => {
  // 页面加载完成后，目录组件会自动选择第一个目录
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}
</style>
