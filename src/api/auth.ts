import request from '@/utils/request'
import type {LoginForm} from '@/types/user'
import type {RouteRecordRaw} from 'vue-router'
import { TokenCookie } from '@/utils/cookies'

export interface LoginResponse {
    accessToken: string
    refreshToken: string
    tokenType: string
    expiresIn: number
    userId: string
    userName: string
    nickname: string
    userType: string
    avatar: string
}

export interface RefreshTokenResponse {
    accessToken: string
    refreshToken: string
    tokenType: string
    expiresIn: number
}

// 修改密码参数接口
export interface ChangePasswordParams {
    userId: string
    oldPassword: string
    newPassword: string
}

export interface LoginParams {
    userName: string
    password: string
}

export interface UserInfo {
    userId: string
    userName: string
    nickname: string
    userType?: string
    accessToken?: string
    email?: string
    phone?: string
    avatar?: string
    deptName?: string
    postNameList?: string[]
    roleNameList?: string[]
    roles?: string[] // 可能的角色字段名
    permissions?: string[] // 用户权限列表
    perms?: string[] // 可能的权限字段名
    authorities?: string[] // 可能的权限字段名
}

export const login = (data: LoginForm) => {
    return request.post<LoginResponse>('/auth/login', data)
}

export const logout = () => {
    return request.post('/auth/logout')
}

/**
 * 刷新访问令牌
 * @param refreshToken 刷新令牌
 */
export const refreshAccessToken = (refreshToken: string) => {
    // 获取动态的 tokenType
    const tokenType = TokenCookie.getTokenType() || 'Bearer'
    const authHeader = refreshToken.startsWith(tokenType + ' ') ? refreshToken : `${tokenType} ${refreshToken}`
    
    return request.post<RefreshTokenResponse>('/auth/refresh', {}, {
        headers: {
            'Authorization': authHeader
        }
    })
}

/**
 * 修改密码
 * @param params 修改密码参数
 */
export const changePassword = (params: ChangePasswordParams) => {
    const {userId, oldPassword, newPassword} = params
    return request.post('/user/' + userId + '/password?oldPassword=' + oldPassword + '&newPassword=' + newPassword)
}

/**
 * 获取当前用户信息
 */
export const getCurrentUserInfo = () => {
    return request.get<UserInfo>('/auth/info')
}

/**
 * 更新用户个人信息
 * @param data 用户信息
 */
export const updateUserProfile = (data: Partial<UserInfo>) => {
    return request.put(`/user/${data.userId}/profile`, data)
}

/**
 * 获取用户菜单
 */
export const getUserMenus = () => {
    return request.get<RouteRecordRaw[]>('/auth/menus')
}
