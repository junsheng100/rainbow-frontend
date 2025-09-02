<template>
  <div class="login-container" :style="{ backgroundImage: currentBackgroundImage ? `url(${currentBackgroundImage})` : undefined }">
    <!-- 背景动效 -->
    <div class="background-wrapper">
      <!-- 背景图片遮罩 -->
      <div class="background-overlay"></div>

      <!-- 雪花动画（可选，在某些图片上可能不太明显） -->
      <div class="snow-container" v-if="showSnowEffect">
        <div class="snowflake" v-for="i in 30" :key="i"></div>
      </div>

      <!-- 加载指示器 -->
      <div class="loading-indicator" v-if="isLoadingImage">
        <div class="loading-spinner"></div>
        <div class="loading-text">正在加载背景图片...</div>
      </div>
    </div>

    <!-- 壁纸信息显示 -->
    <div class="wallpaper-info" v-if="currentImageInfo">
      <div class="wallpaper-title">{{ currentImageInfo.title }}</div>
      <div class="wallpaper-copyright">{{ currentImageInfo.copyright }}</div>
    </div>

    <!-- 图片控制按钮 -->
    <div class="wallpaper-controls">
      <button
        class="control-btn prev-btn"
        @click="handlePrevImage"
        :disabled="isLoadingImage"
        title="上一张图片"
      >
        <el-icon><ArrowLeft /></el-icon>
        <span class="button-tooltip">上一张</span>
      </button>
      <button
        class="control-btn next-btn"
        @click="handleNextImage"
        :disabled="isLoadingImage"
        title="下一张图片"
      >
        <el-icon><ArrowRight /></el-icon>
        <span class="button-tooltip">下一张</span>
      </button>
      <button
        class="control-btn refresh-btn"
        @click="handleRefreshData"
        :disabled="isLoadingImage || isRefreshing"
        :class="{ 'is-loading': isRefreshing }"
        title="刷新壁纸数据"
      >
        <el-icon v-if="!isRefreshing"><Refresh /></el-icon>
        <el-icon v-else class="loading-icon"><Loading /></el-icon>
        <span class="button-tooltip">刷新数据</span>
      </button>
    </div>

    <!-- 顶部导航 -->
    <div class="top-nav">
      <div class="nav-left">
        <img src="@/assets/logo/logo.png" class="app-logo" alt="Rainbow Logo" />
        <h1 class="app-title">Rainbow</h1>
      </div>
    </div>

    <!-- 登录弹窗 -->
    <div
      class="login-modal"
      ref="loginModal"
      :class="{ 'minimized': isMinimized }"
      :style="isMinimized ? {
        position: 'fixed',
        top: '20px',
        right: '20px',
        left: 'auto',
        transform: 'none',
        width: '100px',
        height: 'auto'
      } : {
        transform: `translate(calc(-50% + ${modalPosition.x}px), calc(-50% + ${modalPosition.y}px))`
      }"
    >
      <div
        class="modal-header"
        @mousedown="handleModalMouseDown"
        @click="handleHeaderClick"
      >
         <h2 class="modal-title">
          {{ isMinimized ? '登陆' : '用户登录' }}
        </h2>
        <el-icon class="minimize-icon" @click.stop="handleMinimize" v-show="!isMinimized">
          <Minus />
        </el-icon>
      </div>

      <div class="modal-content" v-show="!isMinimized">
        <el-form
          ref="formRef"
          :model="loginForm"
          :rules="loginRules"
          label-width="0"
          class="login-form"
        >
          <el-form-item prop="userName">
            <div class="input-wrapper">
              <el-input
                v-model="loginForm.userName"
                placeholder="用户名"
                size="large"
                class="custom-input"
                name="username"
                type="text"
                autocomplete="username"
                @input="handleInputChange"
              >
                <template #prefix>
                  <el-icon class="input-icon"><User /></el-icon>
                </template>
              </el-input>
            </div>
          </el-form-item>

          <el-form-item prop="password">
            <div class="input-wrapper">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="密码"
                size="large"
                class="custom-input"
                name="current-password"
                autocomplete="current-password"
                show-password
                @input="handleInputChange"
              >
                <template #prefix>
                  <el-icon class="input-icon"><Lock /></el-icon>
                </template>
              </el-input>
            </div>
          </el-form-item>

          <el-form-item class="slider-form-item">
            <div class="verify-wrapper">
              <div class="slider-container">
                <div class="slider-track" ref="sliderTrack">
                  <div class="slider-progress" :style="{ width: sliderProgress + '%' }"></div>
                  <div
                    class="slider-handle"
                    ref="sliderHandle"
                    :style="{ left: sliderProgress + '%' }"
                    @mousedown="handleMouseDown"
                    @touchstart="handleTouchStart"
                  >
                    <el-icon v-if="!loading && !isVerified"><Right /></el-icon>
                    <el-icon v-else-if="loading" class="loading-icon"><Loading /></el-icon>
                    <el-icon v-else-if="isVerified" class="success-icon"><Check /></el-icon>
                  </div>
                  <div class="slider-text">
                    <span v-if="!isVerified && !loading">{{ sliderText }}</span>
                    <span v-else-if="loading">正在登录...</span>
                    <span v-else-if="isVerified">登录成功</span>
                  </div>
                </div>
              </div>
              <div v-if="!canVerify" class="verify-tip">
                <el-icon><Warning /></el-icon>
                请先输入用户名和密码
              </div>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormRules } from 'element-plus'
