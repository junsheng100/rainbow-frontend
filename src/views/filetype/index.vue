<template>
  <div class="filetype-container">
    <!-- 搜索表单 -->
    <el-card class="search-card">
      <el-form :model="queryParams" ref="queryForm" :inline="true">
        <el-form-item label="类型名称" prop="typeName">
          <el-input
              v-model="queryParams.typeName"
              placeholder="请输入"
              clearable
              style="width: 120px"
              @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="MIME类型" prop="mimeType" label-width="80px">
          <el-input
              v-model="queryParams.mimeType"
              placeholder="请输入"
              clearable
              style="width: 140px"
              @keyup.enter="handleQuery"
          />
        </el-form-item>
        <!--             :label="dict.value === 0?'不可用':'可用'"-->
        <el-form-item label="可用" prop="approve">
          <el-select v-model="queryParams.approve" style="width: 120px;" placeholder="可用类型" clearable>
            <el-option
                v-for="approve in [0,1]"
                :key="approve"
                :label="approve == 0?'不可用':'已可用'"
                :value="approve"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="拒用" prop="refuse">
          <el-select v-model="queryParams.refuse" style="width: 120px;" placeholder="拒用类型" clearable>
            <el-option
                v-for="refuse in [0,1]"
                :key="refuse"
                :label="refuse == 0?'未拒绝':'已拒绝'"
                :value="refuse"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
          <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮和数据表格 -->
    <el-card class="table-card">
      <div class="toolbar-buttons">
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
        <el-button
            type="danger"
            :icon="Delete"
            :disabled="selectedIds.length === 0"
            @click="handleBatchDelete"
        >批量删除
        </el-button>
      </div>

      <el-table
          v-loading="loading"
          :data="tableData"
          @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center"/>

        <el-table-column label="类型名称" prop="typeName" show-overflow-tooltip/>
        <el-table-column label="文件扩展名" prop="extension" width="120"/>
        <el-table-column label="MIME类型" prop="mimeType" show-overflow-tooltip/>
        <el-table-column label="Logo" width="80" align="center">
          <template #default="{ row }">
            <img
                v-if="row.logo"
                :src="getResourceUrl(row.logo)"
                class="table-logo-image"
                alt="logo"
            />
            <el-icon v-else>
              <Plus/>
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column label="是否可用" align="center" prop="approve" width="100px">
          <template #default="{ row }">
            <el-tag :type="row.approve === 0 ? 'info' : 'success' ">
              {{ row.approve === 0 ? '不可用' : '已可用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否拒用" align="center" prop="refuse" width="100px">
          <template #default="{ row }">
            <el-tag :type="row.refuse === 0 ? 'info' : 'warning' ">
              {{ row.refuse === 0 ? '未拒绝' : '已拒绝' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :icon="Edit" @click="handleUpdate(row)">编辑</el-button>
            <el-button link type="danger" :icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrapper">
        <el-pagination
            v-model:current-page="queryParams.pageNum"
            v-model:page-size="queryParams.pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '新增文件类型' : '编辑文件类型'"
        width="500px"
        append-to-body
        @close="resetForm"
    >
      <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="100px"
      >
        <el-form-item label="类型名称" prop="name">
          <el-input v-model="form.typeName" placeholder="请输入类型名称"/>
        </el-form-item>
        <el-form-item label="文件扩展名" prop="extension">
          <el-input v-model="form.extension" placeholder="请输入文件扩展名">
            <template #prepend>.</template>
          </el-input>
        </el-form-item>
        <el-form-item label="MIME类型" prop="mimeType">
          <el-input v-model="form.mimeType" placeholder="请输入MIME类型"/>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
              v-model="form.description"
              type="textarea"
              placeholder="请输入描述"
          />
        </el-form-item>
        <el-form-item label="Logo" prop="logo">
          <el-upload
              class="logo-uploader"
              :action="'/api/mime/type/upload'"
              :show-file-list="false"
              :on-success="handleLogoSuccess"
              :on-error="handleLogoError"
              :before-upload="beforeLogoUpload"
              :headers="uploadHeaders"
              accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.svg,image/jpeg,image/png,image/gif,image/bmp,image/webp,image/svg+xml"
          >
            <img v-if="form.logo" :src="getResourceUrl(form.logo)" class="logo-image"/>
            <el-icon v-else class="logo-uploader-icon">
              <Plus/>
            </el-icon>
          </el-upload>
          <div class="el-upload__tip">
            请上传不大于1MB的图片文件<br/>
            支持格式: JPG, PNG, GIF, BMP, WEBP, SVG
          </div>
        </el-form-item>
        <el-form-item label="是否启用" prop="approve">
          <el-radio-group v-model="form.approve">
            <el-radio :label="0">未启用</el-radio>
            <el-radio :label="1">已启用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否拒绝" prop="refuse">
          <el-radio-group v-model="form.refuse">
            <el-radio :label="0">未拒绝</el-radio>
            <el-radio :label="1">已拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="() => { dialogVisible = false; resetForm(); }">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted, computed} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Edit,
  Delete
} from '@element-plus/icons-vue'
import {getToken} from '@/utils/auth'
import {getResourceUrl} from '@/config'
import type {FormInstance, FormRules} from 'element-plus'
import type {FileType, FileTypeQuery} from '@/types/fileType'
import {
  getFileTypeList,
  addFileType,
  updateFileType,
  deleteFileType,
  batchDeleteFileType,
} from '@/api/files/fileType'

// 查询参数
const queryParams = reactive<FileTypeQuery>({
  pageNum: 1,
  pageSize: 10,
  typeName: '',
  mimeType: '',
  extension: '',
  status: undefined
})

// 表格数据
const loading = ref(false)
const tableData = ref<FileType[]>([])
const total = ref(0)
const selectedIds = ref<number[]>([])

// 上传头部信息，携带token
const uploadHeaders = computed(() => {
  return {
    Authorization: getToken()
  }
})

// 弹窗数据
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()
const form = reactive<Partial<FileType>>({
  typeName: '',
  extension: '',
  mimeType: '',
  description: '',
  status: 1,
  logo: ''
})

// 表单校验规则
const rules: FormRules = {
  typeName: [
    {required: true, message: '请输入类型名称', trigger: 'blur'},
    {min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur'}
  ],
  extension: [
    {required: true, message: '请输入文件扩展名', trigger: 'blur'},
    {pattern: /^[a-zA-Z0-9]+$/, message: '只能包含字母和数字', trigger: 'blur'}
  ],
  // mimeType: [
  //   {required: true, message: '请输入MIME类型', trigger: 'blur'},
  //   {pattern: /^[a-z]+\/[a-z0-9\-\+\.]+$/, message: 'MIME类型格式不正确', trigger: 'blur'}
  // ],
  approve: [
    {required: true, message: '请选择启用状态', trigger: 'change'}
  ],
  refuse: [
    {required: true, message: '请选择是否拒用', trigger: 'change'}
  ]
}

// 获取数据列表
const getList = async () => {
  try {
    loading.value = true
    const res = await getFileTypeList(queryParams)
    tableData.value = res.content
    total.value = res.total
  } catch (error) {
    console.error('获取文件类型列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 表格选择改变
const handleSelectionChange = (selection: FileType[]) => {
  selectedIds.value = selection.map(item => item.id)
}

// 查询操作
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

// 重置查询
const resetQuery = () => {
  queryParams.typeName = ''
  queryParams.mimeType = ''
  queryParams.extension = ''
  queryParams.approve = undefined
  queryParams.refuse = undefined
  queryParams.status = undefined
  handleQuery()
}

// 分页操作
const handleSizeChange = (val: number) => {
  queryParams.pageSize = val
  getList()
}

const handleCurrentChange = (val: number) => {
  queryParams.pageNum = val
  getList()
}

// 新增操作
const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  resetForm()
}

// 修改操作
const handleUpdate = (row: FileType) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  Object.assign(form, row)
}

// 重置表单
const resetForm = () => {
  form.id = undefined
  form.typeName = ''
  form.extension = ''
  form.mimeType = ''
  form.description = ''
  form.logo = ''
  form.approve = 0
  form.refuse = 0
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (dialogType.value === 'add') {
          await addFileType(form as Omit<FileType, 'id'>)
          ElMessage.success('新增成功')
        } else {
          await updateFileType(form as FileType)
          ElMessage.success('修改成功')
        }
        dialogVisible.value = false
        getList()
        resetForm() // 重置表单内容
      } catch (error) {
        console.error('保存文件类型失败:', error)
      }
    }
  })
}

