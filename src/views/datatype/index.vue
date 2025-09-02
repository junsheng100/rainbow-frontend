<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" class="search-form">
      <el-row :gutter="24">
        <el-col :span="24">
          <div class="search-item" style="float: left">
            <el-form-item label="关键词" prop="keyword">
              <el-input v-model="queryParams.keyword" placeholder="请输入关键词" clearable />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </div>
          <div class="search-item" style="float: right">
            <el-form-item>
              <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
              <el-upload
                  class="upload-button"
                  action=""
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="handleFileChange"
                  accept=".xlsx,.xls"
                  :before-upload="beforeUpload"
              >
                <el-button type="primary" plain>
                  <el-icon>
                    <Upload/>
                  </el-icon>
                  上传Excel
                </el-button>
              </el-upload>
              <el-button type="danger" plain icon="Delete" @click="handleDelete()" :disabled="!selectedIds.length">批量删除</el-button>
              <el-button type="success" plain icon="Document" @click="handleExport">导出Excel</el-button>
            </el-form-item>
          </div>
        </el-col>
      </el-row>
    </el-form>

    <el-table v-loading="loading" :data="typeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="序号" align="center"  width="60"  prop="orderNum" >
        <template #default="scope">
          {{ ((queryParams.pageNum || 1) - 1) * (queryParams.pageSize || 10) + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="数据库" align="center" prop="dbType" />
      <el-table-column label="数据类型" align="center" prop="dataType" />
      <el-table-column label="列类型" align="center" prop="columnType" />
      <el-table-column label="数据范围" align="center" prop="dataRange" />
      <el-table-column label="描述" align="center" prop="dataDescribe" />
      <el-table-column label="Java类型" align="center" prop="javaType" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button type="text" icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button type="text" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
        v-show="total > 0"
        :total="total"
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 添加或修改数据类型对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="dataTypeForm" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="数据库" prop="dbType">
          <el-input v-model="form.dbType" placeholder="请输入数据库名称" />
        </el-form-item>
        <el-form-item label="数据类型" prop="dataType">
          <el-input v-model="form.dataType" placeholder="请输入数据类型" />
        </el-form-item>
        <el-form-item label="列类型" prop="columnType">
          <el-input v-model="form.columnType" placeholder="请输入列类型" />
        </el-form-item>
        <el-form-item label="数据范围" prop="dataRange">
          <el-input v-model="form.dataRange" placeholder="请输入数据范围" />
        </el-form-item>
        <el-form-item label="描述" prop="dataDescribe">
          <el-input v-model="form.dataDescribe" type="textarea" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="Java类型" prop="javaType">
          <el-select v-model="form.javaType" placeholder="请选择Java类型">
            <el-option
              v-for="option in javaTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="orderNum">
          <el-input-number
              v-model="form.orderNum"
              :min="1"
              :precision="0"
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, UploadProps, UploadUserFile } from 'element-plus'
import * as XLSX from 'xlsx-js-style'
import { saveAs } from 'file-saver'
import { Upload } from '@element-plus/icons-vue'
import { getDataTypePageList, getDataType, deleteBatchDataType, createDataType, updateDataType, getJavaTypeList, uploadDataTypeExcel } from '@/api/template/dataType'
import type { DataTypeInfo, DataTypeQuery } from '@/api/template/dataType'
import type { Enums } from '@/api/template/types'

const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const typeList = ref<DataTypeInfo[]>([])
const selectedIds = ref<string[]>([])
const open = ref(false)
const title = ref('')

/** 多选框选中数据 */
const handleSelectionChange = (selection: DataTypeInfo[]) => {
  selectedIds.value = selection.map(item => item.id as string)
}

const queryParams = reactive<DataTypeQuery>({
  pageNum: 1,
  pageSize: 10,
  keyword: undefined
})

const form = reactive<DataTypeInfo>({
  columnType: '',
  dataDescribe: '',
  dataRange: '',
  dataType: '',
  dbType: '',
  javaType: '',
  orderNum: 1
})

const rules = reactive({
  dbType: [{ required: true, message: '数据库不能为空', trigger: 'change' }],
  dataType: [{ required: true, message: '数据类型不能为空', trigger: 'blur' }],
  columnType: [{ required: true, message: '列类型不能为空', trigger: 'blur' }],
  javaType: [{ required: true, message: 'Java类型不能为空', trigger: 'blur' }]
})

const queryForm = ref<FormInstance>()
const dataTypeForm = ref<FormInstance>()

/** 查询数据类型列表 */
const getList = async () => {
  loading.value = true
  try {
    const response = await getDataTypePageList(queryParams)
    typeList.value = response.content
    total.value = response.total
  } catch (error) {
    console.error(error)
  }
  loading.value = false
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

/** 重置表单 */
const resetForm = () => {
  form.id = ''
  form.columnType = ''
  form.dataDescribe = ''
  form.dataRange = ''
  form.dataType = ''
  form.dbType = ''
  form.javaType = ''
  // 重置表单校验结果
  dataTypeForm.value?.clearValidate()
}

/** 新增按钮操作 */
const handleAdd = () => {
  resetForm()
  open.value = true
  title.value = '添加数据类型'
}

/** 修改按钮操作 */
const handleUpdate = async (row: DataTypeInfo) => {
  resetForm()  // 先重置表单
  try {
    const response = await getDataType(row.id as string)
    form.id = response.id
    form.columnType = response.columnType
    form.dataDescribe = response.dataDescribe
    form.dataRange = response.dataRange
    form.dataType = response.dataType
    form.dbType = response.dbType
    form.javaType = response.javaType
    open.value = true
    title.value = '修改数据类型'
  } catch (error) {
    console.error(error)
  }
}

/** 提交按钮 */
const submitForm = async () => {
  dataTypeForm.value?.validate(async (valid) => {
    if (valid) {
      try {
        if (form.id) {
          await updateDataType(form)
          ElMessage.success('修改成功')
        } else {
          await createDataType(form)
          ElMessage.success('新增成功')
        }
        open.value = false
        getList()
      } catch (error) {
        console.error(error)
      }
    }
  })
}

/** 删除按钮操作 */
const handleDelete = (row?: DataTypeInfo) => {
  const ids = row?.id ? [row.id] : selectedIds.value
  if (!ids.length) {
    ElMessage.warning('请选择要删除的数据')
    return
  }
  ElMessageBox.confirm(
    `是否确认删除${row ? '该' : '选中'}数据类型?`,
    '警告',
    {
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteBatchDataType(ids)
      getList()
      ElMessage.success('删除成功')
    } catch (error) {
      console.error(error)
    }
  })
}

/** 取消按钮 */
const cancel = () => {
  open.value = false
  resetForm()
}

/** 分页大小改变 */
const handleSizeChange = (val: number) => {
  queryParams.pageSize = val
  getList()
}

/** 页码改变 */
const handleCurrentChange = (val: number) => {
  queryParams.pageNum = val
  getList()
}

// 修改 javaTypeOptions 的类型定义和赋值
const javaTypeOptions = ref<Array<{ label: string; value: string }>>([])

// 文件上传相关
const maxFileSize = 10 * 1024 * 1024 // 10MB
const allowedTypes = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]

