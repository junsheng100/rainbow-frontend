import type { RouteRecordRaw } from 'vue-router'

export interface CustomRouteRecordRaw extends RouteRecordRaw {
  meta: {
    icon?: string
    hidden?: boolean
    [key: string]: any
  }
}
