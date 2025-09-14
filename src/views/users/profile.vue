<template>
  <div class="app-container">
    <div class="user-profile">
      <el-tabs>
        <el-tab-pane label="个人信息">
          <el-card class="profile-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>个人信息</span>
                <el-button v-if="!isEditing" type="primary" @click="handleEdit">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button v-if="!isEditing" type="success" @click="testAuthHeader" style="margin-left: 10px;">
                  <el-icon><Connection /></el-icon>
                  测试认证
                </el-button>
              </div>
            </template>

            <el-form
              ref="formRef"
              :model="userForm"
              :rules="formRules"
              label-width="100px"
              class="user-form"
              :disabled="!isEditing"
            >
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="用户名">
                    <el-input v-model="userForm.userName" disabled />
                  </el-form-item>
                  <el-form-item label="昵称" prop="nickname">
                    <el-input v-model="userForm.nickname" placeholder="请输入昵称" />
                  </el-form-item>
                  <el-form-item label="邮箱" prop="email">
                    <el-input v-model="userForm.email" placeholder="请输入邮箱" />
                  </el-form-item>
                  <el-form-item label="手机号" prop="phone">
                    <el-input v-model="userForm.phone" placeholder="请输入手机号" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="部门">
                    <el-input v-model="userForm.deptName" disabled />
                  </el-form-item>
                  <el-form-item label="岗位">
                    <el-input :value="userForm.postNameList?.join(', ')" disabled />
                  </el-form-item>
                  <el-form-item label="角色">
                    <el-input :value="userForm.roleNameList?.join(', ')" disabled />
                  </el-form-item>
                </el-col>
              </el-row>

              <div v-if="isEditing" class="form-actions">
                <el-button @click="handleCancel">取消</el-button>
                <el-button type="primary" :loading="submitLoading" @click="handleSubmit">保存</el-button>
              </div>
            </el-form>
          </el-card>
        </el-tab-pane>
        <el-tab-pane label="头像管理">
          <el-row :gutter="24">
            <el-col :span="12">
              <el-card class="avatar-preview" shadow="hover">
                <template #header>
                  <div class="card-header">
                    <span>当前头像</span>
                  </div>
                </template>
                <div class="avatar-display">
                  <el-image
                    style="width: 200px; height: 200px; border-radius: 50%"
                    v-if="userForm.avatar !== ''"
                    :src="avatarUrl"
                    :preview-teleported="true"
                    fit="cover"
                    class="table-preview-image"
                  />
                  <div v-else class="no-avatar">
                    <el-icon :size="64" class="avatar-icon"><User /></el-icon>
                    <p>暂无头像</p>
                  </div>
                </div>

              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card class="avatar-cropper-card" shadow="hover">
                <template #header>
                  <div class="card-header">
                    <span>头像上传与裁剪</span>
                  </div>
                </template>
                <avatar-cropper
                  :action="uploadUrl"
                  :headers="uploadHeaders"
                  :max-size="10"
                  :existing-avatar="userForm.avatar ?avatarUrl: ''"
                  @crop-success="handleCropSuccess"
                  @crop-error="handleCropError"
                  @cancel="handleCropCancel"
                />
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Edit, Connection } from '@element-plus/icons-vue'
import { getUserProfile, updateUser } from '@/api/users/user'
import type { UserInfo } from '@/types/user'
import { useUserStore } from '@/stores/user'
import { getResourceUrl } from "@/config"
import { getToken } from "@/utils/auth"
import { TokenCookie } from '@/utils/cookies'
import AvatarCropper from './avatarCropper.vue'

// 响应式数据
const isEditing = ref(false)
const submitLoading = ref(false)
const avatarTimestamp = ref(Date.now())

// 表单引用
const formRef = ref<FormInstance>()
const userStore = useUserStore()

// 用户表单数据
const userForm = reactive<Partial<UserInfo>>({
  userId: '',
  userName: '',
  nickname: '',
  email: '',
  avatar: '',
  phone: '',
  deptName: '',
  postNameList: [],
  roleNameList: [],
})


