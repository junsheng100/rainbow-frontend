<template>
  <div class="dashboard-container">


    <!-- 数据统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="6" :md="6" :lg="6">
        <el-card class="stat-card stat-card-1" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ userCount }}</div>
              <div class="stat-label">用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="12" :sm="6" :md="6" :lg="6">
        <el-card class="stat-card stat-card-2" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ todayLoginCount }}</div>
              <div class="stat-label">今日登录</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="12" :sm="6" :md="6" :lg="6">
        <el-card class="stat-card stat-card-3" shadow="hover" @click="gotoMessagePage">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><Message /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ messageCount }}</div>
              <div class="stat-label">系统消息</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="12" :sm="6" :md="6" :lg="6">
        <el-card class="stat-card stat-card-4" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><Connection /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ onlineUserCount }}</div>
              <div class="stat-label">在线用户</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表和数据展示区域 -->
    <el-row :gutter="20" class="charts-row">
      <!-- 左侧图表区域 -->
      <el-col :xs="24" :sm="24" :md="16" :lg="16">
        <el-row :gutter="20">
          <!-- 地图图表 -->
          <el-col :span="12">
            <el-card class="chart-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <span class="chart-title">区域分布</span>
                  <div class="chart-legends" v-if="loginCityData.length > 0">
                    <span
                      v-for="(city, index) in loginCityData.slice(0, 3)"
                      :key="city.city"
                      class="legend-item"
                    >
                      <span
                        class="legend-dot"
                        :style="{ backgroundColor: getCityChartColor(index) }"
                      ></span>
                      {{ city.city }}
                    </span>
                  </div>
                </div>
              </template>
              <div class="chart-content map-chart">
                <div ref="cityChartRef" class="city-chart-container"></div>
              </div>
            </el-card>
          </el-col>

          <!-- 饼图 -->
          <el-col :span="12">
            <el-card class="chart-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <span class="chart-title">数据分布</span>
                  <div class="chart-controls">
                    <el-select
                      v-model="pieChartLimit"
                      placeholder="选择数量"
                      style="width: 120px;"
                      @change="handlePieChartLimitChange"
                      filterable
                      allow-create
                      default-first-option
                    >
                      <el-option label="10条" :value="10" />
                      <el-option label="20条" :value="20" />
                      <el-option label="50条" :value="50" />
                      <el-option label="100条" :value="100" />
                    </el-select>
                  </div>
                </div>
              </template>
              <div class="chart-content pie-chart">
                <div v-if="topOperLogData.length === 0" class="pie-placeholder">
                  <el-icon class="pie-icon"><PieChart /></el-icon>
                  <p>加载中...</p>
                </div>
                <div v-else ref="pieChartRef" class="pie-chart-container"></div>
              </div>
            </el-card>
          </el-col>

          <!-- 折线图 -->
          <el-col :span="24">
            <el-card class="chart-card line-chart-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <span class="chart-title">数据趋势</span>
                  <div class="chart-controls">
                    <el-date-picker
                      v-model="dateRange"
                      type="daterange"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                      format="YYYY-MM-DD"
                      value-format="YYYY-MM-DD"
                      size="small"
                      style="width: 240px; margin-right: 10px;"
                      :disabled-date="disabledDate"
                      @change="handleDateRangeChange"
                    />
                    <el-button
                      size="small"
                      type="info"
                      plain
                      @click="resetDateRange"
                      title="重置为最近30天"
                    >
                      重置
                    </el-button>
                    <el-button
                      size="small"
                      :type="currentStatType === 'day' ? 'primary' : ''"
                      plain
                      @click="handleStatTypeChange('day')"
                    >
                      日
                    </el-button>
                    <el-button
                      size="small"
                      :type="currentStatType === 'week' ? 'primary' : ''"
                      plain
                      @click="handleStatTypeChange('week')"
                    >
                      周
                    </el-button>
                    <el-button
                      size="small"
                      :type="currentStatType === 'month' ? 'primary' : ''"
                      plain
                      @click="handleStatTypeChange('month')"
                    >
                      月
                    </el-button>
                  </div>
                </div>
              </template>
              <div class="chart-content line-chart">
                <div ref="lineChartRef" class="line-chart-container"></div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-col>

      <!-- 右侧消息通知区域 -->
      <el-col :xs="24" :sm="24" :md="8" :lg="8">
        <el-card class="notification-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="chart-title">后台管理系统功能版块</span>
            </div>
          </template>
          <div class="notification-list">
            <div class="notification-item" v-for="(item, index) in notifications" :key="index">
              <div class="notification-avatar">
                <el-avatar :size="32" :style="{ backgroundColor: item.color }">
                  {{ item.type }}
                </el-avatar>
              </div>
              <div class="notification-content">
                <div class="notification-title">{{ item.title }}</div>
                <div class="notification-desc">{{ item.desc }}</div>
                <div class="notification-time">{{ item.time }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 系统消息弹窗 -->
    <el-dialog
      v-model="messageDialogVisible"
      title="系统消息"
      width="80%"
      top="5vh"
      destroy-on-close
      @closed="handleDialogClosed"
    >
      <NoticeRead />
    </el-dialog>

    <!-- 测试尺寸记忆功能的Dialog -->
    <el-dialog
      v-model="testDialogVisible"
      title="测试尺寸记忆功能"
      width="500px"
      v-dialog-size-memory="'test-dialog'"
    >
      <div style="padding: 20px;">
        <p>这是一个测试 Dialog，您可以：</p>
        <ul>
          <li>拖拽标题栏移动位置</li>
          <li>拖拽边缘调整大小</li>
          <li>关闭后重新打开，尺寸和位置会保持</li>
        </ul>
        <el-button type="primary" @click="testDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 饼图详情弹窗 -->
    <el-dialog
      v-model="pieDetailDialogVisible"
      title="操作详情"
      width="600px"
      destroy-on-close
    >
      <div v-if="selectedPieData" class="pie-detail-content">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="功能名称">
            {{ selectedPieData.title }}
          </el-descriptions-item>
          <el-descriptions-item label="控制器">
            {{ selectedPieData.beanName }}
          </el-descriptions-item>
          <el-descriptions-item label="方法名">
            {{ selectedPieData.method }}
          </el-descriptions-item>
          <el-descriptions-item label="使用次数">
            <el-tag type="primary" size="large">{{ selectedPieData.total }} 次</el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <div class="pie-detail-chart" style="margin-top: 20px;">
          <h4>使用频率分布</h4>
          <div style="height: 300px;" ref="detailChartRef"></div>
        </div>
      </div>
    </el-dialog>

    <!-- 城市详情弹窗 -->
    <el-dialog
      v-model="cityDetailDialogVisible"
      title="城市登录详情"
      width="80%"
      :before-close="() => {
        cityDetailDialogVisible = false
        if (cityDetailChart) {
          cityDetailChart.dispose()
        }
      }"
    >
      <div class="city-detail-content">
        <!-- 城市详情表格 -->
        <el-descriptions
          title="城市登录统计"
          :column="3"
          border
          style="margin-bottom: 20px;"
        >
          <el-descriptions-item
            v-for="city in selectedCityData"
            :key="city.city"
            :label="city.city"
          >
            <el-tag type="success">{{ city.total }} 次</el-tag>
            <div style="font-size: 12px; color: #909399; margin-top: 4px;">
              {{ city.pro }} - {{ city.country }}
            </div>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 城市详情图表 -->
        <div ref="cityDetailChartRef" class="city-detail-chart"></div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, inject, nextTick } from 'vue'
