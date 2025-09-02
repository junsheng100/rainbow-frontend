<template>
  <el-menu
    :default-active="defaultActive"
    class="sidebar-menu"
    :router="router"
    :collapse="collapse"
    :background-color="backgroundColor"
    :text-color="textColor"
    :active-text-color="activeTextColor"
    :collapse-transition="collapseTransition"
    @select="handleSelect"
  >
    <!-- 首页概览 -->
    <el-menu-item index="/dashboard" class="menu-item">
      <el-icon>
        <HomeFilled />
      </el-icon>
      <template #title>首页概览</template>
    </el-menu-item>

    <!-- 动态菜单项 -->
    <template v-for="route in menuRoutes" :key="route.path">
      <!-- 如果是叶子节点，渲染为菜单项 -->
      <el-menu-item
        v-if="!hasChildren(route)"
        :index="resolvePath(route.path)"
        class="menu-item"
      >
        <el-icon v-if="route.meta?.icon">
          <component :is="route.meta.icon" />
        </el-icon>
        <template #title>{{ route.meta?.title }}</template>
      </el-menu-item>

      <!-- 如果有子节点，渲染为子菜单 -->
      <el-sub-menu
        v-else
        :index="resolvePath(route.path)"
        class="sub-menu"
      >
        <template #title>
          <el-icon v-if="route.meta?.icon">
            <component :is="route.meta?.icon" />
          </el-icon>
          <span>{{ route.meta?.title }}</span>
        </template>
        <!-- 递归渲染子菜单 -->
        <el-menu-item
          v-for="child in getVisibleChildren(route)"
          :key="child.path"
          :index="resolveChildPath(route.path, child.path)"
          class="menu-item"
        >
          <el-icon v-if="child.meta?.icon">
            <component :is="child.meta.icon" />
          </el-icon>
          <template #title>{{ child.meta?.title }}</template>
        </el-menu-item>
      </el-sub-menu>
    </template>
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePermissionStore } from '@/store/modules/permission'
import { HomeFilled } from '@element-plus/icons-vue'

// 定义组件属性
interface Props {
  defaultActive?: string
  router?: boolean
  collapse?: boolean
  backgroundColor?: string
  textColor?: string
  activeTextColor?: string
  collapseTransition?: boolean
}

withDefaults(defineProps<Props>(), {
  defaultActive: '/dashboard',
  router: true,
  collapse: false,
  backgroundColor: '#2c3e50',
  textColor: '#bdc3c7',
  activeTextColor: '#3498db',
  collapseTransition: false
})

// 定义事件
const emit = defineEmits<{
  select: [index: string, indexPath: string[], item: any]
}>()

const permissionStore = usePermissionStore()

// 过滤出需要在菜单中显示的路由
const menuRoutes = computed(() => {
  return permissionStore.routes.filter(route => {
    // 过滤掉隐藏的路由
    return !route.meta?.hidden
  })
})

// 检查是否有子菜单
const hasChildren = (route: any): boolean => {
  return route.children && route.children.length > 0
}

// 获取可见的子菜单
const getVisibleChildren = (route: any): any[] => {
  return route.children?.filter((child: any) => !child.meta?.hidden) || []
}

// 解析路径，确保路径是完整的
const resolvePath = (basePath: string, routePath?: string): string => {
  if (routePath) {
    if (routePath.startsWith('/')) {
      return routePath
    }
    return basePath + '/' + routePath
  }

  if (basePath.startsWith('/')) {
    return basePath
  }
  return '/' + basePath
}

// 解析子路径，避免路径重复
const resolveChildPath = (parentPath: string, childPath: string): string => {
  // 如果子路径已经是绝对路径，直接返回
  if (childPath.startsWith('/')) {
    return childPath
  }

  // 确保父路径是绝对路径
  const normalizedParentPath = parentPath.startsWith('/') ? parentPath : '/' + parentPath

  // 拼接路径，避免重复
  const result = normalizedParentPath + '/' + childPath

  // 开发环境下打印路径解析信息
  // if (import.meta.env.DEV) {
  //   console.log('路径解析:', {
  //     parentPath,
  //     childPath,
  //     normalizedParentPath,
  //     result
  //   })
  // }

  return result
}

// 处理菜单选择事件
const handleSelect = (index: string, indexPath: string[], item: any) => {
  emit('select', index, indexPath, item)
}
</script>

<style lang="scss" scoped>
.sidebar-menu {
  border: none;
  height: 100%;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }

  :deep(.el-menu-item) {
    &.is-active {
      background-color: rgba(52, 152, 219, 0.2);
    }

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }

  :deep(.el-sub-menu) {
    .el-sub-menu__title {
      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
    }

    .el-menu {
      background-color: rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
