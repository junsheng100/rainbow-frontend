<template>
  <div class="oper-log-container">
    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="hover">
      <div class="search-form">
        <el-row :gutter="24">
          <el-col :span="4">
            <div class="search-item">
              <el-form-item prop="title" label="模块">
              <el-input
                v-model="searchForm.title"
                placeholder="请输入系统模块"
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
          <el-col :span="4">
            <div class="search-item">
              <el-form-item prop="operName" label="操作人员">
              <el-input
                v-model="searchForm.operName"
                placeholder="请输入操作人员"
                clearable
                @keyup.enter="handleSearch"
              />
              </el-form-item>
            </div>

          </el-col>
          <el-col :span="4">
            <div class="search-item">
              <el-form-item prop="operTime" label="操作时间">
              <el-date-picker
                v-model="searchForm.operTime"
                type="datetime"
                placeholder="请选择操作时间"
                clearable
                value-format="YYYY-MM-DD"
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
          <el-button type="danger" @click="handleAllDelete">
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
        <el-table-column prop="title" label="系统模块" min-width="100" show-overflow-tooltip />
        <el-table-column prop="operName" label="操作人员" min-width="100" show-overflow-tooltip />
        <el-table-column prop="requestMethod" label="请求方式" min-width="100" show-overflow-tooltip />
        <el-table-column prop="operIp" label="操作IP" min-width="130" show-overflow-tooltip />
        <el-table-column prop="operLocation" label="操作地点" min-width="130" show-overflow-tooltip />
        <el-table-column prop="operTime" label="操作时间" min-width="160" show-overflow-tooltip />
        <el-table-column prop="costTime" label="耗时(ms)" min-width="100" show-overflow-tooltip />

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
      title="操作日志详情"
      width="800px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="系统模块">{{ detailData.title }}</el-descriptions-item>
        <el-descriptions-item label="操作人员">{{ detailData.operName }}</el-descriptions-item>
        <el-descriptions-item label="实例类名">{{ detailData.beanName }}</el-descriptions-item>
        <el-descriptions-item label="请求方法">{{ detailData.method }}</el-descriptions-item>
        <el-descriptions-item label="请求方式">{{ detailData.requestMethod }}</el-descriptions-item>
        <el-descriptions-item label="操作类别">{{ detailData.operatorType }}</el-descriptions-item>
        <el-descriptions-item label="操作IP">{{ detailData.operIp }}</el-descriptions-item>
        <el-descriptions-item label="操作地点">{{ detailData.operLocation }}</el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ detailData.operTime }}</el-descriptions-item>
        <el-descriptions-item label="耗时(ms)">{{ detailData.costTime }}</el-descriptions-item>
      </el-descriptions>
      <el-divider>请求参数</el-divider>
      <pre class="detail-pre">{{ detailData.operParam }}</pre>
      <el-divider>返回参数</el-divider>
      <pre class="detail-pre">{{ detailData.jsonResult }}</pre>
      <template v-if="detailData.errorMsg">
        <el-divider>错误信息</el-divider>
        <pre class="detail-pre error">{{ detailData.errorMsg }}</pre>
      </template>
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
  getOperLogPage,
  getOperLogDetail,
  deleteOperLog,
  deleteAllOperLog,
  batchDeleteOperLog,
  type OperLog,
  type OperLogQueryParams
} from '@/api/logs/operLog.ts'

// 响应式数据
const loading = ref(false)
const detailVisible = ref(false)
const tableData = ref<OperLog[]>([])
const selectedIds = ref<number[]>([])
const detailData = ref<Partial<OperLog>>({})

// 搜索表单
const searchForm = reactive<Partial<OperLogQueryParams>>({
  title: '',
  operName: '',
  operTime: ''
})

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
    const params: OperLogQueryParams = {
      page: pagination.current,
      size: pagination.size,
      title: searchForm.title,
      operName: searchForm.operName,
      operTime: searchForm.operTime
    }

    const response = await getOperLogPage(params)
    tableData.value = response.content
    pagination.total = response.total
  } catch (error) {
    console.error('获取操作日志列表失败:', error)
    ElMessage.error('获取操作日志列表失败')
  } finally {
    loading.value = false
  }
}

// 查看详情
const handleDetail = async (row: OperLog) => {
  try {
    const response = await getOperLogDetail(row.operId)
    detailData.value = response
    detailVisible.value = true
  } catch (error) {
    console.error('获取操作日志详情失败:', error)
    ElMessage.error('获取操作日志详情失败')
  }
}

// 删除
const handleDelete = async (row: OperLog) => {
  try {
    await ElMessageBox.confirm('确定要删除该操作日志吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteOperLog(row.operId)
    ElMessage.success('删除成功')
    getTableData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除操作日志失败:', error)
      ElMessage.error('删除操作日志失败')
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

    await batchDeleteOperLog(selectedIds.value)
    ElMessage.success('删除成功')
    getTableData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批量删除操作日志失败:', error)
      ElMessage.error('批量删除操作日志失败')
    }
  }
}
// 全部删除
const handleAllDelete = async () => {

  try {
    await ElMessageBox.confirm(`确定要删除全部数据吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteAllOperLog()
    ElMessage.success('删除成功')
    getTableData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批量删除操作日志失败:', error)
      ElMessage.error('批量删除操作日志失败')
    }
  }
}

// 表格多选
const handleSelectionChange = (selection: OperLog[]) => {
  selectedIds.value = selection.map(item => item.operId)
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  getTableData()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    title: '',
    operName: '',
    operTime: ''
  })
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

// 生命周期
onMounted(() => {
  getTableData()
})
</script>

<style scoped lang="scss">
.oper-log-container {
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

  .detail-pre {
    padding: 12px;
    background-color: #f8f9fa;
    border-radius: 4px;
    font-family: monospace;
    white-space: pre-wrap;
    word-wrap: break-word;
    max-height: 300px;
    overflow-y: auto;

    &.error {
      color: #dc3545;
      background-color: #fff5f5;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}
</style>