import {getUserTotal} from '@/api/users/user'
import { countWillPush } from '@/api/notice/push'
import { getTopOperLogData, type TopOperLogData, getUserStatData, type UserStatData, type UserStatType } from '@/api/logs/operLog'
import { getLoginCityData, type LoginCityData } from '@/api/logs/loginLog'
import NoticeRead from '@/views/notice/read.vue'
import * as echarts from 'echarts'







const userCount = ref(0)
const todayLoginCount = ref(0)
const messageCount = ref(0)
const onlineUserCount = ref(0)
const messageDialogVisible = ref(false)
const testDialogVisible = ref(false)
const refreshUnreadCount = inject('refreshUnreadCount') as () => Promise<void>

// 饼图相关变量
const pieChartRef = ref<HTMLElement>()
const pieChart = ref<echarts.ECharts>()
const topOperLogData = ref<TopOperLogData[]>([])

// 饼图详情弹窗
const pieDetailDialogVisible = ref(false)
const selectedPieData = ref<TopOperLogData | null>(null)
const detailChartRef = ref<HTMLElement>()
const detailChart = ref<echarts.ECharts>()

// 饼图数量限制
const pieChartLimit = ref(20)

// 折线图相关变量
const lineChartRef = ref<HTMLElement>()
const lineChart = ref<echarts.ECharts>()
const userStatData = ref<UserStatData[]>([])
const currentStatType = ref<UserStatType>('day')