// 上传前校验
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  // 检查文件大小
  if (file.size > maxFileSize) {
    ElMessage.error('文件大小不能超过10MB')
    return false
  }

  // 检查文件类型
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error('只能上传Excel文件（.xlsx, .xls）')
    return false
  }

  return true
}

// 处理文件选择
const handleFileChange = async (uploadFile: UploadUserFile) => {
  if (!uploadFile.raw) {
    ElMessage.error('文件获取失败')
    return
  }

  try {
    loading.value = true
    ElMessage.info('正在上传文件，请稍候...')

    await uploadDataTypeExcel(uploadFile.raw)

    ElMessage.success({
      message: '上传成功',
      duration: 2000
    })
    getList() // 刷新列表
  } catch (error: any) {
    console.error('上传失败:', error)
    ElMessage.error({
      message: `上传失败: ${error.message || '未知错误'}`,
      duration: 3000
    })
  } finally {
    loading.value = false
  }
}

// 修改 javaTypes.map 的类型处理
onMounted(async () => {
  await getList()
  try {
    const javaTypes = await getJavaTypeList()
    const options = (javaTypes || [])
      .filter((type): type is Enums => Boolean(type?.code))
      .map(type => ({
        label: `${type.message} (${type.code})`,
        value: type.code
      }))
    javaTypeOptions.value = options
  } catch (error) {
    console.error('Failed to fetch Java type list:', error)
    ElMessage.error('加载Java类型失败，请检查网络或稍后重试')
  }
})

/** 导出Excel */
const handleExport = () => {
  if (!typeList.value || typeList.value.length === 0) {
    ElMessage.warning('当前没有可导出的数据')
    return
  }

  // 构建导出的数据
  const exportData = typeList.value.map(item => ({
    '数据库': item.dbType,
    '数据类型': item.dataType,
    '列类型': item.columnType,
    '数据范围': item.dataRange,
    '描述': item.dataDescribe,
    'Java类型': item.javaType,
    '排序号': item.orderNum
  }))

  // 使用 xlsx 库生成工作表
  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '数据类型')

  // 生成 Excel 文件并触发下载
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
  saveAs(blob, '数据类型列表.xlsx')
}
</script>

<style lang="scss" scoped>
.search-form {
  background-color: #fff;
  padding: 20px;
  margin-bottom: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  text-align: right;
}

.upload-button {
  display: inline-block;
  margin: 0 8px;

  :deep(.el-upload) {
    display: inline-block;
  }
}
</style>
