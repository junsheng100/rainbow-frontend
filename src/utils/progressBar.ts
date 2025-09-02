import NProgress from 'nprogress'

class ProgressBarManager {
  private static instance: ProgressBarManager
  private isStarted = false
  private timeoutId: NodeJS.Timeout | null = null

  private constructor() {
    // 配置 NProgress
    NProgress.configure({
      showSpinner: false,
      minimum: 0.1,
      speed: 500,
      trickleSpeed: 200
    })
  }

  static getInstance(): ProgressBarManager {
    if (!ProgressBarManager.instance) {
      ProgressBarManager.instance = new ProgressBarManager()
    }
    return ProgressBarManager.instance
  }

  // 开始进度条
  start(): void {
    if (!this.isStarted) {
      this.isStarted = true
      NProgress.start()
      
      // 设置超时保护，防止进度条卡住
      this.timeoutId = setTimeout(() => {
        this.forceComplete()
      }, 10000) // 10秒超时
    }
  }

  // 完成进度条
  done(): void {
    if (this.isStarted) {
      this.isStarted = false
      NProgress.done()
      
      // 清除超时
      if (this.timeoutId) {
        clearTimeout(this.timeoutId)
        this.timeoutId = null
      }
    }
  }

  // 强制完成进度条
  forceComplete(): void {
    console.warn('进度条超时，强制完成')
    this.isStarted = false
    NProgress.done()
    
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
  }

  // 检查状态
  isInProgress(): boolean {
    return this.isStarted
  }

  // 重置状态
  reset(): void {
    this.isStarted = false
    NProgress.done()
    
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
  }
}

// 导出单例实例
export const progressBar = ProgressBarManager.getInstance()

// 导出便捷方法
export const startProgress = () => progressBar.start()
export const stopProgress = () => progressBar.done()
export const resetProgress = () => progressBar.reset() 