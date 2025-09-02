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
export const getDataTypePageList = (params: DataTypeQuery) => {
    const vo: BaseVo<string> = {
    pageNo: params.pageNum,
    pageSize: params.pageSize,
    data:  params.keyword
  }
  return request.post<PageResponse<DataTypeInfo>>('/template/datatype/page/list', vo)
}

export const getDataTypeList = () => {
  return request.get<DataTypeInfo[]>('/template/datatype/all')
}

// 查询数据类型详细
export const getDataType = (id: string) => {
  return request.get<DataTypeInfo>(`/template/datatype/${id}`)
}

// 新增数据类型
export const createDataType = (data: DataTypeInfo) => {
  return request.post<DataTypeInfo>('/template/datatype', data)
}

// 修改数据类型
export const updateDataType = (data: DataTypeInfo) => {
  return request.post<DataTypeInfo>('/template/datatype', data)
}

// 删除数据类型
export const deleteDataType = (id:  string) => {
  return request.delete<boolean>(`/template/datatype/${id}`)
}

export const deleteBatchDataType = (ids: string[]) => {
  const vo: CommonVo<string[]> = {
    data: ids
  }
  return request.post<boolean>('/template/datatype/batch/delete', vo)
}


export const getJavaTypeList = () => {
  return request.get<Enums[]>('/template/datatype/java')
}
export const getDbTypeList = () => {
  return request.get<string[]>('/template/datatype/db')
}

// 上传数据类型Excel文件
export function uploadDataTypeExcel(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<boolean>(
    '/template/datatype/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      transformRequest: [(data) => data] // 防止axios对FormData进行转换
    }
  )
}
