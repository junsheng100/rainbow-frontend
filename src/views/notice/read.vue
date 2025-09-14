<template>
  <div class="post-container">
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

      <el-table-column label="状态" align="center" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === '0' ? 'success' : 'danger'">
            {{ row.status === '0' ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="查看" width="100" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="info" @click="handleViewDetail(row)">详情</el-button>
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
import {ref, reactive, onMounted} from 'vue'
import {ElMessage} from 'element-plus'
import type {FormInstance, FormRules} from 'element-plus'


import {NoticeInfo, NoticeQuery, willListNotice, updateNotice, addNotice, readNotice} from '@/api/notice/notice.js'


// 遮罩层
const loading = ref(false)
// 选中数组
const selectedIds = ref<Array<string | number>>([])
// 总条数
const total = ref(0)
// 通知/公告表格数据
const noticeList = ref<NoticeInfo[]>([])
// 弹出层标题
const title = ref('')
// 是否显示弹出层
const open = ref(false)
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

// 表单参照
const noticeRef = ref<FormInstance>()
// 查询参数
const queryParams = reactive<NoticeQuery>({
  pageNum: 1,
  pageSize: 10,
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
    const res = await willListNotice(queryParams)

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


/** 多选框选中数据 */
const handleSelectionChange = (selection: NoticeInfo[]) => {
  selectedIds.value = selection.map(item => item.noticeId!)
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
