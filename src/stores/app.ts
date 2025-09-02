import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 应用配置
  const apiBaseUrl = ref<string>(import.meta.env.VITE_API_BASE_URL || '')
  const appName = ref<string>(import.meta.env.VITE_APP_NAME || 'Rainbow Admin')
  const appVersion = ref<string>(import.meta.env.VITE_APP_VERSION || '1.0.0')

  // 应用状态
  const isCollapse = ref<boolean>(false)
  const isDark = ref<boolean>(localStorage.getItem('theme') === 'dark')

  // 切换侧边栏折叠状态
  const toggleCollapse = () => {
    isCollapse.value = !isCollapse.value
  }

  // 切换暗黑模式
  const toggleDark = () => {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')

    // 设置HTML的data-theme属性
    if (isDark.value) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.setAttribute('data-theme', 'light')
    }
  }

  // 设置API基础URL
  const setApiBaseUrl = (url: string) => {
    apiBaseUrl.value = url
  }

  return {
    apiBaseUrl,
    appName,
    appVersion,
    isCollapse,
    isDark,
    toggleCollapse,
    toggleDark,
    setApiBaseUrl
  }
})
