
export interface TaskConfig {
  id?: string
  taskName: string
  beanName: string
  methodName: string
  cronExpression: string
  disabled: number
  runStatus: number
  orderNum: number
  fcd?: string
  status?: string
  params?: TaskConfigParams[]
}

export interface TaskConfigParams {
  id?: string
  configId?: string
  params: string
  orderNum: number
}
