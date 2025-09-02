<template>
  <div class="category-container">
    <div class="header-actions">
      <el-button type="primary" @click="handleAdd" icon="Plus">新增</el-button>
      <el-button type="success" @click="handleRefreshAll" icon="Refresh">刷新全部</el-button>
      <!-- 添加搜索框 -->
      <el-input
        v-model="queryParams.simpleName"
        placeholder="请输入目录名称"
        style="width: 200px; margin-left: 10px"
        clearable
        @clear="getList"
        @keyup.enter="getList"
      >
        <template #append>
          <el-button icon="Search" @click="getList" />
        </template>
      </el-input>
    </div>

    <el-table
      v-loading="loading"
      :data="categoryList"
      style="width: 100%"
      @row-click="handleRowClick"
      highlight-current-row
    >
      <el-table-column  label="序号" type="index"  width="60">
        <template #default="{ $index }">
          {{ (queryParams.pageNum - 1) * queryParams.pageSize + $index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="simpleName" label="目录名称" width="180" />

      <el-table-column prop="description"  label="说明" width="140">
        <template #default="scope">
          <el-tooltip :content="scope.row.description" placement="top">
            <span class="description-text">{{ scope.row.description || '-' }}</span>
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
          <el-button type="primary" link @click.stop="handleEdit(scope.row)">
            <el-icon><Edit /></el-icon>
          </el-button>
          <el-button type="danger" link @click.stop="handleDelete(scope.row)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 目录表单对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
      append-to-body
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="目录名称" prop="simpleName">
          <el-input v-model="form.simpleName" placeholder="请输入目录名称" />
        </el-form-item>
        <el-form-item label="类名" prop="className">
          <el-input v-model="form.className" placeholder="请输入类名" />
        </el-form-item>
        <el-form-item label="请求路径" prop="requestUrl">
          <el-input v-model="form.requestUrl" placeholder="请输入请求路径" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入描述" />
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
import { ref, reactive, onMounted, defineEmits } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  pageCategory,
  saveCategory,
  deleteCategory,
  refreshAllCategory,
  AppCategoryParams
} from '@/api/appdoc/category'
import { listInterface } from '@/api/appdoc/interface'
import {AppCategory} from "@/types/appdoc.ts";

// 定义事件
const emit = defineEmits(['select-category'])

// 加载状态
const loading = ref(false)

// 目录列表数据
const categoryList = ref<AppCategory[]>([])
const total = ref(0)

// 查询参数
const queryParams = reactive<AppCategoryParams>({
  pageNum: 1,
  pageSize: 10,
  simpleName: '',
  className: '',
  requestUrl: '',
  status: ''
})

// 当前选中的目录ID
const currentCategoryId = ref('')

// 表单相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref()
const form = reactive({
  id: '',
  simpleName: '',
  className: '',
  requestUrl: '',
  description: '',
  orderNum: 0,
  disabled: 0,
  hide: 0
})

// 表单校验规则
const rules = {
  simpleName: [{ required: true, message: '请输入目录名称', trigger: 'blur' }],
  className: [{ required: true, message: '请输入类名', trigger: 'blur' }],
  requestUrl: [{ required: true, message: '请输入请求路径', trigger: 'blur' }]
}

// 获取目录列表数据
const getList = async () => {
  loading.value = true
  try {
    const res = await pageCategory(queryParams)

    categoryList.value = res.content  || []
    total.value = res.total || 0

    // 如果是首次加载，自动选中第一个目录
    if (categoryList.value.length > 0 && !currentCategoryId.value) {
      handleRowClick(categoryList.value[0])
    }
  } catch (error) {
    console.error('获取目录列表失败', error)
    ElMessage.error('获取目录列表失败')
  } finally {
    loading.value = false
  }
}

// 处理行点击事件
const handleRowClick = (row: any) => {
  currentCategoryId.value = row.id
  emit('select-category', row.id)
}


// 处理新增按钮点击
const handleAdd = () => {
  resetForm()
  dialogTitle.value = '新增目录'
  dialogVisible.value = true
}

// 处理编辑按钮点击
const handleEdit = (row: any) => {
  resetForm()
  dialogTitle.value = '编辑目录'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 处理删除按钮点击
const handleDelete = async (row: any) => {
  try {
    // 先检查该目录下是否有接口
    const res = await listInterface({ categoryId: row.id })
    if (res && res.length > 0) {
      ElMessage.warning('该目录下存在接口，请先删除接口')
      return
    }

    // 确认删除
    await ElMessageBox.confirm('确认删除该目录吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })

    await deleteCategory(row.id)
    ElMessage.success('删除成功')
    getList()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败', error)
      ElMessage.error('删除失败')
    }
  }
}



// 处理刷新全部按钮点击
const handleRefreshAll = async () => {
  try {
    await ElMessageBox.confirm('确认刷新所有目录吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })

    loading.value = true
    await refreshAllCategory()
    ElMessage.success('刷新成功')
    getList()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('刷新失败', error)
      ElMessage.error('刷新失败')
    }
  } finally {
    loading.value = false
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    loading.value = true
    await saveCategory(form)

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
  form.simpleName = ''
  form.className = ''
  form.requestUrl = ''
  form.description = ''
  form.orderNum = 0
  form.disabled = 0
  form.hide = 0
}

// 处理分页大小变化
const handleSizeChange = (val: number) => {
  queryParams.pageSize = val
  getList()
}

// 处理页码变化
const handleCurrentChange = (val: number) => {
  queryParams.pageNum = val
  getList()
}

// 暴露方法给父组件调用
defineExpose({
  getList
})

// 页面加载时获取数据
onMounted(() => {
  getList()
})
</script>

<style scoped>
.category-container {
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

.pagination-container {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}
</style>
