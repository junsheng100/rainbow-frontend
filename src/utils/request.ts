import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { tokenManager } from './tokenManager'
import { useUserStore } from '@/stores/user'
import { TokenCookie } from './cookies'

// 保存原始的ElMessage.error，避免被劫持影响
const originalElMessageError = ElMessage.error

// 用于存储正在重试的请求
const retryQueue: Array<() => Promise<any>> = []
// 标记是否正在刷新token
let isRefreshing = false

// 请求失败计数器
let failureCount = 0
// 最后一个失败的请求URL
let lastFailedUrl = ''
// 最大失败次数
const MAX_FAILURE_COUNT = 3

// 获取环境变量中的 API 基础 URL
const BASE_API = import.meta.env.VITE_APP_BASE_API || '/web'

// 创建不需要 token 的 axios 实例
export const publicService: AxiosInstance = axios.create({
  baseURL: BASE_API,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT || 15000),
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
})

// 创建需要 token 的 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: BASE_API,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT || 15000),
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
})

// HTTP状态码对应的错误消息映射
const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: '请求参数错误',
  401: '身份验证失败，请重新登录',
  403: '没有权限访问此资源',
  404: '请求的资源不存在',
  405: '请求方法不允许',
  408: '请求超时',
  409: '请求冲突，资源已存在',
  422: '请求参数验证失败',
  429: '请求过于频繁，请稍后重试',
  500: '服务器内部错误',
  501: '服务器不支持此功能',
  502: '网关错误',
  503: '服务暂时不可用',
  504: '网关超时',
  512: '业务未许可'
}

// 网络错误消息映射
const NETWORK_ERROR_MESSAGES: Record<string, string> = {
  'Network Error': '网络连接失败，请检查网络状态',
  'timeout': '请求超时，请稍后重试',
  'Timeout': '请求超时，请稍后重试',
  'ECONNREFUSED': '无法连接到服务器',
  'ECONNABORTED': '请求被中止，请稍后重试',
  'CORS': '跨域请求失败，请联系管理员',
  'Cross-Origin': '跨域请求失败，请联系管理员',
  'SSL': '安全连接失败，请检查网络设置',
  'certificate': '安全连接失败，请检查网络设置',
  'ERR_INTERNET_DISCONNECTED': '网络连接已断开，请检查网络',
  'ERR_NETWORK_CHANGED': '网络环境发生变化，请重新尝试'
}

// 从服务端响应中提取错误消息
const extractServerErrorMessage = (responseData: any): string | null => {
  if (!responseData) return null

  // 常见的服务端错误字段，按优先级排序
  const errorFields = ['message', 'msg', 'error', 'errorMessage', 'detail', 'description']

  for (const field of errorFields) {
    if (responseData[field]) {
      return responseData[field]
    }
  }

  // 检查嵌套的data字段
  if (responseData.data) {
    for (const field of errorFields) {
      if (responseData.data[field]) {
        return responseData.data[field]
      }
    }
  }

  // 如果是字符串类型的响应
  if (typeof responseData === 'string') {
    return responseData
  }

  return null
}

// 从错误响应中提取消息的工具函数
const getErrorMessage = (error: any): string => {
  // 优先级顺序：
  // 1. 服务端返回的业务错误消息（最高优先级）
  // 2. HTTP状态码对应的错误消息
  // 3. 网络错误消息
  // 4. 默认错误消息

  // 1. 优先检查服务端返回的业务错误消息
  if (error.response?.data) {
    const serverMessage = extractServerErrorMessage(error.response.data)
    if (serverMessage) {
      return serverMessage
    }
  }

  // 2. 检查HTTP状态码对应的错误消息
  if (error.response?.code) {
    const status = error.response.status
    const statusMessage = HTTP_STATUS_MESSAGES[status]
    if (statusMessage) {
      return statusMessage
    }

    // 其他状态码的通用处理
    if (status >= 500) {
      return `服务器错误 (${status})`
    } else if (status >= 400) {
      return `客户端错误 (${status})`
    }
  }

  // 3. 检查axios错误消息中的网络错误
  if (error.message) {
    const message = error.message

    // 检查是否是状态码错误消息
    const statusCodeMatch = message.match(/Request failed with status code (\d+)|Request failed with status (\d+)|status code (\d+)|status (\d+)/)
    if (statusCodeMatch) {
      const statusCode = parseInt(statusCodeMatch[1] || statusCodeMatch[2] || statusCodeMatch[3] || statusCodeMatch[4])
      const statusMessage = HTTP_STATUS_MESSAGES[statusCode]
      if (statusMessage) {
        return statusMessage
      }

      if (statusCode >= 500) {
        return `服务器错误 (${statusCode})`
      } else if (statusCode >= 400) {
        return `客户端错误 (${statusCode})`
      }
    }

    // 检查网络错误
    for (const [key, value] of Object.entries(NETWORK_ERROR_MESSAGES)) {
      if (message.includes(key)) {
        return value
      }
    }

    // 处理其他技术错误
    if (message.includes('XMLHttpRequest') ||
        message.includes('Failed to fetch') ||
        message.includes('ERR_') ||
        message.includes('ENOTFOUND') ||
        message.includes('EHOSTUNREACH')) {
      return '网络连接异常，请检查网络状态'
    }

    // 处理通用请求失败
    if (message.toLowerCase().includes('request failed')) {
      return '请求失败，请稍后重试'
    }

    // 如果错误消息较短且不包含技术术语，直接返回
    if (message.length < 128) {
      return message
    }
  }

  // 4. 默认错误消息
  return '请求失败，请稍后重试'
}

