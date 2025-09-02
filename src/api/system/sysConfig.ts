import request from "@/utils/request.ts"
import {BaseVo,PageResponse} from "@/types/common.ts"

// 系统配置接口
export interface SysConfig {
  configId?: number
  configName: string
  configKey: string
  configValue: string
  orderNum: number
  fcd?: string
  lcd?: string
  status?: string
}

// 系统配置查询参数
export interface SysConfigQueryParams {
  page: number
  size: number
  configName?: string
  configKey?: string
  configValue?: string
  status?: string
}



// 获取系统配置分页列表
export const getSysConfigPage = (params: SysConfigQueryParams) => {
  const vo: BaseVo<SysConfig> =  {
    pageNo: params.page,
    pageSize: params.size,
    data: {
      configName: params.configName,
      configKey: params.configKey,
      configValue: params.configValue,
      status: params.status
    }
  }

  return request.post<PageResponse<SysConfig>>('/config/page', vo)
}

// 获取系统配置详情
export const getSysConfigDetail = (id: number) => {
  return request.get<SysConfig>(`/config/${id}`)
}

// 创建系统配置
export const createSysConfig = (data: Partial<SysConfig>) => {
  return request.post<SysConfig>('/config', data)
}

// 更新系统配置
export const updateSysConfig = (data: SysConfig) => {
  return request.post<SysConfig>('/config', data)
}

// 删除系统配置
export const deleteSysConfig = (id: number) => {
  return request.delete<boolean>(`/config/${id}`)
}

// 获取所有系统配置列表
export const getSysConfigList = () => {
  const vo: BaseVo<SysConfig> = {}

  return request.post<SysConfig[]>('/config/list', vo)
}
