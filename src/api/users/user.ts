import request from '@/utils/request.ts'
import {BaseVo,PageResponse} from "@/types/common.ts"
import {ChangePasswordForm} from "@/types/user.ts";
import {getToken} from "@/utils/auth.ts";


// 用户信息接口
export interface UserInfo {
    userId?: string
    userName: string
    nickname?: string
    email?: string
    phone?: string
    avatar?: string
    deptId?: number
    deptName?: string
    postIdList?: number[]
    postNameList?: string[]
    roleIdList?: number[]
    roleNameList?: string[]
    password?: string
    status?: string // '0'-启用 '1'-禁用 '-1'-删除
    fcd?: string
    lcd?: string
}

export interface UserTotal  {
    total?: number
    login?: number
    online?:number
}

export interface ReetPasswdForm  {
    userId?: string
    userName: string
    nickname?: string
    password?: string
    confirmPassword?: string
}

// 用户查询参数
export interface UserQueryParams {
    page: number
    size: number
    keyword?:string
    status?: string
}



// 获取用户列表
export const getUserList = (params: UserQueryParams) => {
    const vo:BaseVo<UserQueryParams> = {
        pageNo: params.page,
        pageSize: params.size,
        data: {
            keyword:params.keyword,
            status: params.status,
        }
    }
    return request.post<PageResponse<UserInfo>>('/user/page', vo)
}

export const listUser = () => {
    const vo:BaseVo<UserInfo> = {
        data: {
        }
    }
    return request.post<PageResponse<UserInfo>>('/user/list', vo)
}

// 获取用户详情
export const getUserDetail = (id: number) => {
    return request.get<UserInfo>(`/user/${id}`)
}

// 获取用户统计数据
export const getUserTotal = () => {
    return request.get<UserTotal>(`/user/total`)
}

// 创建用户
export const createUser = (data: Partial<UserInfo>) => {
    return request.post<UserInfo>('/user', data)
}

// 更新用户
export const updateUser = (data: Partial<UserInfo>) => {
    return request.post<UserInfo>(`/user`, data)
}

// 删除用户
export const deleteUser = (userId: string) => {
    return request.delete<boolean>(`/user/${userId}`)
}

// 批量删除用户
export const batchDeleteUsers = (ids: string[]) => {
    return request.delete<boolean>('/user/batch', {data: {ids}})
}

// 切换用户状态
export const toggleUserStatus = (userId: string) => {
    return request.put(`/user/${userId}/status`)
}

// 获取当前用户个人信息
export const getUserProfile = () => {
    return request.get<UserInfo>('/user/profile')
}

// 上传用户头像
export const uploadUserAvatar = (formData: FormData) => {
    return request.post<{url: string}>('/user/avatar/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Bearer ' + getToken()
        }
    })
}

// 修改用户密码
export const updateUserPassword = (data: ChangePasswordForm) => {
    return request.post('/user/password', data)
}
// 管理员重置用户密码
export const restUserPassword = (data: ReetPasswdForm) => {
    const userId = data.userId
    const password = data.password
    return request.put<boolean>(`/user/${userId}/rest/${password}`)
}


