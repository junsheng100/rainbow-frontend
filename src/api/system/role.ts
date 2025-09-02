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
export const getRolePage = (vo: RoleQuery) => {
  return request.post<PageResponse<RoleInfo>>('/role/info/page', vo)
}

// 查询角色详细
export const getRoleById = (roleId: string | number) => {
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
export const deleteRole = (roleId: string | number) => {
  return request.delete<boolean>(`/role/info/${roleId}`)
}

export const getRoleTree = (roleId: string | number) => {
  return request.get(`/role/info/tree/${roleId}`)
}


