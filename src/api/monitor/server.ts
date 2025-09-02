import request from '@/utils/request.ts'

// 服务器信息接口
export interface ServerInfo {
  cpu: {
    cpuNum: number
    total: number
    sys: number
    used: number
    wait: number
    free: number
  }
  mem: {
    total: number
    used: number
    free: number
    usage: number
  }
  jvm: {
    total: number
    max: number
    free: number
    version: string
    home: string
    name: string
    startTime: string
    runTime: string
    inputArgs: string
    usage: number
  }
  sys: {
    computerName: string
    computerIp: string
    userDir: string
    osName: string
    osArch: string
  }
  sysFiles: Array<{
    dirName: string
    sysTypeName: string
    typeName: string
    total: string
    free: string
    used: string
    usage: string
  }>
}

// 查询服务器信息
export function getServer() {
  return request.get<ServerInfo>('/monitor/server')
}
