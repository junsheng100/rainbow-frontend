import request from '@/utils/request.ts'
import {TemplateConfig, TemplateConfigQuery} from "@/types/template.ts";
import {TemplateEntity, TemplateEntityQuery} from "@/types/template.ts";
import {TemplateField, TemplateFieldQuery} from "@/types/template.ts";
import {TemplateData, TemplateDataQuery} from "@/types/template.ts";
import {DataTypeInfo} from "@/api/template/dataType.ts";
import {PageResponse} from "@/types/common.ts";

// 模板配置相关接口
export const getTemplateConfigPage = (vo: TemplateConfigQuery) => {
  return request.post<PageResponse<TemplateConfig>>('/template/config/page', vo)
}

export const getTemplateConfigData = () => {
  return request.post<TemplateConfig[]>('/template/config/data')
}

export const createTemplateConfig = (data: TemplateConfig) => {
  return request.post<TemplateConfig>('/template/config', data)
}

export const updateTemplateConfig = (data: TemplateConfig) => {
  return request.post<TemplateConfig>('/template/config', data)
}

export const deleteTemplateConfig = (id: string | number) => {
  return request.delete<boolean>(`/template/config/${id}`)
}

export const batchDeleteTemplateConfig = (vo: {ids: (string | number)[]}) => {
  return request.post<boolean>('/template/config//batch/delete', vo)
}

export const getTemplateConfigById = (id: string | number) => {
  return request.get<TemplateConfig>(`/template/config/${id}`)
}

// 模板实体相关接口
export const getTemplateEntityPage = (vo: TemplateEntityQuery) => {
  return request.post<PageResponse<TemplateEntity>>('/template/entity/page', vo)
}

export const getTemplateEntityData = () => {
  return request.post<TemplateEntity[]>('/template/entity/data')
}

export const createTemplateEntity = (data: TemplateEntity) => {
  return request.post<TemplateEntity>('/template/entity', data)
}

export const updateTemplateEntity = (data: TemplateEntity) => {
  return request.post<TemplateEntity>('/template/entity', data)
}

export const deleteTemplateEntity = (id: string | number) => {
  return request.delete(`/template/entity/${id}`)
}

export const getTemplateEntityById = (id: string | number) => {
  return request.get<TemplateEntity>(`/template/entity/${id}`)
}

export const getTemplateFieldType = (entityId: string | number) => {
  return request.get<DataTypeInfo[]>(`/template/field/type/${entityId}`)
}

// 模板字段相关接口
export const getTemplateFieldList = (vo: TemplateFieldQuery) => {
  return request.post<TemplateField[]>('/template/field/list', vo)
}

export const createTemplateField = (data: TemplateField) => {
  return request.post<TemplateField>('/template/field', data)
}

export const updateTemplateField = (data: TemplateField) => {
  return request.post<TemplateField>('/template/field', data)
}

export const deleteTemplateField = (id: string | number) => {
  return request.delete<boolean>(`/template/field/${id}`)
}

// 模板数据相关接口
export const getTemplateDataPage = (vo: TemplateDataQuery) => {
  return request.post<PageResponse<TemplateData>>('/template/result/page', vo)
}

export const createTemplateData = (data: TemplateData) => {
  return request.post<TemplateData>('/template/result', data)
}

export const updateTemplateData = (data: TemplateData) => {
  return request.post<TemplateData>('/template/result', data)
}

export const deleteTemplateData = (id: string | number) => {
  return request.delete<boolean>(`/template/result/${id}`)
}

export const batchDeleteTemplateData = (vo: {ids: (string | number)[]}) => {
  return request.post<boolean>('/template/result/batch/delete', vo)
}


