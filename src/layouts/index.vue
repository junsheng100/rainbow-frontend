<template>
  <el-container class="layout-container">
    <!-- 顶部导航栏 -->
    <el-header class="header">
      <div class="header-left">
        <el-icon class="menu-icon" @click="toggleSidebar">
          <Fold v-if="!isCollapsed"/>
          <Expand v-else/>
        </el-icon>
        <h1 class="system-title"></h1>
      </div>
      <div class="header-right">
        <div class="header-actions">

          <el-badge :value="unreadCount" class="notification-badge" @click="handleNoticeClick">
            <el-icon class="header-icon">
              <Bell/>
            </el-icon>
          </el-badge>

          <el-dropdown class="user-dropdown">
            <span class="user-info">
              <el-avatar :size="32" v-if="!userStore.userInfo.avatar" class="user-avatar">
                <span>{{ (userStore.userInfo.nickname || userStore.userInfo.userName || '用户').charAt(0) }}</span>
              </el-avatar>

               <el-image
                   v-else
                   :src="getResourceUrl(userStore.userInfo.avatar)"
                   :preview-src-list="[getResourceUrl(userStore.userInfo.avatar)]"
                   :preview-teleported="true"
                   fit="cover"
                   class="preview-image el-avatar--circle el-avatar--small"
                   style="width: 28px;height: 28px;margin-right: 8px"
               />
               <span class="username">{{ userStore.userInfo.nickname || userStore.userInfo.userName || '用户' }}</span>
              <el-icon><ArrowDown/></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push('/users/profile')">
                  <el-icon>
                    <User/>
                  </el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item @click="toggleMenuPosition">
                  <el-icon>
                    <ArrowRight v-if="menuPosition === 'left'"/>
                    <ArrowLeft v-else/>
                  </el-icon>
                  {{ menuPosition === 'left' ? '菜单移至右侧' : '菜单移至左侧' }}
                </el-dropdown-item>
                <el-dropdown-item @click="showChangePassword = true">
                  <el-icon>
                    <Lock/>
                  </el-icon>
                  修改密码
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon>
                    <SwitchButton/>
                  </el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-header>

    <el-container class="main-container">
      <!-- 左侧边栏 -->
      <el-aside 
        v-if="menuPosition === 'left'"
        class="sidebar left-sidebar" 
        :width="isCollapsed ? '64px' : '240px'"
      >
        <div class="sidebar-header">
          <el-icon class="sidebar-logo">
            <Monitor/>
          </el-icon>
          <span class="sidebar-title" v-show="!isCollapsed">管理系统</span>
        </div>
        <el-menu
            :default-active="route.path"
            class="sidebar-menu"
            router
            :collapse="isCollapsed"
            background-color="#2c3e50"
            text-color="#bdc3c7"
            active-text-color="#3498db"
            :collapse-transition="false"
            :unique-opened="true"
            @open="handleSubMenuOpen"
        >
          <el-menu-item index="/dashboard" class="menu-item">
            <el-icon>
              <HomeFilled/>
            </el-icon>
            <template #title>首页概览</template>
          </el-menu-item>
          <MenuItem v-for="route in menuRoutes" :key="route.path" :route="route"/>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-main 
        class="main-content" 
        :class="{ 
          'with-left-menu': menuPosition === 'left',
          'with-right-menu': menuPosition === 'right'
        }"
      >
        <!-- 页面标签 -->
        <PageTabs/>

        <!-- 页面内容 -->
        <div class="page-content">
          <router-view/>
        </div>
      </el-main>

      <!-- 右侧边栏 -->
      <el-aside 
        v-if="menuPosition === 'right'"
        class="sidebar right-sidebar" 
        :width="isCollapsed ? '64px' : '240px'"
      >
        <div class="sidebar-header">
          <el-icon class="sidebar-logo">
            <Monitor/>
          </el-icon>
          <span class="sidebar-title" v-show="!isCollapsed">管理系统</span>
        </div>
        <el-menu
            :default-active="route.path"
            class="sidebar-menu"
            router
            :collapse="isCollapsed"
            background-color="#2c3e50"
            text-color="#bdc3c7"
            active-text-color="#3498db"
            :collapse-transition="false"
            :unique-opened="true"
            @open="handleSubMenuOpen"
        >
          <el-menu-item index="/dashboard" class="menu-item">
            <el-icon>
              <HomeFilled/>
            </el-icon>
            <template #title>首页概览</template>
          </el-menu-item>
          <MenuItem v-for="route in menuRoutes" :key="route.path" :route="route"/>
        </el-menu>
      </el-aside>
    </el-container>

    <!-- 修改密码弹窗 -->
    <ChangePassword
        v-model="showChangePassword"
        @success="handlePasswordChangeSuccess"
    />

    <!-- 通知弹窗 -->
    <el-dialog
        v-model="showNoticeDialog"
        title="通知消息"
        width="70%"
        top="5vh"
        destroy-on-close
    >
      <NoticeRead />
    </el-dialog>
  </el-container>
