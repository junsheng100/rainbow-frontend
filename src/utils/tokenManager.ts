import { refreshAccessToken } from '@/api/auth'
import router from '@/router'
import { useUserStore } from '@/stores/user'
import { TokenCookie } from './cookies'

class TokenManager {
  private isRefreshing = false
  private refreshSubscribers: ((token: string) => void)[] = []
  private refreshTimer: NodeJS.Timeout | null = null
  private readonly tokenExpirationBuffer = 5 * 60 * 1000 // 5分钟缓冲时间
  private readonly defaultRefreshInterval = 24 * 3600 * 1000 // 24小时刷新间隔
  private readonly tokenExpirationTime = 7 * 24 * 3600 * 1000 // 7天过期时间

  // 订阅token刷新
  public subscribeTokenRefresh(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback)
  }

  // 通知所有订阅者
  private onTokenRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token))
    this.refreshSubscribers = []
  }

  // 检查token是否即将过期
  public isTokenExpiringSoon(): boolean {
    const token = TokenCookie.getAccessToken()
    if (!token) return true

    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]))
      const expirationTime = tokenData.exp * 1000
      return Date.now() >= expirationTime - this.tokenExpirationBuffer
    } catch (error) {
      console.error('Token parsing error:', error)
      return true
    }
  }

  // 清除token
  public clearToken(): void {
    TokenCookie.clearTokens()
  }

  // 刷新token
  public async refreshTokenIfNeeded(force: boolean = false): Promise<string | null> {
    const userStore = useUserStore()
    const accessToken = TokenCookie.getAccessToken()
    const refreshTokenValue = TokenCookie.getRefreshToken()

    // 只有当用户已登录（有访问令牌）且有刷新令牌时才尝试刷新
    if (!accessToken || !refreshTokenValue || (!force && !this.isTokenExpiringSoon())) {
      return null
    }

    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.subscribeTokenRefresh(resolve)
      })
    }

    try {
      this.isRefreshing = true
      const response = await refreshAccessToken(refreshTokenValue)
      const { accessToken, refreshToken: newRefreshToken } = response

      // 更新存储的token
      userStore.token = accessToken
      TokenCookie.setRefreshToken(newRefreshToken)

      this.onTokenRefreshed(accessToken)
      return accessToken
    } catch (error) {
      // console.error('Token refresh failed:', error)
      // 刷新失败，清除用户信息并跳转到登录页
      await userStore.logout()
      router.push('/login')
      return null
    } finally {
      this.isRefreshing = false
    }
  }

  // 获取当前token
  public async getValidToken(): Promise<string | null> {
    const accessToken = TokenCookie.getAccessToken()
    console.log('🔑 TokenManager.getValidToken:', {
      hasAccessToken: !!accessToken,
      isExpiringSoon: this.isTokenExpiringSoon(),
      tokenLength: accessToken?.length || 0
    })
    
    if (this.isTokenExpiringSoon()) {
      console.log('🔄 Token 即将过期，尝试刷新...')
      const refreshedToken = await this.refreshTokenIfNeeded()
      return refreshedToken
    }
    return accessToken
  }

  // 启动自动刷新token定时器
  public startAutoRefresh(): void {
    this.stopAutoRefresh() // 先清除现有的定时器
    
    console.log('⏰ 启动自动刷新token定时器，间隔:', this.defaultRefreshInterval / 1000 / 3600, '小时')
    
    this.refreshTimer = setInterval(async () => {
      console.log('⏰ 定时器触发，尝试刷新token...')
      try {
        await this.refreshTokenIfNeeded(true)
        console.log('✅ 定时刷新token成功')
      } catch (error) {
        console.error('❌ 定时刷新token失败:', error)
      }
    }, this.defaultRefreshInterval)
  }

  // 停止自动刷新token定时器
  public stopAutoRefresh(): void {
    if (this.refreshTimer) {
      console.log('⏹️ 停止自动刷新token定时器')
      clearInterval(this.refreshTimer)
      this.refreshTimer = null
    }
  }

  // 获取刷新间隔时间（秒）
  public getRefreshInterval(): number {
    return this.defaultRefreshInterval / 1000
  }

  // 获取token过期时间（秒）
  public getTokenExpirationTime(): number {
    return this.tokenExpirationTime / 1000
  }
}

export const tokenManager = new TokenManager()
