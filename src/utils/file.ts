/**
 * 文件工具函数
 */

import { useAppStore } from '@/stores/app'

/**
 * 获取资源的完整URL
 * @param url 资源路径
 * @returns 完整的资源URL
 */
export const getResourceUrl = (url: string): string => {
  // 如果是完整的URL（以http或https开头），则直接返回
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    return url
  }

  // 如果是相对路径，则拼接上API基础路径
  const appStore = useAppStore()
  const baseUrl = appStore.apiBaseUrl || import.meta.env.VITE_API_BASE_URL || ''

  // 确保URL以/开头
  const normalizedUrl = url.startsWith('/') ? url : `/${url}`

  return `${baseUrl}${normalizedUrl}`
}

/**
 * 下载文件
 * @param url 文件URL
 * @param fileName 文件名
 */
export const downloadFile = (url: string, fileName?: string): void => {
  const link = document.createElement('a')
  link.href = getResourceUrl(url)
  link.target = '_blank'

  // 如果提供了文件名，则设置下载属性
  if (fileName) {
    link.download = fileName
  }

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 获取文件扩展名
 * @param fileName 文件名
 * @returns 文件扩展名（小写）
 */
export const getFileExtension = (fileName: string): string => {
  return fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase()
}

/**
 * 格式化文件大小
 * @param size 文件大小（字节）
 * @returns 格式化后的文件大小
 */
export const formatFileSize = (size: number): string => {
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB'
  } else if (size < 1024 * 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(2) + ' MB'
  } else {
    return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }
}
