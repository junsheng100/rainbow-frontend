<template>
  <div class="post-container">
    <!-- 搜索区域 -->

    <el-form :model="queryParams" ref="queryRef" :inline="true" class="search-form">
      <el-row :gutter="24">
        <el-col :span="24">
          <el-form-item label="通知标题" prop="noticeTitle">
            <el-input
                v-model="queryParams.noticeTitle"
                placeholder="请输入标题"
                clearable
                @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="推送状态" prop="isPush">
            <el-select v-model="queryParams.isPush" placeholder="选择推送状态" clearable style="width: 140px;">
              <el-option
                  v-for="dict in isPushOptions"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">
              <el-icon>
                <Search/>
              </el-icon>
              搜索
            </el-button>
            <el-button @click="resetQuery">
              <el-icon>
                <Refresh/>
              </el-icon>
              重置
            </el-button>
          </el-form-item>


          <el-button type="danger" :disabled="!ids.length" @click="handleBatchDelete">
            <el-icon>
              <Delete/>
            </el-icon>
            批量删除
          </el-button>
        </el-col>

      </el-row>
    </el-form>


    <!-- 表格区域 -->
    <el-table
        v-loading="loading"
        :data="pushList"
        @selection-change="handleSelectionChange"
        class="post-table"
        stripe
        :highlight-current-row="true"
        style="width: 100%;"
    >
      <el-table-column type="selection" width="50" align="center"/>
      <el-table-column label="序号" width="60" align="center">
        <template #default="{ $index }">
          {{ (queryParams.pageNum! - 1) * queryParams.pageSize! + $index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="通知标题" align="left" prop="noticeTitle" min-width="200" show-overflow-tooltip/>
      <el-table-column label="部门" align="left" prop="deptName" width="120" show-overflow-tooltip/>
      <el-table-column label="用户" align="left" prop="nickname" width="120" show-overflow-tooltip/>
      <el-table-column label="已读次数" align="center" prop="readCount" min-width="60" />
      <el-table-column label="推送时间" align="center" prop="pushTime" min-width="160">
        <template #default="{row}">
          <span>{{ formatDate(row.pushTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="340" fixed="right">
        <template #default="scope">
          <el-button
              link
              type="info"
              @click="handleViewDetail(scope.row)"
          >
            详情
          </el-button>
          <el-button
              link
              type="danger"
              class="delete-btn"
              @click="handleDelete(scope.row)"
              v-hasPermi="['system:push:remove']"
          >
            <el-icon>
              <Delete/>
            </el-icon>
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
          v-show="total > 0"
          :total="total"
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"

      />
    </div>

    <!-- 查看详情对话框 -->
    <el-dialog title="通知详情" v-model="detailOpen" width="600px" append-to-body>
      <el-form label-width="100px">
        <el-form-item label="通知类型">
          <el-tag :type="detailForm.noticeType === '1' ? 'info' : 'primary'">
            {{ detailForm.noticeType === '1' ? '消息' : '公告' }}
          </el-tag>
        </el-form-item>

        <el-form-item label="通知标题">
          <div class="detail-text">{{ detailForm.noticeTitle }}</div>
        </el-form-item>

        <el-form-item label="通知内容">
          <div class="detail-text detail-content-box">{{ detailForm.noticeContent }}</div>
        </el-form-item>

        <el-form-item label="创建时间">
          <div class="detail-text">{{ detailForm.fcd }}</div>
        </el-form-item>

        <el-form-item label="状态">
          <el-tag :type="detailForm.status === '0' ? 'success' : 'danger'">
            {{ detailForm.status === '0' ? '正常' : '停用' }}
          </el-tag>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 添加或修改推送对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="pushRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="通知ID" prop="noticeId">
          <el-input v-model="form.noticeId" placeholder="请输入通知ID"/>
        </el-form-item>
        <el-form-item label="推送类型" prop="pushType">
          <el-select v-model="form.pushType" placeholder="请选择推送类型">
            <el-option
                v-for="dict in pushTypeOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="推送时间" prop="pushTime">
          <el-date-picker
              v-model="form.pushTime"
              type="datetime"
              placeholder="选择推送时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%;"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, toRefs, onMounted} from 'vue'
import {Search, Refresh, Delete} from '@element-plus/icons-vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import type {FormInstance, FormRules} from 'element-plus'
import { readNotice} from '@/api/notice/notice.ts'
import {listPush, addPush, updatePush, delPush, batchDeletePush} from '@/api/notice/push.ts'
import type {PushInfo, PushQuery} from '@/api/notice/push.ts'
import {formatDate} from '@/utils/date'

const queryRef = ref<FormInstance>()
const pushRef = ref<FormInstance>()

// 遮罩层
const loading = ref(false)
// 选中数组
const ids = ref<Array<string>>([])
// 非单个禁用
const single = ref(true)
// 非多个禁用
const multiple = ref(true)

// 总条数
const total = ref(0)
// 详情对话框
const detailOpen = ref(false)
// 详情表单
const detailForm = ref<any>({})
// 推送表格数据
const pushList = ref<PushInfo[]>([])
// 弹出层标题
const title = ref('')
// 是否显示弹出层
const open = ref(false)

// 推送类型选项
const pushTypeOptions = [
  {value: '0', label: '全部用户'},
  {value: '1', label: '指定部门'},
  {value: '2', label: '指定用户'}
]

// 推送状态选项
const isPushOptions = [
  {value: 0, label: '待推送'},
  {value: 1, label: '已推送'},
  {value: 2, label: '推送失败'}
]

// 查询参数
const data = reactive<{
  queryParams: PushQuery
  form: PushInfo
  rules: FormRules
}>({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    noticeId: undefined,
    pushType: '',
    isPush: 0
  },
  form: {
    pushId: undefined,
    noticeId: undefined, // 使用0作为默认值
    pushType: '0',
    pushTime: '',
    isPush: 0
  },
  rules: {
    noticeId: [
      {required: true, message: '通知ID不能为空', trigger: 'blur'}
    ],
    pushType: [
      {required: true, message: '推送类型不能为空', trigger: 'change'}
    ],
    pushTime: [
      {required: true, message: '推送时间不能为空', trigger: 'blur'}
    ]
  }
})

const {queryParams, form, rules} = toRefs(data)

/** 查询推送列表 */
const getList = () => {
  loading.value = true
  listPush(queryParams.value).then(response => {
    pushList.value = response.content
    total.value = response.total
    loading.value = false
  })
}

/** 取消按钮 */
const cancel = () => {
  open.value = false
  resetForm()
}

/** 表单重置 */
const resetForm = () => {
  form.value = {
    pushId: '',
    noticeId: undefined,
    pushType: '0',
    pushTime: '',
    isPush: 0
  }
  pushRef.value?.resetFields()
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryRef.value?.resetFields()
  handleQuery()
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: PushInfo[]) => {
  ids.value = selection.map(item => item.pushId as string)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}


/** 提交按钮 */
const submitForm = () => {
  pushRef.value?.validate(valid => {
    if (valid) {
      if (form.value.pushId) {
        updatePush(form.value).then(() => {
          ElMessage.success('修改成功')
          open.value = false
          getList()
        })
      } else {
        addPush(form.value).then(() => {
          ElMessage.success('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}


// 批量删除
const handleBatchDelete = async () => {
  if (!ids.value.length) {
    ElMessage.warning('请选择要删除的数据')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${ids.value.length} 条数据吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await batchDeletePush(ids.value)
    ElMessage.success('删除成功')
    getList()
  } catch (err: any) {
    if (err !== 'cancel') {
      console.error('批量删除操作日志失败:', err)
      ElMessage.error('批量删除操作日志失败')
    }
  }
}

/** 删除按钮操作 */
const handleDelete = (row?: PushInfo) => {
  if (!row?.pushId) {
    ElMessage.warning('无效的推送记录')
    return
  }
  const pushIds = row.pushId
  ElMessageBox.confirm('是否确认删除"' + pushIds.length + '"条数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    return delPush(pushIds)
  }).then(() => {
    getList()
    ElMessage.success('删除成功')
  }).catch(() => {})
}

/** 查看详情按钮操作 */
const handleViewDetail = (row: PushInfo) => {
  if (!row?.noticeId) {
    ElMessage.warning('无效的通知记录')
    return
  }
  readNotice(row.noticeId).then(response => {
    detailForm.value = response
    detailOpen.value = true
  })
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.post-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;

  .search-form {
    background-color: #fff;
    padding: 20px;
    margin-bottom: 0;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    :deep(.el-form-item) {
      margin-bottom: 0;
    }

    :deep(.el-form-item__content) {
      margin-right: 16px;
    }

    .el-button {
      margin-left: 8px;
    }
  }

  .post-table {
    margin-top: 0;
  }

  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }

  .delete-btn {
    color: #F56C6C;
  }

  .dialog-footer {
    text-align: right;
  }
}
</style>