// 城市统计相关变量
const cityChartRef = ref<HTMLElement>()
const cityChart = ref<echarts.ECharts>()
const loginCityData = ref<LoginCityData[]>([])

// 城市详情弹窗相关
const cityDetailDialogVisible = ref(false)
const selectedCityData = ref<LoginCityData[]>([])
const cityDetailChartRef = ref<HTMLElement>()
const cityDetailChart = ref<echarts.ECharts | null>(null)

// 日期选择相关变量
const dateRange = ref<[string, string] | null>(null)

// 获取默认日期范围
const getDefaultDateRange = (): [string, string] => {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - 30)

  return [
    startDate.toISOString().split('T')[0], // yyyy-MM-dd
    endDate.toISOString().split('T')[0]    // yyyy-MM-dd
  ]
}

// 处理饼图数量限制变化
const handlePieChartLimitChange = async (value: number | string) => {
  // 确保转换为数字
  const numValue = typeof value === 'string' ? parseInt(value) : value
  pieChartLimit.value = numValue
  await fetchTopOperLogData()
}

// 处理统计类型变化
const handleStatTypeChange = async (type: UserStatType) => {
  currentStatType.value = type
  await fetchUserStatData()
}

// 处理日期范围变化
const handleDateRangeChange = async (range: [string, string] | null) => {
  dateRange.value = range
  await fetchUserStatData()
}

// 重置日期范围到默认值
const resetDateRange = async () => {
  dateRange.value = getDefaultDateRange()
  await fetchUserStatData()
}

// 禁用未来日期
const disabledDate = (time: Date) => {
  const today = new Date()
  today.setHours(23, 59, 59, 999) // 设置为今天的最后一毫秒
  return time.getTime() > today.getTime()
}

// 打开消息弹窗
const gotoMessagePage = () => {
  messageDialogVisible.value = true
}

const handleDialogClosed = async () => {
  try {
    // 并行执行两个更新操作
    await Promise.all([
      fetchUserStats(),  // 这会自动更新messageCount
      refreshUnreadCount()
    ])

  } catch (error) {
    console.error('更新统计数据失败:', error)
    // 即使出错也尝试重新获取消息计数
    try {
      const messageRes = await countWillPush()
      messageCount.value = Number(messageRes) || 0
    } catch (err) {
      console.error('获取消息计数失败:', err)
    }
  }
}

const notifications = ref([
  {
    type: '系',
    title: '系统管理',
    desc: '全面的用户权限和角色管理功能',
    time: '2024/04/15',
    color: '#409eff'
  },
  {
    type: '数',
    title: '数据统计',
    desc: '详细的业务数据统计和分析报表',
    time: '2024/04/14',
    color: '#67c23a'
  },
  {
    type: '监',
    title: '系统监控',
    desc: '实时监控系统运行状态和性能指标',
    time: '2024/04/13',
    color: '#e6a23c'
  },
  {
    type: '日',
    title: '操作日志',
    desc: '完整记录所有用户操作和系统变更',
    time: '2024/04/12',
    color: '#f56c6c'
  }
])

// 定时器引用
const refreshTimer = ref<NodeJS.Timeout>()

// 获取高频使用数据
const fetchTopOperLogData = async () => {
  try {
    const data = await getTopOperLogData(pieChartLimit.value) // 使用当前选择的limit值
    topOperLogData.value = data
    await initPieChart()
  } catch (error) {
    console.error('获取高频使用数据失败:', error)
    // 显示无数据提示
    topOperLogData.value = []
    await initPieChart()
  }
}

