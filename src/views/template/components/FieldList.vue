<template>
  <div class="field-list" v-loading="loading">
    <div class="header">
      <h3>字段列表</h3>
      <el-button
        type="success"
        :disabled="!currentEntity"
        @click="handleAdd"
      >
        新增字段
      </el-button>
    </div>

    <!-- 调试信息 -->
    <div v-if="!currentEntity" style="color: #999; text-align: center; padding: 20px;">
      请先选择一个实体类
    </div>

    <div v-else-if="list.length === 0" style="color: #999; text-align: center; padding: 20px;">
      暂无字段数据
    </div>

    <el-table v-else :data="list">
      <el-table-column label="序号" type="index" width="60" align="center"/>
      <el-table-column label="字段名称" prop="fieldName"/>
      <el-table-column label="字段说明" prop="fieldComment" show-overflow-tooltip/>
      <el-table-column label="字段类型" prop="columnType"/>
      <el-table-column label="长度" prop="fieldLength"/>
      <el-table-column label="刻度" prop="fieldScale"/>
      <el-table-column label="是否主键">
        <template #default="{ row }">
          <el-tag v-if="row.isPk" type="success">是</el-tag>
          <el-tag v-else type="info">否</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="是否自增">
        <template #default="{ row }">
          <el-tag v-if="row.isAuto" type="success">是</el-tag>
          <el-tag v-else type="info">否</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="是否必填">
        <template #default="{ row }">
          <el-tag v-if="!row.isNull" type="danger">是</el-tag>
          <el-tag v-else type="info">否</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="是否关联">
        <template #default="{ row }">
          <el-tag v-if="row.isRel" type="warning">是</el-tag>
          <el-tag v-else type="info">否</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="是否唯一">
        <template #default="{ row }">
          <el-tag v-if="row.isUnique" type="success">是</el-tag>
          <el-tag v-else type="info">否</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="字段名称" prop="fieldName">
          <el-input
            v-model="form.fieldName"
            placeholder="请输入字段名称"
          />
        </el-form-item>
        <el-form-item label="字段类型" prop="columnType">
          <el-select
            v-model="form.columnType"
            placeholder="请选择字段类型"
            :loading="fieldTypeLoading"
            :disabled="fieldTypeLoading"
          >
            <el-option
              v-for="item in fieldTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
            <el-option
              v-if="!fieldTypeLoading && fieldTypeOptions.length === 0"
              disabled
              label="暂无字段类型数据"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="字段长度" prop="fieldLength">
          <el-input-number
            v-model="form.fieldLength"
            :min="0"
            :precision="0"
          />
        </el-form-item>
        <el-form-item label="字段刻度" prop="fieldScale">
          <el-input-number
            v-model="form.fieldScale"
            :min="0"
            :precision="0"
          />
        </el-form-item>
        <el-form-item label="排序号" prop="orderNum">
          <el-input-number
            v-model="form.orderNum"
            :min="0"
            :precision="0"
          />
        </el-form-item>
        <el-form-item label="是否主键">
          <el-switch v-model="form.isPk"/>
        </el-form-item>
        <el-form-item label="是否自增">
          <el-switch v-model="form.isAuto"/>
        </el-form-item>
        <el-form-item label="是否必填">
          <el-switch v-model="form.isNull" :active-value="false" :inactive-value="true"/>
        </el-form-item>
        <el-form-item label="是否关联">
          <el-switch v-model="form.isRel"/>
        </el-form-item>
        <el-form-item label="是否唯一">
          <el-switch v-model="form.isUnique"/>
        </el-form-item>
        <el-form-item label="关联实体" v-if="form.isRel" prop="relEntity">
          <el-input
            v-model="form.relEntity"
            placeholder="请输入关联实体"
          />
        </el-form-item>
        <el-form-item label="关联字段" v-if="form.isRel" prop="relField">
          <el-input
            v-model="form.relField"
            placeholder="请输入关联字段"
          />
        </el-form-item>
        <el-form-item label="关联类型" v-if="form.isRel" prop="relType">
          <el-select v-model="form.relType" placeholder="请选择关联类型">
            <el-option
              v-for="item in relTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="字段说明" prop="fieldComment">
          <el-input
            v-model="form.fieldComment"
            type="textarea"
            :rows="3"
            placeholder="请输入字段说明"
          />
        </el-form-item>
        <el-form-item label="外键字段说明" prop="fieldFkFieldComment">
          <el-input
            v-model="form.fieldFkFieldComment"
            type="textarea"
            :rows="2"
            placeholder="请输入外键字段说明"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup name="FieldList">
import {onMounted, reactive, ref, watch} from 'vue'
import type {FormInstance, FormRules} from 'element-plus'
import {ElMessage, ElMessageBox} from 'element-plus'
import {
  addTemplateField,
  deleteTemplateField,
  getDataTypeById,
  getTemplateFieldList,
  updateTemplateField
} from '@/api/template'
import type { TemplateEntity } from '@/api/template/types'

// 使用TemplateField类型
import type { TemplateField } from '@/api/template/types'

type Field = TemplateField

interface Props {
  currentEntity: TemplateEntity | null
}

const props = defineProps<Props>()

const loading = ref(false)
const fieldTypeLoading = ref(false)
const list = ref<Field[]>([])

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()

// 字段类型选项
const fieldTypeOptions = ref<Array<{ label: string; value: string }>>([])

// 关联类型选项
const relTypeOptions = [
  { label: '一对一', value: 'ONE_TO_ONE' },
  { label: '一对多', value: 'ONE_TO_MANY' },
  { label: '多对一', value: 'MANY_TO_ONE' },
  { label: '多对多', value: 'MANY_TO_MANY' }
]