import {
  User,
  Lock,
  Minus,
  Warning,
  Right,
  Loading,
  Check,
  ArrowLeft,
  ArrowRight,
  Refresh
} from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { systemWallpaperService, type WallpaperResponse } from '@/utils/systemWallpaper'
import { initDynamicRoutes } from '@/router'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const sliderTrack = ref<HTMLElement>()
const sliderHandle = ref<HTMLElement>()
const loginModal = ref<HTMLElement>()
const loading = ref(false)
const isVerified = ref(false)
const sliderProgress = ref(0)
const isDragging = ref(false)
const startX = ref(0)
const startProgress = ref(0)

// 弹窗拖动相关状态
const modalPosition = reactive({ x: 0, y: 0 })
const isModalDragging = ref(false)
const modalStartX = ref(0)
const modalStartY = ref(0)
const modalStartPosX = ref(0)
const modalStartPosY = ref(0)

// 最小化状态
const isMinimized = ref(false)

// Bing壁纸相关状态
const currentBackgroundImage = ref('')
const currentImageInfo = ref<WallpaperResponse | null>(null)
const isLoadingImage = ref(true)
const showSnowEffect = ref(false)
const isRefreshing = ref(false)

// 登录表单
const loginForm = reactive({
  userName: '',
  password: '',
  rememberMe: false
})

// 表单校验规则
const loginRules = reactive<FormRules>({
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
})

// 计算是否可以进行滑块验证
const canVerify = computed(() => {
  return loginForm.userName.trim() !== '' && loginForm.password.trim() !== ''
})

// 计算滑块文本
const sliderText = computed(() => {
  if (!canVerify.value) {
    return '请先输入用户名和密码'
  }
  return '向右滑动登录'
})

import { getSavedUserCredentials, saveUserCredentials, clearUserCredentials } from '@/utils/auth'

// 从 auth 工具获取保存的用户名和密码
const initSavedCredentials = () => {
  const { username, password, rememberMe } = getSavedUserCredentials()

  if (rememberMe && username && password) {
    loginForm.userName = username
    loginForm.password = password
    loginForm.rememberMe = true
  }
}

// 保存或清除用户名密码
const handleRememberMe = () => {
  if (loginForm.rememberMe) {
    saveUserCredentials(loginForm.userName, loginForm.password)
  } else {
    clearUserCredentials()
  }
}

