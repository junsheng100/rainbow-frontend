import request from '@/utils/request'
import { CommonVo, PageResponse} from "@/types/common.ts"
import {AppCategory, MenuInterface} from '@/types/appdoc'

export interface AppCategoryParams {
  pageNum: number
  pageSize: number
  simpleName?: string
  className?: string
  requestUrl?: string
  status?: string
}

// 获取目录详情
export const getCategoryDetail = (id: string) => {
  return request.get<AppCategory>(`/app/category/${id}`)
}

// 保存目录（新增/编辑）
export const saveCategory = (data: AppCategory) => {
  return request.post<AppCategory>('/app/category', data)
}

// 删除目录
export const deleteCategory = (id: string) => {
  return request.delete<boolean>(`/app/category/${id}`)
}

// 查询目录列表（支持条件查询）
export const listCategory = (data: Partial<AppCategory>) => {
  return request.post<AppCategory[]>('/app/category/list', data)
}

// 分页查询目录列表
export const pageCategory = (params: AppCategoryParams) => {
  const vo: CommonVo<string> = {
    pageNo: params.pageNum,
    pageSize: params.pageSize,
    data: params.simpleName
  }
  return request.post<PageResponse<AppCategory>>('/app/category/find', vo)
}

// 批量删除目录
export const batchDeleteCategory = (ids: string[]) => {
  return request.post<boolean>('/app/category/batch/delete', ids)
}

// 刷新指定 className 目录
export const refreshCategory = (className: string) => {
  return request.post<AppCategory>(`/app/category/refresh/${className}`)
}

// 刷新所有目录
export const refreshAllCategory = () => {
  return request.post<AppCategory[]>('/app/category/refresh/all')
}

// 提供给菜单使用的数据

export const getMenuInterfaces =  (params: AppCategoryParams): Promise<PageResponse<MenuInterface>> => {
  const vo: CommonVo<string> = {
    pageNo: params.pageNum,
    pageSize: params.pageSize,
    data: params.simpleName
  }
  return request.post<PageResponse<MenuInterface>>( '/app/category/menus',vo);
};
