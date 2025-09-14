<template>
  <div class="login-log-container">
    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="hover">
      <div class="search-form">
        <el-row :gutter="24">
          <el-col :span="6">
            <div class="search-item">
              <el-form-item prop="keyword" label="关键词">
              <el-input
                v-model="searchForm.keyword"
                placeholder="请输入关键词"
                clearable
                @keyup.enter="handleSearch"
              >
                <template #suffix>
                  <el-icon class="search-icon"><Search /></el-icon>
                </template>
              </el-input>
              </el-form-item>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="search-item">
              <el-form-item prop="dateRange" label="登录时间">
              <el-date-picker
                v-model="dateRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                clearable
                value-format="YYYY-MM-DD HH:mm:ss"
                @change="handleDateRangeChange"
              />
              </el-form-item>
            </div>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="hover">
      <el-row :gutter="10" class="mb-2">
        <el-col :span="1.5">
          <el-button type="danger" :disabled="!selectedIds.length" @click="handleBatchDelete">
            <el-icon><Delete /></el-icon>
            批量删除
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="danger"  @click="handleAllDelete">
            <el-icon><Delete /></el-icon>
            全部删除
          </el-button>
        </el-col>
      </el-row>

      <el-table
        v-loading="loading"
        :data="tableData"
        @selection-change="handleSelectionChange"
        :highlight-current-row="true"
        stripe
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column label="序号" type="index" width="60" align="center" >
          <template #default="{ $index }">
            {{ (pagination.current - 1) * pagination.size + $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="userName" label="用户账号" min-width="100" show-overflow-tooltip />
        <el-table-column prop="type" label="操作类型" min-width="100"  >
          <template #default="{ row }">
            {{ row.type === 'Login' ? '登陆' : '登出' }}
          </template>
        </el-table-column>
        <el-table-column prop="ipaddr" label="IP地址" min-width="130" show-overflow-tooltip />
        <el-table-column prop="loginLocation" label="登录地点" min-width="130" show-overflow-tooltip />
        <el-table-column prop="browser" label="浏览器" min-width="100" show-overflow-tooltip />
        <el-table-column prop="os" label="操作系统" min-width="100" show-overflow-tooltip />
        <el-table-column prop="operTime" label="时间" min-width="160" show-overflow-tooltip />

        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button link type="primary" @click="handleDetail(row)">
                <el-icon><View /></el-icon>
                查看
              </el-button>
              <el-button link type="danger" @click="handleDelete(row)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      title="登录日志详情"
      width="600px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户账号">{{ detailData.userName }}</el-descriptions-item>
        <el-descriptions-item label="登录地址">{{ detailData.ipaddr }}</el-descriptions-item>
        <el-descriptions-item label="登录地点">{{ detailData.loginLocation }}</el-descriptions-item>
        <el-descriptions-item label="浏览器">{{ detailData.browser }}</el-descriptions-item>
        <el-descriptions-item label="操作系统">{{ detailData.os }}</el-descriptions-item>
        <el-descriptions-item label="提示消息">{{ detailData.msg }}</el-descriptions-item>
        <el-descriptions-item label="时间">{{ detailData.operTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Delete,
  View
} from '@element-plus/icons-vue'
import {
  getLoginLogPage,
  getLoginLogDetail,
  deleteLoginLog,
  deleteAllLoginLog,
  batchDeleteLoginLog,
  type LoginLog,
  type LoginLogQueryParams
} from '@/api/logs/loginLog'
import Template from "@/router/modules/template";

// 响应式数据
const loading = ref(false)
const detailVisible = ref(false)
const tableData = ref<LoginLog[]>([])
const selectedIds = ref<number[]>([])
const detailData = ref<Partial<LoginLog>>({})

// 搜索表单
const searchForm = reactive<Partial<LoginLogQueryParams>>({
  keyword: '',
  startTime: '',
  endTime: ''
})

// 日期范围选择器
const dateRange = ref<[string, string] | null>(null)

// 分页数据
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 获取表格数据
const getTableData = async () => {
  try {
    loading.value = true
    const params: LoginLogQueryParams = {
      page: pagination.current,
      size: pagination.size,
      keyword: searchForm.keyword,
      startTime: searchForm.startTime,
      endTime: searchForm.endTime
    }

    const response = await getLoginLogPage(params)
    tableData.value = response.content
    pagination.total = response.total
  } catch (error) {
    console.error('获取登录日志列表失败:', error)
    ElMessage.error('获取登录日志列表失败')
  } finally {
    loading.value = false
  }
}

// 查看详情
const handleDetail = async (row: LoginLog) => {
  try {
    const response = await getLoginLogDetail(row.infoId)
    detailData.value = response
    detailVisible.value = true
  } catch (error) {
    console.error('获取登录日志详情失败:', error)
    ElMessage.error('获取登录日志详情失败')
  }
}

// 删除
const handleDelete = async (row: LoginLog) => {
  try {
    await ElMessageBox.confirm('确定要删除该登录日志吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteLoginLog(row.infoId)
    ElMessage.success('删除成功')
    getTableData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除登录日志失败:', error)
      ElMessage.error('删除登录日志失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (!selectedIds.value.length) {
    ElMessage.warning('请选择要删除的数据')
    return
  }

  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 条数据吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await batchDeleteLoginLog(selectedIds.value)
    ElMessage.success('删除成功')
    getTableData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批量删除登录日志失败:', error)
      ElMessage.error('批量删除登录日志失败')
    }
  }
}
const handleAllDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除全部数据吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteAllLoginLog()
    ElMessage.success('删除成功')
    getTableData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批量删除登录日志失败:', error)
      ElMessage.error('批量删除登录日志失败')
    }
  }
}

// 表格多选
const handleSelectionChange = (selection: LoginLog[]) => {
  selectedIds.value = selection.map(item => item.infoId)
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  getTableData()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    keyword: '',
    startTime: '',
    endTime: ''
  })
  dateRange.value = null
  pagination.current = 1
  getTableData()
}

// 分页大小改变
const handleSizeChange = (val: number) => {
  pagination.size = val
  pagination.current = 1
  getTableData()
}

// 当前页改变
const handleCurrentChange = (val: number) => {
  pagination.current = val
  getTableData()
}

// 日期范围变化处理
const handleDateRangeChange = (value: [string, string] | null) => {
  if (value && value.length === 2) {
    searchForm.startTime = value[0]
    searchForm.endTime = value[1]
  } else {
    searchForm.startTime = ''
    searchForm.endTime = ''
  }
}

// 设置默认时间
const setDefaultTime = () => {
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  
  // 设置结束时间为当前时间
  const endTime = formatDateTime(now)
  
  // 设置开始时间为前一天的00:00:00
  const startTime = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0)
  const startTimeStr = formatDateTime(startTime)
  
  // 设置搜索表单
  searchForm.startTime = startTimeStr
  searchForm.endTime = endTime
  
  // 设置日期范围选择器
  dateRange.value = [startTimeStr, endTime]
}

// 格式化日期时间为 YYYY-MM-DD HH:mm:ss 格式
const formatDateTime = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 生命周期
onMounted(() => {
  setDefaultTime()
  getTableData()
})
</script>

<style scoped lang="scss">
.login-log-container {
  .search-card {
    margin-bottom: 16px;

    .search-form {
      .search-item {
        margin-bottom: 16px;
      }
    }
  }

  .table-card {
    .mb-2 {
      margin-bottom: 16px;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }

    .pagination-wrapper {
      margin-top: 16px;
      display: flex;
      justify-content: flex-end;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}
</style>
