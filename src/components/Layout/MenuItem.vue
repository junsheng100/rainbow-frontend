<template>
  <template v-if="route.hidden !== true">
    <!-- 如果是叶子节点，渲染为菜单项 -->
    <el-menu-item v-if="!hasChildren(route)" :index="resolvePath(route.path)" class="menu-item">
      <el-icon v-if="route.meta?.icon">
        <component :is="route.meta.icon"/>
      </el-icon>
      <template #title>{{ route.meta?.title }}</template>
    </el-menu-item>

    <!-- 如果有子节点，渲染为子菜单 -->
    <el-sub-menu v-else :index="resolvePath(route.path)" class="sub-menu">
      <template #title v-if="isIcon(route)">
        <svg-icon v-if="isSvgIcon(route)" :icon-class="route.meta?.icon"/>
        <el-icon v-else>
          <component :is="route.meta?.icon"/>
        </el-icon>
        <span>{{ route.meta?.title }}</span>
      </template>
      <!-- 递归渲染子菜单，传递当前路径作为子菜单的基础路径 -->
      <MenuItem
          v-for="child in route.children"
          :key="child.path"
          :route="child"
          :base-path="resolvePath(route.path)"
      />
    </el-sub-menu>
  </template>
</template>

<script setup lang="ts">
import type {CustomRouteRecordRaw} from '@/router'


const props = defineProps<{
  route: CustomRouteRecordRaw,
  basePath?: string
}>()

const hasChildren = (route: CustomRouteRecordRaw): boolean => {
 // return route.children && route.children.some(child => child.hidden !== true)
  if(route.children && route.children.length>0)
    return true
  return false;
}

// 解析路径，确保路径是完整的
const resolvePath = (routePath: string): string => {
  if (routePath.startsWith('/')) {
    return routePath
  }

  // 如果是相对路径，则与基础路径合并
  if (props.basePath) {
    return props.basePath + '/' + routePath
  }

  return '/' + routePath
}


const isSvgIcon = (route: CustomRouteRecordRaw): boolean => {
  const icon = route.meta?.icon as string | undefined
  return typeof icon === 'string' && icon.startsWith('svg-')
}
const isIcon = (route: CustomRouteRecordRaw): boolean => {
  return typeof route.meta?.icon === 'string'
}

</script>
