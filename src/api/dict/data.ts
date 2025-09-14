import request from '@/utils/request'
import type {BaseVo} from "@/types/common.ts";

export interface SysDictData {
  dictCode?: number
  dictLabel: string
  dictType: string
  dictValue: string
  dictName?: string
  dictSort: number
  status: string
  remark?: string
  disabled?: string
  isDefault: 'Y' | 'N'
}

export interface SysDictDataParams {
  pageNum: number
  pageSize: number
  dictLabel?: string
  dictType?: string
  dictValue?: string
}


// 查询字典数据列表
export const listData = (params: SysDictDataParams) => {

  const vo: BaseVo<SysDictData> = {
    pageNo: params.pageNum,
    pageSize: params.pageSize,
    data: {
      dictLabel: params.dictLabel,
      dictType: params.dictType
    }
  }
  return request.post('/dict/data/page', vo)
}

// 查询字典数据详细
export function getData(dictCode: number) {
  return request.get(`/dict/data/${dictCode}`)
}

// 根据字典类型查询字典数据信息
export const getDicts =(dictType: string) => {
  return request.get(`/dict/data/type/${dictType}`)
}

// 新增字典数据
export const addData =(data: SysDictData) =>{
  return request.post('/dict/data', data)
}

// 修改字典数据
export const updateData =(data: SysDictData) => {
  return request.post('/dict/data',data)
}

// 删除字典数据
export const delData = (dictCodes: number | number[]) => {
  return request.delete(`/dict/data/${dictCodes}`)
}
