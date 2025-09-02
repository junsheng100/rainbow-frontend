<template>
  <div class="error-page">
    <div class="error-code">401</div>
    <div class="error-desc">抱歉，您无权访问该页面</div>
    <div class="error-handle">
      <el-button type="primary" size="large" @click="goBack">返回上一页</el-button>
      <el-button type="primary" size="large" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.go(-1)
}

const goHome = () => {
  router.push('/')
}
</script>

<style lang="scss" scoped>
.error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #fff;

  .error-code {
    color: #2d8cf0;
    font-size: 250px;
    font-weight: bold;
  }

  .error-desc {
    color: #777;
    font-size: 30px;
    margin: 20px 0;
  }

  .error-handle {
    margin-top: 30px;
    padding-bottom: 200px;
  }
}
</style>
