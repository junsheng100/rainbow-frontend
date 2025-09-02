// 扩展 Window 接口
export {}

declare global {
  interface Window {
    __MICRO_APP_ENVIRONMENT__?: boolean
    microApp?: {
      dispatch: (data: { type: string }) => void
    }
  }
}


