<template>
  <div class="app-container">
    <el-tabs v-model="activeTab" type="border-card">

      <!-- 模板配置 -->
      <el-tab-pane label="模板配置" name="config">
        <template-config />
      </el-tab-pane>
      <!-- 数据结构 -->
      <el-tab-pane label="实例设置" name="structure">
        <template-structure />
      </el-tab-pane>

      <!-- 模板数据 -->
      <el-tab-pane label="模板数据" name="data">
        <template-data />
      </el-tab-pane>


    </el-tabs>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import TemplateConfig from './components/TemplateConfig.vue'
import TemplateStructure from './components/TemplateStructure.vue'
import TemplateData from './components/TemplateData.vue'

const activeTab = ref('config')
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;

  :deep(.el-tabs__content) {
    padding: 20px;
    background: #fff;
  }
}
</style>
