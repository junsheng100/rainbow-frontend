<template>
  <el-dialog
    :title="formData?.dictCode ? '修改字典数据' : '新增字典数据'"
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
      <el-form-item label="字典标签" prop="dictLabel">
        <el-input
          v-model="form.dictLabel"
          placeholder="请输入字典标签"
          maxlength="100"
        />
      </el-form-item>
      <el-form-item label="字典键值" prop="dictValue">
        <el-input
          v-model="form.dictValue"
          placeholder="请输入字典键值"
          maxlength="100"
        />
      </el-form-item>
      <el-form-item label="字典排序" prop="dictSort">
        <el-input-number
          v-model="form.dictSort"
          :min="0"
          :max="999"
          controls-position="right"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
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
import type { SysDictData } from '@/api/dict/data'

const props = defineProps<{
  modelValue: boolean
  formData?: Partial<SysDictData>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const dictStore = useDictStore()
const formRef = ref<FormInstance>()
const dialogVisible = ref(false)

// 默认表单数据
const getDefaultFormData = (): SysDictData => ({
  dictLabel: '',
  dictValue: '',
  dictType: dictStore.currentDictType!,
  dictSort: 1,
  status: '0',
  isDefault: 'N',
  remark: ''
})

// 表单数据
const form = ref<SysDictData>(getDefaultFormData())

// 表单校验规则
const rules = {
  dictLabel: [
    { required: true, message: '请输入字典标签', trigger: 'blur' },
    { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  dictValue: [
    { required: true, message: '请输入字典键值', trigger: 'blur' },
    { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  dictSort: [
    { required: true, message: '请输入字典排序', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 重置表单数据
const resetForm = () => {
  form.value = getDefaultFormData()
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 初始化表单数据
const initFormData = () => {
  if (props.formData && Object.keys(props.formData).length > 0) {
    // 编辑模式：使用传入的数据
    form.value = { ...getDefaultFormData(), ...props.formData }
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
    console.log("提交的字典数据:", JSON.stringify(form.value, null, 2))

    if (props.formData?.dictCode) {
      await dictStore.updateDictData({
        ...form.value,
        dictCode: props.formData.dictCode
      })
      ElMessage.success('修改成功')
    } else {
      await dictStore.createDictData(form.value)
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
  name: 'DictDataForm'
})
</script>

<style lang="scss" scoped>
.dialog-footer {
  text-align: right;
}
</style>
