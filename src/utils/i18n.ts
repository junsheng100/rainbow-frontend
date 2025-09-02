import { i18n } from '@/i18n'
import { App } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import en from 'element-plus/dist/locale/en.mjs'

export function setLanguage(lang: 'zh-CN' | 'en-US', app: App) {
  if (lang === undefined) {
    const storedLang = localStorage.getItem('language')
    lang = (storedLang === 'zh-CN' || storedLang === 'en-US') ? storedLang : 'zh-CN'
  }

  localStorage.setItem('language', lang)

  // 设置 i18n 语言
  if (lang !== 'zh-CN' && lang !== 'en-US') {
    console.warn(`Invalid language: ${lang}, defaulting to 'zh-CN'`)
    lang = 'zh-CN'
  }
  i18n.global.locale.value = lang

  // 设置 ElementPlus 语言
  app.use(ElementPlus, {
    locale: lang === 'zh-CN' ? zhCn : en
  })

  // 设置 html lang 属性
  document.querySelector('html')?.setAttribute('lang', lang)

  return lang
}

// 获取当前语言
export function getLanguage(): 'zh-CN' | 'en-US' {
  const lang = localStorage.getItem('language') || 'zh-CN'
  return lang === 'zh-CN' || lang === 'en-US' ? lang : 'zh-CN'
}
