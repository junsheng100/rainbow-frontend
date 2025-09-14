<!--# 字典数据管理页面-->
<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" class="search-form">
      <el-form-item label="字典标签" prop="dictLabel">
        <el-input
          v-model="queryParams.dictLabel"
          placeholder="请输入字典标签"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="字典键值" prop="dictValue">
        <el-input
          v-model="queryParams.dictValue"
          placeholder="请输入字典键值"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb-2">
      <el-col :span="1.5">
        <el-button type="primary" icon="Plus" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" icon="Delete" :disabled="!selectedIds.length" @click="handleBatchDelete">
          删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="Back" @click="handleBack">返回</el-button>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="dataList"
      @selection-change="handleSelectionChange"
    >

      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="字典类型" align="center" prop="dictType" />
      <el-table-column label="序号" align="center" prop="dictSort" />
      <el-table-column label="字典编码" align="center" prop="dictCode" v-if="false"/>
      <el-table-column label="字典标签" align="center" prop="dictLabel" />
      <el-table-column label="数据名称" align="center" prop="dictName" />
      <el-table-column label="字典键值" align="center" prop="dictValue" />

      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="是否默认" align="center" prop="isDefault">
        <template #default="scope">
          <el-tag :type="scope.row.isDefault === 'Y' ? 'success' : 'info'">
            {{ scope.row.isDefault === 'Y' ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="180">
        <template #default="scope">
          <el-button type="primary" link icon="Edit" @click="handleUpdate(scope.row)">
            修改
          </el-button>
          <el-button type="danger" link icon="Delete" @click="handleDelete(scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <pagination
      v-if="total > 0"
      :total="total"
      v-model:current-page="queryParams.pageNum"
      v-model:page-size="queryParams.pageSize"
      :page-sizes="[10, 20, 50, 100]"
      :background="true"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 添加或修改字典数据对话框 -->
    <el-dialog
      :title="title"
      v-model="open"
      width="500px"
      append-to-body
    >
      <el-form ref="dictDataRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="字典类型">
          <el-input v-model="form.dictType" :disabled="true" />
        </el-form-item>
        <el-form-item label="数据标签" prop="dictLabel">
          <el-input v-model="form.dictLabel" placeholder="请输入数据标签" />
        </el-form-item>
        <el-form-item label="数据名称" prop="dictName">
          <el-input v-model="form.dictName" placeholder="请输入数据名称" />
        </el-form-item>
        <el-form-item label="数据键值" prop="dictValue">
          <el-input v-model="form.dictValue" placeholder="请输入数据键值" />
        </el-form-item>
        <el-form-item label="显示排序" prop="dictSort">
          <el-input-number v-model="form.dictSort" :min="1" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="0">启用</el-radio>
            <el-radio label="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否默认" prop="isDefault">
          <el-radio-group v-model="form.isDefault">
            <el-radio label="Y">是</el-radio>
            <el-radio label="N">否</el-radio>
          </el-radio-group>
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
import { useDict } from '@/hooks/dict'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { listData, getData, addData, updateData, delData ,type SysDictDataParams,type SysDictData } from '@/api/dict/data'

const route = useRoute()
const router = useRouter()
const { sys_normal_disable } = useDict('sys_normal_disable')

// 遮罩层
const loading = ref(false)
// 选中数组
const selectedIds = ref<number[]>([])
// 总条数
const total = ref(0)
// 字典数据表格数据
const dataList = ref([])
// 弹出层标题
const title = ref('')
// 是否显示弹出层
const open = ref(false)
// 当前选中的字典类型
const dictType = ref(route.params.type as string)

// 查询参数
const queryParams = reactive<SysDictDataParams>({
  pageNum: 1,
  pageSize: 10,
  dictType: dictType.value,
  dictLabel: '',
  dictValue: ''
})

// 表单参数
const form = reactive<SysDictData>({
  dictCode: undefined,
  dictType: dictType.value,
  dictLabel: '',
  dictName: '',
  dictValue: '',
  dictSort: 0,
  isDefault: 'N',
  status: '0'
})

// 表单校验规则
const rules = reactive<FormRules>({
  dictLabel: [
    { required: true, message: '数据标签不能为空', trigger: 'blur' }
  ],
  dictName: [
    { required: true, message: '数据名称不能为空', trigger: 'blur' }
  ],
  dictValue: [
    { required: true, message: '数据键值不能为空', trigger: 'blur' }
  ],
  dictSort: [
    { required: true, message: '数据顺序不能为空', trigger: 'blur' }
  ],
  isDefault: [
    { required: true, message: '请选择是否默认', trigger: 'change' }
  ]
})

const queryForm = ref<FormInstance>()
const dictDataRef = ref<FormInstance>()

/** 查询字典数据列表 */
function getList() {
  loading.value = true
  listData(queryParams).then(response => {
    dataList.value = response.content
    total.value = response.total
  }).catch(error => {
    ElMessage.error('获取字典数据列表失败：' + error.message)
  }).finally(() => {
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
  form.dictCode = undefined
  form.dictLabel = ''
  form.dictName = ''
  form.dictValue = ''
  form.dictSort = 0
  form.isDefault = 'N'
  dictDataRef.value?.resetFields()
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

/** 返回按钮操作 */
function handleBack() {
  router.push('/dict')
}

/** 多选框选中数据 */
function handleSelectionChange(selection: any[]) {
  selectedIds.value = selection.map(item => item.dictCode)
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加字典数据'
}

/** 修改按钮操作 */
function handleUpdate(row: any) {
  reset()
  const dictCode = row.dictCode
  loading.value = true
  getData(dictCode).then(response => {
    Object.assign(form, response.data)
    open.value = true
    title.value = '修改字典数据'
  }).catch(error => {
    ElMessage.error('获取字典数据详情失败：' + error.message)
  }).finally(() => {
    loading.value = false
  })
}

/** 提交按钮 */
function submitForm() {
  dictDataRef.value?.validate(valid => {
    if (valid) {
      loading.value = true
      const request = form.dictCode ? updateData(form) : addData(form)

      request.then(() => {
        ElMessage.success(form.dictCode ? '修改成功' : '新增成功')
        open.value = false
        getList()
      }).catch(error => {
        ElMessage.error((form.dictCode ? '修改' : '新增') + '失败：' + error.message)
      }).finally(() => {
        loading.value = false
        reset() // 提交后清理表单内容
      })
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row: any) {
  const dictCodes = [row.dictCode]
  ElMessageBox.confirm('是否确认删除字典编码为"' + dictCodes + '"的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    loading.value = true
    delData(dictCodes).then(() => {
      getList()
      ElMessage.success('删除成功')
    }).catch(error => {
      ElMessage.error('删除失败：' + error.message)
    }).finally(() => {
      loading.value = false
    })
  })
}

/** 批量删除按钮操作 */
function handleBatchDelete() {
  const dictCodes = selectedIds.value
  if (!dictCodes.length) {
    ElMessage.warning('请选择要删除的数据')
    return
  }
  ElMessageBox.confirm('是否确认删除选中的' + dictCodes.length + '条数据?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    loading.value = true
    delData(dictCodes).then(() => {
      getList()
      ElMessage.success('删除成功')
    }).catch(error => {
      ElMessage.error('批量删除失败：' + error.message)
    }).finally(() => {
      loading.value = false
    })
  })
}

/** 处理分页大小变化 */
function handleSizeChange(pageSize: number) {
  queryParams.pageSize = pageSize
  getList()
}

/** 处理分页当前页变化 */
function handleCurrentChange(pageNum: number) {
  queryParams.pageNum = pageNum
  getList()
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.search-form {
  margin-bottom: 20px;
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.mb-2 {
  margin-bottom: 20px;
}
</style>
