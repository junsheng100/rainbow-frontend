<template>
  <div class="role-container">
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" class="search-form">
      <el-row :gutter="24">
        <el-col :span="24">
          <div class="search-item" style="float: left">
            <el-form-item prop="roleName" label="角色名称">
              <el-input
                v-model="queryParams.roleName"
                placeholder="请输入角色名称"
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
                新增角色
              </el-button>
            </el-form-item>
          </div>
        </el-col>
      </el-row>
    </el-form>

    <!-- 表格区域 -->
    <el-table
      v-loading="loading"
      :data="roleList"
      class="role-table"
      stripe
      :highlight-current-row="true"
      @selection-change="handleSelectionChange"
      style="width: 100%; margin-top: 15px;"
    >
      <el-table-column type="selection" width="55" align="center"  v-if="false"/>
      <el-table-column label="角色编号" prop="roleId" width="100" align="center" v-if="false"/>
      <el-table-column  label="序号" type="index"  width="60">
        <template #default="{ $index }">
          {{ (pagination.current - 1) * pagination.size + $index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="角色名称" prop="roleName" min-width="150" />
      <el-table-column label="权限字符" prop="roleKey" min-width="150" />
      <el-table-column label="数据范围" prop="dataScope" width="180" align="center">
        <template #default="{ row }">
          {{ dataScopeOptions.find(item => item.value === row.dataScope)?.label }}
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === '0' ? 'success' : 'danger'">
            {{ row.status === '0' ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
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

    <!-- 添加或修改角色对话框 -->
    <el-dialog
      :title="title"
      v-model="open"
      width="720px"
      append-to-body
    >
      <el-row :gutter="24">
        <el-col :span="10">
          <el-form ref="roleRef" :model="form" :rules="rules" label-width="100px">
            <el-form-item label="角色名称" prop="roleName">
              <el-input v-model="form.roleName" placeholder="请输入角色名称" />
            </el-form-item>
            <el-form-item label="权限字符" prop="roleKey">
              <el-input v-model="form.roleKey" placeholder="请输入权限字符" />
            </el-form-item>
            <el-form-item label="显示顺序" prop="roleSort">
              <el-input-number v-model="form.roleSort" :min="0" />
            </el-form-item>
            <el-form-item label="数据范围" prop="dataScope">
              <el-select v-model="form.dataScope" placeholder="请选择数据范围">
                <el-option
                    v-for="dict in dataScopeOptions"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="角色状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio label="0">正常</el-radio>
                <el-radio label="1">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col ref="RoleMenuTree" :span="14">
          <el-card class="menu-tree-card">
            <template #header>
              <div class="card-header">
                <span>菜单权限</span>
              </div>
            </template>
            <el-tree
              ref="menuTreeRef"
              :data="menuOptions"
              :props="{
                label: 'label',
                children: 'children'
              }"
              show-checkbox
              node-key="id"
              :check-strictly="false"
              :default-expanded-keys="expandedKeys"
              empty-text="加载中，请稍候"
              :default-checked-keys="menuIds"
            />
          </el-card>
        </el-col>
      </el-row>

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
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { getRoleList, getRole, createRole, updateRole, deleteRole, getRoleMenuTree } from '@/api/system/role'
import type { RoleInfo, RoleQuery } from '@/api/system/role'
import { useWindowMode } from '@/composables/useWindowMode'

// 数据范围选项
const dataScopeOptions = [
  { label: '全部数据权限', value: '1' },
  { label: '自定义数据权限', value: '2' },
  { label: '本部门数据权限', value: '3' },
  { label: '本部门及以下数据权限', value: '4' },
  { label: '仅本人数据权限', value: '5' }
]

// 加载状态
const loading = ref(false)
// 选中的ID列表
const selectedIds = ref<Array<string | number>>([])
// 总条数
const total = ref(0)
// 角色列表
const roleList = ref<RoleInfo[]>([])
// 弹出层标题
const title = ref('')
// 是否显示弹出层
const open = ref(false)
// 表单参照
const roleRef = ref<FormInstance>()
// 查询参照
const queryForm = ref<FormInstance>()

// 查询参数
const queryParams = reactive<RoleQuery>({
  pageNum: 1,
  pageSize: 10,
  roleName: '',
  roleKey: '',
  status: ''
})

// 表单参数
const form = reactive<RoleInfo>({
  roleId: undefined,
  roleName: '',
  roleKey: '',
  roleSort: 0,
  dataScope: '1',
  status: '0'
})

// 表单校验规则
const rules = reactive<FormRules>({
  roleName: [
    { required: true, message: '角色名称不能为空', trigger: 'blur' }
  ],
  roleKey: [
    { required: true, message: '权限字符不能为空', trigger: 'blur' }
  ],
  roleSort: [
    { required: true, message: '显示顺序不能为空', trigger: 'blur' }
  ]
})

// 菜单树相关
const menuTreeRef = ref()
const menuOptions = ref<any[]>([])
const menuIds = ref<number[]>([])
const expandedKeys = ref<number[]>([])
// 分页数据
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

/** 查询角色列表 */
const getList = async () => {
  try {
    loading.value = true
    const res = await getRoleList(queryParams)
    roleList.value = res.content
    total.value = res.total
  } catch (error) {
    console.error('获取角色列表失败:', error)
  } finally {
    loading.value = false
  }
}

/** 表单重置 */
const reset = () => {
  form.roleId = undefined
  form.roleName = ''
  form.roleKey = ''
  form.roleSort = 0
  form.dataScope = '1'
  form.status = '0'
  roleRef.value?.resetFields()
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
const handleSelectionChange = (selection: RoleInfo[]) => {
  selectedIds.value = selection.map(item => item.roleId!)
}

/** 新增按钮操作 */
const handleAdd = async () => {
  try {
    reset()
    title.value = '添加角色'
    // 先打开对话框，显示加载状态
    open.value = true
    // 加载空的菜单树
    await loadMenuTree()
  } catch (error) {
    console.error('加载菜单树失败:', error)
    ElMessage.error('加载菜单树失败')
    open.value = false
  }
}

/** 修改按钮操作 */
const handleUpdate = async (row: RoleInfo) => {
  try {
    reset()
    title.value = '修改角色'
    // 先打开对话框，显示加载状态
    open.value = true
    // 加载角色基本信息
    const res = await getRole(row.roleId!)
    Object.assign(form, res)
    // 加载菜单树
    await loadMenuTree(row.roleId)
    console.log("加载菜单树完成:", row.roleId)
  } catch (error) {
    console.error('获取角色详情失败:', error)
    ElMessage.error('获取角色详情失败')
    open.value = false
  }
}

/** 提交按钮 */
const submitForm = async () => {
  if (!roleRef.value) return
  try {
    await roleRef.value.validate()
    // 获取选中的菜单ID
    const checkedKeys = menuTreeRef.value?.getCheckedKeys() || []
    const halfCheckedKeys = menuTreeRef.value?.getHalfCheckedKeys() || []
    const menuIdList = [...checkedKeys, ...halfCheckedKeys]

    // 构建提交数据
    const submitData = {
      ...form,
      rightIdList: menuIdList
    }

    if (form.roleId) {
      await updateRole(submitData)
      ElMessage.success('修改成功')
    } else {
      await createRole(submitData)
      ElMessage.success('新增成功')
    }
    open.value = false
    getList()
  } catch (error) {
    console.error('提交表单失败:', error)
  }
}

/** 取消按钮 */
const cancel = () => {
  open.value = false
  reset()
}

/** 删除按钮操作 */
const handleDelete = async (row: RoleInfo) => {

  if (!row) {
    ElMessage.warning('请选择要删除的数据')
    return
  }

  try {
    await ElMessageBox.confirm(
      `是否确认删除数据？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await deleteRole(row)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    console.error('删除失败:', error)
  }
}

/** 角色状态修改 */
// const handleStatusChange = async (row: RoleInfo) => {
//   try {
//     await updateRole(row)
//     ElMessage.success('修改成功')
//   } catch (error) {
//     console.error('修改状态失败:', error)
//     // 状态修改失败，回退状态
//     row.status = row.status === '0' ? '1' : '0'
//   }
// }

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

// 加载菜单树数据
const loadMenuTree = async (roleId?: number) => {
  try {
    const res = await getRoleMenuTree(roleId || 0)
    console.log("菜单树数据:", JSON.stringify(res))
    // 直接使用返回的数据数组
    menuOptions.value = Array.isArray(res) ? res : []
    // 设置第一层节点为展开状态
    expandedKeys.value = menuOptions.value.map(node => node.id)

    if (roleId && menuOptions.value.length > 0) {
      // 如果是编辑角色，收集已选中的菜单ID
      const collectCheckedIds = (nodes: any[]): number[] => {
        let ids: number[] = []
        nodes.forEach(node => {
          if (node.checked) {
            ids.push(node.id)
          }
          if (node.children && node.children.length > 0) {
            ids = ids.concat(collectCheckedIds(node.children))
          }
        })
        return ids
      }
      menuIds.value = collectCheckedIds(menuOptions.value)
    } else {
      // 如果是新增角色，清空选中的菜单ID
      menuIds.value = []
    }
  } catch (error) {
    console.error('获取菜单树失败:', error)
    ElMessage.error('获取菜单树失败')
    menuOptions.value = []
    menuIds.value = []
    expandedKeys.value = []
  }
}

// 初始化数据
useWindowMode(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.role-container {
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

  .role-table {
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

  .menu-tree-card {
    height: 100%;

    :deep(.el-card__header) {
      padding: 12px 20px;
      border-bottom: 1px solid var(--el-border-color-light);
    }

    :deep(.el-card__body) {
      padding: 10px;
      height: calc(100% - 51px);
      overflow: auto;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    :deep(.el-tree) {
      background: none;

      .el-tree-node__content {
        height: 32px;
      }
    }
  }
}
</style>
