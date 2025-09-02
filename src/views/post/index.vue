<template>
  <div class="post-container">
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" class="search-form">
        <el-row :gutter="24">
        <el-col :span="24">
          <div class="search-item" style="float: left">
            <el-form-item prop="postName" label="岗位名称">
              <el-input
                v-model="queryParams.postName"
                placeholder="请输入岗位名称"
                clearable
                @keyup.enter="handleQuery"
              />
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
          </div>
          <div class="search-item" style="float: right">
            <el-form-item>
            <el-button type="success" @click="handleAdd">
              <el-icon><Plus /></el-icon>
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
        :data="postList"
        class="post-table"
        stripe
        :highlight-current-row="true"
        @selection-change="handleSelectionChange"
      style="width: 100%; margin-top: 15px;"
      >
        <el-table-column label="岗位编号" prop="postId" width="100" v-if="false"/>
        <el-table-column label="序号" prop="orderNum" width="100" align="center" >
          <template #default="{ $index }">
            {{ (queryParams.pageNum! - 1) * queryParams.pageSize! + $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="岗位名称" prop="postName" min-width="150" />
        <el-table-column label="岗位编码" prop="postCode" min-width="150" />
        <el-table-column label="状态" align="center" width="100">
          <template #default="{ row }">
          <el-tag :type="row.status === '0' ? 'success' : 'danger'">
              {{ row.status === '0' ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="fcd" width="180" />
      <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
          <el-button link type="primary" @click="handleUpdate(row)">修改</el-button>
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

    <!-- 添加或修改岗位对话框 -->
    <el-dialog
      :title="title"
      v-model="open"
      width="600px"
      append-to-body
    >
      <el-form ref="postRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="岗位名称" prop="postName">
          <el-input v-model="form.postName" placeholder="请输入岗位名称" />
        </el-form-item>
        <el-form-item label="岗位编码" prop="postCode">
          <el-input v-model="form.postCode" placeholder="请输入岗位编码" />
        </el-form-item>
        <el-form-item label="岗位简介" prop="overview">
          <el-input
            v-model="form.overview"
            type="textarea"
            :maxlength="200"
            :rows="4"
            placeholder="请输入岗位简介"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="显示顺序" prop="orderNum">
          <el-input-number v-model="form.orderNum" :min="0" />
        </el-form-item>
        <el-form-item label="岗位状态" prop="status">
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
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { getPostList, getPost, createPost, updatePost, deletePost } from '@/api/system/post.ts'
import type { PostInfo, PostQuery } from '@/api/system/post.ts'

// 遮罩层
const loading = ref(false)
// 选中数组
const selectedIds = ref<Array<string | number>>([])
// 总条数
const total = ref(0)
// 岗位表格数据
const postList = ref<PostInfo[]>([])
// 弹出层标题
const title = ref('')
// 是否显示弹出层
const open = ref(false)
// 表单参照
const postRef = ref<FormInstance>()
// 查询参照
const queryForm = ref<FormInstance>()

// 查询参数
const queryParams = reactive<PostQuery>({
  pageNum: 1,
  pageSize: 10,
  postName: '',
  postCode: '',
  status: ''
})

// 表单参数
const form = reactive<PostInfo>({
  postId: undefined,
  postCode: '',
  postName: '',
  orderNum: 0,
  status: '0',
  overview: ''
})

// 表单校验
const rules = reactive<FormRules>({
  postName: [
    { required: true, message: '岗位名称不能为空', trigger: 'blur' }
  ],
  postCode: [
    { required: true, message: '岗位编码不能为空', trigger: 'blur' }
  ],
  orderNum: [
    { required: true, message: '显示顺序不能为空', trigger: 'blur' }
  ],
  overview: [
    { max: 200, message: '简介长度不能超过200个字符', trigger: 'blur' }
  ]
})

/** 查询岗位列表 */
const getList = async () => {
  try {
    loading.value = true
    const res = await getPostList(queryParams)
    postList.value = res.content
    total.value = res.total
  } catch (error) {
    console.error('获取岗位列表失败:', error)
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
  form.postId = undefined
  form.postCode = ''
  form.postName = ''
  form.orderNum = 0
  form.status = '0'
  form.overview = ''
  postRef.value?.resetFields()
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryForm.value?.resetFields()
  handleQuery()
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: PostInfo[]) => {
  selectedIds.value = selection.map(item => item.postId!)
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset()
  open.value = true
  title.value = '添加岗位'
}

/** 修改按钮操作 */
const handleUpdate = async (row: PostInfo) => {
  try {
    reset()
    const res = await getPost(row.postId!)
    Object.assign(form, res)
    open.value = true
    title.value = '修改岗位'
  } catch (error) {
    console.error('获取岗位详情失败:', error)
  }
}

/** 提交按钮 */
const submitForm = async () => {
  if (!postRef.value) return
  try {
    await postRef.value.validate()
    if (form.postId) {
      await updatePost(form)
      ElMessage.success('修改成功')
    } else {
      await createPost(form)
      ElMessage.success('新增成功')
    }
    open.value = false
    getList()
  } catch (error) {
    console.error('提交表单失败:', error)
  }
}

/** 删除按钮操作 */
const handleDelete = async (row?: PostInfo) => {
  const postIds = row?.postId || selectedIds.value
  if (!postIds && !row) {
    ElMessage.warning('请选择要删除的数据')
    return
  }

  try {
    await ElMessageBox.confirm(
      `是否确认删除${row ? '' : '选中的' + selectedIds.value.length + '条'}数据？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await deletePost(postIds)
    ElMessage.success('删除成功')
    getList()
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
}
</style>