// 初始化壁纸
const initWallpaper = async () => {
  try {
    isLoadingImage.value = true

    // 设置图片变化回调
    systemWallpaperService.onImageChange((imageUrl: string, imageInfo: WallpaperResponse) => {
      currentBackgroundImage.value = imageUrl
      currentImageInfo.value = imageInfo
      isLoadingImage.value = false

      // 根据图片内容决定是否显示雪花效果
      const winterKeywords = ['雪', '冬', '冰', 'snow', 'winter', 'ice']
      const hasWinterTheme = winterKeywords.some(keyword =>
        (imageInfo.title || '').toLowerCase().includes(keyword) ||
        (imageInfo.copyright || '').toLowerCase().includes(keyword)
      )
      showSnowEffect.value = hasWinterTheme

      // 只有在不是默认背景时才显示提示
      if (imageUrl !== '/src/assets/images/bg.jpg') {
        ElMessage.success(`背景已切换: ${imageInfo.title}`)
      }
    })

    await systemWallpaperService.initCarousel()

  } catch (error) {
    isLoadingImage.value = false
  }
}

// 最小化功能
const handleMinimize = () => {
  isMinimized.value = true

  // 最小化时重置位置到初始状态
  modalPosition.x = 0
  modalPosition.y = 0
}

// 标题栏点击恢复
const handleHeaderClick = () => {
  if (isMinimized.value) {
    isMinimized.value = false
    // 恢复到初始位置
    modalPosition.x = 0
    modalPosition.y = 0
  }
}

// 弹窗拖动事件处理
const handleModalMouseDown = (event: MouseEvent) => {
  // 如果是最小化状态或点击的是最小化按钮，不处理拖动
  if (isMinimized.value || (event.target as HTMLElement).closest('.minimize-icon')) {
    return
  }

  event.preventDefault()
  isModalDragging.value = true
  modalStartX.value = event.clientX
  modalStartY.value = event.clientY
  modalStartPosX.value = modalPosition.x
  modalStartPosY.value = modalPosition.y

  document.addEventListener('mousemove', handleModalMouseMove)
  document.addEventListener('mouseup', handleModalMouseUp)

  // 添加拖动时的样式
  if (loginModal.value) {
    loginModal.value.style.cursor = 'grabbing'
  }
}

const handleModalMouseMove = (event: MouseEvent) => {
  if (!isModalDragging.value) return

  const deltaX = event.clientX - modalStartX.value
  const deltaY = event.clientY - modalStartY.value

  modalPosition.x = modalStartPosX.value + deltaX
  modalPosition.y = modalStartPosY.value + deltaY
}

const handleModalMouseUp = () => {
  if (!isModalDragging.value) return

  isModalDragging.value = false
  document.removeEventListener('mousemove', handleModalMouseMove)
  document.removeEventListener('mouseup', handleModalMouseUp)

  // 恢复鼠标样式
  if (loginModal.value) {
    loginModal.value.style.cursor = ''
  }
}

// 输入框内容变化时的处理
const handleInputChange = () => {
  // 如果用户名或密码为空，重置滑块验证状态
  if (!canVerify.value) {
    resetSlider()
  }
}

// 重置滑块状态
const resetSlider = () => {
  isVerified.value = false
  sliderProgress.value = 0
  loading.value = false
}

