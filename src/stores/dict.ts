import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SysDictType, SysDictTypeParams } from '@/api/dict/type'
import type { SysDictData, SysDictDataParams } from '@/api/dict/data'
import {
  listType,
  addType,
  updateType,
  delType,
  refreshCache
} from '@/api/dict/type'
import {
  listData,
  addData,
  updateData,
  delData
} from '@/api/dict/data'

export const useDictStore = defineStore('dict', () => {
  // 状态
  const currentDictType = ref<string | null>(null)
  const dictTypeList = ref<SysDictType[]>([])
  const dictDataList = ref<SysDictData[]>([])
  const dictTypeTotal = ref(0)
  const dictDataTotal = ref(0)
  const loading = ref(false)

  // 设置当前字典类型
  const setCurrentDictType = (type: string | null) => {
    currentDictType.value = type
  }

  // 加载字典类型列表
  const loadDictTypeList = async (params: SysDictTypeParams) => {
    try {
      loading.value = true
      const res = await listType(params)
      dictTypeList.value = res.content
      dictTypeTotal.value = res.total
    } finally {
      loading.value = false
    }
  }

  // 加载字典数据列表
  const loadDictDataList = async (params: SysDictDataParams) => {
    if (!currentDictType.value) return

    try {
      loading.value = true
      const res = await listData({
        ...params,
        dictType: currentDictType.value
      })
      dictDataList.value = res.content
      dictDataTotal.value = res.total
    } finally {
      loading.value = false
    }
  }

  // 新增字典类型
  const createDictType = async (data: SysDictType) => {
    console.log("#####:SysDictType:",JSON.stringify(data))
    await addType(data)
  }

  // 更新字典类型
  const updateDictType = async (data: SysDictType) => {
    await updateType(data)
  }

  // 删除字典类型
  const deleteDictType = async (ids: number | number[]) => {
    await delType(ids)
  }

  // 新增字典数据
  const createDictData = async (data: SysDictData) => {
    await addData(data)
  }

  // 更新字典数据
  const updateDictData = async (data: SysDictData) => {
    await updateData(data)
  }

  // 删除字典数据
  const deleteDictData = async (codes: number | number[]) => {
    await delData(codes)
  }

  // 刷新字典缓存
  const refreshDictCache = async () => {
    await refreshCache()
  }

  // 刷新字典数据列表
  const refreshDictData = () => {
    if (currentDictType.value) {
      loadDictDataList({
        pageNum: 1,
        pageSize: 10,
        dictType: currentDictType.value
      })
    }
  }

  return {
    currentDictType,
    dictTypeList,
    dictDataList,
    dictTypeTotal,
    dictDataTotal,
    loading,
    setCurrentDictType,
    loadDictTypeList,
    loadDictDataList,
    createDictType,
    updateDictType,
    deleteDictType,
    createDictData,
    updateDictData,
    deleteDictData,
    refreshDictCache,
    refreshDictData
  }
})