// 请求拦截器
service.interceptors.request.use(
  async (config) => {
    // 使用tokenManager获取有效token
    if (!config.url?.includes('/auth/refresh') && !config.url?.includes('/auth/login')) {
      try {
        const token = await tokenManager.getValidToken()
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`
        }
      } catch (error) {
        console.error('Token validation failed:', error)
      }
    } else if (config.url?.includes('/auth/login')) {
      // 登录请求不需要检查和刷新token
      const token = TokenCookie.getAccessToken()
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    // 不在这里显示错误消息，交给全局处理
    return Promise.reject(error)
  }
)

// 检查业务错误并创建错误对象
const createBusinessError = (responseData: any, status: number): Error | null => {
  // 检查业务状态码
  if (responseData && typeof responseData === 'object' && 'code' in responseData) {
    if (responseData.code !== 200 && responseData.code !== 0) {
      const errorMessage = extractServerErrorMessage(responseData) || '业务处理失败'
      const error = new Error(errorMessage)
      ;(error as any).response = { data: responseData, status }
      return error
    }
  }

  // 检查 success 字段
  if (responseData && typeof responseData === 'object' && 'success' in responseData && responseData.success === false) {
    const errorMessage = extractServerErrorMessage(responseData) || '操作失败'
    const error = new Error(errorMessage)
    ;(error as any).response = { data: responseData, status }
    return error
  }

  // 检查 status 字段
  if (responseData && typeof responseData === 'object' && 'status' in responseData &&
      (responseData.status === 'error' || responseData.status === 'fail')) {
    const errorMessage = extractServerErrorMessage(responseData) || '操作失败'
    const error = new Error(errorMessage)
    ;(error as any).response = { data: responseData, status }
    return error
  }

  return null
}

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 请求成功时重置失败计数和最后失败URL
    failureCount = 0
    lastFailedUrl = ''

    const res = response.data

    // 检查业务错误
    const businessError = createBusinessError(res, response.status)
    if (businessError) {
      return Promise.reject(businessError)
    }

    // 返回数据：优先返回 data 字段，如果没有则返回整个响应
    return res?.data !== undefined ? res.data : res
  },
  async (error) => {
    // 检查是否是同一个URL的连续失败
    const currentUrl = error.config?.url || ''
    if (currentUrl === lastFailedUrl) {
      failureCount++
    } else {
      // 不同URL，重置计数
      failureCount = 1
      lastFailedUrl = currentUrl
    }

// 统一的登出处理函数
const handleLogout = (errorMessage: string) => {
  // 清除token并跳转到登录页
  tokenManager.clearToken()
  const userStore = useUserStore()
  userStore.logout()

  // 避免在登录页重复跳转
  if (router.currentRoute.value.path !== '/login') {
    router.push('/login')
  }

  // 显示错误消息
  originalElMessageError(errorMessage)
  // 重置失败计数
  failureCount = 0
}

// 处理401未授权错误 - 尝试刷新token
if (error.response?.status === 401 && error.config && !error.config._retry) {
  // 如果是刷新token的请求失败，直接登出
  if (error.config.url?.includes('/auth/refresh')) {
    const errorMessage = getErrorMessage(error)
    handleLogout(errorMessage)
    return Promise.reject(error)
  }

      // 标记该请求已经尝试过重试
      error.config._retry = true

      try {
        // 如果没有正在刷新token，则开始刷新
        if (!isRefreshing) {
          isRefreshing = true

          // 尝试刷新token
          await tokenManager.refreshTokenIfNeeded(true)

          // 刷新成功后，执行所有等待的请求
          const requests = [...retryQueue]
          retryQueue.length = 0

          for (const request of requests) {
            await request()
          }

          isRefreshing = false
        }

        // 创建一个新的Promise来处理当前请求
        return new Promise((resolve, reject) => {
          // 将当前请求添加到重试队列
          retryQueue.push(async () => {
            try {
              // 使用新的token重新发送请求
              const token = await tokenManager.getValidToken()
              if (token) {
                error.config.headers['Authorization'] = `Bearer ${token}`
              }

              // 重新发送请求
              const response = await service(error.config)
              resolve(response)
            } catch (retryError) {
              reject(retryError)
            }
          })

          // 如果当前没有正在刷新token，则立即执行请求
          if (!isRefreshing) {
            const request = retryQueue.shift()
            if (request) {
              request()
            }
          }
        })
      } catch (refreshError) {
        // 刷新token失败，清除token并跳转到登录页
        isRefreshing = false
        retryQueue.length = 0

        handleLogout('登录已过期，请重新登录')
        return Promise.reject(error)
      }
    }

    // 检查是否达到最大失败次数
    if (failureCount >= MAX_FAILURE_COUNT) {
      handleLogout('请求多次失败，请检查网络连接或重新登录')
      return Promise.reject(error)
    }

    // 其他错误不在这里显示消息，交给全局处理
    return Promise.reject(error)
  }
)

const request = {
  // 通用请求方法，支持完整的配置对象
  request<T = any>(config: AxiosRequestConfig): Promise<T> {
    return service.request(config)
  },

  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return service.get(url, config)
  },

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.post(url, data, config)
  },

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.put(url, data, config)
  },

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return service.delete(url, config)
  },

  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.patch(url, data, config)
  }
}

export default request
