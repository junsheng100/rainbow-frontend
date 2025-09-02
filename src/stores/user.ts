import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login, logout, refreshAccessToken, changePassword, getCurrentUserInfo, updateUserProfile, type ChangePasswordParams, type UserInfo, type LoginResponse } from '@/api/auth'
import { TokenCookie, CookieService, defaultCookieOptions } from '@/utils/cookies'

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
  const userInfo = ref<UserInfo>(getUserInfoFromStorage())
  const hasUserInfo = ref<boolean>(!!userInfo.value.userId)
  
  // 添加权限和角色属性
  const permissions = ref<string[]>([])
  const roles = ref<string[]>([])

  const setToken = (newToken: string) => {
    token.value = newToken
    TokenCookie.setAccessToken(newToken)
  }

  const setRefreshToken = (newRefreshToken: string) => {
    refreshToken.value = newRefreshToken
    TokenCookie.setRefreshToken(newRefreshToken)
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
    const res: LoginResponse = await login({ userName, password })
    // 设置token
    if (res.accessToken) {
      setToken(res.accessToken)
    }

    // 设置refreshToken
    if (res.refreshToken) {
      setRefreshToken(res.refreshToken)
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
    
    // 登录成功后，立即获取完整的用户权限信息
    try {
      await getUserInfo()
    } catch (error) {
      console.error('登录后获取用户权限信息失败:', error)
      // 即使获取权限信息失败，也不影响登录流程
    }
    
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
    try {
      await logout()
    } catch (error) {
      console.error('登出API调用失败:', error)
    }

    // 清除所有用户相关的存储
    token.value = ''
    refreshToken.value = ''
    userInfo.value = DEFAULT_USER_INFO
    hasUserInfo.value = false
    permissions.value = [] // 清除权限
    roles.value = [] // 清除角色
    TokenCookie.clearTokens() // 清除Cookie中的token
    UserInfoCookie.clearUserInfo() // 清除Cookie中的用户信息
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