// 表单校验规则
const formRules = reactive<FormRules>({
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
})

// 上传相关配置
const uploadUrl = '/api/user/avatar/upload'

const uploadHeaders = computed(() => {
  const token = getToken()
  if (!token) {
    ElMessage.error('未登录或登录已过期，请重新登录')
    return {}
  }
  const tokenType = TokenCookie.getTokenType() || 'Bearer'
  return {
    Authorization: `${tokenType} ${token}`,
    'X-Requested-With': 'XMLHttpRequest'
  }
})

const avatarUrl = computed(() => {
  if (!userForm.avatar) return ''
  return getResourceUrl(userForm.avatar) + "?timestamp=" + avatarTimestamp.value
})

// 获取用户信息
const loadUserProfile = async () => {
  try {
    const response = await getUserProfile()
    Object.assign(userForm, response)
  } catch (error) {
    ElMessage.error('获取用户信息失败')
  }
}

// 编辑按钮点击
const handleEdit = () => {
  isEditing.value = true
}

// 取消编辑
const handleCancel = () => {
  isEditing.value = false
  loadUserProfile()
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitLoading.value = true

    const { userId, nickname, email, phone, avatar } = userForm
    if (!userId) {
      ElMessage.error('用户ID不存在')
      submitLoading.value = false
      return
    }
    await updateUser({ userId, nickname, email, phone, avatar })

    ElMessage.success('更新成功')
    isEditing.value = false
    await loadUserProfile()
    await useUserStore().getUserInfo()
  } catch (error) {
    ElMessage.error('更新失败')
  } finally {
    submitLoading.value = false
  }
}


// 头像裁剪成功
const handleCropSuccess = async (avatarUrl: string) => {
  try {
    // 更新表单中的头像
    userForm.avatar = avatarUrl
    
    // 直接更新userStore中的头像信息，确保立即生效
    userStore.userInfo.avatar = avatarUrl
    
    // 更新时间戳强制刷新头像显示
    avatarTimestamp.value = Date.now()
    
    // 使用updateUserProfile方法更新用户头像信息到服务器
    await userStore.updateUserProfile({ avatar: avatarUrl })
    
    // 重新获取用户信息以确保数据同步
    await userStore.getUserInfo()
    
    ElMessage.success('头像更新成功')
  } catch (error) {
    console.error('头像更新失败:', error)
    ElMessage.error('头像更新失败，请重试')
  }
}

// 头像裁剪失败
const handleCropError = (error: any) => {
  ElMessage.error('头像上传失败，请重试')
  console.error('Avatar upload error:', error)
}

// 取消裁剪
const handleCropCancel = () => {
  // 可以添加一些取消时的处理逻辑
}

// 测试认证 header
const testAuthHeader = async () => {
  try {
    console.log('🧪 开始测试 Authorization header...')
    
    // 先检查 cookie 中的 token
    const token = document.cookie.split(';').find(c => c.trim().startsWith('token='))
    console.log('🍪 当前 Cookie 中的 token:', token ? 'exists' : 'missing')
    
    // 测试获取用户信息 API
    const response = await getUserProfile()
    console.log('✅ 测试成功:', response)
    ElMessage.success('认证测试成功！请查看控制台日志')
  } catch (error) {
    console.error('❌ 测试失败:', error)
    ElMessage.error('认证测试失败，请查看控制台日志')
  }
}

// 生命周期钩子
onMounted(() => {
  loadUserProfile()
})
</script>

<style lang="scss" scoped>
.user-profile {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .form-actions {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    gap: 16px;
  }

  .avatar-preview {
    .avatar-display {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
    }

    .no-avatar {
      text-align: center;
      color: #909399;

      .avatar-icon {
        margin-bottom: 8px;
      }

      p {
        margin: 0;
        font-size: 14px;
      }
    }
  }

  .avatar-cropper-card {
    min-height: 500px;
  }
}
</style>
