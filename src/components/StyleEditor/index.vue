<template>
  <div class="style-editor">
    <el-button
      type="success"
      @click="visible = true"
      :icon="Setting"
      size="large"
    >
      样式编辑器
    </el-button>

    <el-drawer
      v-model="visible"
      title="🎛️ 样式编辑器"
      direction="rtl"
      size="500px"
      :with-header="true"
    >
      <div class="style-editor-content">
        <!-- 布局设置 -->
        <el-card class="layout-settings" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">📱 布局设置</span>
              <el-tooltip content="调整菜单和布局位置" placement="top">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          
          <el-form :model="layoutSettings" label-width="80px">
            <el-form-item label="菜单位置">
              <el-radio-group v-model="layoutSettings.menuPosition" @change="updateLayout">
                <el-radio label="left">左侧</el-radio>
                <el-radio label="right">右侧</el-radio>
                <el-radio label="top">顶部</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item label="菜单折叠">
              <el-switch 
                v-model="layoutSettings.menuCollapsed" 
                @change="updateLayout"
                active-text="已折叠"
                inactive-text="已展开"
              />
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 头部样式 -->
        <el-card class="header-style" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">🧭 头部样式</span>
              <el-tooltip content="自定义头部导航样式" placement="top">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          
          <el-form :model="headerStyle" label-width="80px">
            <el-form-item label="高度">
              <el-input-number 
                v-model="headerStyle.height" 
                :min="40" 
                :max="100" 
                @change="updateHeader"
                controls-position="right"
              />
              <span class="unit">px</span>
            </el-form-item>
            
            <el-form-item label="背景色">
              <el-color-picker 
                v-model="headerStyle.background" 
                @change="updateHeader"
                show-alpha
                size="large"
              />
            </el-form-item>
            
            <el-form-item label="阴影">
              <el-input 
                v-model="headerStyle.shadow" 
                placeholder="CSS box-shadow 值"
                @change="updateHeader"
              />
            </el-form-item>

            <el-form-item label="文字颜色">
              <el-color-picker 
                v-model="headerStyle.textColor" 
                @change="updateHeader"
                size="large"
              />
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 页面标签样式 -->
        <el-card class="tabs-style" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">🏷️ 页面标签</span>
              <el-tooltip content="自定义页面标签样式" placement="top">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          
          <el-form :model="tabsStyle" label-width="80px">
            <el-form-item label="高度">
              <el-input-number 
                v-model="tabsStyle.height" 
                :min="30" 
                :max="60" 
                @change="updateTabs"
                controls-position="right"
              />
              <span class="unit">px</span>
            </el-form-item>
            
            <el-form-item label="背景色">
              <el-color-picker 
                v-model="tabsStyle.background" 
                @change="updateTabs"
                size="large"
              />
            </el-form-item>
            
            <el-form-item label="边框色">
              <el-color-picker 
                v-model="tabsStyle.borderColor" 
                @change="updateTabs"
                size="large"
              />
            </el-form-item>

            <el-form-item label="激活色">
              <el-color-picker 
                v-model="tabsStyle.activeColor" 
                @change="updateTabs"
                size="large"
              />
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 背景设置 -->
        <el-card class="background-settings" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">🖼️ 背景设置</span>
              <el-tooltip content="自定义页面背景样式" placement="top">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          
          <el-form :model="backgroundSettings" label-width="80px">
            <el-form-item label="背景类型">
              <el-select v-model="backgroundSettings.type" @change="updateBackground">
                <el-option label="纯色背景" value="color" />
                <el-option label="图片背景" value="image" />
                <el-option label="动画背景" value="animation" />
              </el-select>
            </el-form-item>
            
            <el-form-item v-if="backgroundSettings.type === 'color'" label="背景色">
              <el-color-picker 
                v-model="backgroundSettings.color" 
                @change="updateBackground"
                show-alpha
                size="large"
              />
            </el-form-item>
            
            <el-form-item v-if="backgroundSettings.type === 'image'" label="背景图片">
              <el-input 
                v-model="backgroundSettings.image" 
                placeholder="图片URL地址"
                @change="updateBackground"
              />
              <div class="image-preview" v-if="backgroundSettings.image">
                <img :src="backgroundSettings.image" alt="背景预览" />
              </div>
            </el-form-item>
            
            <el-form-item v-if="backgroundSettings.type === 'animation'" label="动画类型">
              <el-select v-model="backgroundSettings.animation" @change="updateBackground">
                <el-option label="粒子动画" value="particles" />
                <el-option label="波浪动画" value="waves" />
                <el-option label="几何动画" value="geometric" />
              </el-select>
            </el-form-item>

            <el-form-item label="透明度">
              <el-slider
                v-model="backgroundSettings.opacity"
                :min="0.1"
                :max="1"
                :step="0.1"
                @change="updateBackground"
                show-input
                :format-tooltip="(val: number) => Math.round(val * 100) + '%'"
              />
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 字体设置 -->
        <el-card class="typography-settings" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">✒️ 字体设置</span>
              <el-tooltip content="自定义字体和文字样式" placement="top">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          
          <el-form :model="typographySettings" label-width="80px">
            <el-form-item label="字体族">
              <el-select v-model="typographySettings.fontFamily" @change="updateTypography">
                <el-option label="系统默认" value="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" />
                <el-option label="微软雅黑" value="Microsoft YaHei, sans-serif" />
                <el-option label="思源黑体" value="Source Han Sans CN, sans-serif" />
                <el-option label="苹方字体" value="PingFang SC, sans-serif" />
                <el-option label="Helvetica" value="Helvetica, Arial, sans-serif" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="字体大小">
              <el-input-number 
                v-model="typographySettings.fontSize" 
                :min="12" 
                :max="20" 
                @change="updateTypography"
                controls-position="right"
              />
              <span class="unit">px</span>
            </el-form-item>
            
            <el-form-item label="字体粗细">
              <el-select v-model="typographySettings.fontWeight" @change="updateTypography">
                <el-option label="细体" value="300" />
                <el-option label="正常" value="400" />
                <el-option label="中等" value="500" />
                <el-option label="加粗" value="600" />
                <el-option label="特粗" value="700" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="行高">
              <el-input-number 
                v-model="typographySettings.lineHeight" 
                :min="1" 
                :max="2" 
                :step="0.1" 
                @change="updateTypography"
                controls-position="right"
              />
            </el-form-item>

            <el-form-item label="字间距">
              <el-input-number 
                v-model="typographySettings.letterSpacing" 
                :min="-2" 
                :max="10" 
                :step="0.5" 
                @change="updateTypography"
                controls-position="right"
              />
              <span class="unit">px</span>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button @click="resetToDefault" :icon="Refresh">
            重置默认
          </el-button>
          <el-button type="primary" @click="applyAllSettings" :icon="Check">
            应用设置
          </el-button>
          <el-button type="success" @click="saveSettings" :icon="Download">
            保存设置
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Setting, 
  Check, 
  Refresh, 
  Download,
  QuestionFilled 
} from '@element-plus/icons-vue'
import { useUserStyleStore } from '@/stores/userStyle'

