<template>
  <el-dialog
    title="回复反馈"
    v-model="dialogVisible"
    width="500px"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="标题" class="readonly">
        <el-input v-model="form.title" readonly />
      </el-form-item>
      <el-form-item label="反馈内容" class="readonly">
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="4"
          readonly
        />
      </el-form-item>
      <el-form-item label="回复内容" prop="reply">
        <el-input
          v-model="form.reply"
          type="textarea"
          :rows="4"
          placeholder="请输入回复内容"
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
import { replyFeedback } from '@/api/system/feedback.ts'

interface ReplyFormData {
  id: string
  title: string
  content: string
  reply: string
  stage: number
  replyTime?: string
}

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  formData: {
    type: Object as () => Partial<ReplyFormData>,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'success'])

// 对话框可见状态
const dialogVisible = ref(props.visible)

// 表单引用
const formRef = ref<FormInstance>()

// 表单数据
const form = reactive<ReplyFormData>({
  id: '',
  title: '',
  content: '',
  reply: '',
  stage: 0
})

// 表单校验规则
const rules = {
  reply: [
    { required: true, message: '请输入回复内容', trigger: 'blur' },
    { min: 1, max: 2000, message: '长度在 1 到 2000 个字符', trigger: 'blur' }
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
          if (key in val) {
            const formKey = key as keyof ReplyFormData
            const valKey = key as keyof typeof val
            const value = val[valKey]
            if (value !== undefined) {
              // 使用类型安全的赋值方式
              if (formKey === 'id' || formKey === 'title' || formKey === 'content' || formKey === 'reply') {
                form[formKey] = String(value)
              } else if (formKey === 'stage') {
                form[formKey] = Number(value)
              }
            }
          }
        })

        // 如果是新回复且处理阶段为待处理，默认设置为处理中
        if (!form.reply && form.stage === 0) {
          form.stage = 1
        }
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
        // 设置回复时间
        const updateData = {
          id: form.id,
          title: form.title,
          content: form.content,
          reply: form.reply,
          stage: form.stage,
          replyTime: new Date().toISOString()
        }

        await replyFeedback(updateData)
        ElMessage.success('回复成功')
        emit('success')
      } catch (error: any) {
        ElMessage.error(error.message || '回复失败')
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

.readonly {
  :deep(.el-input__inner) {
    color: #606266;
    background-color: #f5f7fa;
  }

  :deep(.el-textarea__inner) {
    color: #606266;
    background-color: #f5f7fa;
  }
}
</style>
