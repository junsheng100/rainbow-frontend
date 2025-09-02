<!--# 字典类型管理页面-->
<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="hover">
      <div class="search-form">
        <el-row :gutter="20">
          <el-col :span="4">
            <div class="search-item">
              <el-form-item prop="dictName" label="字典名称" >
              <el-input
                v-model="queryParams.dictName"
                placeholder="请输入字典名称"
                clearable
                @keyup.enter="handleQuery"
              />
              </el-form-item>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="search-item">
              <el-input
                v-model="queryParams.dictType"
                placeholder="请输入字典类型"
                clearable
                @keyup.enter="handleQuery"
              />
            </div>
          </el-col>
          <el-col :span="6" :offset="10">
            <el-button type="primary" @click="handleQuery">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="resetQuery">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
            <el-button type="success" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              新增
            </el-button>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 表格区域 -->
    <el-card class="table-card" shadow="hover">
      <el-row :gutter="10" class="mb-2">
        <el-col :span="1.5">
          <el-button type="danger" icon="Delete" :disabled="!selectedIds.length" @click="handleBatchDelete">
            删除
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="warning" icon="Refresh" @click="handleRefreshCache">刷新缓存</el-button>
        </el-col>
      </el-row>

      <el-table
        v-loading="loading"
        :data="typeList"
        @selection-change="handleSelectionChange"
        :highlight-current-row="true"
        stripe
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="序号" align="center" prop="orderNum" width="100" />
        <el-table-column label="字典编号" align="center" prop="dictId" width="100" v-if="false"/>
        <el-table-column label="字典名称" align="center" prop="dictName" width="180" />
        <el-table-column label="字典类型" align="center" prop="dictType" min-width="180" />

        <el-table-column label="状态" align="center" prop="disabled" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.disabled === '0' ? 'success' : 'info'">
              {{ scope.row.disabled === '0' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="250" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button type="primary" link @click="handleUpdate(scope.row)">
                <el-icon><Edit /></el-icon>
                修改
              </el-button>
              <el-button type="primary" link @click="handleData(scope.row)">
                <el-icon><List /></el-icon>
                数据
              </el-button>
              <el-button type="danger" link @click="handleDelete(scope.row)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加或修改字典类型对话框 -->
    <el-dialog
      :title="title"
      v-model="open"
      width="500px"
      append-to-body
      @close="cancel"
    >
      <el-form ref="dictTypeRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="字典名称" prop="dictName">
          <el-input v-model="form.dictName" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item label="字典类型" prop="dictType">
          <el-input v-model="form.dictType" placeholder="请输入字典类型" />
        </el-form-item>
        <el-form-item label="显示顺序" prop="orderNum">
          <el-input-number v-model="form.orderNum" :min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="disabled">
          <el-switch
            v-model="form.disabled"
            :active-value="0"
            :inactive-value="1"
          ></el-switch>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
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

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Edit,
  Delete,
  List
} from '@element-plus/icons-vue'
import {listType, getType, addType, updateType, delType, refreshCache, type SysDictTypeParams,type SysDictType } from '@/api/dict/type'

const router = useRouter()

// 遮罩层
const loading = ref(false)
// 选中数组
const selectedIds = ref<number[]>([])
// 总条数
const total = ref(0)
// 字典表格数据
const typeList = ref([])
// 弹出层标题
const title = ref('')
// 是否显示弹出层
const open = ref(false)

// 查询参数
const queryParams = reactive<SysDictTypeParams>({
  pageNum: 1,
  pageSize: 10,
  dictName: '',
  dictType: ''
})

// 表单参数
const form = reactive<SysDictType>({
  dictId: undefined,
  dictName: '',
  dictType: '',
  orderNum: 1,
  disabled: '0',
  remark: ''
})

// 表单校验规则
const rules = reactive<FormRules>({
  dictName: [
    { required: true, message: '字典名称不能为空', trigger: 'blur' }
  ],
  dictType: [
    { required: true, message: '字典类型不能为空', trigger: 'blur' },
    { pattern: /^[a-z][a-z0-9_]*$/, message: '字典类型必须以小写字母开头，且只能为（小写字母，数字，下划线）', trigger: 'blur' }
  ],
  orderNum: [
    { required: true, message: '显示顺序不能为空', trigger: 'blur' }
  ]
})

const queryForm = ref<FormInstance>()
const dictTypeRef = ref<FormInstance>()

/** 查询字典类型列表 */
function getList() {
  loading.value = true
  listType(queryParams).then(response => {
    typeList.value = response.content
    total.value = response.total
    loading.value = false
  })
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 表单重置 */
function reset() {
  form.dictId = undefined
  form.dictName = ''
  form.dictType = ''
  form.orderNum = 0
  form.disabled = '0'
  form.remark = ''
  dictTypeRef.value?.resetFields()
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  queryForm.value?.resetFields()
  handleQuery()
}

/** 多选框选中数据 */
function handleSelectionChange(selection: any[]) {
  selectedIds.value = selection.map(item => item.dictId)
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加字典类型'
}
/** 修改按钮操作 */
function handleUpdate(row: any) {
  reset()
  const dictId = row.dictId
  getType(dictId).then(response => {

    Object.assign(form, response)
    open.value = true
    title.value = '修改字典类型'
  }).catch(error => {
    console.error('获取字典类型详情失败:', error)
    ElMessage.error('获取字典类型详情失败')
  })
}

/** 提交按钮 */
function submitForm() {
  dictTypeRef.value?.validate(valid => {
    if (valid) {
      if (form.dictId) {
        updateType(form).then(() => {
          ElMessage.success('修改成功')
          open.value = false
          getList()
        })
      } else {
        addType(form).then(() => {
          ElMessage.success('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row: any) {
  const dictIds = [row.dictId]
  ElMessageBox.confirm('是否确认删除字典编号为"' + dictIds + '"的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    delType(dictIds).then(() => {
      getList()
      ElMessage.success('删除成功')
    })
  })
}

/** 批量删除按钮操作 */
function handleBatchDelete() {
  const dictIds = selectedIds.value
  if (!dictIds.length) {
    ElMessage.warning('请选择要删除的数据')
    return
  }
  ElMessageBox.confirm('是否确认删除选中的' + dictIds.length + '条数据?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    delType(dictIds).then(() => {
      getList()
      ElMessage.success('删除成功')
    })
  })
}

/** 刷新缓存按钮操作 */
function handleRefreshCache() {
  refreshCache().then(() => {
    ElMessage.success('刷新成功')
  })
}

/** 查看字典数据按钮操作 */
function handleData(row: any) {
  const { dictType, dictName } = row
  router.push({
    name: 'DictData',
    params: { type: dictType },
    query: { dictName }
  })
}



/** 分页大小改变 */
function handleSizeChange(val: number) {
  queryParams.pageSize = val;
  getList();
}

/** 页码改变 */
function handleCurrentChange(val: number) {
  queryParams.pageNum = val;
  getList();
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;

  .search-form {
    .search-item {
      display: flex;
      align-items: center;
      margin-bottom: 18px;

      .search-label {
        width: 80px;
        color: #606266;
      }

      .el-input,
      .el-select,
      .el-date-picker {
        flex: 1;
      }
    }
  }
}

.table-card {
  .action-buttons {
    display: flex;
    gap: 8px;
  }
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.mb-2 {
  margin-bottom: 20px;
}
</style>