</template>

<script setup lang="ts">
import {computed, onBeforeUnmount, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useUserStore} from '@/stores/user'
import {useTabsStore} from '@/stores/tabs'

import {getResourceUrl} from "@/config"
import {usePermissionStore} from '@/store/modules/permission'
import MenuItem from '@/components/Layout/MenuItem.vue'
import {ArrowDown, ArrowLeft, ArrowRight, Expand, Fold, HomeFilled, Lock, Monitor, SwitchButton, User} from '@element-plus/icons-vue'
import ChangePassword from '@/components/ChangePassword/index.vue'
import PageTabs from '@/components/PageTabs/index.vue'
import { countWillPush } from '@/api/notice/push'
import NoticeRead from '@/views/notice/read.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const tabsStore = useTabsStore()
const permissionStore = usePermissionStore()

// 过滤出需要在菜单中显示的路由
const menuRoutes = computed(() => {
  return permissionStore.routes.filter(route => {
    // 过滤掉隐藏的路由
    return !route.meta?.hidden
  })
})

const showChangePassword = ref(false)
const isCollapsed = ref(false)
const menuPosition = ref<'left' | 'right'>('left') // 菜单位置：左侧或右侧

// 监听路由变化，添加标签页
watch(
    () => route.path,
    () => {
      if (route.meta?.title) {
        tabsStore.addTab(route)
      }
    },
    {immediate: true}
)

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

// 切换菜单位置
const toggleMenuPosition = () => {
  menuPosition.value = menuPosition.value === 'left' ? 'right' : 'left'
}

// 处理子菜单打开，实现手风琴效果
const handleSubMenuOpen = (index: string, indexPath: string[]) => {
  // 这里可以添加额外的逻辑，比如记录当前打开的菜单
  console.log('子菜单打开:', index, indexPath)
}

const handlePasswordChangeSuccess = async () => {
  await userStore.logout()
  router.push('/login')
}






const unreadCount = ref<number>(0)
const showNoticeDialog = ref(false)

// 处理通知点击
const handleNoticeClick = () => {
  // 当未读消息数量为0时，不显示通知对话框
  if (unreadCount.value === 0) {
    return
  }
  showNoticeDialog.value = true
}

// 获取未读消息数量
const fetchUnreadCount = async () => {
  try {
    const res = await countWillPush()
    console.log('获取未读消息数量成功:', JSON.stringify(res))
    unreadCount.value = res || 0
  } catch (error) {
    console.error('获取未读消息数量失败:', error)
    unreadCount.value = 0
  }
}

// 初始化获取未读消息数量
fetchUnreadCount()

// 每15分钟刷新一次未读消息数量
const timer = setInterval(fetchUnreadCount, 15*60000)

// 组件卸载时清除定时器
onBeforeUnmount(() => {
  clearInterval(timer)
})

const handleLogout = async () => {
  await userStore.logout()
  router.push('/login')
}
</script>

