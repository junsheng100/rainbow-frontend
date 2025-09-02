import { defineStore } from 'pinia'

interface DialogSizeData {
  width: string
  height: string
  transform: string
  left: string
  top: string
}

interface DialogSizeState {
  dialogSizes: Record<string, DialogSizeData>
}

export const useDialogSizeStore = defineStore('dialogSize', {
  state: (): DialogSizeState => ({
    dialogSizes: {}
  }),

  actions: {
    /**
     * 保存dialog的尺寸和位置信息
     * @param dialogKey dialog的唯一标识
     * @param sizeData 尺寸和位置数据
     */
    saveDialogSize(dialogKey: string, sizeData: DialogSizeData) {
      this.dialogSizes[dialogKey] = sizeData
      
      // 同时保存到localStorage，以便页面刷新后保持
      try {
        const storageKey = `dialog_size_${dialogKey}`
        localStorage.setItem(storageKey, JSON.stringify(sizeData))
      } catch (error) {
        console.warn('保存dialog尺寸到localStorage失败:', error)
      }
    },

    /**
     * 获取dialog的尺寸和位置信息
     * @param dialogKey dialog的唯一标识
     * @returns 尺寸和位置数据，如果不存在则返回null
     */
    getDialogSize(dialogKey: string): DialogSizeData | null {
      // 先从内存中获取
      if (this.dialogSizes[dialogKey]) {
        return this.dialogSizes[dialogKey]
      }
      
      // 如果内存中没有，尝试从localStorage获取
      try {
        const storageKey = `dialog_size_${dialogKey}`
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          const sizeData = JSON.parse(stored) as DialogSizeData
          // 保存到内存中
          this.dialogSizes[dialogKey] = sizeData
          return sizeData
        }
      } catch (error) {
        console.warn('从localStorage获取dialog尺寸失败:', error)
      }
      
      return null
    },

    /**
     * 删除dialog的尺寸和位置信息
     * @param dialogKey dialog的唯一标识
     */
    removeDialogSize(dialogKey: string) {
      delete this.dialogSizes[dialogKey]
      
      // 同时从localStorage中删除
      try {
        const storageKey = `dialog_size_${dialogKey}`
        localStorage.removeItem(storageKey)
      } catch (error) {
        console.warn('从localStorage删除dialog尺寸失败:', error)
      }
    },

    /**
     * 清除所有dialog的尺寸和位置信息
     */
    clearAllDialogSizes() {
      this.dialogSizes = {}
      
      // 同时清除localStorage中的所有dialog尺寸数据
      try {
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.startsWith('dialog_size_')) {
            localStorage.removeItem(key)
          }
        })
      } catch (error) {
        console.warn('清除localStorage中的dialog尺寸失败:', error)
      }
    },

    /**
     * 重置dialog的尺寸和位置信息
     * @param dialogKey dialog的唯一标识
     */
    resetDialogSize(dialogKey: string) {
      this.removeDialogSize(dialogKey)
    },

    /**
     * 获取所有dialog的尺寸信息
     * @returns 所有dialog的尺寸信息
     */
    getAllDialogSizes(): Record<string, DialogSizeData> {
      return { ...this.dialogSizes }
    }
  }
})
