/// <reference types="node" />
import { getResourceUrl } from '@/config'
import { publicService } from "@/utils/request.ts"
import { ApiResponse } from "@/types/common.ts"
import request from './request'

export interface WallpaperResponse {
  id: string
  url: string
  title: string
  copyright: string
  date: string
  localPath?: string
}

export class SystemWallpaperService {
  private readonly CACHE_KEY = 'system_wallpaper'
  private readonly CACHE_TIMESTAMP_KEY = 'system_wallpaper_timestamp'
  private readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7天
  private readonly DEFAULT_WALLPAPER: WallpaperResponse = {
    id: 'default',
    title: 'Rainbow 默认背景',
    copyright: 'Rainbow System',
    url: '/src/assets/images/bg.jpg',
    date: new Date().toISOString(),
    localPath: '/src/assets/images/bg.jpg'
  }

  private wallpapers: WallpaperResponse[] = []
  private currentIndex = 0
  private timer: NodeJS.Timeout | null = null
  private onImageChangeCallback: ((imageUrl: string, imageInfo: WallpaperResponse) => void) | null = null
  private baseUrl = '/wallpaper'

  /**
   * 获取壁纸数据
   */
  async fetchWallpapers(): Promise<WallpaperResponse[]> {
    try {
      // 检查缓存
      const cachedData = this.getCachedData()
      if (cachedData) {
        return cachedData
      }

      // 获取新的壁纸数据
      // //  console.log('开始获取壁纸数据...')
      const response = await publicService.get<ApiResponse<WallpaperResponse[]>>(`/wallpaper/public/latest`)

      if (!response.data.code) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      if (response.data.code === 200 && Array.isArray(response.data.data)) {
        //  console.log('成功获取壁纸数据:', response.data.data)
        // 缓存数据
        this.setCachedData({ wallpapers: response.data.data })
        return response.data.data
      } else {
        console.error('API返回数据格式不正确:', response.data)
        throw new Error('没有获取到壁纸数据')
      }
    } catch (error) {
      console.warn('获取壁纸失败，使用默认背景:', error)
      return [this.DEFAULT_WALLPAPER]
    }
  }

  /**
   * 获取缓存数据
   */
  private getCachedData(): WallpaperResponse[] | null {
    try {
      const timestamp = localStorage.getItem(this.CACHE_TIMESTAMP_KEY)
      const now = Date.now()

      // 检查缓存是否过期
      if (timestamp && (now - parseInt(timestamp)) < this.CACHE_DURATION) {
        const cachedData = localStorage.getItem(this.CACHE_KEY)
        if (cachedData) {
          const parsedData = JSON.parse(cachedData)
          return parsedData
        }
      }

      //  console.log('缓存已过期或不存在')
      // 缓存过期或不存在，清理旧缓存
      localStorage.removeItem(this.CACHE_KEY)
      localStorage.removeItem(this.CACHE_TIMESTAMP_KEY)
      return null
    } catch (error) {
      console.error('读取缓存失败:', error)
      return null
    }
  }

  /**
   * 设置缓存数据
   */
  private setCachedData({ wallpapers }: { wallpapers: WallpaperResponse[] }): void {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(wallpapers))
      localStorage.setItem(this.CACHE_TIMESTAMP_KEY, Date.now().toString())
    } catch (error) {
      // 忽略缓存错误
    }
  }

  /**
   * 初始化壁纸
   */
  async initCarousel(): Promise<void> {
    try {
      const wallpapers = await this.fetchWallpapers()
      this.wallpapers = wallpapers

      // //  console.log('获取到的壁纸数量:', wallpapers.length)

      // 随机选择起始图片
      this.currentIndex = Math.floor(Math.random() * this.wallpapers.length)

      // 显示壁纸
      this.showCurrentWallpaper()

      // 启动轮播定时器
      this.startTimer()

      // //  console.log('壁纸轮播初始化完成')
    } catch (error) {
      console.error('初始化壁纸失败:', error)

      // 使用默认壁纸
      this.wallpapers = [this.DEFAULT_WALLPAPER]
      this.currentIndex = 0
      this.showCurrentWallpaper()
    }
  }

  /**
   * 启动定时器
   */
  private startTimer(): void {
    if (this.timer) {
      clearInterval(this.timer)
    }

    // 每1分钟切换一次壁纸
    this.timer = setInterval(() => {
      this.nextWallpaper()
    }, 60 * 1000) // 1分钟
  }

  /**
   * 显示当前壁纸
   */
  private showCurrentWallpaper(): void {
    if (this.wallpapers.length === 0) {
      console.warn('没有可用的壁纸数据')
      return
    }

    const currentWallpaper = this.wallpapers[this.currentIndex]


    // 处理图片 URL
    let imageUrl = currentWallpaper.url

    // 优先使用 localPath
    if (currentWallpaper.localPath) {
      imageUrl = getResourceUrl(currentWallpaper.localPath)
    }
    // 如果没有 localPath，检查 url 是否需要处理
    else if (!currentWallpaper.url.startsWith('http')) {
      imageUrl = getResourceUrl(currentWallpaper.url)
    }

    // //  console.log('最终处理后的图片 URL:', imageUrl)

    // 调用回调函数
    if (this.onImageChangeCallback) {
      this.onImageChangeCallback(
        imageUrl,
        currentWallpaper
      )
    } else {
      console.warn('未设置图片变化回调函数')
    }
  }

  /**
   * 切换到下一张壁纸
   */
  nextWallpaper(): void {

    if (this.wallpapers.length <= 1) {
      return
    }

    this.currentIndex = (this.currentIndex + 1) % this.wallpapers.length
    this.showCurrentWallpaper()
  }

  /**
   * 切换到上一张壁纸
   */
  prevWallpaper(): void {

    if (this.wallpapers.length <= 1) {
      //  console.log('壁纸数量不足，无法切换')
      return
    }

    this.currentIndex = (this.currentIndex - 1 + this.wallpapers.length) % this.wallpapers.length
    this.showCurrentWallpaper()
  }

  /**
   * 设置图片变化回调
   */
  onImageChange(callback: (imageUrl: string, imageInfo: WallpaperResponse) => void): void {
    this.onImageChangeCallback = callback
  }

  /**
   * 停止服务
   */
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  /**
   * 手动刷新
   */
  async refresh(): Promise<void> {
    // //  console.log('=== 开始刷新壁纸数据 ===')
    // 清除缓存
    localStorage.removeItem(this.CACHE_KEY)
    localStorage.removeItem(this.CACHE_TIMESTAMP_KEY)

    // 重新初始化
    await this.initCarousel()
    // //  console.log('刷新完成')
  }

  // 获取壁纸列表
  async getWallpapers(): Promise<WallpaperResponse[]> {
    const response = await request.get(this.baseUrl)
    return response.data
  }

  // 获取指定日期的壁纸
  async getWallpaperByDate(date: string): Promise<WallpaperResponse> {
    const response = await request.get(`${this.baseUrl}/${date}`)
    return response.data
  }

  // 获取随机壁纸
  async getRandomWallpaper(): Promise<WallpaperResponse> {
    const response = await request.get(`${this.baseUrl}/random`)
    return response.data
  }

  // 刷新壁纸数据
  async refreshWallpapers(): Promise<WallpaperResponse[]> {
    const response = await request.post(`${this.baseUrl}/refresh`)
    return response.data
  }
}

// 导出单例实例
export const systemWallpaperService = new SystemWallpaperService()
