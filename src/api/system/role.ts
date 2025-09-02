import request from '@/utils/request.ts'
import type {BaseVo, PageResponse} from "@/types/common.ts"

export interface CommonVo {
  data: number[]
}

// 角色信息接口
export interface RoleInfo {
  roleId?: number
  roleName: string
  roleKey: string
  roleSort: number
  dataScope: string
  status: string
  delFlag?: string
  fcd?: string
  fcu?: string
  lcd?: string
  lcu?: string
  rightIdList?: number[]
}

export interface RoleQuery {
  roleName?: string
  roleKey?: string
  status?: string
  pageNum?: number
  pageSize?: number
}

// 查询角色列表
export const getRoleList = (params: RoleQuery) => {
  const vo: BaseVo<RoleInfo> = {
    pageNo: params.pageNum,
    pageSize: params.pageSize,
    data: {
      roleName: params.roleName
    }
  }
  return request.post<PageResponse<RoleInfo>>('/role/info/page', vo)
}

// 查询角色详细
export const getRole = (roleId: number) => {
  return request.get<RoleInfo>(`/role/info/${roleId}`)
}

// 新增角色
export const createRole = (data: RoleInfo) => {
  return request.post<RoleInfo>('/role/info', data)
}

// 修改角色
export const updateRole = (data: RoleInfo) => {
  return request.post<RoleInfo>('/role/info', data)
}

// 删除角色
export const deleteRole = (data: RoleInfo) => {
  const roleId = data.roleId;
  return request.delete<boolean>(`/role/info/${roleId}`)
}

export const getRoleMenuTree = (roleId: number | number[]) => {
  return request.get(`/role/info/tree/${roleId}`)
}


