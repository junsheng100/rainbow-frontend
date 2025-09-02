<template>
  <div class="interface-container">
    <div class="header-actions">
      <el-button type="primary" @click="handleAdd" icon="Plus" :disabled="!categoryId">新增</el-button>
      <el-button type="success" @click="handleRefresh" icon="Refresh" :disabled="!categoryId">刷新</el-button>
      <!-- 添加搜索框 -->
      <el-input
        v-model="searchKeyword"
        placeholder="请输入方法名称或描述"
        style="width: 200px; margin-left: 10px"
        clearable
        @clear="handleSearch"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button icon="Search" @click="handleSearch" />
        </template>
      </el-input>
    </div>

    <el-table
      v-loading="loading"
      :data="filteredInterfaceList"
      style="width: 100%"
      highlight-current-row
    >
      <el-table-column prop="orderNum" label="序号" width="80" >
        <template #default="scope">
          <span class="order-num">{{ scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="功能描述" width="120" show-overflow-tooltip>
        <template #default="scope">
          <el-tooltip :content="scope.row.description" placement="top">
            <span class="description-text">{{ scope.row.description || '-' }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="methodName" label="方法名" width="180" />
      <el-table-column prop="requestMethod" label="请求方式" width="100">
        <template #default="scope">
          <el-tag :type="getMethodTagType(scope.row.requestMethod)">
            {{ scope.row.requestMethod || '-' }}
          </el-tag>

        </template>
      </el-table-column>
      <!--
      <el-table-column prop="requestUrl" label="请求路径" />
      -->
      <el-table-column label="客户端类型" width="150" show-overflow-tooltip>
        <template #default="scope">
          <el-tooltip :content="scope.row.clientTypes" placement="top">
            <span class="client-types-text">{{ scope.row.clientTypes || '-' }}</span>
          </el-tooltip>
        </template>
      </el-table-column>

      <el-table-column label="启用" width="80">
        <template #default="scope">
          <el-tag :type=" scope.row.disabled === 0 || scope.row.disabled === undefined  ? 'success' : 'danger'">
            {{ scope.row.disabled === 0 || scope.row.disabled === undefined ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center">
        <template #default="scope">
          <el-button type="primary" link @click="handleEdit(scope.row)">
            <el-icon><Edit /></el-icon>
          </el-button>
          <el-button type="danger" link @click="handleDelete(scope.row)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 接口表单对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
      append-to-body
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="方法名称" prop="methodName">
          <el-input v-model="form.methodName" placeholder="请输入方法名称" />
        </el-form-item>
        <el-form-item label="请求方式" prop="requestMethod">
          <el-select v-model="form.requestMethod" placeholder="请选择请求方式">
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
            <el-option label="DELETE" value="DELETE" />
            <el-option label="PATCH" value="PATCH" />
          </el-select>
        </el-form-item>
        <el-form-item label="请求路径" prop="requestUrl">
          <el-input v-model="form.requestUrl" placeholder="请输入请求路径" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="客户端类型" prop="clientTypes">
          <el-select
            v-model="form.clientTypes"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="请选择客户端类型"
            style="width: 100%"
          >
            <el-option
              v-for="item in clientTypeOptions"
              :key="item.dictValue"
              :label="item.dictLabel"
              :value="item.dictValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="orderNum">
          <el-input-number v-model="form.orderNum" :min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="disabled">
          <el-radio-group v-model="form.disabled">
            <el-radio :label="0">启用</el-radio>
            <el-radio :label="1">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import {defineProps, reactive, ref, watch, computed, onMounted} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {deleteInterface, listInterface, saveInterface} from '@/api/appdoc/interface'
import {getDicts} from '@/api/dict/data'

// 搜索关键词
const searchKeyword = ref('')

// 接收父组件传递的目录ID
const props = defineProps({
  categoryId: {
    type: String,
    default: ''
  }
})

// 加载状态
const loading = ref(false)

// 接口列表数据
const interfaceList = ref<any[]>([])

// 客户端类型选项
const clientTypeOptions = ref<any[]>([])

// 表单相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref()
const form = reactive({
  id: '',
  categoryId: '',
  methodName: '',
  requestMethod: 'GET',
  requestUrl: '',
  description: '',
  orderNum: 0,
  disabled: 0,
  hide: 0,
  clientTypes: ''
})

// 表单校验规则
const rules = {
  methodName: [{ required: true, message: '请输入方法名称', trigger: 'blur' }],
  requestMethod: [{ required: true, message: '请选择请求方式', trigger: 'change' }]
}

// 加载客户端类型选项
const loadClientTypeOptions = async () => {
  try {
    const options = await getDicts('client_type')
    clientTypeOptions.value = options || []
  } catch (error) {
    console.error('获取客户端类型选项失败:', error)
  }
}

// 获取接口列表数据
const getList = async () => {
  if (!props.categoryId) {
    interfaceList.value = []
    return
  }

  loading.value = true
  try {
    const res = await listInterface({ categoryId: props.categoryId })
    // 修改数据处理逻辑以适配返回的数据结构
    interfaceList.value =  res || []
  } catch (error) {
    console.error('获取接口列表失败', error)
    ElMessage.error('获取接口列表失败')
  } finally {
    loading.value = false
  }
}

// 监听目录ID变化，自动刷新接口列表
watch(() => props.categoryId, (newVal) => {
  if (newVal) {
    getList()
  } else {
    interfaceList.value = []
  }
}, { immediate: true })

// 处理新增按钮点击
const handleAdd = () => {
  resetForm()
  form.categoryId = props.categoryId
  dialogTitle.value = '新增接口'
  dialogVisible.value = true
}

// 处理编辑按钮点击
const handleEdit = (row: any) => {
  resetForm()
  dialogTitle.value = '编辑接口'
  Object.assign(form, row)
  // 处理客户端类型，如果是字符串则转换为数组
  if (row.clientTypes && typeof row.clientTypes === 'string') {
    form.clientTypes = row.clientTypes.split(',').filter((item: string) => item.trim())
  }
  dialogVisible.value = true
}

// 处理删除按钮点击
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确认删除该接口吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })

    await deleteInterface(row.id)
    ElMessage.success('删除成功')
    getList()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败', error)
      ElMessage.error('删除失败')
    }
  }
}