<style lang="scss" scoped>
.layout-container {
  height: 100vh;

  .header {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 0 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 1000;

    .header-left {
      display: flex;
      align-items: center;

      .menu-icon {
        font-size: 20px;
        margin-right: 15px;
        cursor: pointer;
        padding: 8px;
        border-radius: 4px;
        transition: background-color 0.3s;

        &:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
      }

      .system-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: white;
      }
    }

    .header-right {
      .header-actions {
        display: flex;
        align-items: center;
        gap: 20px;

        .notification-badge {
          .header-icon {
            font-size: 18px;
            cursor: pointer;
            transition: color 0.3s;

            &:hover {
              color: #f39c12;
            }
          }
        }

        .header-icon {
          font-size: 18px;
          cursor: pointer;
          transition: color 0.3s;

          &:hover {
            color: #f39c12;
          }
        }

        .user-dropdown {
          .user-info {
            display: flex;
            align-items: center;
            cursor: pointer;
            padding: 5px 10px;
            border-radius: 20px;
            transition: background-color 0.3s;

            &:hover {
              background-color: rgba(255, 255, 255, 0.1);
            }

            .user-avatar {
              margin-right: 8px;
              background-color: #3498db;
              color: white;
              font-weight: bold;
            }

            .username {
              margin-right: 8px;
              font-size: 14px;
              color: white;
              font-weight: 500;
            }
          }
        }
      }
    }
  }

  .main-container {
    height: calc(100vh - 60px);
    display: flex;

    .sidebar {
      background-color: #2c3e50;
      color: #bdc3c7;
      transition: width 0.3s ease;
      overflow-x: hidden;
      overflow-y: auto;

      &.left-sidebar {
        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
      }

      &.right-sidebar {
        box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
      }

      /* 自定义滚动条样式 */
      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 3px;

        &:hover {
          background-color: rgba(255, 255, 255, 0.3);
        }
      }

      &::-webkit-scrollbar-track {
        background-color: transparent;
      }

      .sidebar-header {
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-bottom: 1px solid #34495e;
        transition: all 0.3s ease;

        .sidebar-logo {
          font-size: 24px;
          color: #3498db;
          margin-right: 10px;
          transition: all 0.3s ease;
        }

        .sidebar-title {
          font-size: 16px;
          font-weight: 600;
          color: #ecf0f1;
          transition: opacity 0.3s ease;
        }
      }

              .sidebar-menu {
          border: none;

          :deep(.el-menu-item) {
            height: 48px;
            line-height: 48px;
            margin: 4px 8px;
            border-radius: 6px;

            &:hover {
              background-color: #34495e !important;
            }

            &.is-active {
              background-color: #3498db !important;
              color: white !important;
            }
          }

          :deep(.el-sub-menu) {
            .el-sub-menu__title {
              height: 48px;
              line-height: 48px;
              margin: 4px 8px;
              border-radius: 6px;

              &:hover {
                background-color: #34495e !important;
              }
            }

            // 子菜单样式优化
            .el-menu {
              background-color: rgba(0, 0, 0, 0.1);
              border-radius: 0 0 6px 6px;
              margin: 0 8px;
              overflow: hidden;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

              .el-menu-item {
                margin: 2px 0;
                border-radius: 4px;
                transition: all 0.2s ease;

                &:hover {
                  background-color: rgba(52, 152, 219, 0.1);
                  transform: translateX(4px);
                }

                &.is-active {
                  background-color: rgba(52, 152, 219, 0.2);
                  transform: translateX(8px);
                }
              }
            }
          }

        // 折叠状态下的样式
        &.el-menu--collapse {
          .el-menu-item,
          .el-sub-menu__title {
            text-align: center;
            padding: 0 !important;

            .el-icon {
              margin-right: 0;
            }
          }

          .el-sub-menu {
            .el-sub-menu__title {
              .el-sub-menu__icon-arrow {
                display: none;
              }
            }
          }
        }
      }
    }

    .main-content {
      background-color: #f8f9fa;
      padding: 0;
      overflow-y: auto;
      transition: all 0.3s ease;
      flex: 1;
      min-width: 0;

      .page-content {
        padding: 20px;
      }
    }
  }
}

// 下拉菜单样式
:deep(.el-dropdown-menu) {
  .el-dropdown-menu__item {
    display: flex;
    align-items: center;

    .el-icon {
      margin-right: 8px;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .layout-container {
    .header {
      .header-left {
        .system-title {
          display: none;
        }
      }
    }

    .main-container {
      .sidebar {
        position: fixed;
        height: calc(100vh - 60px);
        z-index: 999;

        &.left-sidebar {
          box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
        }

        &.right-sidebar {
          right: 0;
          box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
        }
      }

      .main-content {
        margin-left: 0 !important;
        margin-right: 0 !important;
      }
    }
  }
}
</style>

