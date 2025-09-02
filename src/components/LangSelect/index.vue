<template>
  <el-dropdown trigger="click" class="international" @command="handleSetLanguage">
    <div>
      <el-tooltip content="语言切换" placement="bottom">
        <el-icon class="international-icon"><Monitor /></el-icon>
      </el-tooltip>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item :disabled="language === 'zh-CN'" command="zh-CN">
          中文
        </el-dropdown-item>
        <el-dropdown-item :disabled="language === 'en'" command="en">
          English
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Monitor } from '@element-plus/icons-vue'

const i18n = useI18n()
const language = computed(() => i18n.locale.value)

const handleSetLanguage = (lang: string) => {
  i18n.locale.value = lang
  localStorage.setItem('language', lang)
  ElMessage.success('切换语言成功')
}
</script>

<style lang="scss" scoped>
.international-icon {
  font-size: 20px;
  cursor: pointer;
  vertical-align: -5px !important;
  color: #eee;
}
</style> 