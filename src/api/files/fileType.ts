import request from '@/utils/request.ts'
import type {FileType, FileTypeQuery} from '@/types/fileType.ts'
import {BaseVo, CommonVo, PageResponse} from "@/types/common.ts";


// 获取文件类型列表
export const getFileTypeList = (params: FileTypeQuery) => {

    const vo: BaseVo<FileType> = {
        pageNo: params.pageNum,
        pageSize: params.pageSize,
        data: {
            typeName: params.typeName,
            mimeType: params.mimeType,
            extension: params.extension,
            refuse: params.refuse,
            approve: params.approve
        }
    }
    return request.post<PageResponse<FileType>>('/mime/type/page', vo)
}

// 获取文件类型详情
export const getFileTypeDetail = (id: number) => {
    return request.get<FileType>(`/mime/type/${id}`)
}

// 新增文件类型
export const addFileType = (data: Omit<FileType, 'id'>)=> {
    return request.post<FileType>('/mime/type', data)
}

// 更新文件类型
export function updateFileType(data: FileType) {
    return request.post<FileType>(`/mime/type`, data)
}

// 删除文件类型
export function deleteFileType(id: number) {
    return request.delete(`/mime/type/${id}`)
}

// 批量删除文件类型
export function batchDeleteFileType(ids: number[]) {
    const vo: CommonVo<number[]> = {
        data: ids
    }
    return request.post<boolean>('/mime/type/batch/delete',vo)
}

// 更新文件类型状态
export function updateFileTypeStatus(id: number, status: number) {
    return request.put(`/mime/type/${id}/status`, {status})
}


// 获取许可文件类型
export const findAllowFileTypeList = () => {
    return request.get<FileType>(`/mime/type/allow/data`)
}

// 获取文件类型分组数据
export const getFileTypeGroupData = () => {
    return request.get<Record<string, string[]>>(`/mime/type/allow/group`)
}