// 获取用户统计数据
const fetchUserStatData = async () => {
  try {
    let startDateStr: string, endDateStr: string

    // 如果用户选择了日期范围，使用选择的日期；否则使用默认的最近30天
    if (dateRange.value && dateRange.value.length === 2) {
      startDateStr = dateRange.value[0]
      endDateStr = dateRange.value[1]
    } else {
      // 默认时间范围：最近30天
      const defaultRange = getDefaultDateRange()
      startDateStr = defaultRange[0]
      endDateStr = defaultRange[1]
    }

    const params = {
      start: startDateStr,
      end: endDateStr,
      type: currentStatType.value
    }

    const data = await getUserStatData(params)
    userStatData.value = data
    await initLineChart()
  } catch (error) {
    console.error('获取用户统计数据失败:', error)
    userStatData.value = []
    await initLineChart()
  }
}

// 获取城市统计数据
const fetchCityData = async () => {
  try {
    const data = await getLoginCityData()
    // 按total从高到低排序
    loginCityData.value = data.sort((a: LoginCityData, b: LoginCityData) => b.total - a.total)
    await initCityChart()
  } catch (error) {
    console.error('获取城市统计数据失败:', error)
    loginCityData.value = []
    await initCityChart()
  }
}

// 初始化饼图
const initPieChart = async () => {
  if (!topOperLogData.value.length) {
    // 没有数据时显示提示
    await nextTick()
    if (pieChartRef.value) {
      // 销毁之前的图表实例
      if (pieChart.value) {
        pieChart.value.dispose()
      }

      // 创建新的图表实例
      pieChart.value = echarts.init(pieChartRef.value)

      // 显示无数据提示
      const option = {
        graphic: {
          type: 'text',
          left: 'center',
          top: 'middle',
          style: {
            text: '日志无数据或被清除',
            fontSize: 16,
            fontWeight: 'normal',
            fill: '#909399'
          }
        }
      }

      pieChart.value.setOption(option)
    }
    return
  }

  // 等待DOM更新
  await nextTick()

  if (!pieChartRef.value) {
    return
  }

  // 销毁之前的图表实例
  if (pieChart.value) {
    pieChart.value.dispose()
  }

  // 创建新的图表实例
  pieChart.value = echarts.init(pieChartRef.value)

  // 准备数据
  const chartData = topOperLogData.value.map((item, index) => ({
    name: item.title,
    value: item.total,
    itemStyle: {
      color: getChartColor(index)
    }
  }))

  // 配置项
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const data = topOperLogData.value[params.dataIndex]
        return `
          <div style="padding: 8px;">
            <div style="font-weight: bold; margin-bottom: 8px;">${data.title}</div>
            <div style="margin-bottom: 4px;">控制器: ${data.beanName}</div>
            <div style="margin-bottom: 4px;">方法: ${data.method}</div>
            <div style="color: #409eff; font-weight: bold;">使用次数: ${data.total} 次</div>
            <div style="color: #909399; font-size: 12px;">占比: ${params.percent}%</div>
          </div>
        `
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e4e7ed',
      borderWidth: 1,
      textStyle: {
        color: '#303133'
      }
    },
    legend: {
      show: false // 隐藏图例
    },
    series: [
      {
        name: '操作频率',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '50%'], // 居中显示
        avoidLabelOverlap: false,
        label: {
          show: false, // 默认不显示标签
          position: 'center'
        },
        emphasis: {
          label: {
            show: true, // 鼠标悬浮时显示标签
            fontSize: '14',
            fontWeight: 'bold',
            formatter: '{b}\n{c}次 ({d}%)'
          }
        },
        labelLine: {
          show: false
        },
        data: chartData
      }
    ]
  }

  // 设置配置项并渲染
  pieChart.value.setOption(option)

  // 添加点击事件监听
  pieChart.value.on('click', handlePieChartClick)
}

