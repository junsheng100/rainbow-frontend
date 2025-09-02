<template>
  <div class="app-container">


    <!-- 搜索区域 -->
    <el-form :model="searchForm" ref="searchFormRef" :inline="true" class="search-form">
      <el-row :gutter="24">
        <el-col :span="24">
          <div class="search-item" style="float: left">
            <el-form-item prop="keyword" label="用户名">
              <el-input
                  v-model="searchForm.keyword"
                  placeholder="请输入用户名"
                  clearable
                  @keyup.enter="getUserListData"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="getUserListData">
                <el-icon>
                  <Search/>
                </el-icon>
                搜索
              </el-button>
              <el-button @click="handleReset">
                <el-icon>
                  <Refresh/>
                </el-icon>
                重置
              </el-button>
            </el-form-item>
          </div>
          <div class="search-item" style="float: right">
            <el-form-item>
              <el-button type="success" @click="handleAdd" v-hasPermi="['system:user:add']">
                <el-icon>
                  <Plus/>
                </el-icon>
                新增
              </el-button>
            </el-form-item>
          </div>
        </el-col>
      </el-row>
    </el-form>

    <!-- 表格区域 -->
    <el-card class="table-card" shadow="hover">
      <el-table
          v-loading="loading"
          :data="tableData"
          @selection-change="handleSelectionChange"
          :highlight-current-row="true"
          stripe
      >
        <el-table-column prop="userId" label="ID" width="80" v-if="false"/>
        <el-table-column label="序号" width="80">
          <template #default="{ $index }">
            {{ (pagination.current - 1) * pagination.size + $index + 1 }}
          </template>
        </el-table-column>

        <el-table-column prop="userName" label="用户名" width="120"/>
        <el-table-column prop="nickname" label="昵称" width="120"/>
        <el-table-column prop="deptName" label="部门" width="120"/>
        <el-table-column prop="postNameList" label="岗位"/>
        <el-table-column prop="roleNameList" label="角色"/>

        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === '0' ? 'success' : (row.status === '1' ? 'danger' : 'info')">
              {{ row.status === '0' ? '启用' : (row.status === '1' ? '禁用' : '已删除') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-buttons" v-if="row.userType != 'ADMIN'">
              <el-button link type="primary" @click="handleEdit(row)" v-hasPermi="['system:user:edit']">
                <el-icon>
                  <Edit/>
                </el-icon>
                编辑
              </el-button>

              <el-button link type="warning" @click="handleResetPassword(row)" v-hasPermi="['system:user:resetPwd']">
                <el-icon>
                  <Key/>
                </el-icon>
                重置密码
              </el-button>

              <el-button link type="danger" @click="handleDelete(row)" v-hasPermi="['system:user:remove']">
                <el-icon>
                  <Delete/>
                </el-icon>
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
            v-model:current-page="pagination.current"
            v-model:page-size="pagination.size"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            :background="true"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 重置密码弹窗 -->
    <el-dialog
        v-model="resetPasswordDialogVisible"
        title="重置密码"
        width="500px"
        @close="handleResetPasswordDialogClose"
    >
      <el-form
          ref="resetPasswordFormRef"
          :model="resetPasswordForm"
          :rules="resetPasswordRules"
          label-width="100px"
      >
        <el-form-item label="用户名">
          <el-input v-model="resetPasswordForm.userName" disabled/>
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="resetPasswordForm.nickname" disabled/>
        </el-form-item>
        <el-form-item label="新密码" prop="password">
          <el-input
              v-model="resetPasswordForm.password"
              type="password"
              placeholder="请输入新密码"
              show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
              v-model="resetPasswordForm.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleResetPasswordDialogClose">取 消</el-button>
          <el-button type="primary" @click="submitResetPassword" :loading="resetPasswordLoading">
            确 定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加/编辑用户弹窗 -->
    <el-dialog
        v-model="dialogVisible"
        :title="isEdit ? '编辑用户' : '新增用户'"
        width="700px"
        @close="handleDialogClose"
    >
      <el-form
          ref="formRef"
          :model="userForm"
          :rules="formRules"
          label-width="100px"
          class="user-form"
      >
        <el-row :gutter="16">

          <el-col :span="10">

            <el-form-item label="用户名" prop="userName">
              <el-input v-model="userForm.userName" placeholder="请输入用户名"/>
            </el-form-item>
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="userForm.nickname" placeholder="请输入昵称"/>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="userForm.password" type="password" placeholder="请输入密码" show-password/>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="userForm.email" placeholder="请输入邮箱"/>
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="userForm.phone" placeholder="请输入手机号"/>
            </el-form-item>


          </el-col>
          <el-col :span="12">

            <el-form-item label="部门" prop="deptId">
              <el-tree-select
                  v-model="userForm.deptId"
                  :data="deptOptions"
                  :props="{ label: 'deptName', value: 'deptId', children: 'children' }"
                  placeholder="请选择部门"
                  check-strictly
                  clearable
              />
            </el-form-item>
            <el-form-item label="岗位" prop="postIdList">
              <el-select
                  v-model="userForm.postIdList"
                  placeholder="请选择岗位"
                  multiple
                  clearable
                  style="width: 100%"
              >
                <el-option
                    v-for="item in postOptions"
                    :key="item.postId"
                    :label="item.postName"
                    :value="item.postId"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="角色" prop="roleIdList">
              <el-select
                  v-model="userForm.roleIdList"
                  placeholder="请选择角色"
                  multiple
                  clearable
                  style="width: 100%"
              >
                <el-option
                    v-for="item in roleOptions"
                    :key="item.roleId"
                    :label="item.roleName"
                    :value="item.roleId"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="userForm.status">
                <el-radio label="0">启用</el-radio>
                <el-radio label="1">禁用</el-radio>
              </el-radio-group>
            </el-form-item>

          </el-col>

        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleDialogClose">取 消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            确 定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import type {FormInstance, FormRules} from 'element-plus'
import {Search, Refresh, Plus, Edit, Delete, Key} from '@element-plus/icons-vue'
import {getUserList, createUser, updateUser, deleteUser, restUserPassword} from '@/api/users/user'
import type {UserInfo as BaseUserInfo, UserQueryParams, ReetPasswdForm} from '@/api/users/user'
import {getDeptList, type DeptInfo} from '@/api/system/dept'
import {getPostList, type PostInfo, type PostQuery} from '@/api/system/post'
import {getRoleList, type RoleInfo, type RoleQuery} from '@/api/system/role'
import {handleError} from '@/utils/errorHandler'
import {useWindowMode} from '@/composables/useWindowMode'


// 扩展 UserInfo 类型，包含额外的字段



// 响应式数据
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const tableData = ref<BaseUserInfo[]>([])
const selectedRows = ref<BaseUserInfo[]>([])
const deptOptions = ref<DeptInfo[]>([]) // 部门树数据
const postOptions = ref<PostInfo[]>([]) // 岗位列表数据
const roleOptions = ref<RoleInfo[]>([]) // 角色列表数据

// 重置密码相关
const resetPasswordDialogVisible = ref(false)
const resetPasswordLoading = ref(false)
const resetPasswordFormRef = ref<FormInstance>()
const resetPasswordForm = reactive<ReetPasswdForm>({
  userId: '',
  userName: '',
  nickname: '',
  password: '',
  confirmPassword: ''
})

// 重置密码表单验证规则
const resetPasswordRules = reactive<FormRules>({
  password: [
    {required: true, message: '请输入新密码', trigger: 'blur'},
    {min: 6, message: '密码长度不能少于6个字符', trigger: 'blur'}
  ],
  confirmPassword: [
    {required: true, message: '请再次输入新密码', trigger: 'blur'},
    {
      validator: (_rule, value, callback) => {
        if (value !== resetPasswordForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

// 搜索表单
const searchForm = reactive<UserQueryParams>({
  page: 1,
  size: 10,
  keyword:'',
  status: '0'
})

// 分页信息
const pagination = reactive({
  current: 1,
  size: 20,
  total: 0
})

// 用户表单
const userForm = reactive<BaseUserInfo>({
  userId: undefined,
  userName: '',
  nickname: '',
  email: '',
  phone: '',
  password: '',
  deptId: undefined,
  postIdList: [],
  roleIdList: [],
  status: '0'
})

// 表单引用
const formRef = ref<FormInstance>()

// 表单校验规则
const formRules = reactive<FormRules>({
  userName: [
    {required: true, message: '请输入用户名', trigger: 'blur'},
    {min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur'}
  ],
  nickname: [
    {required: true, message: '请输入昵称', trigger: 'blur'},
    {min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur'}
  ],
  email: [
    {type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur'}
  ],
  phone: [
    {pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur'}
  ],
  deptId: [
    {required: true, message: '请选择部门', trigger: 'change'}
  ],
  status: [
    {required: true, message: '请选择状态', trigger: 'change'}
  ]
})

// 获取用户列表
const getUserListData = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      page: pagination.current,
      size: pagination.size
    } as UserQueryParams

    const response = await getUserList(params)
    tableData.value = response.content
    pagination.total = response.total
  } catch (error: any) {
    // 检查是否是接口不存在的情况
    if (error?.response?.status === 404) {
      // 接口不存在，使用空数据
      tableData.value = []
      pagination.total = 0
      return
    }

    // 使用统一的错误处理
    handleError(error, '获取用户列表')
  } finally {
    loading.value = false
  }
}


// 获取部门树数据
const loadDeptTree = async () => {
  try {
    const res = await getDeptList()
    deptOptions.value = res || []
  } catch (error) {
    console.error('获取部门树失败:', error)
    ElMessage.error('获取部门树失败')
    deptOptions.value = []
  }
}

// 获取岗位列表
const loadPostList = async () => {
  try {
    const params: PostQuery = {
      pageNum: 1,
      pageSize: 100,
      status: '0' // 只获取正常状态的岗位
    }
    const res = await getPostList(params)
    postOptions.value = res.content || []
  } catch (error) {
    console.error('获取岗位列表失败:', error)
    ElMessage.error('获取岗位列表失败')
    postOptions.value = []
  }
}

// 获取角色列表
const loadRoleList = async () => {
  try {
    const params: RoleQuery = {
      pageNum: 1,
      pageSize: 100,
      status: '0' // 只获取正常状态的角色
    }
    const res = await getRoleList(params)
    roleOptions.value = res.content || []
  } catch (error) {
    console.error('获取角色列表失败:', error)
    ElMessage.error('获取角色列表失败')
    roleOptions.value = []
  }
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    keyword: '',
    status: undefined
  })
  pagination.current = 1
  getUserListData()
}

// 新增用户
const handleAdd = () => {
  isEdit.value = false
  dialogVisible.value = true
  resetForm()
}

// 编辑用户
const handleEdit = (row: BaseUserInfo) => {
  if (!row.userId) {
    ElMessage.error('无效的用户ID')
    return
  }
  isEdit.value = true
  dialogVisible.value = true
  Object.assign(userForm, {...row})
}

// 删除用户
const handleDelete = async (row: BaseUserInfo) => {
  try {
    await ElMessageBox.confirm(
        `确定要删除用户"${row.userName}"吗？此操作不可恢复！`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )
    // 将用户状态设置为删除状态
    await deleteUser(row.userId!)
    ElMessage.success('删除成功')
    getUserListData()
  } catch (error) {
    console.error('删除用户失败:', error)
    ElMessage.error(error instanceof Error ? error.message : '删除失败')
  }
}

// 打开重置密码弹窗
const handleResetPassword = (row: BaseUserInfo) => {
  resetPasswordForm.userId = row.userId
  resetPasswordForm.userName = row.userName
  resetPasswordForm.nickname = row.nickname
  resetPasswordForm.password = ''
  resetPasswordForm.confirmPassword = ''
  resetPasswordDialogVisible.value = true
}

// 关闭重置密码弹窗
const handleResetPasswordDialogClose = () => {
  resetPasswordDialogVisible.value = false
  resetPasswordFormRef.value?.resetFields()
}

// 提交重置密码
const submitResetPassword = async () => {
  if (!resetPasswordFormRef.value) return

  try {
    await resetPasswordFormRef.value.validate()

    await ElMessageBox.confirm(
        '确认要重置该用户的密码吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
    )

    resetPasswordLoading.value = true
    await restUserPassword(resetPasswordForm)

    ElMessage.success('密码重置成功')
    resetPasswordDialogVisible.value = false
  } catch (error: any) {
    if (error === 'cancel') return
    console.error('重置密码失败:', error)
    ElMessage.error(error instanceof Error ? error.message : '重置密码失败')
  } finally {
    resetPasswordLoading.value = false
  }
}

// 切换用户状态

// 选择用户
const handleSelectionChange = (selection: BaseUserInfo[]) => {
  selectedRows.value = selection
}

// 分页大小改变
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.current = 1
  getUserListData()
}

// 当前页改变
const handleCurrentChange = (current: number) => {
  pagination.current = current
  getUserListData()
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitLoading.value = true

    // 确保 postIdList 和 roleIdList 是数组类型
    const submitData = {
      ...userForm,
      postIdList: Array.isArray(userForm.postIdList) ? userForm.postIdList : [],
      roleIdList: Array.isArray(userForm.roleIdList) ? userForm.roleIdList : []
    }

    if (isEdit.value && submitData.userId) {
      const userId = submitData.userId
      if (!userId) {
        throw new Error('用户ID无效')
      }
      await updateUser(submitData)
      ElMessage.success('更新成功')
    } else {
      // 新增用户时创建一个新的对象，不包含 userId 字段
      const {userId, ...createData} = submitData
      await createUser(createData)
      ElMessage.success('创建成功')
    }

    dialogVisible.value = false
    getUserListData()
  } catch (error) {
    console.error('提交表单失败:', error)
    ElMessage.error(error instanceof Error ? error.message : (isEdit.value ? '更新失败' : '创建失败'))
  } finally {
    submitLoading.value = false
  }
}

// 关闭弹窗
const handleDialogClose = () => {
  dialogVisible.value = false
  formRef.value?.resetFields()
}

// 重置表单
const resetForm = () => {
  Object.assign(userForm, {
    userId: undefined,
    userName: '',
    nickname: '',
    email: '',
    phone: '',
    deptId: undefined,
    postIdList: [],
    roleIdList: [],
    status: '0'
  })
}

// 初始化数据
useWindowMode(() => {
  getUserListData()
  loadDeptTree() // 加载部门树数据
  loadPostList() // 加载岗位列表
  loadRoleList() // 加载角色列表
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}



.search-form {
  padding: 20px;
  margin-bottom: 16px;
  background-color: #fff;
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

.user-form {
  :deep(.el-form-item) {
    margin-bottom: 18px;
  }

  .el-col {
    padding-right: 8px;
    padding-left: 8px;

    &:last-child {
      padding-right: 20px; // 增加最后一列的右侧边距
    }
  }
}

.avatar-upload-wrapper {
  width: 100%;
  display: flex;
  align-items: flex-start; // 改为顶部对齐

  .avatar-preview {
    position: relative;
    width: 80px; // 减小尺寸
    height: 80px;
    overflow: hidden;
    border: 1px solid var(--el-border-color);
    background-color: var(--el-fill-color-blank);

    .avatar-image {
      width: 100%;
      height: 100%;
      object-fit: contain; // 使用contain确保图片完整显示
      padding: 2px; // 添加内边距，避免图片贴边
    }

    .remove-avatar {
      position: absolute;
      top: 2px;
      right: 2px;
      opacity: 0;
      transition: opacity 0.3s;
      z-index: 1;
      background-color: rgba(255, 255, 255, 0.9);
      transform: scale(0.8); // 稍微缩小按钮
    }

    &:hover {
      .remove-avatar {
        opacity: 1;
      }
    }

    .image-error {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--el-fill-color-light);
      color: var(--el-text-color-secondary);

      .el-icon {
        font-size: 20px; // 稍微减小图标尺寸
      }
    }
  }

  .avatar-uploader {
    width: 80px;
    height: 80px;
  }

  .avatar-uploader-placeholder {
    width: 80px;
    height: 80px;
    border: 1px dashed var(--el-border-color);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    background-color: var(--el-fill-color-blank);

    &:hover {
      border-color: var(--el-color-primary);
      color: var(--el-color-primary);
    }

    .avatar-uploader-icon {
      font-size: 20px;
      margin-bottom: 4px; // 减小图标和文字的间距
    }

    span {
      font-size: 12px; // 减小文字大小
    }
  }
}
</style>
