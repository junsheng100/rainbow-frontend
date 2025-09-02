<template>
  <div class="permissions-container">
    <div class="page-header">
      <h2 class="page-title">权限管理</h2>
    </div>
    
    <el-card shadow="hover">
      <div class="coming-soon">
        <el-icon class="icon"><Lock /></el-icon>
        <h3>权限管理功能开发中...</h3>
        <p>该功能正在开发中，敬请期待</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Lock } from '@element-plus/icons-vue'
</script>

<style lang="scss" scoped>
.permissions-container {
  .page-header {
    margin-bottom: 20px;
    
    .page-title {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #2c3e50;
    }
  }
  
  .coming-soon {
    text-align: center;
    padding: 60px 20px;
    color: #7f8c8d;
    
    .icon {
      font-size: 64px;
      margin-bottom: 20px;
      color: #bdc3c7;
    }
    
    h3 {
      margin: 0 0 10px 0;
      font-size: 20px;
    }
    
    p {
      margin: 0;
      font-size: 14px;
    }
  }
}
</style> 