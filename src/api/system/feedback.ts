import request from '@/utils/request'
import {BaseVo, CommonVo, PageResponse} from '@/types/common'

export interface FeedbackInfo {
  id?: string
  title: string
  content: string
  stage: number // 0:待处理 1:处理中 2:已完成
  reply?: string
  fcd?: string
  replyTime?: string
  replyBy?: string
}

export interface FeedbackQuery {
  title?: string
  stage?: number
  startTime?: string
  endTime?: string
  pageNum?: number
  pageSize?: number
}

// 查询反馈列表
export const getFeedbackList = (params: FeedbackQuery) => {
  const vo: BaseVo<FeedbackQuery> = {
    pageNo: params.pageNum,
    pageSize: params.pageSize,
    data: {
      title: params.title,
      stage: params.stage,
      startTime: params.startTime ? params.startTime+' 00:00:00' : undefined,
      endTime:  params.endTime ? params.endTime+' 23:59:59' : undefined
    }
  }
  return request.post<PageResponse<FeedbackInfo>>('/feedback/page', vo)
}

// 查询反馈详细
export const getFeedbackDetail = (id: string) => {
  return request.get<FeedbackInfo>(`/feedback/${id}`)
}

// 新增反馈
export const createFeedback = (data: FeedbackInfo) => {
  return request.post<FeedbackInfo>('/feedback', data)
}

// 修改反馈
export const updateFeedback = (data: FeedbackInfo) => {
  return request.post<FeedbackInfo>('/feedback', data)
}

//回复反馈
export const replyFeedback = (data: FeedbackInfo) => {
  const stage = data.stage === 2 ? 2 : 1
  data.stage = stage
  return request.post<FeedbackInfo>(`/feedback/reply`,data)
}

// 删除反馈
export const deleteFeedback = (id: string) => {
  return request.delete<boolean>(`/feedback/${id}`)
}

// 批量删除反馈
export const batchDeleteFeedback = (ids: string []) => {
  const vo: CommonVo<string[]> = {
    data: ids
  }
  return request.post<boolean>('/feedback/batch/delete',vo)
}
