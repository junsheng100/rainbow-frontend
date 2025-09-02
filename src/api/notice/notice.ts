import request from '@/utils/request.ts'
import {BaseVo, CommonVo, PageResponse} from "@/types/common.ts"

export interface NoticeInfo {
  noticeId: number
  noticeTitle: string
  noticeType: string
  noticeContent: string
  deptCount: number
  userCount: number
  readCount: number
  status: string // '0'正常 '1'关闭
  pushType?: string
  deptIds?: number[]
  userIds?: string[]
  fcd?: string
  fcu?: string
  lcd?: string
  lcu?: string
}

export interface NoticeQuery {
  noticeTitle?: string
  noticeType?: string
  status?: string
  fcu?: string
  pageNum?: number
  pageSize?: number
}

export interface NoticePushParams {
  noticeId: number
  noticeTitle: string
  pushTime: string
  pushType: string // '0'全部用户 '1'指定部门 '2'指定用户
  deptIds?: number[]
  userIds?: string[]
}

// 查询公告列表
export const listNotice = (params: NoticeQuery) => {
  const vo: BaseVo<NoticeInfo> = {
    pageNo: params.pageNum,
    pageSize: params.pageSize,
    data: {
      noticeTitle: params.noticeTitle,
      noticeType: params.noticeType,
      status: params.status,
      fcu: params.fcu
    }
  }
  return request.post<PageResponse<NoticeInfo>>('/notice/info/page', vo)
}

export const willListNotice = (params: NoticeQuery) => {
  const vo: BaseVo<NoticeInfo> = {
    pageNo: params.pageNum,
    pageSize: params.pageSize,
    data: {
      status: params.status
    }
  }
  return request.post<PageResponse<NoticeInfo>>('/notice/info/page/will', vo)
}

// 查询公告详细
export const getNotice = (noticeId: number ) => {
  return request.get<NoticeInfo>(`/notice/info/${noticeId}`)
}

// 阅读公告详细
export const readNotice = (noticeId: number ) => {
  return request.post<NoticeInfo>(`/notice/info/read/${noticeId}`)
}

// 新增公告
export const addNotice = (data: NoticeInfo) => {
  return request.post<NoticeInfo>('/notice/info', data)
}

// 修改公告
export const updateNotice = (data: NoticeInfo) => {
  return request.post<NoticeInfo>('/notice/info', data)
}

// 删除公告
export const delNotice = (ids: number[]) => {
  const vo: CommonVo<number[]> = {
    data: ids
  }
  return request.post<boolean>('/notice/info/batch/delete', vo)

}
// 推送公告
export const pushNotice = (data: NoticePushParams) => {
  return request.post<boolean>('/notice/push/plan', data)
}
