import request from '@/utils/request'
import type {BaseVo, PageResponse} from "@/types/common.ts"
import { AppInterface } from '@/types/appdoc'

export interface AppInterfaceParams {
  pageNum: number
  pageSize: number
  categoryId?: string
  methodName?: string
  requestMethod?: string
  requestUrl?: string
  status?: string
}

// 获取接口方法详情
export const getInterfaceDetail = (id: string) => {
  return request.get<AppInterface>(`/app/interface/${id}`)
}

// 保存接口方法（新增/编辑）
export const saveInterface = (data: AppInterface) => {
  return request.post<AppInterface>('/app/interface', data)
}

// 删除接口方法
export const deleteInterface = (id: string) => {
  return request.delete<boolean>(`/app/interface/${id}`)
}

// 查询接口方法列表（支持条件查询）
export const listInterface = (data: Partial<AppInterface>) => {

  const vo: BaseVo<AppInterface> = {
    data: {
      categoryId: data.categoryId,
      status: '0',
    }
  }
  return request.post<AppInterface[]>('/app/interface/list', vo)
}

// 分页查询接口方法列表
export const pageInterface = (params: AppInterfaceParams) => {
  const vo: BaseVo<AppInterface> = {
    pageNo: params.pageNum,
    pageSize: params.pageSize,
    data: {
      categoryId: params.categoryId,
      methodName: params.methodName,
      requestMethod: params.requestMethod,
      requestUrl: params.requestUrl,
      status: params.status
    }
  }
  return request.post<PageResponse<AppInterface>>('/app/interface/page', vo)
}

// 批量删除接口方法
export const batchDeleteInterface = (ids: string[]) => {
  return request.post<boolean>('/app/interface/batch/delete', ids)
}
