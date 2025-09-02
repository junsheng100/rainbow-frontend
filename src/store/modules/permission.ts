import { defineStore } from 'pinia'
import { type RouteRecordRaw } from 'vue-router'
import type { Component } from 'vue'
import { getRouters, type RouteItem } from '@/api/routers'

// 组件映射表
const componentMap: Record<string, () => Promise<Component>> = {
  Layout: () => import('@/layouts/index.vue'),
  ParentView: () => import('@/components/ParentView/index.vue'),
}

// 预加载所有视图组件
const modules = import.meta.glob('../../views/**/*.vue')
// console.log('Preloaded modules:', Object.keys(modules))

// 动态加载组件
const loadComponent = (component: string): () => Promise<Component> => {
  // console.log('Loading component:', component)

  // 处理特殊组件
  if (component === 'Layout' || component === 'ParentView') {
    // console.log('Using special component:', component)
    return componentMap[component]
  }

  // 统一处理组件路径
  let componentPath = component

  // 确保以 views/ 开头
  if (!componentPath.startsWith('views/')) {
    componentPath = `views/${componentPath}`
  }

  // 确保有 .vue 后缀
  if (!componentPath.endsWith('.vue')) {
    componentPath = `${componentPath}.vue`
  }

  // 构造完整的组件路径
  const fullPath = `../../${componentPath}`
  // console.log('Full component path:', fullPath)


  // 查找匹配的组件
  const matchedComponent = modules[fullPath]
  if (!matchedComponent) {
    return componentMap.ParentView
  }
  return matchedComponent as () => Promise<Component>
}

// 将后端返回的路由数据转换为Vue Router格式
const transformRoutes = (routes: RouteItem[]): RouteRecordRaw[] => {
  // 添加数据校验
  if (!Array.isArray(routes)) {
    return []
  }

  const validRoutes: RouteRecordRaw[] = []

  routes.forEach(route => {
    try {
      // 校验必要字段
      if (!route.path || !route.name) {
        return
      }

      const routeRecord = {
        path: route.path,
        name: route.name,
        component: route.component === 'Layout'   ? componentMap.Layout : loadComponent(route.component || 'ParentView'),
        meta: {
          title: route.meta?.title || route.name,
          icon: route.meta?.icon,
          noCache: route.meta?.noCache,
          link: route.meta?.link,
          hidden: route.hidden,
          alwaysShow: route.alwaysShow
        }
      } as RouteRecordRaw

      // 处理子路由
      if (route.children && route.children.length > 0) {
        const children = transformRoutes(route.children)
        if (children.length > 0) {
          routeRecord.children = children
        }
      }

      validRoutes.push(routeRecord)
    } catch (error) {
      console.error('处理路由数据出错:', error, route)
    }
  })

  return validRoutes
}

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: [] as RouteRecordRaw[],
    hasRoutes: false
  }),

  actions: {
    // 初始化路由
    async initRoutes() {
      try {
        const routes = await getRouters()

        // 开发环境下打印API返回数据
        if (import.meta.env.DEV) {
         // console.log('API返回的路由数据:', JSON.stringify(routes, null, 2))
        }

        // 校验并转换路由数据
        if (!Array.isArray(routes)) {
          throw new Error('API返回的数据格式错误')
        }

        const validRoutes = transformRoutes(routes)

        // 开发环境下打印转换后的路由
        if (import.meta.env.DEV) {

        }

        // 校验转换结果
        if (validRoutes.length === 0) {
          console.warn('没有可用的路由数据')
        }

        this.routes = validRoutes
        this.hasRoutes = true
        return validRoutes
      } catch (error) {
        console.error('初始化路由失败:', error)
        this.routes = []
        this.hasRoutes = false
        throw error
      }
    },

    // 重置路由状态
    resetRoutes() {
      this.routes = []
      this.hasRoutes = false
    }
  }
})
