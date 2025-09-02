import request from '@/utils/request.ts'
import type { BaseVo, PageResponse } from "@/types/common.ts"
import { TaskConfig, TaskConfigParams } from '@/types/task'

// 任务配置查询参数接口
export interface TaskConfigQuery {
  taskName?: string
  runStatus?: number
  disabled?: number
  pageNum?: number
  pageSize?: number
}

// 查询任务配置列表
export const getTaskConfigPage = (vo: TaskConfigQuery) => {
  const baseVo: BaseVo<any> = {
    pageNo: vo.pageNum,
    pageSize: vo.pageSize,
    data: {
      taskName: vo.taskName,
      runStatus: vo.runStatus,
      disabled: vo.disabled
    }
  }
  return request.post<PageResponse<TaskConfig>>('/task/config/page', baseVo)
}

// 查询任务配置详情
export const getTaskConfigById = (id: string | number) => {
  return request.get<TaskConfig>(`/task/config/${id}`)
}

// 新增任务配置
export const createTaskConfig = (data: TaskConfig) => {
  return request.post<TaskConfig>('/task/config', data)
}

// 修改任务配置
export const updateTaskConfig = (data: TaskConfig) => {
  return request.post<TaskConfig>('/task/config', data)
}

// 删除任务配置
export const deleteTaskConfig = (id: string | number) => {
  return request.delete<boolean>(`/task/config/${id}`)
}

// 查询任务参数列表
export const getTaskConfigParams = (configId: string | number) => {
  return request.get<TaskConfigParams[]>(`/task/config/params/${configId}`)
}

// 更新任务参数
export const updateTaskConfigParams = (configId: string | number, params: TaskConfigParams[]) => {
  return request.put<boolean>(`/task/config/params/${configId}`, params)
}