// 鼠标按下事件
const handleMouseDown = (event: MouseEvent) => {
  if (!canVerify.value || loading.value || isVerified.value) return

  event.preventDefault()
  isDragging.value = true
  startX.value = event.clientX
  startProgress.value = sliderProgress.value

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

// 触摸开始事件
const handleTouchStart = (event: TouchEvent) => {
  if (!canVerify.value || loading.value || isVerified.value) return

  event.preventDefault()
  isDragging.value = true
  startX.value = event.touches[0].clientX
  startProgress.value = sliderProgress.value

  document.addEventListener('touchmove', handleTouchMove, { passive: false })
  document.addEventListener('touchend', handleTouchEnd)
}

// 鼠标移动事件
const handleMouseMove = (event: MouseEvent) => {
  if (!isDragging.value || !sliderTrack.value) return

  const deltaX = event.clientX - startX.value
  const trackWidth = sliderTrack.value.offsetWidth - 46 // 减去滑块宽度
  const newProgress = Math.max(0, Math.min(100, startProgress.value + (deltaX / trackWidth) * 100))

  sliderProgress.value = newProgress
}

// 触摸移动事件
const handleTouchMove = (event: TouchEvent) => {
  if (!isDragging.value || !sliderTrack.value) return

  event.preventDefault()
  const deltaX = event.touches[0].clientX - startX.value
  const trackWidth = sliderTrack.value.offsetWidth - 46 // 减去滑块宽度
  const newProgress = Math.max(0, Math.min(100, startProgress.value + (deltaX / trackWidth) * 100))

  sliderProgress.value = newProgress
}

// 鼠标释放事件
const handleMouseUp = () => {
  if (!isDragging.value) return

  isDragging.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)

  checkSliderCompletion()
}

// 触摸结束事件
const handleTouchEnd = () => {
  if (!isDragging.value) return

  isDragging.value = false
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)

  checkSliderCompletion()
}

// 检查滑块是否完成
const checkSliderCompletion = () => {
  if (sliderProgress.value >= 90) {
    // 滑块拖动到90%以上视为成功
    sliderProgress.value = 100
    handleLogin()
  } else {
    // 未达到要求，回弹到起始位置
    sliderProgress.value = 0
  }
}

// 登录处理
const handleLogin = async () => {
  if (!formRef.value) return

      try {
        loading.value = true
    await formRef.value.validate()
        await userStore.login(loginForm.userName, loginForm.password)
    handleRememberMe()

    // 初始化动态路由
    await initDynamicRoutes()

    ElMessage.success('登录成功')
          router.push('/')
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error(error instanceof Error ? error.message : '登录失败')
      } finally {
        loading.value = false
      }
}

// 生命周期
onMounted(() => {
  // console.log('=== 组件挂载 ===')
  // console.log('systemWallpaperService 实例:', systemWallpaperService)
  // 初始化壁纸
  initWallpaper()
  initSavedCredentials()
})

onUnmounted(() => {
  // console.log('=== 组件卸载 ===')
  // console.log('停止壁纸服务')
  systemWallpaperService.stop()
})

// 壁纸控制函数
const handlePrevImage = (event: MouseEvent) => {
  event.preventDefault()
  event.stopPropagation()
  if (isLoadingImage.value) return
  systemWallpaperService.prevWallpaper()
}

const handleNextImage = (event: MouseEvent) => {
  event.preventDefault()
  event.stopPropagation()
  if (isLoadingImage.value) return
  systemWallpaperService.nextWallpaper()
}

const handleRefreshData = async (event: MouseEvent) => {
  event.preventDefault()
  event.stopPropagation()
  if (isRefreshing.value || isLoadingImage.value) return

  try {
    isRefreshing.value = true
    ElMessage.info('正在刷新壁纸数据...')
    await systemWallpaperService.refresh()
    ElMessage.success('壁纸数据已更新')
  } catch (error) {
    ElMessage.error('刷新失败，请稍后重试')
  } finally {
    isRefreshing.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  position: relative;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg,
    #1e3c72 0%,
    #2a5298 25%,
    #1e3c72 50%,
    #2a5298 75%,
    #1e3c72 100%
  );
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: background-image 1s ease-in-out;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
      radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 2px, transparent 2px),
      radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
    background-size: 100px 100px, 60px 60px;
    pointer-events: none;
  }
}

.background-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  z-index: 2;
}

