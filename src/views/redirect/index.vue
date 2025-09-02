<template>
  <div class="app-container">
    <el-alert :closable="false" title="正在跳转..." type="success" />
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

onMounted(() => {
  const { params, query } = route
  const { path } = params
  router.replace({
    path: '/' + (Array.isArray(path) ? path.join('/') : path),
    query
  }).catch(err => {
    console.warn('重定向失败:', err)
  })
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}
</style>