// 初始化折线图
const initLineChart = async () => {
  if (!userStatData.value.length) {
    // 没有数据时显示提示
    await nextTick()
    if (lineChartRef.value) {
      // 销毁之前的图表实例
      if (lineChart.value) {
        lineChart.value.dispose()
      }

      // 创建新的图表实例
      lineChart.value = echarts.init(lineChartRef.value)

      // 显示无数据提示
      const option = {
        graphic: {
          type: 'text',
          left: 'center',
          top: 'middle',
          style: {
            text: '暂无统计数据',
            fontSize: 16,
            fontWeight: 'normal',
            fill: '#909399'
          }
        }
      }

      lineChart.value.setOption(option)
    }
    return
  }

  // 等待DOM更新
  await nextTick()

  if (!lineChartRef.value) {
    return
  }

  // 销毁之前的图表实例
  if (lineChart.value) {
    lineChart.value.dispose()
  }

  // 创建新的图表实例
  lineChart.value = echarts.init(lineChartRef.value)

  // 准备数据
  const timeData = userStatData.value.map(item => item.time)
  const usersData = userStatData.value.map(item => item.users)
  const countData = userStatData.value.map(item => item.count)

  // 配置项
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      },
      formatter: (params: any) => {
        let result = `<div style="padding: 8px;">
          <div style="font-weight: bold; margin-bottom: 8px;">${params[0].axisValue}</div>`

        params.forEach((param: any) => {
          const color = param.color
          const name = param.seriesName
          const value = param.value
          result += `<div style="margin-bottom: 4px;">
            <span style="display: inline-block; width: 10px; height: 10px; background-color: ${color}; margin-right: 5px;"></span>
            <span>${name}: ${value}</span>
          </div>`
        })

        result += '</div>'
        return result
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e4e7ed',
      borderWidth: 1,
      textStyle: {
        color: '#303133'
      }
    },
    legend: {
      data: ['活跃用户', '操作次数'],
      top: 10,
      textStyle: {
        fontSize: 12
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
      boundaryGap: false,
      data: timeData,
      axisLabel: {
        fontSize: 12,
        rotate: 45
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '用户数',
        position: 'left',
        axisLabel: {
          fontSize: 12
        }
      },
      {
        type: 'value',
        name: '操作次数',
        position: 'right',
        axisLabel: {
          fontSize: 12
        }
      }
    ],
    series: [
      {
        name: '活跃用户',
        type: 'line',
        yAxisIndex: 0,
        data: usersData,
        smooth: true,
        lineStyle: {
          color: '#409eff',
          width: 2
        },
        itemStyle: {
          color: '#409eff'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
            ]
          }
        }
      },
      {
        name: '操作次数',
        type: 'line',
        yAxisIndex: 1,
        data: countData,
        smooth: true,
        lineStyle: {
          color: '#67c23a',
          width: 2
        },
        itemStyle: {
          color: '#67c23a'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
              { offset: 1, color: 'rgba(103, 194, 58, 0.1)' }
            ]
          }
        }
      }
    ]
  }

  // 设置配置项并渲染
  lineChart.value.setOption(option)
}

// 处理城市图表点击事件
const handleCityChartClick = (_params: any) => {
  cityDetailDialogVisible.value = true
  selectedCityData.value = loginCityData.value
  nextTick(() => {
    initCityDetailChart()
  })
}

// 初始化城市详情图表
const initCityDetailChart = () => {
  if (!cityDetailChartRef.value || !selectedCityData.value.length) return

  if (cityDetailChart.value) {
    cityDetailChart.value.dispose()
  }

  cityDetailChart.value = echarts.init(cityDetailChartRef.value)

  // 准备数据 - 显示所有城市
  const cityNames = selectedCityData.value.map(item => item.city)
  const cityTotals = selectedCityData.value.map(item => item.total)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        const data = params[0]
        const cityData = selectedCityData.value.find(item => item.city === data.name)
        return `
          <div style="padding: 8px;">
            <div style="font-weight: bold; margin-bottom: 8px;">${data.name}</div>
            <div style="margin-bottom: 4px;">省份: ${cityData?.pro || '未知'}</div>
            <div style="margin-bottom: 4px;">国家: ${cityData?.country || '未知'}</div>
            <div style="color: #409eff; font-weight: bold;">登录次数: ${data.value} 次</div>
          </div>
        `
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: cityNames,
      axisLabel: {
        fontSize: 10,
        rotate: 45,
        interval: 0
      }
    },
    yAxis: {
      type: 'value',
      name: '登录次数',
      axisLabel: {
        fontSize: 12
      }
    },
    series: [
      {
        name: '登录次数',
        type: 'bar',
        data: cityTotals,
        itemStyle: {
          color: (params: any) => {
            return getCityChartColor(params.dataIndex % 3)
          }
        },
        barWidth: '50%',
        label: {
          show: true,
          position: 'top',
          fontSize: 10,
          color: '#606266'
        }
      }
    ]
  }

  cityDetailChart.value.setOption(option)
}

