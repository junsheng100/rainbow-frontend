import { getDicts } from '@/api/dict/data'
import type { AxiosResponse } from 'axios'
import { ref } from 'vue'

export function useDict(...args: string[]) {
  const res = ref<Record<string, any>>({})
  return (() => {
    args.forEach((dictType) => {
      res.value[dictType] = []
      getDicts(dictType).then((resp: AxiosResponse) => {
        res.value[dictType] = resp.data.map((p: any) => ({
          label: p.dictLabel,
          value: p.dictValue,
          elTagType: p.listClass,
          elTagClass: p.cssClass
        }))
      })
    })
    return res.value
  })()
}
