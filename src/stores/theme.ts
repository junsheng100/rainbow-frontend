import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 主题类型定义
export interface Theme {
  name: string
  label: string
  colors: {
    primary: string
    success: string
    warning: string
    danger: string
    info: string
    background: string
    text: string
    border: string
  }
  previewStyle: Record<string, any>
}

// 预设主题配置
export const presetThemes: Theme[] = [
  {
    name: 'default',
    label: '默认主题',
    colors: {
      primary: '#409EFF',
      success: '#67C23A',
      warning: '#E6A23C',
      danger: '#F56C6C',
      info: '#909399',
      background: '#F5F7FA',
      text: '#303133',
      border: '#DCDFE6'
    },
    previewStyle: {
      background: 'linear-gradient(45deg, #409EFF, #67C23A)'
    }
  },
  {
    name: 'dark',
    label: '深色主题',
    colors: {
      primary: '#409EFF',
      success: '#67C23A',
      warning: '#E6A23C',
      danger: '#F56C6C',
      info: '#909399',
      background: '#1F2937',
      text: '#F9FAFB',
      border: '#374151'
    },
    previewStyle: {
      background: 'linear-gradient(45deg, #1F2937, #374151)'
    }
  },
  {
    name: 'business',
    label: '商务主题',
    colors: {
      primary: '#2C3E50',
      success: '#E74C3C',
      warning: '#F39C12',
      danger: '#E74C3C',
      info: '#3498DB',
      background: '#ECF0F1',
      text: '#2C3E50',
      border: '#BDC3C7'
    },
    previewStyle: {
      background: 'linear-gradient(45deg, #2C3E50, #E74C3C)'
    }
  },
  {
    name: 'fresh',
    label: '清新主题',
    colors: {
      primary: '#27AE60',
      success: '#2ECC71',
      warning: '#F39C12',
      danger: '#E74C3C',
      info: '#9B59B6',
      background: '#F8F9FA',
      text: '#2C3E50',
      border: '#E9ECEF'
    },
    previewStyle: {
      background: 'linear-gradient(45deg, #27AE60, #F39C12)'
    }
  }
]

export const useThemeStore = defineStore('theme', () => {
  // 状态
  const currentTheme = ref<string>('default')
  const customColors = ref({
    primary: '#409EFF',
    success: '#67C23A',
    warning: '#E6A23C',
    danger: '#F56C6C',
    info: '#909399',
    background: '#F5F7FA',
    text: '#303133',
    border: '#DCDFE6'
  })
  const darkMode = ref(false)
  const autoTheme = ref(true)

  // 计算属性
  const activeTheme = computed(() => {
    return presetThemes.find(theme => theme.name === currentTheme.value) || presetThemes[0]
  })

  const themeColors = computed(() => {
    if (darkMode.value) {
      return {
        ...customColors.value,
        background: '#1F2937',
        text: '#F9FAFB',
        border: '#374151'
      }
    }
    return customColors.value
  })

  // 方法
  const setTheme = (themeName: string) => {
    currentTheme.value = themeName
    const theme = presetThemes.find(t => t.name === themeName)
    if (theme) {
      customColors.value = { ...theme.colors }
      applyTheme()
    }
  }

  const updateCustomColor = (colorType: string, colorValue: string) => {
    if (colorType in customColors.value) {
      customColors.value[colorType as keyof typeof customColors.value] = colorValue
      applyCustomColors()
    }
  }

  const toggleDarkMode = () => {
    darkMode.value = !darkMode.value
    applyDarkMode()
  }

  const applyTheme = () => {
    const root = document.documentElement
    const colors = themeColors.value

    // 应用主题色彩
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}-color`, value)
    })

    // 应用主题类名
    document.body.setAttribute('data-theme', currentTheme.value)
    
    // 保存到本地存储
    saveThemeToStorage()
  }

  const applyCustomColors = () => {
    const root = document.documentElement
    const colors = themeColors.value

    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}-color`, value)
    })

    saveThemeToStorage()
  }

  const applyDarkMode = () => {
    const root = document.documentElement
    
    if (darkMode.value) {
      root.style.setProperty('--background-color', '#1F2937')
      root.style.setProperty('--text-color', '#F9FAFB')
      root.style.setProperty('--border-color', '#374151')
      document.body.setAttribute('data-theme', 'dark')
    } else {
      root.style.setProperty('--background-color', customColors.value.background)
      root.style.setProperty('--text-color', customColors.value.text)
      root.style.setProperty('--border-color', customColors.value.border)
      document.body.setAttribute('data-theme', currentTheme.value)
    }

    saveThemeToStorage()
  }

  const saveThemeToStorage = () => {
    try {
      const themeData = {
        currentTheme: currentTheme.value,
        customColors: customColors.value,
        darkMode: darkMode.value,
        autoTheme: autoTheme.value
      }
      localStorage.setItem('rainbow-view-theme', JSON.stringify(themeData))
    } catch (error) {
      console.error('保存主题设置失败:', error)
    }
  }

  const loadThemeFromStorage = () => {
    try {
      const themeData = localStorage.getItem('rainbow-view-theme')
      if (themeData) {
        const data = JSON.parse(themeData)
        currentTheme.value = data.currentTheme || 'default'
        customColors.value = { ...customColors.value, ...data.customColors }
        darkMode.value = data.darkMode || false
        autoTheme.value = data.autoTheme !== false
        
        // 应用加载的主题
        applyTheme()
      }
    } catch (error) {
      console.error('加载主题设置失败:', error)
    }
  }

  const resetToDefault = () => {
    currentTheme.value = 'default'
    customColors.value = { ...presetThemes[0].colors }
    darkMode.value = false
    applyTheme()
  }

  // 初始化时加载主题
  loadThemeFromStorage()

  return {
    // 状态
    currentTheme,
    customColors,
    darkMode,
    autoTheme,
    
    // 计算属性
    activeTheme,
    themeColors,
    
    // 方法
    setTheme,
    updateCustomColor,
    toggleDarkMode,
    applyTheme,
    applyCustomColors,
    applyDarkMode,
    resetToDefault,
    loadThemeFromStorage
  }
})
