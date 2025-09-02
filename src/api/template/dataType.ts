import request from '@/utils/request.ts'
import type {BaseVo, CommonVo, PageResponse} from "@/types/common.ts"
import {Enums} from "@/types/dataType.ts";

export interface DataTypeInfo {
  id?: string
  fcd?: string
  status?: string
  columnType: string
  dataDescribe: string
  dataRange: string
  dataType: string
  dbType: string
  javaType: string
  orderNum: number
}

export interface DataTypeQuery {
  keyword?: string
  pageNum?: number
  pageSize?: number
}

// 查询数据类型列表
export const getDataTypePage = (vo: DataTypeQuery) => {
  return request.post<PageResponse<DataTypeInfo>>('/template/datatype/page/list', vo)
}

export const getAllDataTypes = () => {
  return request.get<DataTypeInfo[]>('/template/datatype/all')
}

export const getDataTypeById = (id: string | number) => {
  return request.get<DataTypeInfo>(`/template/datatype/${id}`)
}

export const createDataType = (data: DataTypeInfo) => {
  return request.post<DataTypeInfo>('/template/datatype', data)
}

export const updateDataType = (data: DataTypeInfo) => {
  return request.post<DataTypeInfo>('/template/datatype', data)
}

export const deleteDataType = (id: string | number) => {
  return request.delete<boolean>(`/template/datatype/${id}`)
}

export const batchDeleteDataType = (vo: BatchDeleteVo) => {
  return request.post<boolean>('/template/datatype/batch/delete', vo)
}

export const getJavaDataTypes = () => {
  return request.get<Enums[]>('/template/datatype/java')
}

export const getDbDataTypes = () => {
  return request.get<string[]>('/template/datatype/db')
}

export const uploadDataTypeFile = (formData: FormData) => {
  return request.post<DataTypeInfo>(
    '/template/datatype/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )
}
