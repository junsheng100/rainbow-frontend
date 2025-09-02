<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :model="queryParams" ref="queryFormRef" :inline="true">
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="queryParams.title"
            placeholder="请输入标题"
            clearable
            @keyup.enter="handleQuery"
          />

        </el-form-item>
        <el-form-item label="处理阶段" prop="stage">
          <el-select v-model="queryParams.stage" placeholder="请选择处理阶段" clearable style="width: 100px">
            <el-option
                v-for="item in stageOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetQuery">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>

        <el-form-item style="float: right">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增
          </el-button>
          <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
            <el-icon><Delete /></el-icon>
            批量删除
          </el-button>
        </el-form-item>

      </el-form>
    </el-card>

    <!-- 操作按钮区域 -->
    <el-card class="table-card">
      <!-- 表格区域 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        @selection-change="handleSelectionChange"
        border
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="标题" prop="title" min-width="100">
          <template #default="{ row }">
            <el-tooltip :content="row.title" placement="top" :show-after="200">
              <span class="clickable-title" @click="showDetails(row)">{{ truncateText(row.title, 10) }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="内容" prop="content" min-width="160">
          <template #default="{ row }">
            <el-tooltip :content="row.content" placement="top" :show-after="200">
              <span>{{ truncateText(row.content, 20) }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="回复" prop="reply" min-width="120">
          <template #default="{ row }">
            <el-tooltip :content="row.reply" placement="top" :show-after="200">
              <span>{{ truncateText(row.reply || '', 10) }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="处理阶段" prop="stage" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStageTagType(row.stage)">
              {{ getStageLabel(row.stage) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="提交时间" prop="replyTime" width="180" align="center">
          <template #default="{ row }">
            {{ row.replyTime ? formatDate(row.fcd) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              @click="handleReply(row)"
            >
              回复
            </el-button>
            <el-button
              type="primary"
              link
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              link
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <div class="pagination-container">
        <el-pagination
          :current-page="queryParams.pageNum"
          :page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 表单对话框 -->
    <feedback-form
      v-if="formVisible"
      :visible="formVisible"
      :form-type="formType"
      :form-data="formData"
      @close="closeForm"
      @success="handleFormSuccess"
    />

    <!-- 回复对话框 -->
    <reply-form
      v-if="replyVisible"
      :visible="replyVisible"
      :form-data="formData"
      @close="closeReplyForm"
      @success="handleFormSuccess"
    />

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailsVisible"
      title="反馈详情"
      width="600px"
      destroy-on-close
    >
      <div class="feedback-details">
        <div class="detail-item">
          <div class="detail-label">标题：</div>
          <div class="detail-content">{{ detailsData.title }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">内容：</div>
          <div class="detail-content">{{ detailsData.content }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">处理阶段：</div>
          <div class="detail-content">
            <el-tag :type="getStageTagType(detailsData.stage!)">
              {{ getStageLabel(detailsData.stage!) }}
            </el-tag>
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-label">提交时间：</div>
          <div class="detail-content">{{ detailsData.fcd ? formatDate(detailsData.fcd) : '-' }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">回复：</div>
          <div class="detail-content">{{ detailsData.reply || '-' }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">回复时间：</div>
          <div class="detail-content">{{ detailsData.replyTime ? formatDate(detailsData.replyTime) : '-' }}</div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailsVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Delete } from '@element-plus/icons-vue'
import { getFeedbackList, deleteFeedback, batchDeleteFeedback, type FeedbackInfo, type FeedbackQuery } from '@/api/system/feedback'
import FeedbackForm from './components/FeedbackForm.vue'
import ReplyForm from './components/ReplyForm.vue'

// 扩展查询参数类型，使分页参数成为必需的
interface FeedbackQueryWithPagination extends Omit<FeedbackQuery, 'pageNum' | 'pageSize'> {
  pageNum: number
  pageSize: number
}

// 查询参数
const queryParams = reactive<FeedbackQueryWithPagination>({
  title: undefined,
  stage: undefined,
  startTime: undefined,
  endTime: undefined,
  pageNum: 1,
  pageSize: 10
})

// 日期范围
const dateRange = ref<string[]>([])

// 表格数据
const tableData = ref<FeedbackInfo[]>([])
const total = ref(0)
const loading = ref(false)
const selectedIds = ref<string[]>([])

// 表单相关
const formVisible = ref(false)
const replyVisible = ref(false)
const formType = ref<'add' | 'edit'>('add')
const formData = ref<Partial<FeedbackInfo>>({})

// 详情对话框相关
const detailsVisible = ref(false)
const detailsData = ref<Partial<FeedbackInfo>>({})

// 显示详情
const showDetails = (row: FeedbackInfo) => {
  detailsData.value = { ...row }
  detailsVisible.value = true
}

// 处理阶段选项
const stageOptions = [
  { value: 0, label: '待处理' },
  { value: 1, label: '处理中' },
  { value: 2, label: '已完成' }
]

// 获取处理阶段标签类型
const getStageTagType = (stage: number) => {
  switch (stage) {
    case 0:
      return 'warning'
    case 1:
      return 'primary'
    case 2:
      return 'success'
    default:
      return 'info'
  }
}

// 获取处理阶段标签文本
const getStageLabel = (stage: number) => {
  const option = stageOptions.find(item => item.value === stage)
  return option ? option.label : '未知'
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(/\//g, '-')
}


// 查询数据
const getList = async () => {
  loading.value = true
  try {
    const res = await getFeedbackList(queryParams)
    if (res) {
      tableData.value = res.content || []
      total.value = res.total || 0
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取数据失败')
  } finally {
    loading.value = false
  }
}

// 处理查询
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

// 重置查询
const resetQuery = () => {
  queryParams.title = ''
  queryParams.stage = undefined
  queryParams.startTime = ''
  queryParams.endTime = ''
  dateRange.value = []
  queryParams.pageNum = 1
  getList()
}

// 处理表格选择变化
const handleSelectionChange = (selection: FeedbackInfo[]) => {
  selectedIds.value = selection
    .map(item => item.id)
    .filter((id): id is string => id !== undefined)
}

// 处理分页大小变化
const handleSizeChange = (size: number | undefined) => {
  if (typeof size === 'number') {
    queryParams.pageSize = size
    getList()
  }
}

// 处理页码变化
const handleCurrentChange = (page: number | undefined) => {
  if (typeof page === 'number') {
    queryParams.pageNum = page
    getList()
  }
}

// 处理新增
const handleAdd = () => {
  formType.value = 'add'
  formData.value = {}
  formVisible.value = true
}

// 处理编辑
const handleEdit = (row: FeedbackInfo) => {
  formType.value = 'edit'
  formData.value = { ...row }
  formVisible.value = true
}

// 处理回复
const handleReply = (row: FeedbackInfo) => {
  formData.value = { ...row }
  replyVisible.value = true
}

// 处理删除
const handleDelete = (row: FeedbackInfo) => {
  if (!row.id) {
    ElMessage.error('反馈ID不存在')
    return
  }

  ElMessageBox.confirm(`确认删除标题为"${row.title}"的反馈吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteFeedback(row.id as string)
      ElMessage.success('删除成功')
      getList()
    } catch (error: any) {
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => {})
}

// 处理批量删除
const handleBatchDelete = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请至少选择一条记录')
    return
  }

  ElMessageBox.confirm(`确认删除选中的${selectedIds.value.length}条反馈吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await batchDeleteFeedback(selectedIds.value)
      ElMessage.success('批量删除成功')
      getList()
    } catch (error: any) {
      ElMessage.error(error.message || '批量删除失败')
    }
  }).catch(() => {})
}

// 关闭表单
const closeForm = () => {
  formVisible.value = false
}

// 关闭回复表单
const closeReplyForm = () => {
  replyVisible.value = false
}

// 处理表单提交成功
const handleFormSuccess = () => {
  closeForm()
  closeReplyForm()
  getList()
}

// 截断文本
const truncateText = (text: string, length: number) => {
  if (!text) return ''
  return text.length > length ? text.slice(0, length) + '...' : text
}

// 页面加载时获取数据
onMounted(() => {
  try {
    getList()
  } catch (error) {
    console.error('Failed to load feedback list on mount:', error)
    // 即使API失败，也要确保组件能正常显示
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  .card-header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.clickable-title {
  cursor: pointer;
  color: #409eff;
  &:hover {
    text-decoration: underline;
  }
}

.feedback-details {
  .detail-item {
    margin-bottom: 16px;
    display: flex;

    .detail-label {
      width: 80px;
      color: #606266;
      font-weight: 500;
    }

    .detail-content {
      flex: 1;
      word-break: break-all;
    }
  }
}
</style>
