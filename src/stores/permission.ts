import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { getUserMenus } from '@/api/auth'

export const usePermissionStore = defineStore('permission', () => {
  // 状态
  const routes = ref<RouteRecordRaw[]>([])
  const hasRoutes = ref(false)

  // 初始化路由
  const initRoutes = async () => {
    try {
      // 获取用户菜单
      const menus = await getUserMenus()
      // 转换菜单为路由
      routes.value = menus
      hasRoutes.value = true
      return routes.value
    } catch (error) {
      console.error('Failed to initialize routes:', error)
      throw error
    }
  }

  // 重置状态
  const $reset = () => {
    routes.value = []
    hasRoutes.value = false
  }

  return {
    routes,
    hasRoutes,
    initRoutes,
    $reset
  }
})