// 处理刷新按钮点击
const handleRefresh = () => {
  getList()
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    // 处理客户端类型，将数组转换为逗号分割的字符串
    const submitData = {
      ...form,
      clientTypes: Array.isArray(form.clientTypes) ? form.clientTypes.join(',') : form.clientTypes
    }

    loading.value = true
    await saveInterface(submitData)

    ElMessage.success('保存成功')
    dialogVisible.value = false
    getList()
  } catch (error) {
    console.error('保存失败', error)
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  form.id = ''
  form.categoryId = props.categoryId
  form.methodName = ''
  form.requestMethod = 'GET'
  form.requestUrl = ''
  form.description = ''
  form.orderNum = 0
  form.disabled = 0
  form.hide = 0
  form.clientTypes = ''
}

// 获取请求方式对应的标签类型
const getMethodTagType = (method: string) => {
  const map: Record<string, string> = {
    'GET': 'success',
    'POST': 'primary',
    'PUT': 'warning',
    'DELETE': 'danger',
    'PATCH': 'info'
  }
  return map[method] || ''
}

// 过滤后的接口列表
const filteredInterfaceList = computed(() => {
  if (!searchKeyword.value) {
    return interfaceList.value
  }

  const keyword = searchKeyword.value.toLowerCase()
  return interfaceList.value.filter(item =>
    (item.methodName && item.methodName.toLowerCase().includes(keyword)) ||
    (item.description && item.description.toLowerCase().includes(keyword))
  )
})

// 处理搜索
const handleSearch = () => {
  getList()
}

// 初始化
onMounted(() => {
  loadClientTypeOptions()
})

// 暴露方法给父组件调用
defineExpose({
  getList
})
</script>

<style scoped>
.interface-container {
  padding: 10px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header-actions {
  margin-bottom: 15px;
  display: flex;
  justify-content: flex-start;
  gap: 10px;
}

.description-text {
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.client-types-text {
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  color: #409eff;
}
</style>
