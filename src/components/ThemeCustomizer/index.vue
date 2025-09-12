<template>
  <div class="theme-customizer">
    <el-button
      type="primary"
      @click="visible = true"
      :icon="Brush"
      size="large"
    >
      主题自定义
    </el-button>

    <el-drawer
      v-model="visible"
      title="🎨 主题自定义"
      direction="rtl"
      size="450px"
      :with-header="true"
    >
      <div class="theme-customizer-content">
        <!-- 预设主题选择 -->
        <el-card class="preset-themes" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">🎯 预设主题</span>
              <el-tooltip content="选择预设的主题配色方案" placement="top">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          
          <div class="theme-grid">
            <div
              v-for="theme in presetThemes"
              :key="theme.name"
              class="theme-item"
              :class="{ active: currentTheme === theme.name }"
              @click="selectTheme(theme.name)"
            >
              <div class="theme-preview" :style="theme.previewStyle"></div>
              <span class="theme-name">{{ theme.label }}</span>
              <div v-if="currentTheme === theme.name" class="theme-active">
                <el-icon><Check /></el-icon>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 自定义颜色 -->
        <el-card class="custom-colors" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">🎨 自定义颜色</span>
              <el-tooltip content="自定义各个颜色值" placement="top">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          
          <div class="color-grid">
            <div 
              v-for="(color, key) in customColors" 
              :key="key" 
              class="color-item"
            >
              <div class="color-info">
                <span class="color-label">{{ colorLabels[key] }}</span>
                <span class="color-value">{{ color }}</span>
              </div>
              <div class="color-controls">
                <el-color-picker
                  v-model="customColors[key]"
                  @change="updateColor(key, $event)"
                  :predefine="predefineColors"
                  show-alpha
                  size="large"
                />
                <el-button
                  size="small"
                  @click="resetColor(key)"
                  :icon="Refresh"
                >
                  重置
                </el-button>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 深色模式切换 -->
        <el-card class="dark-mode" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">🌙 深色模式</span>
              <el-tooltip content="切换深色/浅色主题" placement="top">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          
          <div class="dark-mode-controls">
            <el-switch
              v-model="darkMode"
              @change="toggleDarkMode"
              active-text="深色模式"
              inactive-text="浅色模式"
              size="large"
            />
            <div class="dark-mode-info">
              <p>深色模式会自动调整背景和文字颜色，提供更好的夜间使用体验</p>
            </div>
          </div>
        </el-card>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button @click="resetToDefault" :icon="Refresh">
            重置默认
          </el-button>
          <el-button type="primary" @click="applyTheme" :icon="Check">
            应用主题
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Brush, 
  Check, 
  Refresh, 
  QuestionFilled 
} from '@element-plus/icons-vue'
import { useThemeStore, presetThemes } from '@/stores/theme'

const themeStore = useThemeStore()
const visible = ref(false)

// 计算属性
const currentTheme = computed(() => themeStore.currentTheme)
const customColors = computed(() => themeStore.customColors)
const darkMode = computed(() => themeStore.darkMode)

// 颜色标签映射
const colorLabels = {
  primary: '主色调',
  success: '成功色',
  warning: '警告色',
  danger: '危险色',
  info: '信息色',
  background: '背景色',
  text: '文字色',
  border: '边框色'
}

// 预定义颜色
const predefineColors = [
  '#409EFF',
  '#67C23A',
  '#E6A23C',
  '#F56C6C',
  '#909399',
  '#2C3E50',
  '#E74C3C',
  '#F39C12',
  '#27AE60',
  '#9B59B6',
  '#1F2937',
  '#F9FAFB'
]

// 方法
const selectTheme = (themeName: string) => {
  themeStore.setTheme(themeName)
  ElMessage.success(`已切换到${presetThemes.find(t => t.name === themeName)?.label}`)
}

const updateColor = (colorType: string, colorValue: string) => {
  themeStore.updateCustomColor(colorType, colorValue)
}

const resetColor = (colorType: string) => {
  const defaultTheme = presetThemes.find(t => t.name === 'default')
  if (defaultTheme && colorType in defaultTheme.colors) {
    const defaultColor = defaultTheme.colors[colorType as keyof typeof defaultTheme.colors]
    themeStore.updateCustomColor(colorType, defaultColor)
    ElMessage.info(`已重置${colorLabels[colorType as keyof typeof colorLabels]}`)
  }
}

const toggleDarkMode = () => {
  themeStore.toggleDarkMode()
  ElMessage.success(darkMode.value ? '已开启深色模式' : '已关闭深色模式')
}

const resetToDefault = () => {
  themeStore.resetToDefault()
  ElMessage.success('已重置为默认主题')
}

const applyTheme = () => {
  themeStore.applyTheme()
  ElMessage.success('主题已应用')
}
</script>

<style scoped lang="scss">
.theme-customizer {
  display: inline-block;
}

.theme-customizer-content {
  padding: 20px;
  
  .el-card {
    margin-bottom: 20px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .card-title {
    font-weight: 600;
    font-size: 16px;
  }
}

// 预设主题网格
.theme-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.theme-item {
  position: relative;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &.active {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  }
}

.theme-preview {
  height: 60px;
  border-radius: 6px 6px 0 0;
}

.theme-name {
  display: block;
  padding: 12px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
}

.theme-active {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: var(--el-color-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

// 自定义颜色网格
.color-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.color-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--el-bg-color-page);
  border-radius: 6px;
  border: 1px solid var(--el-border-color-light);
}

.color-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  .color-label {
    font-weight: 500;
    color: var(--el-text-color-primary);
  }
  
  .color-value {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    font-family: monospace;
  }
}

.color-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

// 深色模式控制
.dark-mode-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dark-mode-info {
  p {
    margin: 0;
    font-size: 14px;
    color: var(--el-text-color-secondary);
    line-height: 1.5;
  }
}

// 操作按钮
.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color-light);
}

// 响应式设计
@media (max-width: 768px) {
  .theme-grid {
    grid-template-columns: 1fr;
  }
  
  .color-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .color-controls {
    width: 100%;
    justify-content: space-between;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>
