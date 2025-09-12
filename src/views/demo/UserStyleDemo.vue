<template>
  <div class="user-style-demo">
    <!-- 页面头部 -->
    <div class="demo-header">
      <h1>🎨 用户自定义样式演示</h1>
      <p>体验 Rainbow View 的强大自定义功能，包括主题切换、样式编辑、布局调整等</p>
    </div>

    <!-- 控制面板 -->
    <div class="control-panel">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="control-card">
            <template #header>
              <div class="card-header">
                <span>🎯 主题切换</span>
              </div>
            </template>
            <ThemeCustomizer />
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card class="control-card">
            <template #header>
              <div class="card-header">
                <span>🎛️ 样式编辑</span>
              </div>
            </template>
            <StyleEditor />
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card class="control-card">
            <template #header>
              <div class="card-header">
                <span>⚡ 快速操作</span>
              </div>
            </template>
            <div class="quick-actions">
              <el-button type="primary" @click="toggleDarkMode" :icon="Moon">
                {{ isDarkMode ? '关闭深色模式' : '开启深色模式' }}
              </el-button>
              <el-button type="success" @click="toggleMenuPosition" :icon="Switch">
                切换菜单位置
              </el-button>
                             <el-button type="warning" @click="resetAllSettings" :icon="Refresh">
                 重置所有设置
               </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 样式预览区域 -->
    <div class="preview-section">
      <el-row :gutter="20">
        <!-- 色彩预览 -->
        <el-col :span="12">
          <el-card class="preview-card">
            <template #header>
              <div class="card-header">
                <span>🌈 色彩预览</span>
              </div>
            </template>
            <div class="color-preview">
              <div class="color-item primary">
                <span class="color-label">主色调</span>
                <span class="color-value">{{ themeColors.primary }}</span>
              </div>
              <div class="color-item success">
                <span class="color-label">成功色</span>
                <span class="color-value">{{ themeColors.success }}</span>
              </div>
              <div class="color-item warning">
                <span class="color-label">警告色</span>
                <span class="color-value">{{ themeColors.warning }}</span>
              </div>
              <div class="color-item danger">
                <span class="color-label">危险色</span>
                <span class="color-value">{{ themeColors.danger }}</span>
              </div>
              <div class="color-item info">
                <span class="color-label">信息色</span>
                <span class="color-value">{{ themeColors.info }}</span>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 组件预览 -->
        <el-col :span="12">
          <el-card class="preview-card">
            <template #header>
              <div class="card-header">
                <span>🧩 组件预览</span>
              </div>
            </template>
            <div class="component-preview">
              <div class="preview-item">
                <h4>按钮样式</h4>
                <div class="button-group">
                  <el-button type="primary">主要按钮</el-button>
                  <el-button type="success">成功按钮</el-button>
                  <el-button type="warning">警告按钮</el-button>
                  <el-button type="danger">危险按钮</el-button>
                </div>
              </div>
              
              <div class="preview-item">
                <h4>输入框样式</h4>
                <el-input placeholder="请输入内容" />
              </div>
              
              <div class="preview-item">
                <h4>卡片样式</h4>
                <div class="custom-card">
                  <div class="card-header">
                    <h5>自定义卡片</h5>
                  </div>
                  <div class="card-body">
                    <p>这是一个使用自定义样式的卡片组件</p>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 布局预览 -->
    <div class="layout-preview">
      <el-card class="preview-card">
        <template #header>
          <div class="card-header">
            <span>📱 布局预览</span>
          </div>
        </template>
        <div class="layout-info">
          <el-descriptions :column="3" border>
            <el-descriptions-item label="菜单位置">
              <el-tag :type="getMenuPositionType()">{{ menuPositionLabel }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="菜单状态">
              <el-tag :type="menuCollapsed ? 'warning' : 'success'">
                {{ menuCollapsed ? '已折叠' : '已展开' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="当前主题">
              <el-tag type="primary">{{ currentTheme }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="头部高度">
              {{ headerStyle.height }}
            </el-descriptions-item>
            <el-descriptions-item label="标签高度">
              {{ tabsStyle.height }}
            </el-descriptions-item>
            <el-descriptions-item label="背景类型">
              <el-tag :type="getBackgroundType()">{{ backgroundTypeLabel }}</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-card>
    </div>

    <!-- 代码示例 -->
    <div class="code-examples">
      <el-card class="preview-card">
        <template #header>
          <div class="card-header">
            <span>💻 代码示例</span>
          </div>
        </template>
        <div class="code-tabs">
          <el-tabs v-model="activeTab" type="border-card">
            <el-tab-pane label="主题切换" name="theme">
              <pre class="code-block"><code>// 切换主题
const themeStore = useThemeStore()
themeStore.setTheme('dark')

// 自定义颜色
themeStore.updateCustomColor('primary', '#FF6B6B')

// 深色模式
themeStore.toggleDarkMode()</code></pre>
            </el-tab-pane>
            
            <el-tab-pane label="样式编辑" name="style">
              <pre class="code-block"><code>// 更新菜单位置
const userStyleStore = useUserStyleStore()
userStyleStore.updateMenuPosition('right')

// 更新头部样式
userStyleStore.updateHeaderStyle({
  height: '80px',
  background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)'
})

// 更新背景
userStyleStore.updateBackground({
  type: 'animation',
  animation: 'particles',
  opacity: 0.8
})</code></pre>
            </el-tab-pane>
            
            <el-tab-pane label="CSS变量" name="css">
              <pre class="code-block"><code>/* CSS变量使用 */
:root {
  --primary-color: #409EFF;
  --header-height: 60px;
  --border-radius: 6px;
}

.custom-button {
  background-color: var(--primary-color);
  border-radius: var(--border-radius);
}</code></pre>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Moon, Switch, Refresh } from '@element-plus/icons-vue'
import ThemeCustomizer from '@/components/ThemeCustomizer/index.vue'
import StyleEditor from '@/components/StyleEditor/index.vue'
import { useThemeStore } from '@/stores/theme'
import { useUserStyleStore } from '@/stores/userStyle'

const themeStore = useThemeStore()
const userStyleStore = useUserStyleStore()
const activeTab = ref('theme')

// 计算属性
const themeColors = computed(() => themeStore.themeColors)
const currentTheme = computed(() => themeStore.currentTheme)
const isDarkMode = computed(() => themeStore.darkMode)
const menuPosition = computed(() => userStyleStore.menuPosition)
const menuCollapsed = computed(() => userStyleStore.menuCollapsed)
const headerStyle = computed(() => userStyleStore.headerStyle)
const tabsStyle = computed(() => userStyleStore.tabsStyle)
const background = computed(() => userStyleStore.background)

// 标签显示
const menuPositionLabel = computed(() => {
  const labels = { left: '左侧', right: '右侧', top: '顶部' }
  return labels[menuPosition.value] || '左侧'
})

const backgroundTypeLabel = computed(() => {
  const labels = { color: '纯色', image: '图片', animation: '动画' }
  return labels[background.value.type] || '纯色'
})

// 方法
const toggleDarkMode = () => {
  themeStore.toggleDarkMode()
  ElMessage.success(isDarkMode.value ? '已开启深色模式' : '已关闭深色模式')
}

const toggleMenuPosition = () => {
  const positions = ['left', 'right', 'top'] as const
  const currentIndex = positions.indexOf(menuPosition.value)
  const nextIndex = (currentIndex + 1) % positions.length
  const nextPosition = positions[nextIndex]
  
  userStyleStore.updateMenuPosition(nextPosition)
  ElMessage.success(`菜单位置已切换至${menuPositionLabel.value}`)
}

const resetAllSettings = () => {
  themeStore.resetToDefault()
  userStyleStore.resetToDefault()
  ElMessage.success('所有设置已重置为默认值')
}

const getMenuPositionType = () => {
  const types = { left: 'primary', right: 'success', top: 'warning' }
  return types[menuPosition.value] || 'primary'
}

const getBackgroundType = () => {
  const types = { color: 'info', image: 'success', animation: 'warning' }
  return types[background.value.type] || 'info'
}
</script>

<style scoped lang="scss">
.user-style-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  margin-bottom: 30px;
  
  h1 {
    color: var(--primary-color);
    margin-bottom: 16px;
  }
  
  p {
    color: var(--text-color-secondary);
    font-size: var(--font-size-lg);
  }
}

.control-panel {
  margin-bottom: 30px;
}

.control-card {
  height: 100%;
  
  .card-header {
    font-weight: 600;
    font-size: 16px;
  }
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  .el-button {
    width: 100%;
  }
}

.preview-section {
  margin-bottom: 30px;
}

.preview-card {
  height: 100%;
  
  .card-header {
    font-weight: 600;
    font-size: 16px;
  }
}

.color-preview {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.color-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: var(--border-radius);
  color: #ffffff;
  font-weight: 500;
  
  &.primary { background-color: var(--primary-color); }
  &.success { background-color: var(--success-color); }
  &.warning { background-color: var(--warning-color); }
  &.danger { background-color: var(--danger-color); }
  &.info { background-color: var(--info-color); }
  
  .color-value {
    font-family: monospace;
    font-size: 12px;
    opacity: 0.9;
  }
}

.component-preview {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preview-item {
  h4 {
    margin-bottom: 12px;
    color: var(--text-color);
    font-size: 14px;
  }
}

.button-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.custom-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--card-radius);
  
  .card-header {
    padding: 12px 16px;
    border-bottom: 1px solid var(--card-border);
    background-color: var(--bg-color);
    
    h5 {
      margin: 0;
      color: var(--text-color);
    }
  }
  
  .card-body {
    padding: 16px;
    
    p {
      margin: 0;
      color: var(--text-color-secondary);
    }
  }
}

.layout-preview {
  margin-bottom: 30px;
}

.layout-info {
  .el-descriptions {
    .el-descriptions__label {
      font-weight: 600;
    }
  }
}

.code-examples {
  margin-bottom: 30px;
}

.code-tabs {
  .code-block {
    background-color: var(--bg-color);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    padding: 16px;
    margin: 0;
    font-family: var(--font-family-monospace);
    font-size: 14px;
    line-height: 1.5;
    color: var(--text-color);
    overflow-x: auto;
    
    code {
      background: none;
      padding: 0;
      color: inherit;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .user-style-demo {
    padding: 16px;
  }
  
  .control-panel {
    .el-col {
      margin-bottom: 20px;
    }
  }
  
  .preview-section {
    .el-col {
      margin-bottom: 20px;
    }
  }
  
  .button-group {
    flex-direction: column;
    
    .el-button {
      width: 100%;
    }
  }
}
</style>