// 初始化城市柱形图
const initCityChart = async () => {
  if (!loginCityData.value.length) {
    // 没有数据时显示提示
    await nextTick()
    if (cityChartRef.value) {
      // 销毁之前的图表实例
      if (cityChart.value) {
        cityChart.value.dispose()
      }

      // 创建新的图表实例
      cityChart.value = echarts.init(cityChartRef.value)

      // 显示无数据提示
      const option = {
        graphic: {
          type: 'text',
          left: 'center',
          top: 'middle',
          style: {
            text: '暂无城市数据',
            fontSize: 16,
            fontWeight: 'normal',
            fill: '#909399'
          }
        }
      }

      cityChart.value.setOption(option)
    }
    return
  }

  // 等待DOM更新
  await nextTick()

  if (!cityChartRef.value) {
    return
  }

  // 销毁之前的图表实例
  if (cityChart.value) {
    cityChart.value.dispose()
  }

  // 创建新的图表实例
  cityChart.value = echarts.init(cityChartRef.value)

  // 准备数据 - 只显示前3个城市
  const topCities = loginCityData.value.slice(0, 3)
  const cityNames = topCities.map(item => item.city)
  const cityTotals = topCities.map(item => item.total)

  // 配置项
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        const data = params[0]
        const cityData = loginCityData.value.find(item => item.city === data.name)
        return `
          <div style="padding: 8px;">
            <div style="font-weight: bold; margin-bottom: 8px;">${data.name}</div>
            <div style="margin-bottom: 4px;">省份: ${cityData?.pro || '未知'}</div>
            <div style="margin-bottom: 4px;">国家: ${cityData?.country || '未知'}</div>
            <div style="color: #409eff; font-weight: bold;">登录次数: ${data.value} 次</div>
          </div>
        `
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e4e7ed',
      borderWidth: 1,
      textStyle: {
        color: '#303133'
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
      data: cityNames,
      axisLabel: {
        fontSize: 12,
        rotate: 45,
        interval: 0
      }
    },
    yAxis: {
      type: 'value',
      name: '登录次数',
      axisLabel: {
        fontSize: 12
      }
    },
    series: [
      {
        name: '登录次数',
        type: 'bar',
        data: cityTotals,
        itemStyle: {
          color: (params: any) => {
            return getCityChartColor(params.dataIndex)
          }
        },
        barWidth: '60%',
        label: {
          show: true,
          position: 'top',
          fontSize: 12,
          color: '#606266'
        }
      }
    ]
  }

  // 设置配置项并渲染
  cityChart.value.setOption(option)

  // 添加点击事件监听
  cityChart.value.on('click', handleCityChartClick)
}

// 获取图表颜色
const getChartColor = (index: number) => {
  const colors = [
    '#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399',
    '#36cfc9', '#722ed1', '#fa8c16', '#eb2f96', '#52c41a'
  ]
  return colors[index % colors.length]
}

// 获取城市图表颜色
const getCityChartColor = (index: number) => {
  const colors = ['#67c23a', '#e6a23c', '#f56c6c'] // 绿色、橙色、红色
  return colors[index % colors.length]
}

// 处理饼图点击事件
const handlePieChartClick = (params: any) => {
  if (params.data) {
    selectedPieData.value = topOperLogData.value[params.dataIndex]
    pieDetailDialogVisible.value = true
    // 等待DOM更新后初始化详情图表
    nextTick(() => {
      initDetailChart()
    })
  }
}

