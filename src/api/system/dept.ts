import request from '@/utils/request.ts'
import type {BaseVo} from "@/types/common.ts"

export interface DeptInfo {
    deptId?: number
    parentId?: number | null
    ancestors?: string
    deptName: string
    parentName?: string
    orderNum: number
    leader?: string
    phone?: string
    email?: string
    status: string // '0'正常 '1'停用
    overview?: string // 部门简介
    fcd?: string
    fcu?: string
    lcd?: string
    lcu?: string
    children?: DeptInfo[]
}

export interface DeptUserInfo {
    deptId?: number
    deptName: string
    userId?: string
    userName: string
    nickname?: string
}

export interface DeptQuery {
    deptName?: string
    status?: string // '0'正常 '1'停用
}

// 获取部门树形列表
export const getDeptList = (params?: DeptQuery) => {
    const vo: BaseVo<DeptQuery> = {
        data: {
            deptName: params?.deptName
        }
    }
    return request.post<DeptInfo[]>('/dept/tree/view', vo)
}

// 获取子部门列表
export const getChildList = (deptId: number) => {
    return request.get<DeptInfo[]>(`/dept/child/${deptId}`)
}

// 获取部门详情
export const getDeptInfo = (deptId: number) => {
    return request.get<DeptInfo>(`/dept/${deptId}`)
}

// 创建部门
export const createDept = (data: DeptInfo) => {
    return request.post<DeptInfo>('/dept', data)
}

// 更新部门
export const updateDept = (data: DeptInfo) => {
    return request.post<DeptInfo>('/dept', data)
}

// 删除部门
export const deleteDept = (deptId: number) => {
    return request.delete<boolean>(`/dept/${deptId}`)
}

// 获取部门选择器数据
export const getDeptSelectList = () => {
    const vo: BaseVo<DeptQuery> = {
        data: {
            status: '0'
        }
    }
    return request.post<DeptInfo[]>('/dept/list', vo)
}


export const getDeptUserList = (pushType :string,deptIdList: number[]) => {

    const data = {
        pushType : pushType,
        deptIdList :  deptIdList
    }
    return request.post<DeptUserInfo[]>(`/dept/user`, data)
}
