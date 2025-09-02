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
export const getTaskList = (params: TaskConfigQuery) => {
  const vo: BaseVo<any> = {
    pageNo: params.pageNum,
    pageSize: params.pageSize,
    data: {
      taskName: params.taskName,
      runStatus: params.runStatus,
      disabled: params.disabled
    }
  }
  return request.post<PageResponse<TaskConfig>>('/task/config/page', vo)
}

// 查询任务配置详情
export const getTaskById = (id: string) => {
  return request.get<TaskConfig>(`/task/config/${id}`)
}

// 新增任务配置
export const addTask = (data: TaskConfig) => {
  return request.post<TaskConfig>('/task/config', data)
}

// 修改任务配置
export const updateTask = (data: TaskConfig) => {
  return request.post<TaskConfig>('/task/config', data)
}

// 删除任务配置
export const deleteTask = (id: string) => {
  return request.delete<boolean>(`/task/config/${id}`)
}

// 查询任务参数列表
export const getTaskParams = (configId: string) => {
  return request.get<TaskConfigParams[]>(`/task/config/params/${configId}`)
}

// 更新任务参数
export const updateTaskParams = (configId: string, params: TaskConfigParams[]) => {
  return request.put<boolean>(`/task/config/params/${configId}`, params)
}
