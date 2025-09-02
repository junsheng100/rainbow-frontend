<template>
  <el-dialog
    :title="formType === 'add' ? '新增反馈' : '编辑反馈'"
    v-model="dialogVisible"
    width="500px"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入标题" />
      </el-form-item>
      <el-form-item label="内容" prop="content">
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="4"
          placeholder="请输入反馈内容"
        />
      </el-form-item>
      <el-form-item label="处理阶段" prop="stage">
        <el-select v-model="form.stage" placeholder="请选择处理阶段">
          <el-option
            v-for="item in stageOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { createFeedback, updateFeedback } from '@/api/system/feedback.ts'

interface FeedbackFormData {
  id?: string
  title: string
  content: string
  stage: number
}

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  formType: {
    type: String,
    default: 'add'
  },
  formData: {
    type: Object as () => Partial<FeedbackFormData>,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'success'])

// 对话框可见状态
const dialogVisible = ref(props.visible)

// 表单引用
const formRef = ref<FormInstance>()

// 表单数据
const form = reactive<FeedbackFormData>({
  id: '',
  title: '',
  content: '',
  stage: 0
})

// 表单校验规则
const rules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入反馈内容', trigger: 'blur' }
  ],
  stage: [
    { required: true, message: '请选择处理阶段', trigger: 'change' }
  ]
}

// 处理阶段选项
const stageOptions = [
  { value: 0, label: '待处理' },
  { value: 1, label: '处理中' },
  { value: 2, label: '已完成' }
]

// 监听visible属性变化
watch(
  () => props.visible,
  (val) => {
    dialogVisible.value = val
  }
)

// 监听formData属性变化
watch(
  () => props.formData,
  (val) => {
    if (val) {
      nextTick(() => {
        Object.keys(form).forEach((key) => {
          const formKey = key as keyof FeedbackFormData
          if (key in val && val[formKey] !== undefined) {
            const value = val[formKey]
            if (value !== undefined) {
              // 根据字段类型进行安全赋值
              if (formKey === 'id' || formKey === 'title' || formKey === 'content') {
                form[formKey] = String(value)
              } else if (formKey === 'stage') {
                form[formKey] = Number(value)
              }
            }
          }
        })
      })
    }
  },
  { immediate: true, deep: true }
)

// 关闭对话框
const handleClose = () => {
  emit('close')
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (props.formType === 'add') {
          await createFeedback(form)
          ElMessage.success('新增成功')
        } else {
          await updateFeedback(form)
          ElMessage.success('更新成功')
        }
        emit('success')
      } catch (error: any) {
        ElMessage.error(error.message || '操作失败')
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
