import request from '@/utils/request.ts'
import {BaseVo, CommonVo, PageResponse} from '@/types/common.ts'

// 操作日志接口
export interface OperLog {
  operId: number
  title: string
  beanName:string
  method: string
  requestMethod: string
  operatorType: string
  operName: string
  operUrl: string
  operIp: string
  operLocation: string
  operParam: string
  jsonResult: string
  errorMsg: string
  operTime: string
  costTime: number
}

// 查询参数接口
export interface OperLogQueryParams {
  page: number
  size: number
  keyword?: string
  startTime?: string
  endTime?: string
}

// 查询数据接口
export interface OperLogQueryData {
  keyword?: string
  startTime?: string
  endTime?: string
}

// 获取操作日志分页列表
export const getOperLogPage = (params: OperLogQueryParams) => {
  const vo: BaseVo<OperLogQueryData> = {
    pageNo: params.page,
    pageSize: params.size,
    data: {
      keyword: params.keyword,
      startTime: params.startTime,
      endTime: params.endTime
    }
  }
  return request.post<PageResponse<OperLog>>('/oper/log/page/list', vo)
}

// 获取操作日志详情
export const getOperLogDetail = (id: number) => {
  return request.get<OperLog>(`/oper/log/${id}`)
}

// 删除操作日志
export const deleteOperLog = (id: number) => {
  return request.delete<boolean>(`/oper/log/${id}`)
}

export const deleteAllOperLog = () => {
  return request.delete<boolean>(`/oper/log/clean/all`)
}


// 批量删除操作日志
export const batchDeleteOperLog = (ids: number[]) => {
  const vo: CommonVo<number[]> = {
    data: ids
  }
  return request.post<boolean>('/oper/log/batch/delete',vo)
}

// 高频使用数据接口
export interface TopOperLogData {
  beanName: string
  method: string
  title: string
  total: number
}

// 获取高频使用的操作日志数据
export const getTopOperLogData = (limit: number = 20) => {
  const url = `/oper/log/total/top?limit=${limit}&desc=true`
  return request.get<TopOperLogData[]>(url)
}

// 用户统计数据类型
export type UserStatType = 'day' | 'week' | 'month'

// 用户统计数据接口
export interface UserStatData {
  time: string
  users: number
  count: number
}

// 用户统计查询参数接口
export interface UserStatQueryParams {
  start: string // yyyy-MM-dd
  end: string // yyyy-MM-dd
  type: UserStatType
}

// 获取用户统计数据
export const getUserStatData = (params: UserStatQueryParams) => {
  const { start, end, type } = params
  const url = `/oper/log/total/user?start=${start}&end=${end}&type=${type}`
  return request.get<UserStatData[]>(url)
}
