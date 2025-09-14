<template>
  <el-dialog
    :title="formData?.dictId ? '修改字典类型' : '新增字典类型'"
    v-model="dialogVisible"
    width="500px"
    append-to-body
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="字典名称" prop="dictName">
        <el-input
          v-model="form.dictName"
          placeholder="请输入字典名称"
          maxlength="100"
        />
      </el-form-item>
      <el-form-item label="字典类型" prop="dictType">
        <el-input
          v-model="form.dictType"
          placeholder="请输入字典类型"
          maxlength="100"
        />
      </el-form-item>
      <el-form-item label="字典排序" prop="orderNum">
        <el-input-number
          v-model="form.orderNum"
          :min="0"
          :max="999"
          controls-position="right"
        />
      </el-form-item>
      <el-form-item label="状态" prop="disabled">
        <el-radio-group v-model="form.disabled">
          <el-radio label="0">正常</el-radio>
          <el-radio label="1">停用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="form.remark"
          type="textarea"
          placeholder="请输入内容"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useDictStore } from '@/stores/dict'
import type { SysDictType } from '@/api/dict/type'

const props = defineProps<{
  modelValue: boolean
  formData?: Partial<SysDictType>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const dictStore = useDictStore()
const formRef = ref<FormInstance>()
const dialogVisible = ref(false)

// 默认表单数据
const defaultFormData: SysDictType = {
  dictName: '',
  dictType: '',
  disabled: '0',
  remark: '',
  orderNum: 1
}

// 表单数据
const form = ref<SysDictType>({ ...defaultFormData })

// 表单校验规则
const rules = {
  dictName: [
    { required: true, message: '请输入字典名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  dictType: [
    { required: true, message: '请输入字典类型', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' },
    { pattern: /^[a-z][a-z0-9_]*$/, message: '字典类型必须以小写字母开头，且只能为（小写字母，数字，下划线）', trigger: 'blur' }
  ],
  orderNum: [
    { required: true, message: '请输入字典排序', trigger: 'blur' }
  ],
  disabled: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 重置表单数据
const resetForm = () => {
  form.value = { ...defaultFormData }
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 初始化表单数据
const initFormData = () => {
  if (props.formData && Object.keys(props.formData).length > 0) {
    // 编辑模式：使用传入的数据
    form.value = { ...defaultFormData, ...props.formData }
  } else {
    // 新增模式：重置为初始状态
    resetForm()
  }
}

// 监听弹窗显示状态
watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
  if (val) {
    // 弹窗打开时初始化表单数据
    initFormData()
  }
})

// 监听内部弹窗显示状态
watch(() => dialogVisible.value, (val) => {
  emit('update:modelValue', val)
})

// 监听表单数据变化
watch(() => props.formData, () => {
  if (dialogVisible.value) {
    initFormData()
  }
}, { immediate: true })

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false
  resetForm()
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    if (props.formData?.dictId) {
      await dictStore.updateDictType({
        ...form.value,
        dictId: props.formData.dictId
      })
      ElMessage.success('修改成功')
    } else {
      await dictStore.createDictType(form.value)
      ElMessage.success('新增成功')
    }

    dialogVisible.value = false
    resetForm()
    emit('success')
  } catch (err: any) {
    console.error('表单提交失败:', err)
    console.error('错误详情:', {
      message: err.message,
      response: err.response,
      data: err.response?.data
    })

    // 显示具体的错误信息
    if (err.response?.data?.msg) {
      ElMessage.error(err.response.data.msg)
    } else if (err.message) {
      ElMessage.error(err.message)
    } else {
      ElMessage.error('提交失败，请检查表单数据')
    }
  }
}

// 默认导出
defineOptions({
  name: 'DictTypeForm'
})
</script>

<style lang="scss" scoped>
.dialog-footer {
  text-align: right;
}
</style>
