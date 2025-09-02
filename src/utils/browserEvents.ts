export function setupBrowserEvents() {
  // 保留事件监听器结构但不再执行任何操作
  window.addEventListener('beforeunload', () => {})
  document.addEventListener('visibilitychange', () => {})
}
