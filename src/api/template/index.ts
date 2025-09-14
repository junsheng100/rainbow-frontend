import request from '@/utils/request'
import {TemplateConfig, TemplateData, TemplateEntity, TemplateField, TemplateQueryParams} from './types'
import {BaseVo, CommonVo, PageResponse} from "@/types/common.ts";
import {DataTypeInfo} from "@/api/template/dataType.ts";

// 模板配置相关API
export const getTemplateConfigList = (params: TemplateQueryParams) => {
    const vo: BaseVo<TemplateConfig> = {
        pageNo: params.pageNum,
        pageSize: params.pageSize,
        data: {
            name: params.name
        }
    }
    return request.post<PageResponse<TemplateConfig>>('/template/config/page', vo)
}

export const getConfigList = () => {
    return request.post<TemplateConfig[]>('/template/config/data')
}

export const addTemplateConfig = (data: TemplateConfig) => {
    return request.post<TemplateConfig>('/template/config', data)
}

export const updateTemplateConfig = (data: TemplateConfig) => {
    return request.post<TemplateConfig>('/template/config', data)
}

export const deleteTemplateConfig = (id: string) => {

    return request.delete<boolean>(`/template/config/${id}`)
}

export const batchDeleteTemplateConfig = (ids: string[]) => {
    const vo: CommonVo<string[]> = {
        data: ids
    }
    return request.post<boolean>('/template/config//batch/delete', vo)
}

// 获取单个模板配置
export function getTemplateConfigById(id: string) {
    return request.get<TemplateConfig>(`/template/config/${id}`)
}

// 模板实体类相关API
export const getTemplateEntityList = (params: TemplateQueryParams) => {

    const vo: BaseVo<TemplateEntity> = {
        pageNo: params.pageNum,
        pageSize: params.pageSize,
        data: {
            entityName: params.name
        }
    }
    return request.post<PageResponse<TemplateEntity>>('/template/entity/page', vo)
}

export const getEntityList = () => {
    return request.post<TemplateEntity[]>('/template/entity/data')
}

export const addTemplateEntity = (data: TemplateEntity) => {
    return request.post<TemplateEntity>('/template/entity', data)
}

export const updateTemplateEntity = (data: TemplateEntity) => {
    return request.post<TemplateEntity>('/template/entity', data)
}

export const deleteTemplateEntity = (id: string) => {
    return request.delete(`/template/entity/${id}`)
}

// 获取单个实体类详情
export function getTemplateEntityById(id: string) {
    return request.get<TemplateEntity>(`/template/entity/${id}`)
}
export function getDataTypeById(entityId: string) {
    return request.get<DataTypeInfo[]>(`/template/field/type/${entityId}`)
}

// 模板字段相关API
export const getTemplateFieldList = (params: { entityId: string }) => {
    const vo: BaseVo<TemplateField> = {
        data: {
            "entityId": params.entityId
        }
    }
    return request.post<TemplateField[]>('/template/field/list', vo)
}




export const addTemplateField = (data: TemplateField) => {
    return request.post<TemplateField>('/template/field', data)
}

export const updateTemplateField = (data: TemplateField) => {
    return request.post<TemplateField>('/template/field', data)
}

export const deleteTemplateField = (id: string) => {
    return request.delete<boolean>(`/template/field/${id}`)
}

// 模板数据相关API
export const getTemplateDataList = (params: TemplateQueryParams) => {
    const vo: BaseVo<TemplateData> = {
        pageNo: params.pageNum,
        pageSize: params.pageSize,
        data: {
            fileName: params.name
        }
    }
    return request.post<PageResponse<TemplateData>>('/template/result/page', vo)
}


export const addTemplateData = (data: TemplateData) => {
    return request.post<TemplateData>('/template/result', data)
}

export const updateTemplateData = (data: TemplateData) => {
    return request.post<TemplateData>('/template/result', data)
}

export const deleteTemplateData = (id: string) => {
    return request.delete<boolean>(`/template/result/${id}`)
}

export const batchDeleteTemplateData = (ids: string[]) => {
    const vo: CommonVo<string[]> = {
        data: ids
    }
    return request.post<boolean>('/template/result/batch/delete', vo)
}


