import request from '@/utils/request.ts'
import type { BaseVo, PageResponse } from "@/types/common.ts"

export interface PostInfo {
  postId?: number
  postCode: string
  postName: string
  orderNum: number
  status: string // '0'正常 '1'停用
  overview?: string // 岗位简介
  fcd?: string
  fcu?: string
  lcd?: string
  lcu?: string
}

export interface PostQuery {
  postCode?: string
  postName?: string
  status?: string
  pageNum?: number
  pageSize?: number
}

// 查询岗位列表
export const getPostList = (params: PostQuery) => {
  const vo: BaseVo<PostInfo> = {
    pageNo: params.pageNum,
    pageSize: params.pageSize,
    data: {
      postCode: params.postCode,
      postName: params.postName,
      status: params.status
    }
  }
  return request.post<PageResponse<PostInfo>>('/post/info/page', vo)
}

// 查询岗位详细
export const getPost = (postId: number) => {
  return request.get<PostInfo>(`/post/info/${postId}`)
}

// 新增岗位
export const createPost = (data: PostInfo) => {
  return request.post<PostInfo>('/post/info', data)
}

// 修改岗位
export const updatePost = (data: PostInfo) => {
  return request.post<PostInfo>('/post/info', data)
}

// 删除岗位
export const deletePost = (postId: string | number | (string | number)[]) => {
  return request.delete<boolean>(`/post/info/${typeof postId === 'object' ? postId.join(',') : postId}`)
}
