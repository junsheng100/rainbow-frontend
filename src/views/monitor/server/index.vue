<template>
  <div class="app-container">
    <el-card class="mb-20">
      <div class="refresh-settings">
        <el-switch
          v-model="autoRefresh"
          active-text="自动刷新"
          inactive-text="手动刷新"
          @change="toggleAutoRefresh"
        />
        <el-input-number
          v-if="autoRefresh"
          v-model="refreshInterval"
          :min="5"
          :max="300"
          size="small"
          @change="changeRefreshInterval"
        />
        <span v-if="autoRefresh" class="refresh-hint">秒</span>
        <el-button type="primary" @click="getList">
          <el-icon><Refresh /></el-icon>
          立即刷新
        </el-button>
        <span v-if="lastRefreshTime" class="refresh-time">上次刷新时间: {{ lastRefreshTime }}</span>
      </div>
    </el-card>
    <el-row>
      <el-col :span="12" class="card-box">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>CPU</span>
              <el-button type="primary" size="small" @click="getList">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%">
              <thead>
                <tr>
                  <th class="el-table__cell is-leaf"><div class="cell">属性</div></th>
                  <th class="el-table__cell is-leaf"><div class="cell">值</div></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">核心数</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="server.cpu">{{ server.cpu.cpuNum }}</div></td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">用户使用率</div></td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="server.cpu">
                      <el-progress :percentage="server.cpu.used" :format="() => formatPercentage(server.cpu.used)" />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">系统使用率</div></td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="server.cpu">
                      <el-progress :percentage="server.cpu.sys" :format="() => formatPercentage(server.cpu.sys)" />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">当前空闲率</div></td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="server.cpu">
                      <el-progress :percentage="server.cpu.free" :format="() => formatPercentage(server.cpu.free)" status="success" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12" class="card-box">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>内存</span>
            </div>
          </template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%;">
              <thead>
                <tr>
                  <th class="el-table__cell is-leaf"><div class="cell">属性</div></th>
                  <th class="el-table__cell is-leaf"><div class="cell">内存</div></th>
                  <th class="el-table__cell is-leaf"><div class="cell">JVM</div></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">总内存</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="server.mem">{{ formatBytes(server.mem.total * 1024 * 1024 * 1024) }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="server.jvm">{{ formatBytes(server.jvm.total * 1024 * 1024) }}</div></td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">已用内存</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="server.mem">{{ formatBytes(server.mem.used * 1024 * 1024 * 1024) }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="server.jvm">{{ formatBytes(server.jvm.usage * 1024 * 1024) }}</div></td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">剩余内存</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="server.mem">{{ formatBytes(server.mem.free * 1024 * 1024 * 1024) }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="server.jvm">{{ formatBytes(server.jvm.free * 1024 * 1024) }}</div></td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">使用率</div></td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="server.mem">
                      <el-progress :percentage="server.mem.usage" :format="() => formatPercentage(server.mem.usage)" :status="server.mem.usage > 80 ? 'exception' : ''" />
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="server.jvm">
                      <el-progress :percentage="server.jvm.usage" :format="() => formatPercentage(server.jvm.usage)" :status="server.jvm.usage > 80 ? 'exception' : ''" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>

      <el-col :span="24" class="card-box">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>服务器信息</span>
            </div>
          </template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%">
              <tbody>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">服务器名称</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="server.sys">{{ server.sys.computerName }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">操作系统</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="server.sys">{{ server.sys.osName }}</div></td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">服务器IP</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="server.sys">{{ server.sys.computerIp }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">系统架构</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="server.sys">{{ server.sys.osArch }}</div></td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>

      <el-col :span="24" class="card-box">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>Java虚拟机信息</span>
            </div>
          </template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%">
              <tbody>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">Java名称</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="server.jvm">{{ server.jvm.name }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">Java版本</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="server.jvm">{{ server.jvm.version }}</div></td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">启动时间</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="server.jvm">{{ server.jvm.startTime }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">运行时长</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="server.jvm">{{ server.jvm.runTime }}</div></td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">安装路径</div></td>
                  <td class="el-table__cell is-leaf" colspan="3"><div class="cell" v-if="server.jvm">{{ server.jvm.home }}</div></td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">项目路径</div></td>
                  <td class="el-table__cell is-leaf" colspan="3"><div class="cell" v-if="server.sys">{{ server.sys.userDir }}</div></td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>

      <el-col :span="24" class="card-box">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>磁盘状态</span>
            </div>
          </template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%">
              <thead>
                <tr>
                  <th class="el-table__cell is-leaf"><div class="cell">盘符路径</div></th>
                  <th class="el-table__cell is-leaf"><div class="cell">文件系统</div></th>
                  <th class="el-table__cell is-leaf"><div class="cell">盘符类型</div></th>
                  <th class="el-table__cell is-leaf"><div class="cell">总大小</div></th>
                  <th class="el-table__cell is-leaf"><div class="cell">可用大小</div></th>
                  <th class="el-table__cell is-leaf"><div class="cell">已用大小</div></th>
                  <th class="el-table__cell is-leaf"><div class="cell">已用百分比</div></th>
                </tr>
              </thead>
              <tbody v-if="server.sysFiles">
                <tr v-for="(sysFile, index) in server.sysFiles" :key="index">
                  <td class="el-table__cell is-leaf"><div class="cell">{{ sysFile.dirName }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">{{ sysFile.sysTypeName }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">{{ sysFile.typeName }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">{{ sysFile.total }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">{{ sysFile.free }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">{{ sysFile.used }}</div></td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">
                      <el-progress
                        :percentage="parseFloat(sysFile.usage)"
                        :format="() => sysFile.usage + '%'"
                        :status="parseFloat(sysFile.usage) > 80 ? 'exception' : parseFloat(sysFile.usage) > 60 ? 'warning' : 'success'"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { getServer, ServerInfo } from '@/api/monitor/server.ts'

// 自动刷新相关
const autoRefresh = ref(false)
const refreshInterval = ref(30) // 默认30秒刷新一次
const lastRefreshTime = ref('')
let timer: number | null = null

// 切换自动刷新
const toggleAutoRefresh = () => {
  if (autoRefresh.value) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
}

// 开始自动刷新
const startAutoRefresh = () => {
  stopAutoRefresh() // 先清除可能存在的定时器
  timer = window.setInterval(() => {
    getList()
  }, refreshInterval.value * 1000)
}

// 停止自动刷新
const stopAutoRefresh = () => {
  if (timer !== null) {
    clearInterval(timer)
    timer = null
  }
}

// 更改刷新间隔
const changeRefreshInterval = () => {
  if (autoRefresh.value) {
    startAutoRefresh() // 重新启动定时器
  }
}

// 定义服务器信息
const server = ref<ServerInfo>({
  cpu: {
    cpuNum: 0,
    total: 0,
    sys: 0,
    used: 0,
    wait: 0,
    free: 0
  },
  mem: {
    total: 0,
    used: 0,
    free: 0,
    usage: 0
  },
  jvm: {
    total: 0,
    max: 0,
    free: 0,
    version: '',
    home: '',
    name: '',
    startTime: '',
    runTime: '',
    inputArgs: '',
    usage: 0
  },
  sys: {
    computerName: '',
    computerIp: '',
    userDir: '',
    osName: '',
    osArch: ''
  },
  sysFiles: []
})

// 获取服务器信息
const getList = async () => {
  try {
    const response = await getServer()
    server.value = response
  } catch (error) {
    ElMessage.error('获取服务器信息失败')
    console.error('获取服务器信息失败:', error)
  }
}

// 格式化百分比
const formatPercentage = (value: number) => {
  return `${value.toFixed(2)}%`
}

// 格式化字节大小
const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

// 组件挂载时获取数据
onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.card-box {
  padding-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-table :deep(th) {
  background-color: #fafafa;
}

.el-table :deep(td) {
  padding: 8px 0;
}

.el-table :deep(.cell) {
  padding: 0 10px;
}
</style>
