import { refreshAccessToken } from '@/api/auth'
import router from '@/router'
import { useUserStore } from '@/stores/user'
import { TokenCookie } from './cookies'

class TokenManager {
  private isRefreshing = false
  private refreshSubscribers: ((token: string) => void)[] = []
  private readonly tokenExpirationBuffer = 5 * 60 * 1000 // 5分钟缓冲时间

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
    if (this.isTokenExpiringSoon()) {
      return await this.refreshTokenIfNeeded()
    }
    return TokenCookie.getAccessToken()
  }
}

export const tokenManager = new TokenManager()
