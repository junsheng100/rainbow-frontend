import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import en from 'element-plus/dist/locale/en.mjs'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/user'
import { normalizeErrorMessage, showErrorMessage } from './utils/errorHandler'
import { ElMessage } from 'element-plus'
import './styles/main.scss'
import { setupBrowserEvents } from '@/utils/browserEvents'
import 'virtual:svg-icons-register'
import { loadSvg } from '@/utils/svgIcon'
import { i18n } from './i18n'
import permissionDirectives from './directives/permission'
import dialogDrag from './directives/dialogDrag'
import dialogSizeMemory from './directives/dialogSizeMemory'


const app = createApp(App)
loadSvg(app)
app.use(permissionDirectives)
app.use(dialogDrag)
app.use(dialogSizeMemory)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}



// 跟踪业务层是否已经处理过错误
let businessErrorHandled = false
const resetBusinessErrorFlag = () => {
  businessErrorHandled = false
}

// 劫持 ElMessage.error 方法，确保所有错误消息都经过优化
const originalError = ElMessage.error
ElMessage.error = (message: any) => {
  // 标记业务层已经处理了错误
  businessErrorHandled = true

  // 延迟重置标记，给其他错误处理一些时间
  setTimeout(resetBusinessErrorFlag, 100)

  // 只对字符串类型的消息进行优化，其他类型直接处理
  if (typeof message === 'string') {
    const optimizedMessage = normalizeErrorMessage(message)
    return originalError(optimizedMessage)
  }
  return originalError(message)
}

// 全局错误处理 - 更保守的策略
app.config.errorHandler = (err: any, _vm, _info) => {
 // console.error('全局错误捕获:', err, info)

  // 如果业务层已经处理过错误，不再重复显示
  if (businessErrorHandled) {
    console.log('业务层已处理错误，跳过全局显示')
    return
  }

  // 只处理关键的系统级错误
  if (err && typeof err === 'object') {
    // 跳过一些不需要显示给用户的错误
    if (err.message && (
      err.message.includes('ResizeObserver') ||
      err.message.includes('Non-Error') ||
      err.message.includes('Script error') ||
      err.message.includes('Network Error') && businessErrorHandled
    )) {
      return
    }
  }

  // 使用去重的错误显示
  showErrorMessage(err)
}

// 处理未捕获的 Promise 错误 - 更保守的策略
window.addEventListener('unhandledrejection', (event) => {
  // console.error('未处理的 Promise 错误:', event.reason)

  // 如果业务层已经处理过错误，不再重复显示
  if (businessErrorHandled) {
    // console.log('业务层已处理 Promise 错误，跳过全局显示')
    // 阻止控制台显示原始错误
    event.preventDefault()
    return
  }

  // 检查错误类型，避免显示不必要的错误
  const reason = event.reason
  if (reason && typeof reason === 'object') {
    // 跳过网络错误（通常业务层会处理）
    if (reason.message && reason.message.includes('Request failed')) {
      // console.log('网络错误通常由业务层处理，跳过全局显示')
      event.preventDefault()
      return
    }

    // 跳过已经被 axios 拦截器处理的错误
    if (reason.response && reason.config) {
      console.log('axios 错误已由拦截器处理，跳过全局显示')
      event.preventDefault()
      return
    }
  }

  // 使用去重的错误显示
  showErrorMessage(event.reason)

  // 阻止控制台显示原始错误
  event.preventDefault()
})

const pinia = createPinia()

app.use(pinia)
// 根据当前语言设置 ElementPlus 的语言
const locale = localStorage.getItem('language') || 'zh-CN'
app.use(ElementPlus, {
  locale: locale === 'zh-CN' ? zhCn : en
})
app.use(i18n)
app.use(router)

// 路由守卫 - 检查认证状态
router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore()

  if (to.path === '/login') {
    // 如果已登录，跳转到首页
    if (userStore.token) {
      next('/')
      return
    }
  } else {
    // 其他页面需要登录
    if (!userStore.token) {
      next('/login')
      return
    }

    // 如果有token但没有用户信息，尝试获取用户信息
    if (!userStore.userInfo.userName) {
      try {
        await userStore.getUserInfo()
      } catch (error) {
        // console.error('获取用户信息失败:', error)
        // 清除无效token
        await userStore.logout()
        next('/login')
        return
      }
    }
  }

  next()
})

// 初始化用户信息
const userStore = useUserStore()
userStore.initUserInfo()

// 设置浏览器事件监听
setupBrowserEvents()

app.mount('#app')
