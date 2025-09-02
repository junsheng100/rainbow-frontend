// 分页响应接口
export interface PageResponse<T> {
  content: T[]
  total: number
  size: number
  number: number
  pages: number
}

// 通用响应接口
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// 通用查询参数
export interface QueryParams {
  page: number
  size: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  keyword?: string
}

// 查询参数包装
export interface BaseVo<T> {
  data?: Partial<T>
  pageNo?: number
  pageSize?: number
}
export interface CommonVo<T> {
  data?: Partial<T>
  pageNo?: number
  pageSize?: number
}

export interface RestTree {
  id: number
  label: string
  parentId: number
  orderNo: number
  checked: boolean
  children: RestTree[]
}

export type UseStatus = '0' | '1'
