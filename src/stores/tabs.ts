import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'

// 标签页接口
export interface TabItem {
  path: string
  name: string
  title: string
  closable: boolean
}

export const useTabsStore = defineStore('tabs', () => {
  const tabs = ref<TabItem[]>([
    {
      path: '/dashboard',
      name: 'Dashboard',
      title: '首页概览',
      closable: false // 首页不可关闭
    }
  ])
  
  const activeTab = ref('/dashboard')

  // 添加标签页
  const addTab = (route: RouteLocationNormalized) => {
    const { path, name, meta } = route
    const title = (meta?.title as string) || '未知页面'
    
    // 检查是否已存在
    const existingTab = tabs.value.find(tab => tab.path === path)
    if (!existingTab) {
      tabs.value.push({
        path,
        name: name as string,
        title,
        closable: path !== '/dashboard' // 首页不可关闭
      })
    }
    
    activeTab.value = path
  }

  // 移除标签页
  const removeTab = (path: string) => {
    const index = tabs.value.findIndex(tab => tab.path === path)
    if (index > -1 && tabs.value[index].closable) {
      tabs.value.splice(index, 1)
      
      // 如果关闭的是当前活动标签，切换到其他标签
      if (activeTab.value === path) {
        if (tabs.value.length > 0) {
          activeTab.value = tabs.value[index - 1]?.path || tabs.value[0].path
        }
      }
    }
  }

  // 移除其他标签页
  const removeOtherTabs = (currentPath: string) => {
    tabs.value = tabs.value.filter(tab => 
      tab.path === currentPath || !tab.closable
    )
    activeTab.value = currentPath
  }

  // 移除所有标签页（除了不可关闭的）
  const removeAllTabs = () => {
    tabs.value = tabs.value.filter(tab => !tab.closable)
    activeTab.value = tabs.value[0]?.path || '/dashboard'
  }

  // 移除左侧标签页
  const removeLeftTabs = (currentPath: string) => {
    const currentIndex = tabs.value.findIndex(tab => tab.path === currentPath)
    if (currentIndex > -1) {
      // 保留不可关闭的标签页和当前及右侧的标签页
      tabs.value = tabs.value.filter((tab, index) => 
        !tab.closable || index >= currentIndex
      )
      activeTab.value = currentPath
    }
  }

  // 移除右侧标签页
  const removeRightTabs = (currentPath: string) => {
    const currentIndex = tabs.value.findIndex(tab => tab.path === currentPath)
    if (currentIndex > -1) {
      // 保留不可关闭的标签页和当前及左侧的标签页
      tabs.value = tabs.value.filter((tab, index) => 
        !tab.closable || index <= currentIndex
      )
      activeTab.value = currentPath
    }
  }

  // 设置活动标签
  const setActiveTab = (path: string) => {
    activeTab.value = path
  }

  return {
    tabs,
    activeTab,
    addTab,
    removeTab,
    removeOtherTabs,
    removeAllTabs,
    removeLeftTabs,
    removeRightTabs,
    setActiveTab
  }
}) 
