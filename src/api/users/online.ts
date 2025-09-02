import request from '@/utils/request.ts'
import {BaseVo, CommonVo, PageResponse} from '@/types/common.ts'

// 在线用户接口
export interface OnlineUser {
  tokenId: string
  userName: string
  ipaddr: string
  loginLocation: string
  browser: string
  os: string
  loginTime: string
  lastAccessTime: string
}

// 查询参数接口
export interface OnlineUserQueryParams {
  page: number
  size: number
  userName?: string
  ipaddr?: string
}

// 获取在线用户分页列表
export const getOnlineUserPage = (params: OnlineUserQueryParams) => {
  const vo: BaseVo<OnlineUser> = {
    pageNo: params.page,
    pageSize: params.size,
    data: {
      userName: params.userName,
      ipaddr: params.ipaddr
    }
  }
  return request.post<PageResponse<OnlineUser>>('/system/online/page', vo)
}

// 查询在线用户列表
export const listOnlineUser = (query?: Partial<OnlineUser>) => {
  return request.get<OnlineUser[]>('/system/online/list', { params: query })
}

// 强制下线用户
export const forceLogout = (tokenId: string) => {
  return request.delete<boolean>(`/system/online/${tokenId}/logout`)
}

// 批量强制下线用户
export const batchForceLogout = (tokenIds: string[]) => {
  const vo: CommonVo<string[]> = {
    data: tokenIds
  }
  return request.post<boolean>('/system/online/batchLogout', vo)
}