// 初始化详情图表
const initDetailChart = async () => {
  if (!detailChartRef.value || !selectedPieData.value) return

  await nextTick()

  // 销毁之前的图表实例
  if (detailChart.value) {
    detailChart.value.dispose()
  }

  // 创建新的图表实例
  detailChart.value = echarts.init(detailChartRef.value)

  // 准备数据 - 显示选中项与其他项的对比
  const selectedIndex = topOperLogData.value.findIndex(item =>
    item.beanName === selectedPieData.value?.beanName &&
    item.method === selectedPieData.value?.method
  )

  const chartData = topOperLogData.value.map((item, index) => ({
    name: item.title,
    value: item.total,
    itemStyle: {
      color: index === selectedIndex ? '#f56c6c' : getChartColor(index),
      opacity: index === selectedIndex ? 1 : 0.6
    }
  }))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const data = topOperLogData.value[params.dataIndex]
        return `
          <div style="padding: 8px;">
            <div style="font-weight: bold; margin-bottom: 8px;">${data.title}</div>
            <div style="margin-bottom: 4px;">控制器: ${data.beanName}</div>
            <div style="margin-bottom: 4px;">方法: ${data.method}</div>
            <div style="color: #409eff; font-weight: bold;">使用次数: ${data.total} 次</div>
            <div style="color: #909399; font-size: 12px;">占比: ${params.percent}%</div>
          </div>
        `
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e4e7ed',
      borderWidth: 1,
      textStyle: {
        color: '#303133'
      }
    },
    legend: {
      show: false // 详情弹窗中也隐藏图例
    },
    series: [
      {
        name: '操作频率对比',
        type: 'pie',
        radius: ['30%', '70%'],
        center: ['50%', '50%'], // 居中显示
        avoidLabelOverlap: false,
        label: {
          show: true, // 详情弹窗中显示标签
          formatter: '{b}\n{c}次 ({d}%)',
          fontSize: 12
        },
        labelLine: {
          show: true
        },
        data: chartData
      }
    ]
  }

  detailChart.value.setOption(option)
}

