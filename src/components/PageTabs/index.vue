<template>
  <div class="page-tabs">
    <el-tabs
      v-model="activeTab"
      type="card"
      class="tabs-container"
      @tab-click="handleTabClick"
      @tab-remove="handleTabRemove"
    >
      <el-tab-pane
        v-for="tab in tabs"
        :key="tab.path"
        :label="tab.title"
        :name="tab.path"
        :closable="tab.closable"
      />
    </el-tabs>

    <!-- 右键菜单 -->
    <div
      v-show="contextMenuVisible"
      :style="{ left: contextMenuLeft + 'px', top: contextMenuTop + 'px' }"
      class="context-menu"
      @click="hideContextMenu"
    >
      <div class="context-menu-item" @click="closeCurrentTab">
        <el-icon><Close /></el-icon>
        关闭当前标签
      </div>
      <div v-if="hasLeftTabs" class="context-menu-item" @click="closeLeftTabs">
        <el-icon><Close /></el-icon>
        关闭左侧标签
      </div>
      <div v-if="hasRightTabs" class="context-menu-item" @click="closeRightTabs">
        <el-icon><Close /></el-icon>
        关闭右侧标签
      </div>
      <div class="context-menu-item" @click="closeOtherTabs">
        <el-icon><Close /></el-icon>
        关闭其他标签
      </div>
      <div class="context-menu-item" @click="closeAllTabs">
        <el-icon><Close /></el-icon>
        关闭所有标签
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTabsStore } from '@/stores/tabs'
import { Close } from '@element-plus/icons-vue'
import type { TabsPaneContext } from 'element-plus'

const router = useRouter()
const route = useRoute()
const tabsStore = useTabsStore()

// 计算属性
const tabs = computed(() => tabsStore.tabs)
const activeTab = computed({
  get: () => tabsStore.activeTab,
  set: (value: string) => tabsStore.setActiveTab(value)
})

// 右键菜单相关
const contextMenuVisible = ref(false)
const contextMenuLeft = ref(0)
const contextMenuTop = ref(0)
const currentContextPath = ref('')
const hasLeftTabs = ref(false)
const hasRightTabs = ref(false)

// 标签点击事件
const handleTabClick = (tab: TabsPaneContext) => {
  const path = tab.paneName as string
  if (path !== route.path) {
    router.push(path)
  }
}

// 标签移除事件
const handleTabRemove = (path: string) => {
  tabsStore.removeTab(path)

  // 如果关闭的是当前标签，跳转到活动标签
  if (path === route.path) {
    router.push(tabsStore.activeTab)
  }
}

// 右键菜单事件
const showContextMenu = (e: MouseEvent, path: string) => {
  e.preventDefault()
  currentContextPath.value = path
  contextMenuLeft.value = e.clientX
  contextMenuTop.value = e.clientY
  contextMenuVisible.value = true

  // 计算是否有左侧和右侧标签
  const currentIndex = tabs.value.findIndex(tab => tab.path === path)
  hasLeftTabs.value = currentIndex > 0
  hasRightTabs.value = currentIndex < tabs.value.length - 1
}

const hideContextMenu = () => {
  contextMenuVisible.value = false
}

// 右键菜单操作
const closeCurrentTab = () => {
  handleTabRemove(currentContextPath.value)
  hideContextMenu()
}

const closeOtherTabs = () => {
  tabsStore.removeOtherTabs(currentContextPath.value)
  if (currentContextPath.value !== route.path) {
    router.push(currentContextPath.value)
  }
  hideContextMenu()
}

const closeLeftTabs = () => {
  tabsStore.removeLeftTabs(currentContextPath.value)
  if (currentContextPath.value !== route.path) {
    router.push(currentContextPath.value)
  }
  hideContextMenu()
}

const closeRightTabs = () => {
  tabsStore.removeRightTabs(currentContextPath.value)
  if (currentContextPath.value !== route.path) {
    router.push(currentContextPath.value)
  }
  hideContextMenu()
}

const closeAllTabs = () => {
  tabsStore.removeAllTabs()
  router.push(tabsStore.activeTab)
  hideContextMenu()
}

// 监听点击事件隐藏右键菜单
const handleDocumentClick = (_e: MouseEvent) => {
  if (contextMenuVisible.value) {
    hideContextMenu()
  }
}

// 使用事件委托处理右键菜单
const handleTabsNavContextMenu = (e: Event) => {
  // 将事件转换为 MouseEvent
  const mouseEvent = e as MouseEvent
  e.preventDefault()

  // 查找被点击的标签元素
  const target = mouseEvent.target as HTMLElement
  const tabItem = target.closest('.el-tabs__item') as HTMLElement

  if (tabItem) {
    // 获取标签的索引
    const tabElements = Array.from(document.querySelectorAll('.el-tabs__item'))
    const index = tabElements.indexOf(tabItem)

    // 获取对应的路径
    const path = tabs.value[index]?.path
    if (path) {
      showContextMenu(mouseEvent, path)
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)

  // 使用事件委托添加右键菜单
  const tabsNav = document.querySelector('.el-tabs__nav')
  if (tabsNav) {
    tabsNav.addEventListener('contextmenu', handleTabsNavContextMenu)
  }
})

onUnmounted(() => {
  // 移除所有事件监听器
  document.removeEventListener('click', handleDocumentClick)
  const tabsNav = document.querySelector('.el-tabs__nav')
  if (tabsNav) {
    tabsNav.removeEventListener('contextmenu', handleTabsNavContextMenu)
  }
})
</script>

<style scoped lang="scss">
.page-tabs {
  position: relative;

  .tabs-container {
    :deep(.el-tabs__header) {
      margin: 0;
      border-bottom: 1px solid #e4e7ed;
      background-color: #fff;

      .el-tabs__nav-wrap {
        padding: 0 10px;

        .el-tabs__nav {
          border: none;

          .el-tabs__item {
            height: 32px;
            line-height: 32px;
            margin-right: 4px;
            border: 1px solid #d9d9d9;
            border-radius: 4px 4px 0 0;
            background-color: #fafafa;
            color: #666;
            font-size: 12px;
            padding: 0 12px;
            position: relative;

            &:hover {
              background-color: #e6f7ff;
              color: #1890ff;
            }

            &.is-active {
              background-color: #fff;
              border-bottom-color: #fff;
              color: #1890ff;

              &::after {
                content: '';
                position: absolute;
                bottom: -1px;
                left: 0;
                right: 0;
                height: 1px;
                background-color: #fff;
              }
            }

            .el-icon-close {
              margin-left: 8px;
              border-radius: 50%;
              width: 14px;
              height: 14px;
              display: flex;
              align-items: center;
              justify-content: center;

              &:hover {
                background-color: #ff4d4f;
                color: #fff;
              }
            }
          }
        }
      }
    }

    :deep(.el-tabs__content) {
      display: none;
    }
  }

  .context-menu {
    position: fixed;
    z-index: 9999;
    background: #fff;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    min-width: 120px;

    .context-menu-item {
      padding: 8px 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      font-size: 12px;
      color: #333;

      &:hover {
        background-color: #f5f5f5;
      }

      .el-icon {
        margin-right: 6px;
        font-size: 12px;
      }
    }
  }
}
</style>
