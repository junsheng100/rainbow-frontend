import request from '@/utils/request.ts'
import {BaseVo, CommonVo, PageResponse} from '@/types/common.ts'

// 登录日志接口
export interface LoginLog {
  infoId: number
  userId: string
  userName: string
  type: string
  ipaddr: string
  loginLocation: string
  browser: string
  os: string
  msg: string
  operTime: string
}

// 查询参数接口
export interface LoginLogQueryParams {
  page: number
  size: number
  keyword?: string
  startTime?: string
  endTime?: string
}

// 查询数据接口
export interface LoginLogQueryData {
  keyword?: string
  startTime?: string
  endTime?: string
}

// 获取登录日志分页列表
export const getLoginLogPage = (params: LoginLogQueryParams) => {
  const vo: BaseVo<LoginLogQueryData> = {
    pageNo: params.page,
    pageSize: params.size,
    data: {
      keyword: params.keyword,
      startTime: params.startTime,
      endTime: params.endTime
    }
  }
  return request.post<PageResponse<LoginLog>>('/login/user/page/list', vo)
}

// 获取登录日志详情
export const getLoginLogDetail = (id: number) => {
  return request.get<LoginLog>(`/login/user/${id}`)
}

// 删除登录日志
export const deleteLoginLog = (id: number) => {
  return request.delete<boolean>(`/login/user/${id}`)
}
export const deleteAllLoginLog = () => {
  return request.delete<boolean>(`/login/user/clean/all`)
}

// 批量删除登录日志
// 批量删除操作日志
export const batchDeleteLoginLog = (ids: number[]) => {
  const vo: CommonVo<number[]> = {
    data: ids
  }
  return request.post<boolean>('/login/user/batch/delete',vo)
}

export const batchLogout = (ids: string[]) => {
  const vo: CommonVo<string[]> = {
    data: ids
  }
  return request.post<boolean>('/login/user/batch/exit',vo)
}

export const logout = (id: string) => {
  return request.delete<boolean>(`/login/user/exit/${id}`)
}

export const logoutAll = () => {
  return request.delete<boolean>(`/login/user/exit/all`)
}


export const getOnlinePage = (params: LoginLogQueryParams) => {
  const vo: BaseVo<string> = {
    pageNo: params.page,
    pageSize: params.size,
    data: params.keyword
  }
  return request.post<PageResponse<LoginLog>>('/login/user/online', vo)
}

// 登录城市统计数据接口
export interface LoginCityData {
  country: string
  pro: string
  city: string
  total: number
}

// 获取登录城市统计数据
export const getLoginCityData = () => {
  return request.get<LoginCityData[]>('/login/user/total/city')
}

