import request from '@/utils/request'

// 文件配置接口
export interface FileConfig {
  previewUrl: string
  uploadUrl: string
  maxSize: number
  allowExtensions: string[]
  previewType: string[]
  fileExt: string
  hasPreview: boolean
}

// 文件配置响应接口
export interface FileConfigResponse {
  code: number
  msg: string
  data: FileConfig
}

// 获取文件配置
export const getFileConfig = () => {
  return request.get<FileConfig>('/files/config')
}

// 更新文件配置
export const updateFileConfig = (data: FileConfig) => {
  return request.post<FileConfig>('/files/config', data)
}
