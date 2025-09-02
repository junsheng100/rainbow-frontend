import { onMounted, nextTick } from 'vue'

/**
 * 窗口模式下的数据加载处理
 * @param callback 数据加载回调函数
 * @param delay 延迟时间，默认100ms
 */
export function useWindowMode(callback: () => void, delay: number = 100) {
  onMounted(async () => {
    // 检查是否在窗口模式下运行
    const isWindowMode = (window as any).isWindowMode || false
    
    if (isWindowMode) {
      // 在窗口模式下，延迟加载数据，确保组件完全挂载
      await nextTick()
      setTimeout(callback, delay)
    } else {
      // 正常模式下直接加载
      callback()
    }
  })
}

/**
 * 检查当前是否在窗口模式下运行
 */
export function isWindowMode(): boolean {
  return (window as any).isWindowMode || false
} 