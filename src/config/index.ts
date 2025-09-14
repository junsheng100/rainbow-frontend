// API配置


export const API_CONFIG = {
  BASE_URL: '',  // 使用相对路径，让所有请求通过 Vite 代理
  RESOURCE_PATH: '/resources'  // 修改为使用 /resources 作为资源路径前缀
}

// 获取基础URL
export const getBaseUrl = () => {
  return API_CONFIG.BASE_URL || ''
}

// 资源URL处理函数
export const getResourceUrl = (path: string) => {
  if (!path) {
    // console.warn('getResourceUrl: 路径为空')
    return ''
  }
  // 移除开头的斜杠（如果存在）
  const cleanPath = path.startsWith('/') ? path.substring(1) : path
  // console.log('getResourceUrl - 清理后的路径:', cleanPath)

  // 构建最终的 URL（使用 RESOURCE_PATH）
  // 确保不会出现双斜杠
  const finalUrl = `${API_CONFIG.RESOURCE_PATH}/${cleanPath}`.replace(/\/+/g, '/')

  return finalUrl
}
