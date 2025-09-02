// 用户类型信息接口
export interface UserTypeInfo {
  id: number
  label: string
  value: string
  description?: string
}

// 获取用户类型列表
export const getUserTypeList = () => {
  // 返回模拟数据，实际项目中可以改为API调用
  return Promise.resolve({
    data: [
      { id: 1, label: '管理员', value: 'admin', description: '拥有用户管理权限' },
      { id: 2, label: '普通用户', value: 'user', description: '普通用户权限' }
    ] as UserTypeInfo[]
  })
}
