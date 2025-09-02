# 创建日志管理主页面
<template>
  <div class="log-container">
    <el-card class="box-card">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="登录日志" name="login">
          <component :is="LoginLog" v-if="activeTab === 'login'" />
        </el-tab-pane>
        <el-tab-pane label="操作日志" name="operation">
          <component :is="OperLog" v-if="activeTab === 'operation'" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue'

// 异步加载组件
const LoginLog = defineAsyncComponent(() => import('@/views/log/login/index.vue'))
const OperLog = defineAsyncComponent(() => import('@/views/log/oper/index.vue'))

// 当前激活的选项卡
const activeTab = ref('login')
</script>

<style lang="scss" scoped>
.log-container {
  padding: 20px;

  .box-card {
    margin-bottom: 20px;

    :deep(.el-tabs__content) {
      padding: 20px;
      background-color: #fff;
    }
  }
}
</style>
