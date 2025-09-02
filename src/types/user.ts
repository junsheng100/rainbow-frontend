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

export interface LoginForm {
  userName: string
  password: string
}

export interface ChangePasswordForm {
  oldPassword: string
  newPassword: string
  confirmPassword?: string
}
