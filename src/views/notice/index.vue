<template>
  <div class="post-container">
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" class="search-form">
      <el-row :gutter="24">
        <el-col :span="24">
          <div class="search-item" style="float: left">
            <el-form-item prop="noticeTitle" label="标题">
              <el-input
                  v-model="queryParams.noticeTitle"
                  placeholder="请输入标题名称"
                  clearable
                  @keyup.enter="handleQuery"
              />
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
          </div>
          <div class="search-item" style="float: right">
            <el-form-item>
              <el-button type="success" @click="handleAdd">
                <el-icon>
                  <Plus/>
                </el-icon>
                新增
              </el-button>
            </el-form-item>
          </div>
        </el-col>
      </el-row>
    </el-form>

    <!-- 表格区域 -->
    <el-table
        v-loading="loading"
        :data="noticeList"
        class="post-table"
        stripe
        :highlight-current-row="true"
        @selection-change="handleSelectionChange"
        style="width: 100%; margin-top: 15px;"
    >
      <el-table-column type="selection" width="55" align="center" v-if="false"/>
      <el-table-column label="通知/公告编号" prop="noticeId" width="100" v-if="false"/>
      <el-table-column label="序号" prop="orderNum" width="100" align="center">
        <template #default="{ $index }">
          {{ (queryParams.pageNum! - 1) * queryParams.pageSize! + $index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="通知类型" align="center" width="100">
        <template #default="{ row }">
          <el-tag :type="row.noticeType === '1' ? 'info' : 'primary'">
            {{ row.noticeType === '1' ? '消息' : '公告' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
          label="标题"
          align="center"
          prop="noticeTitle"
          :show-overflow-tooltip="true"
      />
      <el-table-column label="通知内容" prop="noticeContent" min-width="150" :show-overflow-tooltip="true"/>
      <el-table-column label="推送部门数" prop="deptCount" min-width="60"/>
      <el-table-column label="推送用户数" prop="userCount" min-width="60"/>
      <el-table-column label="已读用户数" prop="readCount" min-width="60"/>
      <el-table-column label="状态" align="center" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === '0' ? 'success' : 'danger'">
            {{ row.status === '0' ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="fcd" width="180"/>
      <el-table-column label="操作" width="380" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="info" @click="handleViewDetail(row)">详情</el-button>
          <el-button link type="primary" @click="handleUpdate(row)">修改</el-button>
          <el-button link type="success" @click="handlePush(row)">推送</el-button>
          <el-button link type="danger" @click="handleDelete(row)" class="delete-btn">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
          :current-page="queryParams.pageNum"
          :page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>

    <!-- 添加或修改通知/公告对话框 -->
    <el-dialog
        :title="title"
        v-model="open"
        width="600px"
        append-to-body
    >
      <el-form ref="noticeRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="通知类型" prop="noticeType">
          <el-radio-group v-model="form.noticeType">
            <el-radio label="1">消息</el-radio>
            <el-radio label="2">公告</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="通知标题" prop="noticeTitle">
          <el-input v-model="form.noticeTitle" placeholder="请输入通知标题"/>
        </el-form-item>

        <el-form-item label="通知内容" prop="noticeContent">
          <el-input
              v-model="form.noticeContent"
              type="textarea"
              :maxlength="200"
              :rows="4"
              placeholder="请输入通知内容"
              show-word-limit
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="0">正常</el-radio>
            <el-radio label="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 推送设置对话框 -->
    <push-dialog
        v-model:visible="pushOpen"
        title="推送设置"
        :form-data="pushForm"
        @submit="handlePushSubmit"
        @cancel="pushOpen = false"
    />

    <!-- 查看详情对话框 -->
    <el-dialog
        title="通知详情"
        v-model="detailOpen"
        width="600px"
        append-to-body
    >
      <div class="detail-content">
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
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailOpen = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import {ref, reactive, onMounted, nextTick} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import type {FormInstance, FormRules} from 'element-plus'
import {Search, Refresh, Plus} from '@element-plus/icons-vue'

import {NoticeInfo, NoticePushParams, NoticeQuery, pushNotice} from '@/api/notice/notice.ts'
import {listNotice, getNotice, addNotice, updateNotice, delNotice, readNotice} from '@/api/notice/notice.ts'
import PushDialog, { PushFormData } from './PushDialog.vue'

// 遮罩层
const loading = ref(false)
// 选中数组
const selectedIds = ref<number[]>([])
// 总条数
const total = ref(0)
// 通知/公告表格数据
const noticeList = ref<NoticeInfo[]>([])
// 弹出层标题
const title = ref('')
// 是否显示弹出层
const open = ref(false)
// 是否显示推送弹出层
const pushOpen = ref(false)
// 是否显示详情弹出层
const detailOpen = ref(false)
// 详情表单
const detailForm = ref<NoticeInfo>({
  noticeId: 0,
  noticeTitle: '',
  noticeType: '',
  noticeContent: '',
  status: '',
  deptCount: 0,
  userCount: 0,
  readCount: 0,
  fcd: ''
})
// 推送表单
const pushForm = reactive<PushFormData>({
  noticeId: 0,
  noticeTitle: '',
  pushTimeType: '0', // 默认立即推送
  pushTime: null,
  pushType: '0',
  deptIds: [],
  userIds: []
})
// 表单参照
const noticeRef = ref<FormInstance>()
// 查询参照
const queryForm = ref<FormInstance>()

// 查询参数
const queryParams = reactive<NoticeQuery>({
  pageNum: 1,
  pageSize: 10,
  noticeTitle: '',
  status: '0'  // 默认选择"正常"状态
})

// 表单参数
const form = reactive<NoticeInfo>({
  noticeId: 0,
  noticeTitle: '',
  noticeType: '1', // 默认为消息类型
  noticeContent: '',
  status: '0',
  deptCount: 0,
  userCount: 0,
  readCount: 0
})

// 表单校验
const rules = reactive<FormRules>({
  noticeType: [
    {required: true, message: '请选择通知类型', trigger: 'change'}
  ],
  noticeTitle: [
    {required: true, message: '通知标题不能为空', trigger: 'blur'}
  ],
  noticeContent: [
    {required: true, message: '通知内容不能为空', trigger: 'blur'},
    {max: 200, message: '简介长度不能超过200个字符', trigger: 'blur'}
  ]
})

/** 查询通知列表 */
const getList = async () => {
  try {
    loading.value = true
    const res = await listNotice(queryParams)

    noticeList.value = res.content
    total.value = res.total
  } catch (error) {
    console.error('获取通知列表失败:', error)
  } finally {
    loading.value = false
  }
}

/** 取消按钮 */
const cancel = () => {
  reset()
  open.value = false
}

/** 表单重置 */
const reset = () => {
  form.noticeId = 0
  form.noticeTitle = ''
  form.noticeContent = ''
  form.noticeType = '1' // 默认为消息类型
  form.status = '0'
  noticeRef.value?.resetFields()
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryForm.value?.resetFields()
  queryParams.status = '0'  // 确保重置后状态为"正常"
  handleQuery()
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: NoticeInfo[]) => {
  selectedIds.value = selection.map(item => item.noticeId || 0)
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset()
  open.value = true
  title.value = '添加通知/公告'
}

/** 修改按钮操作 */
const handleUpdate = async (row: NoticeInfo) => {
  try {
    const noticeId = row.noticeId!;
    const res = await getNotice(noticeId)
    open.value = true
    title.value = '修改通知/公告'
    reset() // 重置表单
    // 使用nextTick确保表单重置后再设置新值
    nextTick(() => {
      Object.assign(form, res)
    })
  } catch (error) {
    console.error('获取通知/公告详情失败:', error)
  }
}

/** 提交按钮 */
const submitForm = async () => {
  if (!noticeRef.value) return
  try {
    await noticeRef.value.validate()
    if (form.noticeId) {
      await updateNotice(form)
      ElMessage.success('修改成功')
    } else {
      await addNotice(form)
      ElMessage.success('新增成功')
    }
    open.value = false
    getList()
  } catch (error) {
    console.error('提交表单失败:', error)
  }
}

/** 查看详情按钮操作 */
const handleViewDetail = async (row: NoticeInfo) => {
  detailOpen.value = true
  try {
    if (row.noticeId) {
      const res = await readNotice(row.noticeId)
      detailForm.value = res
    }
  } catch (error) {
    console.error('获取通知详情失败:', error)
    ElMessage.error(error instanceof Error ? error.message : '获取通知详情失败')
  }
}

/** 推送按钮操作 */
const handlePush = async (row: NoticeInfo) => {
  try {
    const noticeId = row.noticeId!
    const res = await getNotice(noticeId)

    pushForm.noticeId = noticeId
    pushForm.noticeTitle = res.noticeTitle || ''
    pushForm.pushTimeType = '0' // 默认立即推送
    pushForm.pushTime = new Date()
    pushForm.pushType = res.pushType || '0' // 默认全部用户
    pushForm.deptIds = res.deptIds || []
    pushForm.userIds = res.userIds || []

    pushOpen.value = true
  } catch (error) {
    console.error('获取通知详情失败:', error)
    ElMessage.error('获取通知详情失败')
  }
}

/** 处理推送提交 */
const handlePushSubmit = async (data: NoticePushParams) => {
  try {
    // 确保 deptIds 是数字数组
    const numericDeptIds = Array.isArray(data.deptIds)
      ? data.deptIds.map((id: any) => Number(id)).filter((id: number) => !isNaN(id))
      : []

    // 确保 userIds 是字符串数组
    const stringUserIds = Array.isArray(data.userIds)
      ? data.userIds.map((id: any) => String(id))
      : []

    const pushData: NoticePushParams = {
      noticeId: data.noticeId,
      noticeTitle: data.noticeTitle,
      pushTime: data.pushTime,
      pushType: data.pushType,
      deptIds: numericDeptIds,
      userIds: stringUserIds
    }
    console.log("##### 推送公告:1 Data: ",JSON.stringify(pushData))
    await pushNotice(pushData)
    ElMessage.success('推送设置成功')
    pushOpen.value = false
  } catch (error) {
    console.error('推送设置失败:', error)
    if (error instanceof Error) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('推送设置失败')
    }
  }
}
/** 删除按钮操作 */
const handleDelete = async (row?: NoticeInfo) => {
  const noticeIds = row?.noticeId ? [row.noticeId] : selectedIds.value
  if (!noticeIds.length) {
    ElMessage.warning('请选择要删除的数据')
    return
  }

  try {
    await ElMessageBox.confirm('是否确认删除选中的数据?', '警告', {
      type: 'warning'
    })
    await delNotice(noticeIds)
    getList()
    ElMessage.success('删除成功')
  } catch (error) {
    console.error('删除失败:', error)
  }
}

/** 处理分页大小变化 */
const handleSizeChange = (val: number) => {
  queryParams.pageSize = val
  getList()
}

/** 处理页码变化 */
const handleCurrentChange = (val: number) => {
  queryParams.pageNum = val
  getList()
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

  .detail-content {
    .detail-text {
      line-height: 1.5;
      color: #606266;
    }

    .detail-content-box {
      background-color: #f8f8f8;
      padding: 12px;
      border-radius: 4px;
      min-height: 100px;
      white-space: pre-wrap;
      word-break: break-word;
    }
  }
}
</style>