const userStyleStore = useUserStyleStore()
const visible = ref(false)

// 响应式数据
const layoutSettings = reactive({
  menuPosition: 'left' as 'left' | 'right' | 'top',
  menuCollapsed: false
})

const headerStyle = reactive({
  height: '60px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  shadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  textColor: '#ffffff'
})

const tabsStyle = reactive({
  height: '40px',
  background: '#ffffff',
  borderColor: '#e4e7ed',
  activeColor: '#409eff'
})

const backgroundSettings = reactive({
  type: 'color' as 'color' | 'image' | 'animation',
  color: '#f8f9fa',
  image: '',
  animation: 'particles',
  opacity: 1
})

const typographySettings = reactive({
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontSize: '14px',
  fontWeight: '400',
  lineHeight: 1.5,
  letterSpacing: '0'
})

// 计算属性 - 从store获取当前值
const currentMenuPosition = computed(() => userStyleStore.menuPosition)
const currentMenuCollapsed = computed(() => userStyleStore.menuCollapsed)
const currentHeaderStyle = computed(() => userStyleStore.headerStyle)
const currentTabsStyle = computed(() => userStyleStore.tabsStyle)
const currentBackground = computed(() => userStyleStore.background)
const currentTypography = computed(() => userStyleStore.typography)

// 初始化数据
const initData = () => {
  Object.assign(layoutSettings, {
    menuPosition: currentMenuPosition.value,
    menuCollapsed: currentMenuCollapsed.value
  })
  
  Object.assign(headerStyle, currentHeaderStyle.value)
  Object.assign(tabsStyle, currentTabsStyle.value)
  Object.assign(backgroundSettings, currentBackground.value)
  Object.assign(typographySettings, currentTypography.value)
}



// 更新方法
const updateLayout = () => {
  userStyleStore.updateMenuPosition(layoutSettings.menuPosition)
  if (layoutSettings.menuCollapsed !== currentMenuCollapsed.value) {
    userStyleStore.toggleMenuCollapsed()
  }
}

const updateHeader = () => {
  userStyleStore.updateHeaderStyle(headerStyle)
}

const updateTabs = () => {
  userStyleStore.updateTabsStyle(tabsStyle)
}

const updateBackground = () => {
  userStyleStore.updateBackground(backgroundSettings)
}

const updateTypography = () => {
  userStyleStore.updateTypography(typographySettings)
}

const applyAllSettings = () => {
  updateLayout()
  updateHeader()
  updateTabs()
  updateBackground()
  updateTypography()
  ElMessage.success('所有设置已应用')
}

const saveSettings = () => {
  // 保存到本地存储（store中已实现）
  ElMessage.success('设置已保存到本地')
}

const resetToDefault = () => {
  userStyleStore.resetToDefault()
  initData()
  ElMessage.success('已重置为默认设置')
}


</script>

<style scoped lang="scss">
.style-editor {
  display: inline-block;
}

.style-editor-content {
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

.unit {
  margin-left: 8px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.image-preview {
  margin-top: 8px;
  
  img {
    max-width: 100%;
    max-height: 100px;
    border-radius: 4px;
    border: 1px solid var(--el-border-color-light);
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
  .action-buttons {
    flex-direction: column;
  }
  
  .el-form-item {
    .el-form-item__content {
      flex-direction: column;
      align-items: flex-start;
    }
  }
}
</style>
