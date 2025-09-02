<template>
  <div class="settings-container">
    <!-- 搜索区域 -->
    <el-form :model="searchForm" ref="queryForm" :inline="true" class="search-form">
        <el-row :gutter="24">
        <el-col :span="24">
          <div class="search-item" style="float: left">
            <el-form-item prop="configName" label="参数名称">
              <el-input
                v-model="searchForm.configName"
                placeholder="请输入参数名称"
                clearable
                @keyup.enter="handleSearch"
              />
            </el-form-item>
            <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
            </el-form-item>
          </div>
          <div class="search-item" style="float: right">
            <el-form-item>
            <el-button type="success" @click="handleAdd">
              <el-icon><Plus /></el-icon>
                新增参数
            </el-button>
            </el-form-item>
          </div>
          </el-col>
        </el-row>
    </el-form>

    <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        class="config-table"
        stripe
        :highlight-current-row="true"
      style="width: 100%; margin-top: 15px;"
      >
      <el-table-column prop="orderNum" label="序号" width="100" align="center" >
        <template #default="{ $index }">
          {{ (pagination.current - 1) * pagination.size + $index + 1 }}
        </template>
      </el-table-column>
        <el-table-column prop="configId" label="ID" width="80" v-if="false" />
        <el-table-column prop="configName" label="参数名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="configKey" label="参数键名" min-width="150" show-overflow-tooltip />
        <el-table-column prop="configValue" label="参数值" min-width="200" show-overflow-tooltip />
      <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
          <el-button link type="primary" @click="handleEdit(row)">修改</el-button>
          <el-button link type="danger" @click="handleDelete(row)" class="delete-btn">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          :current-page="pagination.current"
          :page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :small="false"
          :disabled="loading"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

    <!-- 添加/编辑配置弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑配置' : '新增配置'"
      width="600px"
      :before-close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="configForm"
        :rules="formRules"
        label-width="100px"
        class="config-form"
      >
        <el-form-item label="参数名称" prop="configName">
          <el-input
            v-model="configForm.configName"
            placeholder="请输入参数名称"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="参数键名" prop="configKey">
          <el-input
            v-model="configForm.configKey"
            placeholder="请输入参数键名"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="参数值" prop="configValue">
          <el-input
            v-model="configForm.configValue"
            type="textarea"
            :rows="4"
            placeholder="请输入参数值"
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="显示顺序" prop="orderNum">
          <el-input-number
            v-model="configForm.orderNum"
            :min="0"
            :max="9999"
            placeholder="请输入显示顺序"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
} from '@element-plus/icons-vue'
import {
  getSysConfigPage,
  createSysConfig,
  updateSysConfig,
  deleteSysConfig,
  type SysConfig,
  type SysConfigQueryParams
} from '@/api/system/sysConfig.ts'

// 响应式数据
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const tableData = ref<SysConfig[]>([])
const formRef = ref<FormInstance>()

// 搜索表单
const searchForm = reactive({
  configName: '',
  status: '0'
})

// 分页数据
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 配置表单
const configForm = reactive<Partial<SysConfig>>({
  configName: '',
  configKey: '',
  configValue: '',
  orderNum: 0
})

// 表单验证规则
const formRules: FormRules = {
  configName: [
    { required: true, message: '请输入参数名称', trigger: 'blur' },
    { max: 100, message: '参数名称不能超过100个字符', trigger: 'blur' }
  ],
  configKey: [
    { required: true, message: '请输入参数键名', trigger: 'blur' },
    { max: 100, message: '参数键名不能超过100个字符', trigger: 'blur' }
  ],
  configValue: [
    { required: true, message: '请输入参数值', trigger: 'blur' },
    { max: 2000, message: '参数值不能超过2000个字符', trigger: 'blur' }
  ],
  orderNum: [
    { required: true, message: '请输入显示顺序', trigger: 'blur' },
    { type: 'number', min: 0, max: 9999, message: '显示顺序范围为 0-9999', trigger: 'blur' }
  ]
}

// 初始化数据
const initData = () => {
  getTableData()
}

// 获取表格数据
const getTableData = async () => {
  try {
    loading.value = true
    const params: SysConfigQueryParams = {
      page: pagination.current,
      size: pagination.size,
      configName: searchForm.configName || undefined,
      status: searchForm.status || '0'
    }

    const response = await getSysConfigPage(params)
    tableData.value = response.content
    pagination.total = response.total
  } catch (error) {
    console.error('获取系统配置列表失败:', error)
    ElMessage.error('获取系统配置列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  getTableData()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    configName: '',
    configKey: '',
    configValue: ''
  })
  pagination.current = 1
  getTableData()
}

// 分页大小改变
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.current = 1
  getTableData()
}

// 当前页改变
const handleCurrentChange = (page: number) => {
  pagination.current = page
  getTableData()
}

// 新增配置
const handleAdd = () => {
  isEdit.value = false
  dialogVisible.value = true
  resetForm()
}

// 编辑配置
const handleEdit = (row: SysConfig) => {
  isEdit.value = true
  dialogVisible.value = true
  Object.assign(configForm, row)
}

// 删除配置
const handleDelete = async (row: SysConfig) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除配置"${row.configName}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await deleteSysConfig(row.configId!)
    ElMessage.success('删除成功')
    getTableData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除配置失败:', error)
      ElMessage.error('删除配置失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitLoading.value = true

    if (isEdit.value) {
      await updateSysConfig(configForm as SysConfig)
      ElMessage.success('更新成功')
    } else {
      await createSysConfig(configForm)
      ElMessage.success('创建成功')
    }

    dialogVisible.value = false
    getTableData()
  } catch (error) {
    console.error('保存配置失败:', error)
    ElMessage.error('保存配置失败')
  } finally {
    submitLoading.value = false
  }
}

// 关闭弹窗
const handleDialogClose = () => {
  dialogVisible.value = false
  resetForm()
}

// 重置表单
const resetForm = () => {
  Object.assign(configForm, {
    configId: undefined,
    configName: '',
    configKey: '',
    configValue: '',
    orderNum: 0
  })
  formRef.value?.clearValidate()
}

// 生命周期
onMounted(() => {
  initData()
})
</script>

<style lang="scss" scoped>
.settings-container {
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

  .delete-btn {
    color: #F56C6C;
      }

  .dialog-footer {
    text-align: right;
    }

    .pagination-wrapper {
      margin-top: 16px;
      display: flex;
      justify-content: flex-end;
    }

  .table-card {
    flex: 1;
    display: flex;
    flex-direction: column;

    .el-table {
      flex: 1;
    }
  }
}
</style>
