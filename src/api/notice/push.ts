import request from '@/utils/request.ts'
import {BaseVo, CommonVo, PageResponse} from "@/types/common.ts"

// 消息推送记录查询参数
export interface PushQuery {
    pushId?: string
    noticeId?: number
    noticeTitle?: string
    pushType?: string
    isPush?: number
    pageNum?: number
    pageSize?: number
}

// 消息推送记录信息
export interface PushInfo {
    pushId?: string
    noticeId?: number
    noticeTitle?: string
    pushType?: string // '0'全部 '1'部门 '2'用户
    pushTime?: string
    isPush?: number // '0'待推送 '1'已推送 '2'推送失败
    deptName?: string
    userName?: string
    nickname?: string
    fcu?: string
    fcd?: string
    lcu?: string
    lcd?: string
}

// 查询推送记录列表
export const listPush = (params: PushQuery) => {
    const vo: BaseVo<PushInfo> = {
        pageNo: params.pageNum,
        pageSize: params.pageSize,
        data: {
            noticeId: params.noticeId,
            pushType: params.pushType,
            isPush: params.isPush
        }
    }
    return request.post<PageResponse<PushInfo>>('/notice/push/page', vo)
}

// 查询推送记录详细
export const getPush = (pushId: string) => {
    return request.get<PushInfo>(`/notice/push/${pushId}`)
}

export const countWillPush = () => {
    return request.get<number>(`/notice/push/will/total`)
}

// 新增推送记录
export const addPush = (data: PushInfo) => {
    return request.post<PushInfo>('/notice/push', data)
}

// 修改推送记录
export const updatePush = (data: PushInfo) => {
    return request.put<PushInfo>('/notice/push', data)
}

// 删除推送记录
export const delPush = (pushId: string) => {
    return request.delete<boolean>(`/notice/push/${pushId}`)
}


export const batchDeletePush = (ids: string[]) => {
    const vo: CommonVo<string[]> = {
        data: ids
    }
    return request.post<boolean>('/notice/push/batch/delete', vo)
}

// 取消推送
export const cancelPush = (pushId: string ) => {
    return request.post<boolean>(`/notice/push/cancel/${pushId}`)
}

// 立即推送
export const executePush = (pushId:  string) => {
    return request.post<boolean>(`/notice/push/execute/${pushId}`)
}
