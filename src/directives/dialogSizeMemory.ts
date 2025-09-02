import type { App, DirectiveBinding } from 'vue'
import { useDialogSizeStore } from '@/stores/dialogSize'

interface DialogSizeData {
  width: string
  height: string
  transform: string
  left: string
  top: string
}

/**
 * 全局Dialog尺寸记忆指令
 * 使用方法：v-dialog-size-memory="'unique-dialog-key'"
 */
export default {
  install(app: App) {
    app.directive('dialog-size-memory', {
      mounted(el: HTMLElement, binding: DirectiveBinding) {
        const dialogKey = binding.value
        if (!dialogKey || typeof dialogKey !== 'string') {
          console.warn('v-dialog-size-memory指令需要一个字符串值作为dialog的唯一标识')
          return
        }

        const dialogSizeStore = useDialogSizeStore()
        
        // 标记已处理的dialog
        el.dataset.sizeMemoryBound = '1'
        el.dataset.dialogKey = dialogKey

        // 监听dialog的显示和隐藏
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
              const isVisible = el.style.display !== 'none' && el.style.visibility !== 'hidden'
              
              if (isVisible) {
                // dialog显示时，应用保存的尺寸和位置
                applySavedSize(el, dialogKey, dialogSizeStore)
              } else {
                // dialog隐藏时，保存当前的尺寸和位置
                saveCurrentSize(el, dialogKey, dialogSizeStore)
              }
            }
          })
        })

        observer.observe(el, {
          attributes: true,
          attributeFilter: ['style']
        })

        // 监听dialog的关闭事件
        const closeButton = el.querySelector('.el-dialog__headerbtn')
        if (closeButton) {
          closeButton.addEventListener('click', () => {
            // 延迟保存，确保dialog完全关闭后再保存
            setTimeout(() => {
              saveCurrentSize(el, dialogKey, dialogSizeStore)
            }, 100)
          })
        }

        // 监听拖拽和调整大小事件
        let resizeObserver: ResizeObserver | null = null
        let mutationObserver: MutationObserver | null = null

        // 创建ResizeObserver监听尺寸变化
        resizeObserver = new ResizeObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.target === el) {
              // 延迟保存，避免频繁保存
              clearTimeout((el as any).saveTimeout)
              ;(el as any).saveTimeout = setTimeout(() => {
                saveCurrentSize(el, dialogKey, dialogSizeStore)
              }, 500)
            }
          })
        })

        resizeObserver.observe(el)

        // 监听transform变化（拖拽位置变化）
        mutationObserver = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
              // const style = window.getComputedStyle(el)
              // const _transform = style.transform
              
              // 延迟保存，避免频繁保存
              clearTimeout((el as any).saveTimeout)
              ;(el as any).saveTimeout = setTimeout(() => {
                saveCurrentSize(el, dialogKey, dialogSizeStore)
              }, 500)
            }
          })
        })

        mutationObserver.observe(el, {
          attributes: true,
          attributeFilter: ['style']
        })

        // 将observers保存到元素上，以便后续清理
        ;(el as any).sizeMemoryObservers = {
          resizeObserver,
          mutationObserver
        }
      },

      unmounted(el: HTMLElement) {
        // 清理observers
        const observers = (el as any).sizeMemoryObservers
        if (observers) {
          if (observers.resizeObserver) {
            observers.resizeObserver.disconnect()
          }
          if (observers.mutationObserver) {
            observers.mutationObserver.disconnect()
          }
        }

        // 清理timeout
        if ((el as any).saveTimeout) {
          clearTimeout((el as any).saveTimeout)
        }
      }
    })
  }
}

/**
 * 应用保存的尺寸和位置
 */
function applySavedSize(el: HTMLElement, dialogKey: string, dialogSizeStore: any) {
  const savedSize = dialogSizeStore.getDialogSize(dialogKey)
  if (!savedSize) return

  // 应用保存的尺寸
  if (savedSize.width) {
    el.style.width = savedSize.width
  }
  if (savedSize.height) {
    el.style.height = savedSize.height
  }
  if (savedSize.transform) {
    el.style.transform = savedSize.transform
  }
  if (savedSize.left) {
    el.style.left = savedSize.left
  }
  if (savedSize.top) {
    el.style.top = savedSize.top
  }
}

/**
 * 保存当前的尺寸和位置
 */
function saveCurrentSize(el: HTMLElement, dialogKey: string, dialogSizeStore: any) {
  const rect = el.getBoundingClientRect()
  const style = window.getComputedStyle(el)
  
  const sizeData: DialogSizeData = {
    width: rect.width + 'px',
    height: rect.height + 'px',
    transform: style.transform,
    left: style.left,
    top: style.top
  }
  
  dialogSizeStore.saveDialogSize(dialogKey, sizeData)
}
