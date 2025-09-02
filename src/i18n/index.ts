import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'

const messages = {
  'zh-CN': zhCN,
  'en-US': enUS
}

export const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: localStorage.getItem('language') || 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages
})
