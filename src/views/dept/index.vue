<template>
  <div class="dept-container">
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" class="search-form">

      <el-row :gutter="24">
        <el-col :span="24">
          <div class="search-item" style="float: left">
          <el-form-item prop="deptName" label="部门名称">
            <el-input
                v-model="queryParams.deptName"
                placeholder="请输入部门名称"
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

              <el-button type="success" @click="handleAdd(null)">
            <el-icon>
              <Plus/>
            </el-icon>
            新增部门
          </el-button>
              <el-button type="primary" @click="handleExpandAll">
            <el-icon>
              <Operation/>
            </el-icon>
            {{ isExpandAll ? '折叠' : '展开' }}
          </el-button>
        </el-form-item>
          </div>
        </el-col>

      </el-row>
    </el-form>

    <el-table
        ref="deptTable"
        :data="deptList"
        row-key="deptId"
        :default-expand-all="isExpandAll"
        :tree-props="{
        children: 'children',
        hasChildren: 'hasChildren'
      }"
        :expand-row-keys="expandedKeys"
        v-loading="loading"
        style="width: 100%; margin-top: 15px;"
    >
      <el-table-column prop="deptName" label="部门名称" min-width="200">
        <template #default="{ row }">
          <span>{{ row.deptName }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="orderNum" label="排序" width="100" align="center"/>
      <el-table-column prop="contacts" label="联系人" width="120" align="center"/>
      <el-table-column prop="email" label="邮箱" min-width="200"/>
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === '0' ? 'success' : 'danger'">
            {{ row.status === '0' ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="fcd" width="180"/>
      <el-table-column label="操作" width="220" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="success" @click="handleAdd(row)">新增</el-button>
          <el-button link type="primary" @click="handleEdit(row)">修改</el-button>
          <el-button link type="danger" @click="handleDelete(row)" class="delete-btn">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 部门表单对话框 -->
    <el-dialog
        :title="dialogTitle"
        v-model="dialogVisible"
        width="600px"
        append-to-body
    >
      <el-form ref="deptRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="上级部门" prop="parentId">
          <el-tree-select
              v-model="form.parentId"
              :data="deptOptions"
              :props="{ label: 'deptName', value: 'deptId' }"
              placeholder="选择上级部门"
              check-strictly
              clearable
          />
        </el-form-item>
        <el-form-item label="部门名称" prop="deptName">
          <el-input v-model="form.deptName" placeholder="请输入部门名称"/>
        </el-form-item>
        <el-form-item label="部门简介" prop="overview">
          <el-input
              v-model="form.overview"
              type="textarea"
              :maxlength="200"
              :rows="4"
              placeholder="请输入部门简介"
              show-word-limit
          />
        </el-form-item>
        <el-form-item label="显示顺序" prop="orderNum">
          <el-input-number v-model="form.orderNum" :min="0"/>
        </el-form-item>
        <el-form-item label="负责人" prop="leader">
          <el-input v-model="form.leader" placeholder="请输入负责人"/>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" maxlength="11"/>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50"/>
        </el-form-item>
        <el-form-item label="部门状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="0">正常</el-radio>
            <el-radio label="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import {ref, onMounted, reactive, watch} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import type {FormInstance, FormRules} from 'element-plus'
import {getDeptList, createDept, updateDept, deleteDept} from '@/api/system/dept'
import type {DeptInfo, DeptQuery} from '@/api/system/dept'
import {Search, Refresh, Plus, Operation} from '@element-plus/icons-vue'

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const deptList = ref<DeptInfo[]>([])
const deptOptions = ref<DeptInfo[]>([])
const expandedKeys = ref<number[]>([])
const isExpandAll = ref(true)
const deptRef = ref<FormInstance>()
const queryForm = ref<FormInstance>()
const deptTable = ref()

const form = reactive<DeptInfo>({
  deptId: undefined,
  parentId: undefined,
  deptName: '',
  orderNum: 0,
  leader: '',
  phone: '',
  email: '',
  status: '0',
  overview: ''
})

const rules = reactive<FormRules>({
  parentId: [
    {required: true, message: '上级部门不能为空', trigger: 'change'}
  ],
  deptName: [
    {required: true, message: '部门名称不能为空', trigger: 'blur'}
  ],
  orderNum: [
    {required: true, message: '显示顺序不能为空', trigger: 'blur'}
  ],
  email: [
    {type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change']}
  ],
  phone: [
    {pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: ['blur', 'change']}
  ],
  overview: [
    {max: 200, message: '简介长度不能超过200个字符', trigger: 'blur'}
  ]
})

// 查询参数
const queryParams = reactive<DeptQuery>({
  deptName: ''
})

// 查询部门列表
const handleQuery = async () => {
  try {
    loading.value = true
    const res = await getDeptList(queryParams)
    deptList.value = res || []
  } catch (error) {
    console.error('获取部门列表失败:', error)
    ElMessage.error('获取部门列表失败')
    deptList.value = []
  } finally {
    loading.value = false
  }
}

// 重置查询
const resetQuery = () => {
  queryForm.value?.resetFields()
  queryParams.deptName = ''
  getList()
}

// 展开/折叠
const handleExpandAll = () => {
  isExpandAll.value = !isExpandAll.value


  if (isExpandAll.value) {
    // 获取所有部门的ID
    const getAllDeptIds = (depts: DeptInfo[]): number[] => {
      let ids: number[] = []
      depts.forEach(dept => {
        if (dept.deptId) {
          ids.push(dept.deptId)
          if (dept.children && dept.children.length > 0) {
            ids = ids.concat(getAllDeptIds(dept.children))
          }
        }
      })
      return ids
    }
    expandedKeys.value = getAllDeptIds(deptList.value)
  } else {
    expandedKeys.value = []
  }
  console.log("######## 当前expandedKeys:", expandedKeys.value)
}

// 监听展开键的变化
watch(expandedKeys, () => {

}, {deep: true})

// 获取部门列表
const getList = async () => {
  try {
    loading.value = true
    const res = await getDeptList(queryParams)
    deptList.value = res || []

    // 默认展开所有节点
    if (deptList.value.length > 0) {
      // 直接设置展开状态和展开键
      isExpandAll.value = true
      const ids = deptList.value.map(dept => dept.deptId).filter(id => id !== undefined) as number[]

      expandedKeys.value = ids
    }

    // 设置部门选择数据
    deptOptions.value = [{
      deptId: 0,
      deptName: '上层部门',
      parentId: -1,
      orderNum: 0,
      status: '0',
      children: res || []
    }]
  } catch (error) {
    console.error('获取部门列表失败:', error)
    ElMessage.error('获取部门列表失败')
    deptList.value = []
    deptOptions.value = [{
      deptId: 0,
      deptName: '上层部门',
      parentId: -1,
      orderNum: 0,
      status: '0',
      children: []
    }]
  } finally {
    loading.value = false
  }
}

// 新增部门
const handleAdd = (row: any) => {
  reset()
  if (row) {
    form.parentId = row.deptId
  }
  dialogTitle.value = '新增部门'
  dialogVisible.value = true
}

// 修改部门
const handleEdit = (row: any) => {
  reset()
  Object.assign(form, row)
  dialogTitle.value = '修改部门'
  dialogVisible.value = true
}

// 删除部门
const handleDelete = async (row: any) => {
  const hasChildren = row.children && row.children.length > 0
  if (hasChildren) {
    ElMessage.warning('存在下级部门,不允许删除')
    return
  }

  try {
    await ElMessageBox.confirm('确认要删除该部门吗？', '提示', {
      type: 'warning'
    })
    await deleteDept(row.deptId)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    console.error('删除部门失败:', error)
  }
}

// 表单提交
const submitForm = async () => {
  if (!deptRef.value) return

  try {
    await deptRef.value.validate()
    if (form.deptId) {
      await updateDept(form)
      ElMessage.success('修改成功')
    } else {
      await createDept(form)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    getList()
  } catch (error) {
    console.error('提交表单失败:', error)
  }
}

// 重置表单
const reset = () => {
  form.deptId = undefined
  form.parentId = undefined
  form.deptName = ''
  form.orderNum = 0
  form.leader = ''
  form.phone = ''
  form.email = ''
  form.status = '0'
  form.overview = ''
  deptRef.value?.resetFields()
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.dept-container {
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

  .el-table {
    margin-top: 0;
}

.delete-btn {
  color: #F56C6C;
}

.dialog-footer {
  text-align: right;
  }
}
</style>