.wallpaper-info {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 100;
  color: white;
  max-width: 600px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  padding: 15px 20px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  .wallpaper-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 5px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }

  .wallpaper-copyright {
    font-size: 14px;
    opacity: 0.9;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    line-height: 1.4;
  }
}

.loading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  color: white;
  z-index: 5;
  background: rgba(0, 0, 0, 0.6);
  padding: 20px 30px;
  border-radius: 10px;
  backdrop-filter: blur(10px);

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top: 3px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-text {
    font-size: 16px;
    font-weight: 500;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }
}

.snow-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.snowflake {
  position: absolute;
  top: -10px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.2em;
  animation: snowfall linear infinite;

  &::before {
    content: '❄';
  }
}

@keyframes snowfall {
  0% {
    transform: translateY(-100px) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

.top-nav {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
  z-index: 10;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .nav-left {
    display: flex;
    align-items: center;
    gap: 15px;

    .app-logo {
      height: 40px;
      width: auto;
      filter: brightness(1) invert(0);
      transition: transform 0.3s ease;

      &:hover {
        transform: scale(1.05);
      }
    }

    .app-title {
      font-size: 24px;
      font-weight: bold;
      color: white;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
  }
}

.login-modal {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 420px;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  overflow: hidden;
  z-index: 20;
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);

  &:hover:not(.minimized) {
    box-shadow:
      0 12px 40px rgba(0, 0, 0, 0.6),
      0 0 0 1px rgba(255, 255, 255, 0.2);
  }

  &.minimized {
    cursor: pointer;
    border-radius: 8px;
    width: 100px !important;
    height: auto !important;
    position: fixed !important;
    top: 20px !important;
    right: 20px !important;
    left: auto !important;
    transform: none !important;
    z-index: 9999;

    .modal-header {
      cursor: pointer;
      padding: 8px 16px;
      border-bottom: none;

      &:hover {
        background: rgba(0, 0, 0, 0.6);
      }

      .modal-title {
        font-size: 14px;
        font-weight: 500;
        color: #ffffff;
        margin: 0;
        pointer-events: none;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        text-align: center;
        white-space: nowrap;
      }
    }

    .minimize-icon {
      display: none;
    }
  }

  .modal-header {
    position: relative;
    padding: 30px 40px 20px;
    text-align: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    cursor: grab;
    user-select: none;
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
    transition: background-color 0.3s ease;

    &:active:not(.minimized *) {
      cursor: grabbing;
    }

    &:hover:not(.minimized *) {
      background: rgba(0, 0, 0, 0.3);
    }

    .modal-title {
      font-size: 24px;
      font-weight: 600;
      color: #ffffff;
      margin: 0;
      pointer-events: none;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }

    .minimize-icon {
      position: absolute;
      top: 20px;
      right: 20px;
      font-size: 20px;
      color: #cccccc;
      cursor: pointer;
      transition: all 0.3s ease;
      z-index: 10;

      &:hover {
        color: #ffffff;
        transform: scale(1.1);
      }
    }
  }

  .modal-content {
    padding: 30px 40px 40px;
    background: rgba(0, 0, 0, 0.1);

    .login-form {
      max-width: 320px;
      margin: 0 auto;

      .el-form-item {
        margin-bottom: 20px;

        &:last-child {
          margin-bottom: 0;
        }
      }

      .input-wrapper {
        width: 100%;

        .custom-input {
          width: 100%;

          :deep(.el-input__wrapper) {
            border-radius: 12px;
            border: 2px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s;
            background: rgba(255, 255, 255, 0.1);

            &:hover {
              border-color: rgba(255, 255, 255, 0.4);
              background: rgba(255, 255, 255, 0.15);
            }

            &.is-focus {
              border-color: #1890ff;
              box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.2);
              background: rgba(255, 255, 255, 0.2);
            }
          }

          :deep(.el-input__inner) {
            font-size: 16px;
            padding-left: 45px;
            color: #ffffff;

            &::placeholder {
              color: rgba(255, 255, 255, 0.6);
            }
          }

          .input-icon {
            color: rgba(255, 255, 255, 0.7);
            font-size: 18px;
          }
        }
      }

      .slider-form-item {
        margin-bottom: 0;
      }

      .verify-wrapper {
        width: 100%;

        .slider-container {
          width: 100%;
          margin-bottom: 20px;
        }

        .slider-track {
          position: relative;
          width: 100%;
          height: 46px;
          background: rgba(45, 45, 45, 0.8);
          border-radius: 23px;
          overflow: visible;
          cursor: pointer;
          user-select: none;
          border: 1px solid rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(8px);
          z-index: 2;
        }

        .slider-progress {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: rgba(0, 122, 255, 0.3);
          border-radius: 8px;
          transition: width 0.3s ease;
          z-index: 2;
        }

        .slider-handle {
          position: absolute;
          top: 50%;
          width: 46px;
          height: 46px;
          background: rgba(70, 70, 70, 0.95);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: grab;
          transition: all 0.3s ease;
          z-index: -1;
          transform: translateY(-50%);

          &:active {
            cursor: grabbing;
            background: rgba(80, 80, 80, 0.95);
          }

          &:hover {
            background: rgba(75, 75, 75, 0.95);
          }

          .el-icon {
            font-size: 24px;
            color: rgba(255, 255, 255, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            padding: 0;
            margin: 0;
          }

          .loading-icon {
            color: rgba(255, 255, 255, 0.9);
            animation: spin 1s linear infinite;
            font-size: 20px;
          }

          .success-icon {
            color: rgba(255, 255, 255, 0.9);
            font-size: 20px;
          }
        }

        .slider-text {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.5);
          font-size: 15px;
          font-weight: 400;
          pointer-events: none;
          z-index: 3;
        }

        .verify-tip {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 10px;
          padding: 8px 12px;
          background: rgba(45, 45, 45, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          color: rgba(255, 193, 7, 0.8);
          font-size: 14px;
          backdrop-filter: blur(8px);

          .el-icon {
            font-size: 16px;
          }
        }
      }
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 响应式设计
@media (max-width: 768px) {
  .top-nav {
    padding: 0 20px;

    .app-title {
      font-size: 20px;
    }
  }

  .login-modal {
    width: 90%;
    margin: 0 5%;

    .modal-header,
    .modal-content {
      padding-left: 25px;
      padding-right: 25px;
    }
  }
}

// 入场动画
@keyframes modalEnter {
  0% {
    opacity: 0;
    transform: translate(-50%, -60%) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.login-modal {
  animation: modalEnter 0.5s ease-out;
}

.wallpaper-controls {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
  z-index: 100;
  pointer-events: auto;

  .control-btn {
    position: relative;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    padding: 0;
    outline: none;
    z-index: 101;

    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.05);
    }

    &:active:not(:disabled) {
      transform: scale(0.95);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: rgba(255, 255, 255, 0.1);
    }

    .el-icon {
      font-size: 20px;
      color: white;
      pointer-events: none;
    }

    &.refresh-btn {
      &.is-loading .el-icon {
        animation: spin 1s linear infinite;
      }

      .loading-icon {
        animation: spin 1s linear infinite;
      }
    }

    .button-tooltip {
      position: absolute;
      top: -30px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      backdrop-filter: blur(4px);
    }

    &:hover .button-tooltip {
      opacity: 1;
      visibility: visible;
      top: -35px;
    }

    &:disabled .button-tooltip {
      display: none;
    }

    &.is-loading {
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 200%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.2),
          transparent
        );
        animation: loading-shine 1.5s infinite;
      }
    }
  }
}

@keyframes loading-shine {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(100%);
  }
}

.el-checkbox {
  color: #666;
  margin-bottom: 20px;
}
</style>
