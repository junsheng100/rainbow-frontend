import request from '@/utils/request'
import type {BaseVo} from "@/types/common.ts";

export interface SysDictType {
  dictId?: number
  dictName: string
  dictType: string
  orderNum: number
  disabled: string
  remark: string
}

export interface SysDictTypeParams {
  pageNum: number
  pageSize: number
  dictName?: string,
  dictType?: string
}

// 查询字典类型列表
export const listType = (params: SysDictTypeParams) => {
  const vo: BaseVo<SysDictType> = {
    pageNo: params.pageNum,
    pageSize: params.pageSize,
    data: {
      dictName: params.dictName,
      dictType: params.dictType
    }
  }
  return request.post('/dict/type/page', vo)
}

// 查询字典类型详细
export const getType = (dictId: number) => {

  return request.get<SysDictType>(`/dict/type/${dictId}`);

}

// 新增字典类型
export const addType = (data: SysDictType) => {
  return request.post('/dict/type', data)
}

// 修改字典类型
export const updateType = (data: SysDictType) => {
  return request.post('/dict/type', data)
}

// 删除字典类型
export const delType = (dictIds: number | number[]) => {
  return request.delete(`/dict/type/delete/${dictIds}`);
}

// 刷新字典缓存
export const refreshCache = () => {
  return request.delete(`/dict/type/refreshCache`);
}

// 修改字典类型状态
export const changeDisabled = (dictId: number, disabled: string) => {
  return request.put(`/dict/type/disabled/${dictId}/${disabled}`)
}

// 获取字典选择框列表
export const optionselect = () => {
  return request.get<SysDictType>(`/dict/type/options`);
}
