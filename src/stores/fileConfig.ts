import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getFileConfig, type FileConfig } from '@/api/files/config'

export const useFileConfigStore = defineStore('fileConfig', () => {
  // 状态
  const config = ref<FileConfig | null>(null)
  const loading = ref(false)
  
  // 加载文件配置
  const loadFileConfig = async (force = false) => {
    // 如果配置存在且不是强制刷新，则直接返回
    if (!force && config.value) {
      return config.value
    }
    
    try {
      loading.value = true
      const response = await getFileConfig()
      
      // request工具已经处理了响应，直接返回data字段的内容
      // 所以response就是FileConfig对象，不需要再检查code
      if (response && typeof response === 'object') {
        config.value = response
        console.log('文件配置加载成功:', response)
        return response
      } else {
        throw new Error('获取文件配置失败：响应数据格式错误')
      }
    } catch (error) {
      console.error('加载文件配置失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  // 获取配置（如果不存在则自动加载）
  const getConfig = async () => {
    if (!config.value) {
      return await loadFileConfig()
    }
    return config.value
  }
  
  // 清除配置
  const clearConfig = () => {
    config.value = null
  }
  
  return {
    config,
    loading,
    loadFileConfig,
    getConfig,
    clearConfig
  }
})
