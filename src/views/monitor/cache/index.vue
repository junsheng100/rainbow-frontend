<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- Redis基本信息 -->
      <el-col :span="24" style="margin-bottom: 20px">
        <el-card>
          <template #header>
            <span>Redis基本信息</span>
          </template>
          <el-descriptions :column="4" border>
            <el-descriptions-item label="Redis版本">
              {{ cacheInfo.info?.redis_version || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="运行模式">
              {{ cacheInfo.info?.redis_mode || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="端口">
              {{ cacheInfo.info?.tcp_port || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="客户端数">
              {{ cacheInfo.info?.connected_clients || 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="运行时间(天)">
              {{ cacheInfo.info?.uptime_in_days || 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="使用内存">
              {{ cacheInfo.info?.used_memory_human || '0B' }}
            </el-descriptions-item>
            <el-descriptions-item label="使用CPU">
              {{ cacheInfo.info?.used_cpu_user_children || '0%' }}
            </el-descriptions-item>
            <el-descriptions-item label="内存配置">
              {{ cacheInfo.info?.maxmemory_human || '0B' }}
            </el-descriptions-item>
            <el-descriptions-item label="AOF是否开启">
              {{ cacheInfo.info?.aof_enabled === '0' ? '否' : '是' }}
            </el-descriptions-item>
            <el-descriptions-item label="RDB是否成功">
              {{ cacheInfo.info?.rdb_last_bgsave_status || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="网络入口/出口">
              {{ cacheInfo.info?.instantaneous_input_kbps || 0 }}kps/{{ cacheInfo.info?.instantaneous_output_kbps || 0 }}kps
            </el-descriptions-item>
            <el-descriptions-item label="Key数量">
              {{ cacheInfo.dbSize || 0 }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <!-- 命令统计 -->
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>命令统计</span>
          </template>
          <div ref="commandStatsChart" style="width: 100%; height: 400px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
// 按需导入 echarts 核心模块和组件
import * as echarts from 'echarts/core'
import { BarChart, BarSeriesOption } from 'echarts/charts'
import {
  TitleComponent,
  TitleComponentOption,
  TooltipComponent,
  TooltipComponentOption,
  GridComponent,
  GridComponentOption,
  DatasetComponent,
  DatasetComponentOption,
  TransformComponent
} from 'echarts/components'
import { LabelLayout, UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

// 注册必需的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  BarChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
])

// 组合类型
type EChartsOption = echarts.ComposeOption<
  | BarSeriesOption
  | TitleComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | DatasetComponentOption
>
import { getCache, CacheInfo } from '@/api/monitor/cache.ts'

// 定义缓存信息对象
const cacheInfo = ref<CacheInfo>({
  info: {
    redis_version: '',
    redis_mode: '',
    tcp_port: 0,
    connected_clients: 0,
    uptime_in_days: 0,
    used_memory_human: '',
    used_cpu_user_children: '',
    maxmemory_human: '',
    aof_enabled: '',
    rdb_last_bgsave_status: '',
    instantaneous_input_kbps: 0,
    instantaneous_output_kbps: 0
  },
  dbSize: 0,
  commandStats: []
})

// 命令统计图表
const commandStatsChart = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

// 初始化图表
const initChart = (data: { name: string; value: number }[]) => {
  if (!commandStatsChart.value) return

  // 销毁旧图表
  if (chart) {
    chart.dispose()
  }

  // 创建新图表
  chart = echarts.init(commandStatsChart.value)

  // 准备数据
  const names = data.map(item => item.name)
  const values = data.map(item => item.value)

  // 设置图表选项
  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: names,
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '调用次数',
        type: 'bar',
        data: values,
        itemStyle: {
          color: '#409EFF'
        }
      }
    ]
  }

  // 应用选项
  chart.setOption(option)

  // 自适应窗口大小
  window.addEventListener('resize', () => {
    chart?.resize()
  })
}

// 获取缓存信息
const fetchCacheInfo = async () => {
  const loading = ElLoading.service({
    lock: true,
    text: '正在加载缓存监控数据，请稍候！',
    background: 'rgba(0, 0, 0, 0.7)'
  })

  try {
    const response = await getCache()
    cacheInfo.value = response

    // 初始化图表
    if (response.commandStats && response.commandStats.length > 0) {
      initChart(response.commandStats)
    }
  } catch (error) {
    ElMessage.error('获取缓存信息失败')
    console.error('获取缓存信息失败:', error)
  } finally {
    loading.close()
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchCacheInfo()
})

// 组件卸载时清理图表
onUnmounted(() => {
  if (chart) {
    chart.dispose()
    chart = null
  }
  window.removeEventListener('resize', () => {
    chart?.resize()
  })
})
</script>
