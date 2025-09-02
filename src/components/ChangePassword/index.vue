<template>
  <el-dialog
    v-model="visible"
    title="修改密码"
    width="400px"
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="旧密码" prop="oldPassword">
        <el-input
          v-model="form.oldPassword"
          type="password"
          placeholder="请输入旧密码"
          show-password
        />
      </el-form-item>

      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="form.newPassword"
          type="password"
          placeholder="请输入新密码"
          show-password
        />
      </el-form-item>

      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="请再次输入新密码"
          show-password
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          确认修改
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { changePassword } from '@/api/auth'
import type { ChangePasswordForm } from '@/types/user'
import { useUserStore } from '@/stores/user'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const loading = ref(false)

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

// 表单数据
const form = reactive<ChangePasswordForm>({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单验证规则
const rules: FormRules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (_, value: string, callback: any) => {
        if (value !== form.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    loading.value = true
    // 从 userStore 中获取 userId
    // console.log("##### user:",JSON.stringify( userStore.userInfo))
    const userId = userStore.userInfo.userId
    if (!userId) {
      ElMessage.error('用户信息获取失败，请重新登录')
      return
    }

    // 构建请求参数
    const params = {
      userId,
      oldPassword: form.oldPassword,
      newPassword: form.newPassword
    }

    await changePassword(params)

    ElMessage.success('密码修改成功')
    handleClose()
    emit('success')

    // 密码修改成功后要求重新登录
    ElMessageBox.confirm(
      '密码已修改成功，需要重新登录',
      '提示',
      {
        confirmButtonText: '重新登录',
        cancelButtonText: '稍后登录',
        type: 'warning'
      }
    ).then(() => {
      // 清除本地存储并跳转到登录页
      localStorage.clear()
      window.location.href = '/login'
    }).catch(() => {
      // 用户选择稍后登录，不做任何操作
    })

  } catch (error: any) {
    ElMessage.error(error.message || '密码修改失败')
  } finally {
    loading.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  formRef.value?.resetFields()
  Object.assign(form, {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  visible.value = false
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
