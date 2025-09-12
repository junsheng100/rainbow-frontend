import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

// 类型定义
export interface HeaderStyle {
  height: string
  background: string
  shadow: string
  textColor: string
}

export interface TabsStyle {
  height: string
  background: string
  borderColor: string
  activeColor: string
}

export interface Background {
  type: 'color' | 'image' | 'animation'
  color: string
  image: string
  animation: string
  opacity: number
}

export interface Typography {
  fontFamily: string
  fontSize: string
  fontWeight: string
  lineHeight: number
  letterSpacing: string
}

export interface UserStyle {
  menuPosition: 'left' | 'right' | 'top'
  menuCollapsed: boolean
  headerStyle: HeaderStyle
  tabsStyle: TabsStyle
  background: Background
  typography: Typography
}

export const useUserStyleStore = defineStore('userStyle', () => {
  // 状态
  const menuPosition = ref<'left' | 'right' | 'top'>('left')
  const menuCollapsed = ref(false)
  
  const headerStyle = reactive<HeaderStyle>({
    height: '60px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    shadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    textColor: '#ffffff'
  })
  
  const tabsStyle = reactive<TabsStyle>({
    height: '40px',
    background: '#ffffff',
    borderColor: '#e4e7ed',
    activeColor: '#409eff'
  })
  
  const background = reactive<Background>({
    type: 'color',
    color: '#f8f9fa',
    image: '',
    animation: 'particles',
    opacity: 1
  })
  
  const typography = reactive<Typography>({
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: '14px',
    fontWeight: '400',
    lineHeight: 1.5,
    letterSpacing: '0'
  })

  // 方法
  const updateMenuPosition = (position: 'left' | 'right' | 'top') => {
    menuPosition.value = position
    applyMenuPosition()
    saveUserStyleToStorage()
  }

  const toggleMenuCollapsed = () => {
    menuCollapsed.value = !menuCollapsed.value
    applyMenuCollapsed()
    saveUserStyleToStorage()
  }

  const updateHeaderStyle = (style: Partial<HeaderStyle>) => {
    Object.assign(headerStyle, style)
    applyHeaderStyle()
    saveUserStyleToStorage()
  }

  const updateTabsStyle = (style: Partial<TabsStyle>) => {
    Object.assign(tabsStyle, style)
    applyTabsStyle()
    saveUserStyleToStorage()
  }

  const updateBackground = (bg: Partial<Background>) => {
    Object.assign(background, bg)
    applyBackground()
    saveUserStyleToStorage()
  }

  const updateTypography = (typographyStyle: Partial<Typography>) => {
    Object.assign(typography, typographyStyle)
    applyTypography()
    saveUserStyleToStorage()
  }

  // 应用样式方法
  const applyMenuPosition = () => {
    const body = document.body
    body.setAttribute('data-menu-position', menuPosition.value)
    
    // 更新CSS变量
    const root = document.documentElement
    root.style.setProperty('--menu-position', menuPosition.value)
  }

  const applyMenuCollapsed = () => {
    const root = document.documentElement
    root.style.setProperty('--menu-collapsed', menuCollapsed.value ? 'true' : 'false')
  }

  const applyHeaderStyle = () => {
    const root = document.documentElement
    
    root.style.setProperty('--header-height', headerStyle.height)
    root.style.setProperty('--header-bg', headerStyle.background)
    root.style.setProperty('--header-shadow', headerStyle.shadow)
    root.style.setProperty('--header-text-color', headerStyle.textColor)
  }

  const applyTabsStyle = () => {
    const root = document.documentElement
    
    root.style.setProperty('--tabs-height', tabsStyle.height)
    root.style.setProperty('--tabs-bg', tabsStyle.background)
    root.style.setProperty('--tabs-border-color', tabsStyle.borderColor)
    root.style.setProperty('--tabs-active-color', tabsStyle.activeColor)
  }

  const applyBackground = () => {
    const body = document.body
    const root = document.documentElement
    
    switch (background.type) {
      case 'color':
        root.style.setProperty('--bg-type', 'color')
        root.style.setProperty('--bg-color', background.color)
        root.style.setProperty('--bg-opacity', background.opacity.toString())
        body.style.background = background.color
        body.style.backgroundImage = 'none'
        break
        
      case 'image':
        root.style.setProperty('--bg-type', 'image')
        root.style.setProperty('--bg-image', background.image)
        root.style.setProperty('--bg-opacity', background.opacity.toString())
        body.style.background = `url(${background.image})`
        body.style.backgroundSize = 'cover'
        body.style.backgroundPosition = 'center'
        body.style.backgroundRepeat = 'no-repeat'
        body.style.backgroundAttachment = 'fixed'
        break
        
      case 'animation':
        root.style.setProperty('--bg-type', 'animation')
        root.style.setProperty('--bg-animation', background.animation)
        root.style.setProperty('--bg-opacity', background.opacity.toString())
        applyAnimationBackground(background.animation)
        break
    }
  }

  const applyTypography = () => {
    const root = document.documentElement
    
    root.style.setProperty('--font-family', typography.fontFamily)
    root.style.setProperty('--font-size-base', typography.fontSize)
    root.style.setProperty('--font-weight', typography.fontWeight)
    root.style.setProperty('--line-height', typography.lineHeight.toString())
    root.style.setProperty('--letter-spacing', typography.letterSpacing)
  }

  const applyAnimationBackground = (animationType: string) => {
    // 移除现有的动画背景
    const existingCanvas = document.getElementById('animation-background')
    if (existingCanvas) {
      existingCanvas.remove()
    }

    // 创建新的动画背景
    const canvas = document.createElement('canvas')
    canvas.id = 'animation-background'
    canvas.style.position = 'fixed'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.zIndex = '-1'
    canvas.style.opacity = background.opacity.toString()
    
    document.body.appendChild(canvas)
    
    switch (animationType) {
      case 'particles':
        initParticleAnimation(canvas)
        break
      case 'waves':
        initWaveAnimation(canvas)
        break
      case 'geometric':
        initGeometricAnimation(canvas)
        break
    }
  }

  // 动画背景实现
  const initParticleAnimation = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      color: string
    }> = []

    // 创建粒子
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        color: `hsl(${Math.random() * 360}, 70%, 70%)`
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach(particle => {
        particle.x += particle.vx
        particle.y += particle.vy
        
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1
        
        ctx.fillStyle = particle.color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
      })
      
      requestAnimationFrame(animate)
    }
    
    animate()
  }

  const initWaveAnimation = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let time = 0
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      ctx.strokeStyle = 'rgba(100, 150, 255, 0.5)'
    ctx.lineWidth = 2
      
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        for (let x = 0; x < canvas.width; x += 5) {
          const y = canvas.height / 2 + 
                    Math.sin(x * 0.01 + time + i * Math.PI / 3) * 50 +
                    Math.sin(x * 0.005 + time * 0.5) * 30
          ctx.lineTo(x, y)
        }
        ctx.stroke()
      }
      
      time += 0.02
      requestAnimationFrame(animate)
    }
    
    animate()
  }

  const initGeometricAnimation = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let time = 0
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radius = 100 + Math.sin(time) * 20
      
      ctx.strokeStyle = 'rgba(255, 100, 150, 0.6)'
      ctx.lineWidth = 3
      
      // 绘制旋转的几何图形
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + time
        const x = centerX + Math.cos(angle) * radius
        const y = centerY + Math.sin(angle) * radius
        
        if (i === 0) {
          ctx.beginPath()
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.closePath()
      ctx.stroke()
      
      time += 0.01
      requestAnimationFrame(animate)
    }
    
    animate()
  }

  // 保存和加载
  const saveUserStyleToStorage = () => {
    try {
      const userStyleData = {
        menuPosition: menuPosition.value,
        menuCollapsed: menuCollapsed.value,
        headerStyle: { ...headerStyle },
        tabsStyle: { ...tabsStyle },
        background: { ...background },
        typography: { ...typography }
      }
      localStorage.setItem('rainbow-view-user-style', JSON.stringify(userStyleData))
    } catch (error) {
      console.error('保存用户样式设置失败:', error)
    }
  }

  const loadUserStyleFromStorage = () => {
    try {
      const userStyleData = localStorage.getItem('rainbow-view-user-style')
      if (userStyleData) {
        const data = JSON.parse(userStyleData)
        
        menuPosition.value = data.menuPosition || 'left'
        menuCollapsed.value = data.menuCollapsed || false
        
        Object.assign(headerStyle, data.headerStyle || {})
        Object.assign(tabsStyle, data.tabsStyle || {})
        Object.assign(background, data.background || {})
        Object.assign(typography, data.typography || {})
        
        // 应用加载的样式
        applyAllStyles()
      }
    } catch (error) {
      console.error('加载用户样式设置失败:', error)
    }
  }

  const applyAllStyles = () => {
    applyMenuPosition()
    applyMenuCollapsed()
    applyHeaderStyle()
    applyTabsStyle()
    applyBackground()
    applyTypography()
  }

  const resetToDefault = () => {
    menuPosition.value = 'left'
    menuCollapsed.value = false
    
    Object.assign(headerStyle, {
      height: '60px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      shadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      textColor: '#ffffff'
    })
    
    Object.assign(tabsStyle, {
      height: '40px',
      background: '#ffffff',
      borderColor: '#e4e7ed',
      activeColor: '#409eff'
    })
    
    Object.assign(background, {
      type: 'color',
      color: '#f8f9fa',
      image: '',
      animation: 'particles',
      opacity: 1
    })
    
    Object.assign(typography, {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: 1.5,
      letterSpacing: '0'
    })
    
    applyAllStyles()
    saveUserStyleToStorage()
  }

  // 初始化时加载样式
  loadUserStyleFromStorage()

  return {
    // 状态
    menuPosition,
    menuCollapsed,
    headerStyle,
    tabsStyle,
    background,
    typography,
    
    // 方法
    updateMenuPosition,
    toggleMenuCollapsed,
    updateHeaderStyle,
    updateTabsStyle,
    updateBackground,
    updateTypography,
    applyAllStyles,
    resetToDefault,
    loadUserStyleFromStorage
  }
})
