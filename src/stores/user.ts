import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login, logout, refreshAccessToken, changePassword, getCurrentUserInfo, updateUserProfile, type ChangePasswordParams, type UserInfo, type LoginResponse } from '@/api/auth'
import { TokenCookie, CookieService, defaultCookieOptions } from '@/utils/cookies'
import { clearUserCredentials } from '@/utils/auth'
import { tokenManager } from '@/utils/tokenManager'

// 用户信息相关的cookie操作
const UserInfoCookie = {
  // 设置用户信息
  setUserInfo(info: UserInfo): void {
    CookieService.set('userInfo', JSON.stringify(info), {
      ...defaultCookieOptions,
      expires: 7 // 7天过期
    });
  },

  // 获取用户信息
  getUserInfo(): UserInfo | null {
    const userInfoStr = CookieService.get('userInfo');
    if (userInfoStr) {
      try {
        return JSON.parse(userInfoStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  // 清除用户信息
  clearUserInfo(): void {
    CookieService.remove('userInfo', defaultCookieOptions);
  }
};

// 默认用户信息
const DEFAULT_USER_INFO: UserInfo = {
  userId: '',
  userName: '',
  nickname: '',
  avatar:''
}

// 从cookie获取用户信息
const getUserInfoFromStorage = (): UserInfo => {
  const userInfo = UserInfoCookie.getUserInfo();
  return userInfo || DEFAULT_USER_INFO;
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(TokenCookie.getAccessToken() || '')
  const refreshToken = ref<string>(TokenCookie.getRefreshToken() || '')
  const tokenType = ref<string>(TokenCookie.getTokenType() || 'Bearer')
  const userInfo = ref<UserInfo>(getUserInfoFromStorage())
  const hasUserInfo = ref<boolean>(!!userInfo.value.userId)
  
  // 添加权限和角色属性
  const permissions = ref<string[]>([])
  const roles = ref<string[]>([])

  const setToken = (newToken: string) => {
    console.log('🔧 开始设置 accessToken 到 store 和 cookie:', {
      tokenLength: newToken.length,
      tokenPreview: newToken.substring(0, 30) + '...',
      currentStoreValue: token.value ? 'exists' : 'missing',
      fullToken: newToken
    })
    
    // 设置到 store
    token.value = newToken
    console.log('✅ accessToken 已设置到 Pinia store')
    
    // 设置到 cookie
    TokenCookie.setAccessToken(newToken)
    console.log('✅ accessToken 已设置到 Cookie')
    
    // 立即验证 token 是否真的被设置到 cookie 中
    const verifyToken = TokenCookie.getAccessToken()
    console.log('🔍 验证 accessToken 存储结果:', {
      cookieHasToken: !!verifyToken,
      tokenMatches: verifyToken === newToken,
      verifyTokenLength: verifyToken?.length || 0,
      verifyTokenPreview: verifyToken ? verifyToken.substring(0, 30) + '...' : 'none'
    })
    
    // 验证原始 cookie 字符串
    const rawCookie = document.cookie
    const tokenInRawCookie = rawCookie.includes('token=')
    console.log('🔍 验证原始 Cookie 字符串:', {
      hasTokenInRawCookie: tokenInRawCookie,
      rawCookieLength: rawCookie.length,
      rawCookiePreview: rawCookie.substring(0, 100) + '...'
    })
  }

  const setRefreshToken = (newRefreshToken: string) => {
    console.log('🔧 开始设置 refreshToken 到 store 和 cookie:', {
      tokenLength: newRefreshToken.length,
      tokenPreview: newRefreshToken.substring(0, 30) + '...',
      currentStoreValue: refreshToken.value ? 'exists' : 'missing'
    })
    
    // 设置到 store
    refreshToken.value = newRefreshToken
    console.log('✅ refreshToken 已设置到 Pinia store')
    
    // 设置到 cookie
    TokenCookie.setRefreshToken(newRefreshToken)
    console.log('✅ refreshToken 已设置到 Cookie')
    
    // 验证 refreshToken 是否真的被设置到 cookie 中
    const verifyRefreshToken = TokenCookie.getRefreshToken()
    console.log('🔍 验证 refreshToken 存储结果:', {
      cookieHasRefreshToken: !!verifyRefreshToken,
      refreshTokenMatches: verifyRefreshToken === newRefreshToken,
      verifyRefreshTokenLength: verifyRefreshToken?.length || 0
    })
  }

  const setTokenType = (newTokenType: string) => {
    console.log('🔧 设置 tokenType:', {
      tokenType: newTokenType,
      currentTokenType: tokenType.value
    })
    
    // 设置到 store
    tokenType.value = newTokenType
    
    // 设置到 cookie
    TokenCookie.setTokenType(newTokenType)
    console.log('✅ tokenType 已设置到 store 和 cookie')
  }

  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info
    hasUserInfo.value = !!info.userId
    
    // 更新角色信息 - 支持多种可能的字段名
    const roleFields = ['roleNameList', 'roles']
    for (const field of roleFields) {
      if (info[field as keyof UserInfo] && Array.isArray(info[field as keyof UserInfo])) {
        roles.value = info[field as keyof UserInfo] as string[]
        break
      }
    }
    
    // 更新权限信息 - 支持多种可能的字段名
    const permissionFields = ['permissions', 'perms', 'authorities', 'roleNameList', 'roles']
    for (const field of permissionFields) {
      if (info[field as keyof UserInfo] && Array.isArray(info[field as keyof UserInfo])) {
        permissions.value = info[field as keyof UserInfo] as string[]
        break
      }
    }
    
    // 将用户信息持久化到cookie
    UserInfoCookie.setUserInfo(info)
  }

  // 获取用户信息API调用
  const getUserInfo = async () => {
    try {
      const res = await getCurrentUserInfo()
      setUserInfo(res)
      return res
    } catch (error) {
      // console.error('获取用户信息失败:', error)
      // 如果获取失败，尝试使用已存储的信息
      if (!userInfo.value.userId || !userInfo.value.userName) {
        throw error
      }
      return userInfo.value
    }
  }

  const loginAction = async (userName: string, password: string) => {
    console.log('🚀 开始登录流程:', { userName })
    
    // 登录前清理所有旧的认证相关数据，避免冲突
    console.log('🧹 清理旧的认证数据...')
    
    // 清理本地 store 数据
    token.value = ''
    refreshToken.value = ''
    tokenType.value = 'Bearer'
    userInfo.value = DEFAULT_USER_INFO
    hasUserInfo.value = false
    permissions.value = []
    roles.value = []
    console.log('✅ 本地 store 数据已清理')
    
    // 清理所有 Cookie 数据
    TokenCookie.clearAllCookies()
    console.log('✅ 所有 Cookie 数据已清理')
    
    // 清理 localStorage 中的用户凭证
    clearUserCredentials()
    console.log('✅ localStorage 用户凭证已清理')
    
    // 清理 localStorage 中可能存在的其他认证相关数据
    try {
      // 清理可能存在的 token 相关数据
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (
          key.toLowerCase().includes('token') ||
          key.toLowerCase().includes('auth') ||
          key.toLowerCase().includes('session') ||
          key.toLowerCase().includes('user') ||
          key.toLowerCase().includes('login')
        )) {
          keysToRemove.push(key)
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key)
        console.log('🧹 清理 localStorage 中的认证相关数据:', key)
      })
      
      if (keysToRemove.length > 0) {
        console.log('✅ localStorage 中其他认证相关数据已清理:', keysToRemove)
      }
    } catch (error) {
      console.warn('⚠️ 清理 localStorage 时出错:', error)
    }
    
    const res: LoginResponse = await login({ userName, password })
    console.log('🎉 登录成功，收到服务端响应:', {
      hasAccessToken: !!res.accessToken,
      hasRefreshToken: !!res.refreshToken,
      accessTokenLength: res.accessToken?.length || 0,
      refreshTokenLength: res.refreshToken?.length || 0,
      accessTokenPreview: res.accessToken ? res.accessToken.substring(0, 30) + '...' : 'none',
      refreshTokenPreview: res.refreshToken ? res.refreshToken.substring(0, 30) + '...' : 'none',
      fullResponse: res
    })
    
    // 设置token
    if (res.accessToken) {
      console.log('🔧 开始设置 accessToken...')
      setToken(res.accessToken)
      console.log('✅ accessToken 设置完成')
    } else {
      console.error('❌ 登录响应中没有 accessToken!')
    }

    // 设置refreshToken
    if (res.refreshToken) {
      console.log('🔧 开始设置 refreshToken...')
      setRefreshToken(res.refreshToken)
      console.log('✅ refreshToken 设置完成')
    } else {
      console.error('❌ 登录响应中没有 refreshToken!')
    }

    // 设置tokenType
    if (res.tokenType) {
      console.log('🔧 开始设置 tokenType...')
      setTokenType(res.tokenType)
      console.log('✅ tokenType 设置完成')
    } else {
      console.warn('⚠️ 登录响应中没有 tokenType，使用默认值 Bearer')
      setTokenType('Bearer')
    }

    // 设置用户信息，兼容不同的响应格式
    const userInfoToSet: UserInfo = {
      userId: res.userId || '',
      userName: res.userName || userName,
      nickname: res.nickname ,
      userType: res.userType,
      avatar: res.avatar
    }
    setUserInfo(userInfoToSet)
    
    // 登录完成后的总结
    console.log('🎯 登录流程完成总结:', {
      accessTokenInStore: !!token.value,
      refreshTokenInStore: !!refreshToken.value,
      tokenTypeInStore: tokenType.value,
      accessTokenInCookie: !!TokenCookie.getAccessToken(),
      refreshTokenInCookie: !!TokenCookie.getRefreshToken(),
      tokenTypeInCookie: TokenCookie.getTokenType(),
      userInfoSet: !!userInfoToSet.userId
    })
    
    // 启动自动刷新token定时器
    console.log('⏰ 启动自动刷新token定时器...')
    tokenManager.startAutoRefresh()
    
    // 登录成功后，延迟获取完整的用户权限信息，确保 token 已存储
    setTimeout(async () => {
      console.log('⏰ 延迟获取用户权限信息开始...')
      try {
        await getUserInfo()
        console.log('✅ 用户权限信息获取成功')
      } catch (error) {
        console.error('❌ 登录后获取用户权限信息失败:', error)
        // 即使获取权限信息失败，也不影响登录流程
      }
    }, 100) // 延迟100ms确保token已存储
    
    return userInfoToSet
  }

  /**
   * 刷新访问令牌
   * @returns 返回刷新结果，成功为true，失败为false
   */
  const refreshTokenAction = async (): Promise<boolean> => {
    if (!refreshToken.value) {
      return false
    }

    try {
      const res = await refreshAccessToken(refreshToken.value)
      setToken(res.accessToken)
      setRefreshToken(res.refreshToken)
      return true
    } catch (error) {
      console.error('刷新令牌失败:', error)
      return false
    }
  }

  const changePasswordAction = async (data: ChangePasswordParams) => {
    return await changePassword(data)
  }

  const logoutAction = async () => {
    console.log('🚪 开始登出流程...')
    
    // 停止自动刷新token定时器
    console.log('⏹️ 停止自动刷新token定时器...')
    tokenManager.stopAutoRefresh()
    
    // 先清空所有用户相关的存储和Cookie
    console.log('🧹 清除本地存储和Cookie...')
    token.value = ''
    refreshToken.value = ''
    tokenType.value = 'Bearer' // 重置为默认值
    userInfo.value = DEFAULT_USER_INFO
    hasUserInfo.value = false
    permissions.value = [] // 清除权限
    roles.value = [] // 清除角色
    TokenCookie.clearAllCookies() // 清除所有Cookie
    clearUserCredentials() // 清除localStorage中的用户凭证
    
    // 清理 localStorage 中可能存在的其他认证相关数据
    try {
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (
          key.toLowerCase().includes('token') ||
          key.toLowerCase().includes('auth') ||
          key.toLowerCase().includes('session') ||
          key.toLowerCase().includes('user') ||
          key.toLowerCase().includes('login')
        )) {
          keysToRemove.push(key)
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key)
        console.log('🧹 登出时清理 localStorage 中的认证相关数据:', key)
      })
      
      if (keysToRemove.length > 0) {
        console.log('✅ 登出时清理 localStorage 中其他认证相关数据:', keysToRemove)
      }
    } catch (error) {
      console.warn('⚠️ 登出时清理 localStorage 时出错:', error)
    }
    
    console.log('✅ 本地存储和Cookie已清除')

    // 然后调用服务端登出API
    try {
      console.log('📡 调用服务端登出API...')
      await logout()
      console.log('✅ 服务端登出API调用成功')
    } catch (error) {
      console.error('❌ 登出API调用失败:', error)
      // 即使API调用失败，本地清理已完成，不影响登出流程
    }
    
    console.log('🎯 登出流程完成')
  }

  // 初始化用户信息（页面刷新时调用）
  const initUserInfo = async () => {
    if (token.value && (!userInfo.value.userId || !userInfo.value.userName)) {
      try {
        await getUserInfo()
      } catch (error) {
        // console.error('初始化用户信息失败:', error)
        // 如果获取用户信息失败，可能token已过期，执行登出
        await logoutAction()
      }
    }
  }

  /**
   * 更新用户个人信息
   * @param userProfileData 要更新的用户信息
   */
  const updateUserProfileAction = async (userProfileData: Partial<UserInfo>) => {
    if (!userInfo.value.userId) {
      throw new Error('用户未登录或用户ID不存在')
    }

    try {
      // 确保包含userId
      const updateData = {
        ...userProfileData,
        userId: userInfo.value.userId
      }

      await updateUserProfile(updateData)

      // 更新本地存储的用户信息
      setUserInfo({
        ...userInfo.value,
        ...userProfileData
      })

      return true
    } catch (error) {
      console.error('更新用户信息失败:', error)
      throw error
    }
  }

  return {
    token,
    refreshToken,
    tokenType,
    userInfo,
    hasUserInfo,
    permissions,
    roles,
    login: loginAction,
    getUserInfo,
    initUserInfo,
    refreshAccessToken: refreshTokenAction,
    changePassword: changePasswordAction,
    logout: logoutAction,
    updateUserProfile: updateUserProfileAction
  }
})