const form = reactive<Field>({
  id: '',
  entityId: '',
  fieldName: '',
  fieldType: '',
  fieldLength: 0,
  fieldScale: 0,
  fieldComment: '',
  fieldFkFieldComment: '',
  isPk: false,
  isAuto: false,
  isNull: true,
  isRel: false,
  isUnique: false,
  orderNum: 0,
  relEntity: '',
  relField: '',
  relType: '',
  columnType: '',
  status: ''
})

const rules = reactive<FormRules>({
  fieldName: [{ required: true, message: '请输入字段名称', trigger: 'blur' }],
  columnType: [{ required: true, message: '请选择字段类型', trigger: 'change' }],
  orderNum: [{ required: true, message: '请输入排序号', trigger: 'blur' }]
})

// 获取字段类型选项
const getFieldTypeOptions = async () => {
  if (!props.currentEntity?.id) return
  fieldTypeLoading.value = true
  try {
    const response = await getDataTypeById(props.currentEntity.id)


    if (response && Array.isArray(response)) {
      // 清空原有选项，避免重复添加
      fieldTypeOptions.value.length = 0
      // 添加从接口获取的选项
      fieldTypeOptions.value.push(...response.map(item => ({
        label: `${item.dataType} (${item.columnType})`,
        value: item.columnType
      })))
      console.log('处理后的字段类型选项:', fieldTypeOptions.value) // 添加调试日志
    } else {
      // 如果接口返回空数据，清空选项
      fieldTypeOptions.value.length = 0
    }
  } catch (error) {
    console.error('获取字段类型选项失败:', error)
    // 出错时清空选项
    fieldTypeOptions.value.length = 0
  } finally {
    fieldTypeLoading.value = false
  }
}

// 获取列表
const getList = async () => {
  if (!props.currentEntity?.id) return
  loading.value = true
  try {
    const res = await getTemplateFieldList({ entityId: props.currentEntity.id })
    console.log('字段列表API返回数据:', res) // 添加调试日志

    // 检查响应数据结构
    if (res && typeof res === 'object' && 'content' in res && Array.isArray((res as any).content)) {
      // 如果返回的是分页格式
      list.value = ((res as any).content || []).map((item: any) => ({
        ...item,
        fieldName: item.fieldName || '',
        fieldType: item.fieldType || '',
        fieldComment: item.fieldComment || '',
        fieldFkFieldComment: item.fieldFkFieldComment || '',
        relEntity: item.relEntity || '',
        relField: item.relField || '',
        relType: item.relType || '',
        columnType: item.columnType || '',
        status: item.status || ''
      }))
    } else if (Array.isArray(res)) {
      // 如果返回的是数组格式
      list.value = (res || []).map((item: any) => ({
        ...item,
        fieldName: item.fieldName || '',
        fieldType: item.fieldType || '',
        fieldComment: item.fieldComment || '',
        fieldFkFieldComment: item.fieldFkFieldComment || '',
        relEntity: item.relEntity || '',
        relField: item.relField || '',
        relType: item.relType || '',
        columnType: item.columnType || '',
        status: item.status || ''
      }))
    } else {
      list.value = []
    }
    console.log('处理后的字段列表:', list.value) // 添加调试日志
  } catch (error) {
    console.error('获取字段列表失败:', error)
    ElMessage.error('获取字段列表失败')
  } finally {
    loading.value = false
  }
}

// 监听实体类变化
watch(() => props.currentEntity, (entity) => {
  console.log('实体类变化:', entity) // 添加调试日志
  if (entity) {
    getList()
    getFieldTypeOptions() // 重新获取字段类型选项
  } else {
    list.value = []
    fieldTypeOptions.value.length = 0 // 清空字段类型选项
  }
}, { immediate: true })

// 监听 columnType 变化，同步更新 fieldType
watch(() => form.columnType, (newValue) => {
  if (newValue) {
    form.fieldType = newValue
  }
})

const resetForm = () => {
  Object.assign(form, {
    id: '',
    entityId: props.currentEntity?.id || '',
    fieldName: '',
    fieldType: '',
    fieldLength: 0,
    fieldScale: 0,
    fieldComment: '',
    fieldFkFieldComment: '',
    isPk: false,
    isAuto: false,
    isNull: true,
    isRel: false,
    isUnique: false,
    orderNum: 0,
    relEntity: '',
    relField: '',
    relType: '',
    columnType: '',
    status: ''
  })
}
// 新增
const handleAdd = () => {
  if (!props.currentEntity) return
  dialogTitle.value = '新增字段'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: Field) => {
  dialogTitle.value = '编辑字段'
  resetForm()
  Object.assign(form, row)
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row: Field) => {
  try {
    if (!row.id) {
      ElMessage.error('无效的字段ID')
      return
    }
    await ElMessageBox.confirm('确认要删除该字段吗？', '提示', {
      type: 'warning'
    })
    await deleteTemplateField(row.id)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    console.error('删除字段失败:', error)
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    const submitData = {
      ...form,
      id: form.id || '',
      entityId: props.currentEntity?.id || '',
      status: form.status || ''
    }
    if (form.id) {
      await updateTemplateField(submitData)
      ElMessage.success('修改成功')
    } else {
      await addTemplateField(submitData)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    getList()
  } catch (error) {
    console.error('保存失败:', error)
  }
}

onMounted(() => {
  // 字段类型选项会在实体类变化时自动获取
})
</script>

<style lang="scss" scoped>
.field-list {
  background: #fff;
  padding: 20px;
  border-radius: 4px;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      margin: 0;
    }
  }
}
</style>
