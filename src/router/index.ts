import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw, RouteRecordRedirectOption } from 'vue-router'

export interface CustomRouteRecordRaw extends Omit<RouteRecordRaw, 'meta' | 'children' | 'redirect'> {
  children?: RouteRecordRaw[]
  hidden?: boolean
  redirect?: RouteRecordRedirectOption
  meta?: {
    title?: string
    icon?: string
    affix?: boolean
    noCache?: boolean
    [key: string]: any
  }
}
import { usePermissionStore } from '@/store/modules/permission'
import { useUserStore } from '@/stores/user'
import { useFileConfigStore } from '@/stores/fileConfig'
import { ElMessage } from 'element-plus'
import 'nprogress/nprogress.css'
import { progressBar } from '@/utils/progressBar'

// 确保初始状态下进度条是关闭的
progressBar.reset()

// 路由重试最大次数
const MAX_ROUTE_RETRY = 3
// 路由重试计数器
let routeRetryCount = 0

// 基础路由
const constantRoutes: CustomRouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' }
  },

  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layouts/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: {
          title: '首页',
          icon: 'House',
          affix: true, // 固定显示在标签栏
          noCache: true // 不缓存
        }
      },
      {
        path: 'users/profile',
        name: 'UserProfile',
        component: () => import('@/views/users/profile.vue'),
        meta: {
          title: '个人中心',
          icon: 'User',
          noCache: true
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '404' }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes as unknown as RouteRecordRaw[]
})

// 基础路由名称列表
const constantRouteNames = new Set(['Login', 'Layout', 'Dashboard', 'NotFound', 'UserProfile'])

// 重置路由
export function resetRouter() {
  // 移除所有非基础路由
  router.getRoutes().forEach(route => {
    const routeName = route.name
    if (routeName && !constantRouteNames.has(routeName.toString())) {
      router.removeRoute(routeName)
    }
  })

  // 重置路由重试计数
  routeRetryCount = 0

  // 清除路由缓存
  if (window.__MICRO_APP_ENVIRONMENT__) {
    // 如果是微前端环境，通知主应用清除缓存
    window.microApp?.dispatch({ type: 'clearRouteCache' })
  }
}

// 初始化动态路由
export async function initDynamicRoutes() {
  const permissionStore = usePermissionStore()
  try {
    const routes = await permissionStore.initRoutes()
    // 清除所有动态路由
    resetRouter()
    // 重新添加动态路由
    routes.forEach(route => {
      const routeName = route.name
      if (routeName && !constantRouteNames.has(routeName.toString())) {
        // 将动态路由添加到根路由下
        router.addRoute({
          ...route,
          // 确保路径格式正确
          path: route.path.startsWith('/') ? route.path : `/${route.path}`
        })
      }
    })
    return true
  } catch (error) {
    console.error('初始化动态路由失败:', error)
    return false
  }
}

// 路由守卫
router.beforeEach(async (to, _from, next) => {
  // 开始进度条
  progressBar.start()

  const userStore = useUserStore()
  const permissionStore = usePermissionStore()
  const fileConfigStore = useFileConfigStore()
  const token = userStore.token

  // 开发环境下打印路由信息
  if (import.meta.env.DEV) {

  }

  if (token) {
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      try {
        // 如果目标路由是基础路由但不匹配，或者没有动态路由，重新加载路由
        const isConstantRoute = to.name && constantRouteNames.has(to.name.toString())
        if (!permissionStore.hasRoutes || (!isConstantRoute && to.matched.length === 0)) {
          // 检查重试次数
          if (routeRetryCount >= MAX_ROUTE_RETRY) {
            // 重置重试计数
            routeRetryCount = 0
            // 结束进度条
            progressBar.done()
            // 显示错误消息
            ElMessage.error('路由加载失败，请重新登录')
            // 执行登出操作
            await userStore.logout()
            // 清除路由状态
            permissionStore.$reset()
            // 重定向到登录页
            next(`/login?redirect=${to.path}`)
            return
          }

          // 增加重试计数
          routeRetryCount++

          // 初始化路由
          await initDynamicRoutes()
          // 重新导航到目标路由，保持原有参数
          next({
            path: to.path,
            query: to.query,
            hash: to.hash,
            replace: true
          })
        } else {
          // 检查是否进入文件列表页面，如果是则更新文件配置
          if (to.path.includes('/filelist') || to.name === 'FileList') {
            try {
              await fileConfigStore.loadFileConfig(true) // 强制刷新配置
              console.log('进入文件列表页面，配置已更新:', fileConfigStore.config)
            } catch (error) {
              console.error('更新文件配置失败:', error)
            }
          }
          next()
        }
      } catch (error) {
        console.error('路由处理失败:', error)
        // 结束进度条
        progressBar.done()
        // 显示错误提示
        ElMessage.error('路由加载失败，请重新登录')
        // 执行登出操作
        await userStore.logout()
        // 清除路由状态
        permissionStore.$reset()
        // 重定向到登录页
        next(`/login?redirect=${to.path}`)
      }
    }
  } else {
    if (to.path === '/login') {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
    }
  }
})

// 路由后置守卫 - 确保进度条结束
router.afterEach((to, from) => {
  // 结束进度条
  progressBar.done()

  // 开发环境下打印路由跳转信息
  if (import.meta.env.DEV) {
     console.log(`路由跳转: ${from.path} → ${to.path}`)
  }
})

// 路由错误处理
router.onError((error) => {
  console.error('路由错误:', error)
  // 确保进度条结束
  progressBar.done()
  // 显示错误提示
  ElMessage.error('页面加载失败，请重试')
})

export default router
