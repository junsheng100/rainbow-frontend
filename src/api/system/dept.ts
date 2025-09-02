import request from '@/utils/request.ts'

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

export interface DeptUserQuery {
    pushType?: string
    deptIdList?: (string | number)[]
}

// 获取部门树形列表
export const getDeptTreeView = (vo: DeptQuery) => {
    return request.post<DeptInfo[]>('/dept/tree/view', vo)
}

// 获取子部门列表
export const getDeptChild = (deptId: string | number) => {
    return request.get<DeptInfo[]>(`/dept/child/${deptId}`)
}

// 获取部门详情
export const getDeptById = (deptId: string | number) => {
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
export const deleteDept = (deptId: string | number) => {
    return request.delete<boolean>(`/dept/${deptId}`)
}

// 获取部门选择器数据
export const getDeptList = (vo: DeptQuery) => {
    return request.post<DeptInfo[]>('/dept/list', vo)
}


export const getDeptUser = (data: DeptUserQuery) => {
    console.log("#########",JSON.stringify(data));
    return request.post<DeptUserInfo[]>(`/dept/user`, data)
}
