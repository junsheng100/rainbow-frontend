import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { WallpaperResponse } from '@/utils/systemWallpaper'

export const useWallpaperStore = defineStore('wallpaper', () => {
  // 当前壁纸列表
  const wallpapers = ref<WallpaperResponse[]>([])
  
  // 当前显示的壁纸索引
  const currentIndex = ref(0)
  
  // 获取当前壁纸
  const currentWallpaper = computed(() => {
    return wallpapers.value[currentIndex.value]
  })
  
  // 设置壁纸列表
  const setWallpapers = (newWallpapers: WallpaperResponse[]) => {
    wallpapers.value = newWallpapers
    currentIndex.value = 0
  }
  
  // 下一张壁纸
  const nextWallpaper = () => {
    if (currentIndex.value < wallpapers.value.length - 1) {
      currentIndex.value++
    } else {
      currentIndex.value = 0
    }
  }
  
  // 上一张壁纸
  const previousWallpaper = () => {
    if (currentIndex.value > 0) {
      currentIndex.value--
    } else {
      currentIndex.value = wallpapers.value.length - 1
    }
  }
  
  // 清空壁纸列表
  const clearWallpapers = () => {
    wallpapers.value = []
    currentIndex.value = 0
  }

  return {
    wallpapers,
    currentIndex,
    currentWallpaper,
    setWallpapers,
    nextWallpaper,
    previousWallpaper,
    clearWallpapers
  }
}) 