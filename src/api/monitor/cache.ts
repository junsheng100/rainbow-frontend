import request from '@/utils/request.ts'

// Redis 基本信息接口
export interface RedisInfo {
  redis_version: string
  redis_mode: string
  tcp_port: number
  connected_clients: number
  uptime_in_days: number
  used_memory_human: string
  used_cpu_user_children: string
  maxmemory_human: string
  aof_enabled: string
  rdb_last_bgsave_status: string
  instantaneous_input_kbps: number
  instantaneous_output_kbps: number
}

// 命令统计接口
export interface CommandStat {
  name: string
  value: number
}

// 缓存信息接口
export interface CacheInfo {
  info: RedisInfo
  dbSize: number
  commandStats: CommandStat[]
}

// 获取缓存监控信息
export function getCache() {
  return request.get<CacheInfo>('/monitor/cache')
}
