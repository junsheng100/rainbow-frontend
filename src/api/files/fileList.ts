import request from '@/utils/request.ts'
import type { BaseVo, PageResponse } from "@/types/common.ts"

export interface FileInfo {
  id: number
  fileName: string
  size: number
  FileInfo: string
  originalFilename: string
  fileUrl: string
  fileExt: string
  fileType: string
  contentType: string
  filePath: string
  logo: string
  fileGroup: string
}

export interface FileListQuery {
  fileName?: string
  FileInfo?: string
  fileGroup?: string
  dateRange?: string[]
  pageNum?: number
  pageSize?: number
  originalFilename?: string
}

// 查询文件列表
export const listFile = (params: FileListQuery) => {
  const vo: BaseVo<FileInfo> = {
    pageNo: params.pageNum,
    pageSize: params.pageSize,
    data: {
      originalFilename: params.originalFilename
    }
  }
  return request.post<PageResponse<FileInfo>>('/files/page', vo)
}

// 查询文件详细
export const getFileInfoDetail = (id: number) => {
  return request.get<FileInfo>(`/files/${id}`)
}

// 新增文件
export const addFileInfo = (data: Omit<FileInfo, 'id'>) => {
  return request.post<FileInfo>('/files', data)
}

// 修改文件
export const updateFileInfo = (data: FileInfo) => {
  return request.post<FileInfo>('/files', data)
}

// 删除文件
export const deleteFileInfo = (id: number) => {
  return request.delete<boolean>(`/files/${id}`, )
}

// 批量删除文件
export const batchDeleteFileInfo = (ids: number[]) => {
  return request.delete<boolean>('/files/batch', {
    data: { ids }
  })
}
// 获取文件预览地址
export const getPreviewUrl = () => {
  return request.get<string>(`/files/preview/url`)
}