// 删除操作
const handleDelete = async (row: FileType) => {
  try {
    await ElMessageBox.confirm('确认要删除该文件类型吗？', '提示', {
      type: 'warning'
    })
    await deleteFileType(row.id)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    console.error('删除文件类型失败:', error)
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的数据')
    return
  }

  try {
    await ElMessageBox.confirm(`确认要删除选中的 ${selectedIds.value.length} 条数据吗？`, '提示', {
      type: 'warning'
    })
    await batchDeleteFileType(selectedIds.value)
    ElMessage.success('批量删除成功')
    getList()
  } catch (error) {
    console.error('批量删除文件类型失败:', error)
  }
}


// 处理Logo上传成功
const handleLogoSuccess = (response: any) => {
  if (response.code === 200) {
    form.logo = response.data
    ElMessage.success('Logo上传成功')
  } else {
    ElMessage.error(response.msg || 'Logo上传失败')
  }
}

// 处理Logo上传失败
const handleLogoError = () => {
  ElMessage.error('Logo上传失败')
}

// 上传前验证
const beforeLogoUpload = (file: File) => {
  // 检查文件类型 - 严格限制为图片格式
  const allowedImageTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
    'image/svg+xml'
  ]
  
  const isImage = allowedImageTypes.includes(file.type.toLowerCase())
  
  // 检查文件扩展名
  const fileName = file.name.toLowerCase()
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg']
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext))
  
  // 检查文件大小，1MB = 1 * 1024 * 1024 bytes
  const isLt1M = file.size / 1024 / 1024 < 1

  if (!isImage && !hasValidExtension) {
    ElMessage.error('只能上传图片文件! 支持格式: JPG, PNG, GIF, BMP, WEBP, SVG')
    return false
  }
  
  if (!isLt1M) {
    ElMessage.error('图片大小不能超过 1MB!')
    return false
  }
  
  return true
}

// 初始化
onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.filetype-container {
  padding: 20px;

  .search-card {
    margin-bottom: 20px;
  }

  .table-card {
    .toolbar-buttons {
      margin-bottom: 20px;
    }

    .pagination-wrapper {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}

.dialog-footer {
  padding-top: 20px;
  text-align: right;
}

.detail-pre {
  margin: 0;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;

  &.error {
    color: #f56c6c;
  }
}

.logo-uploader {
  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s;

    &:hover {
      border-color: #409eff;
    }
  }
}

.logo-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  text-align: center;
  line-height: 120px;
}

.logo-image {
  width: 120px;
  height: 120px;
  display: block;
  object-fit: contain;
}

.table-logo-image {
  width: 30px;
  display: block;
  object-fit: contain;
  border-radius: 10%;
}
</style>