// 获取用户统计数据
const fetchUserStats = async () => {
  try {
    // 获取用户统计数据
    const userRes = await getUserTotal()

    if (userRes) {
      userCount.value = userRes.total || 0
      todayLoginCount.value = userRes.login || 0
      onlineUserCount.value = userRes.online || 0
    }

    // 获取系统消息数量
    const messageRes = await countWillPush()
    // console.log('获取系统消息数量:', JSON.stringify(messageRes))
    if (messageRes !== undefined && messageRes !== null) {
      messageCount.value = Number(messageRes) || 0
      console.log('更新后的messageCount:', messageCount.value)
    } else {
      console.warn('获取系统消息数量返回空值')
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}



onMounted(async () => {
  // 设置默认日期范围
  dateRange.value = getDefaultDateRange()

  // 立即获取一次数据
  await Promise.all([
    fetchUserStats(),
    fetchTopOperLogData(),
    fetchUserStatData(),
    fetchCityData()
  ])

  // 设置每15分钟刷新一次的定时器 (15分钟 = 900000毫秒)
  refreshTimer.value = setInterval(async () => {
    await Promise.all([
      fetchUserStats(),
      fetchTopOperLogData(),
      fetchUserStatData(),
      fetchCityData()
    ])
  }, 15*6000)

  // 监听通知关闭事件
  window.addEventListener('notice-closed', fetchUserStats)

  // 监听窗口大小变化，重新调整图表大小
  window.addEventListener('resize', handleResize)
})

// 处理窗口大小变化
const handleResize = () => {
  if (pieChart.value) {
    pieChart.value.resize()
  }
  if (lineChart.value) {
    lineChart.value.resize()
  }
  if (cityChart.value) {
    cityChart.value.resize()
  }
  if (detailChart.value) {
    detailChart.value.resize()
  }
  if (cityDetailChart.value) {
    cityDetailChart.value.resize()
  }
}

// 组件卸载时清除定时器和事件监听
onUnmounted(() => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value)
  }
  window.removeEventListener('notice-closed', fetchUserStats)
  window.removeEventListener('resize', handleResize)

  // 销毁图表实例
  if (pieChart.value) {
    pieChart.value.dispose()
  }
  if (lineChart.value) {
    lineChart.value.dispose()
  }
  if (cityChart.value) {
    cityChart.value.dispose()
  }
  if (detailChart.value) {
    detailChart.value.dispose()
  }
  if (cityDetailChart.value) {
    cityDetailChart.value.dispose()
  }
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  .stats-row {
    margin-bottom: 20px;

    .stat-card {
      height: 120px;
      border: none;
      overflow: hidden;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
      }

      .stat-content {
        display: flex;
        align-items: center;
        height: 100%;

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: white;
          margin-right: 15px;
        }

        .stat-info {
          flex: 1;

          .stat-number {
            font-size: 28px;
            font-weight: bold;
            color: #2c3e50;
            line-height: 1;
          }

          .stat-label {
            font-size: 14px;
            color: #7f8c8d;
            margin-top: 5px;
          }
        }
      }

      &.stat-card-1 .stat-icon {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      &.stat-card-2 .stat-icon {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      &.stat-card-3 .stat-icon {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }

      &.stat-card-4 .stat-icon {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }
    }
  }

  .charts-row {
    .chart-card {
      margin-bottom: 20px;

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .chart-title {
          font-size: 16px;
          font-weight: 600;
          color: #2c3e50;
        }

        .chart-legends, .chart-controls {
          display: flex;
          gap: 15px;
          align-items: center;

          .legend-item {
            display: flex;
            align-items: center;
            font-size: 12px;
            color: #7f8c8d;

            .legend-dot {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              margin-right: 5px;
            }
          }

          .el-select {
            .el-input__wrapper {
              background-color: #f8f9fa;
              border: 1px solid #e4e7ed;

              &:hover {
                border-color: #409eff;
              }
            }
          }

          .el-date-editor {
            .el-input__wrapper {
              background-color: #f8f9fa;
              border: 1px solid #e4e7ed;

              &:hover {
                border-color: #409eff;
              }
            }
          }
        }
      }

      .chart-content {
        height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f8f9fa;
        border-radius: 6px;

        .map-placeholder,
        .line-placeholder,
        .pie-placeholder {
          text-align: center;
          color: #bdc3c7;

          .map-icon,
          .line-icon,
          .pie-icon {
            font-size: 48px;
            margin-bottom: 10px;
          }

          p {
            margin: 0;
            font-size: 14px;
          }

          .chart-legends {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 15px;
          }
        }

        .pie-chart-container {
          width: 100%;
          height: 200px;
          cursor: pointer; // 添加指针样式，提示可交互
        }

        .line-chart-container {
          width: 100%;
          height: 100%;
        }

        .city-chart-container {
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.city-detail-content {
  .city-detail-chart {
    width: 100%;
    height: 400px;
    margin-top: 20px;
  }
}
      }

      &.line-chart-card .chart-content {
        height: 280px;
      }
    }

    .pie-detail-content {
      .pie-detail-chart {
        h4 {
          margin: 0 0 15px 0;
          color: #2c3e50;
          font-size: 16px;
          font-weight: 600;
        }
      }
    }

    .notification-card {
      height: 520px;

      .notification-list {
        max-height: 450px;
        overflow-y: auto;

        .notification-item {
          display: flex;
          padding: 15px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .notification-avatar {
            margin-right: 15px;
          }

          .notification-content {
            flex: 1;

            .notification-title {
              font-size: 14px;
              font-weight: 600;
              color: #2c3e50;
              margin-bottom: 5px;
            }

            .notification-desc {
              font-size: 12px;
              color: #7f8c8d;
              line-height: 1.4;
              margin-bottom: 5px;
            }

            .notification-time {
              font-size: 11px;
              color: #bdc3c7;
            }
          }
        }
      }
    }
  }
}

// 响应式调整
@media (max-width: 768px) {
  .dashboard-container {
    .stats-row .stat-card {
      height: 100px;

      .stat-content {
        .stat-icon {
          width: 50px;
          height: 50px;
          font-size: 20px;
          margin-right: 10px;
        }

        .stat-info .stat-number {
          font-size: 24px;
        }
      }
    }

    .charts-row {
      .chart-card .chart-content {
        height: 150px;

        .map-placeholder,
        .pie-placeholder,
        .line-placeholder {
          .map-icon,
          .pie-icon,
          .line-icon {
            font-size: 32px;
          }
        }
      }

      .notification-card {
        height: auto;
        margin-top: 20px;
      }
    }
  }
}
</style>
