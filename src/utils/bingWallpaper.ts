export interface BingImage {
  startdate: string
  fullstartdate: string
  enddate: string
  url: string
  urlbase: string
  copyright: string
  copyrightlink: string
  title: string
  quiz: string
  wp: boolean
  hsh: string
  drk: number
  top: number
  bot: number
  hs: any[]
}

export interface BingWallpaperResponse {
  images: BingImage[]
  tooltips: {
    loading: string
    previous: string
    next: string
    walle: string
    walls: string
  }
}

class BingWallpaperService {
  private readonly API_URL = 'https://raw.onmicrosoft.cn/Bing-Wallpaper-Action/main/data/zh-CN_update.json'
  private readonly BING_BASE_URL = 'https://www.bing.com'
  private readonly CACHE_KEY = 'bing_wallpapers'
  private readonly CACHE_TIMESTAMP_KEY = 'bing_wallpapers_timestamp'
  private readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7天

  private images: BingImage[] = []
  private currentIndex = 0
  private timer: NodeJS.Timeout | null = null
  private onImageChangeCallback: ((imageUrl: string, imageInfo: BingImage) => void) | null = null

  /**
   * 获取Bing壁纸数据
   */
  async fetchBingWallpapers(): Promise<BingImage[]> {
    try {
      // 检查缓存
      const cachedData = this.getCachedData()
      if (cachedData && cachedData.length > 0) {
        // console.log('使用缓存的Bing壁纸数据')
        return cachedData
      }

      // console.log('获取新的Bing壁纸数据...')
      const response = await fetch(this.API_URL)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: BingWallpaperResponse = await response.json()

      if (data.images && data.images.length > 0) {
        // 缓存数据
        this.setCachedData(data.images)
        // console.log(`成功获取${data.images.length}张Bing壁纸`)
        return data.images
      } else {
        throw new Error('没有获取到壁纸数据')
      }
    } catch (error) {
      console.error('获取Bing壁纸失败:', error)

      // 如果网络请求失败，尝试使用缓存数据
      const cachedData = this.getCachedData()
      if (cachedData && cachedData.length > 0) {
        // console.log('网络请求失败，使用缓存数据')
        return cachedData
      }

      // 如果没有缓存，返回空数组
      return []
    }
  }

  /**
   * 获取缓存数据
   */
  private getCachedData(): BingImage[] | null {
    try {
      const timestamp = localStorage.getItem(this.CACHE_TIMESTAMP_KEY)
      const now = Date.now()

      // 检查缓存是否过期
      if (timestamp && (now - parseInt(timestamp)) < this.CACHE_DURATION) {
        const cachedData = localStorage.getItem(this.CACHE_KEY)
        if (cachedData) {
          return JSON.parse(cachedData)
        }
      }

      // 缓存过期或不存在，清理旧缓存
      localStorage.removeItem(this.CACHE_KEY)
      localStorage.removeItem(this.CACHE_TIMESTAMP_KEY)
      return null
    } catch (error) {
      // console.error('读取缓存失败:', error)
      return null
    }
  }

  /**
   * 设置缓存数据
   */
  private setCachedData(images: BingImage[]): void {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(images))
      localStorage.setItem(this.CACHE_TIMESTAMP_KEY, Date.now().toString())
    } catch (error) {
      // console.error('设置缓存失败:', error)
    }
  }

  /**
   * 获取完整的图片URL
   */
  getFullImageUrl(image: BingImage, resolution = '1920x1080'): string {
    // 处理URL，确保使用指定分辨率
    let imageUrl = image.url

    // 如果URL中没有分辨率参数，使用urlbase构建
    if (!imageUrl.includes('1920x1080')) {
      imageUrl = `${image.urlbase}_${resolution}.jpg`
    }

    // 确保URL以https://www.bing.com开头
    if (imageUrl.startsWith('/')) {
      imageUrl = this.BING_BASE_URL + imageUrl
    }

    return imageUrl
  }

  /**
   * 初始化轮播
   */
  async initCarousel(): Promise<void> {
    try {
      this.images = await this.fetchBingWallpapers()

      if (this.images.length === 0) {
        console.warn('没有可用的壁纸数据，无法启动轮播')
        return
      }

      // 随机开始位置
      this.currentIndex = Math.floor(Math.random() * this.images.length)

      // 立即显示第一张图片
      this.showCurrentImage()

      // 启动定时器，每分钟切换一次
      this.startTimer()

      console.log(`Bing壁纸轮播已启动，共${this.images.length}张图片`)
    } catch (error) {
      console.error('初始化轮播失败:', error)
    }
  }

  /**
   * 启动定时器
   */
  private startTimer(): void {
    if (this.timer) {
      clearInterval(this.timer)
    }

    // 每分钟切换一次
    this.timer = setInterval(() => {
      this.nextImage()
    }, 60 * 1000) // 60秒
  }

  /**
   * 显示当前图片
   */
  private showCurrentImage(): void {
    if (this.images.length === 0) return

    const currentImage = this.images[this.currentIndex]
    const imageUrl = this.getFullImageUrl(currentImage)

    // console.log(`显示图片: ${currentImage.title} (${this.currentIndex + 1}/${this.images.length})`)

    // 调用回调函数
    if (this.onImageChangeCallback) {
      this.onImageChangeCallback(imageUrl, currentImage)
    }
  }

  /**
   * 切换到下一张图片
   */
  nextImage(): void {
    if (this.images.length === 0) return

    this.currentIndex = (this.currentIndex + 1) % this.images.length
    this.showCurrentImage()
  }

  /**
   * 切换到上一张图片
   */
  prevImage(): void {
    if (this.images.length === 0) return

    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length
    this.showCurrentImage()
  }

  /**
   * 设置图片变化回调
   */
  onImageChange(callback: (imageUrl: string, imageInfo: BingImage) => void): void {
    this.onImageChangeCallback = callback
  }

  /**
   * 获取当前图片信息
   */
  getCurrentImage(): BingImage | null {
    if (this.images.length === 0) return null
    return this.images[this.currentIndex]
  }

  /**
   * 停止轮播
   */
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  /**
   * 预加载图片
   */
  private preloadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = reject
      img.src = url
    })
  }

  /**
   * 预加载所有图片
   */
  async preloadAllImages(): Promise<void> {
    if (this.images.length === 0) return

    // console.log('开始预加载图片...')

    const preloadPromises = this.images.map(async (image) => {
      try {
        const url = this.getFullImageUrl(image)
        await this.preloadImage(url)
        // console.log(`预加载完成: ${image.title}`)
      } catch (error) {
        // console.warn(`预加载失败: ${image.title}`, error)
      }
    })

    await Promise.allSettled(preloadPromises)
    // console.log('图片预加载完成')
  }

  /**
   * 手动刷新数据
   */
  async refresh(): Promise<void> {
    // 清除缓存
    localStorage.removeItem(this.CACHE_KEY)
    localStorage.removeItem(this.CACHE_TIMESTAMP_KEY)

    // 重新初始化
    await this.initCarousel()
  }
}

// 导出单例实例
export const bingWallpaperService = new BingWallpaperService()
