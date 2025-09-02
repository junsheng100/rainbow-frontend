<template>
  <div class="entity-list">
    <div class="header">
      <h3>实体类列表</h3>
      <el-button type="success" @click="handleAdd">新增实体类</el-button>
    </div>

    <div class="search-area">
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item>
          <el-input
              v-model="queryParams.name"
              placeholder="搜索实体类"
              clearable
              @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon>
              <Search/>
            </el-icon>
            搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon>
              <Refresh/>
            </el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table
        v-loading="loading"
        :data="list"
        @row-click="handleSelect"
        highlight-current-row
    >
      <el-table-column label="序号" type="index" width="60" align="center"/>
      <el-table-column label="实体类名" prop="entityName" show-overflow-tooltip/>
      <!--
      <el-table-column label="表名" prop="tableName"/>
      <el-table-column label="包路径" prop="packageName"/>
      -->
      <el-table-column label="说明" prop="entityComment" show-overflow-tooltip/>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click.stop="handleEdit(row)">
            编辑
          </el-button>
          <el-button
              link
              type="danger"
              @click.stop="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :total="total"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>

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
          label-width="150px"
      >
        <el-form-item label="实体类名" prop="entityName">
          <el-input v-model="form.entityName" placeholder="请输入实体类名"/>
        </el-form-item>
        <el-form-item label="表名" prop="tableName">
          <el-input v-model="form.tableName" placeholder="请输入表名"/>
        </el-form-item>
        <el-form-item label="数据库类型" prop="dbType">
          <el-select v-model="form.dbType" placeholder="请选择数据库类型" style="width: 100%">
            <el-option
                v-for="item in dbTypeOptions"
                :key="item"
                :label="item"
                :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="ID类型" prop="idType">
          <el-select v-model="form.idType" placeholder="请选择ID类型" style="width: 100%">
            <el-option
                v-for="item in idTypeOptions"
                :key="item.code"
                :label="item.message"
                :value="item.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="包路径" prop="packageName">
          <el-input
              v-model="form.packageName"
              placeholder="请输入包路径"
          />
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="form.author" placeholder="请输入作者"/>
        </el-form-item>
        <el-form-item label="Catalog" prop="dbCatalog">
          <el-input v-model="form.dbCatalog" placeholder="请输入数据库分组目录"/>
        </el-form-item>
        <el-form-item label="Schema" prop="dbSchema">
          <el-input v-model="form.dbSchema" placeholder="请输入数据库命名空间"/>
        </el-form-item>
        <el-form-item label="排序号" prop="orderNum">
          <el-input-number v-model="form.orderNum" :min="0" :precision="0" placeholder="请输入排序号"/>
        </el-form-item>
        <el-form-item label="说明" prop="entityComment">
          <el-input
              v-model="form.entityComment"
              type="textarea"
              :rows="3"
              placeholder="请输入说明"
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

<script lang="ts" setup name="EntityList">
import {onMounted, reactive, ref} from 'vue'
import type {FormInstance, FormRules} from 'element-plus'
import {ElMessage, ElMessageBox} from 'element-plus'

import {
  getTemplateEntityList,
  addTemplateEntity,
  updateTemplateEntity,
  deleteTemplateEntity
} from '@/api/template'

import { getDbTypeList, getJavaTypeList } from '@/api/template/dataType'

import type { TemplateEntity } from '@/api/template/types'
import type { Enums } from '@/types/dataType'

const emit = defineEmits<{
  (e: 'select', entity: TemplateEntity | null): void
}>()

const loading = ref(false)
const list = ref<TemplateEntity[]>([])
const total = ref(0)

// 下拉框选项
const dbTypeOptions = ref<string[]>([])
const idTypeOptions = ref<Enums[]>([])

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  name: ''
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()
const form = reactive<TemplateEntity>({
  id: '',
  tableName: '',
  entityName: '',
  dbType: '',
  idType: '',
  packageName: '',
  entityComment: '',
  author: '',
  dbCatalog: '',
  dbSchema: '',
  orderNum: 1,
  status: ''
})

const rules = reactive<FormRules>({
  name: [{required: true, message: '请输入实体类名', trigger: 'blur'}],
  tableName: [{required: true, message: '请输入表名', trigger: 'blur'}],
  dbType: [{required: true, message: '请选择数据库类型', trigger: 'change'}],
  idType: [{required: true, message: '请选择ID类型', trigger: 'change'}],
  packageName: [{required: true, message: '请输入包路径', trigger: 'blur'}],
  author: [{required: true, message: '请输入作者', trigger: 'blur'}],
  orderNum: [{required: true, message: '请输入排序号', trigger: 'blur'}]
})

// 获取数据库类型列表
const loadDbTypeOptions = async () => {
  try {
    const res = await getDbTypeList()
    dbTypeOptions.value = res
  } catch (error) {
    console.error('获取数据库类型列表失败:', error)
  }
}

// 获取ID类型列表
const loadIdTypeOptions = async () => {
  try {
    const res = await getJavaTypeList()
    idTypeOptions.value = res
  } catch (error) {
    console.error('获取ID类型列表失败:', error)
  }
}

// 获取列表
const getList = async () => {
  loading.value = true
  try {
    const res = await getTemplateEntityList(queryParams)
    list.value = res.content.map((item: TemplateEntity) => ({
      ...item,
      id: item.id || ''
    }))
    total.value = res.total
  } catch (error) {
    console.error('获取实体类列表失败:', error)
    ElMessage.error('获取实体类列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  queryParams.pageNum = 1
  getList()
}

// 重置搜索
const resetSearch = () => {
  queryParams.name = ''
  queryParams.pageNum = 1
  getList()
}

// 分页大小变化
const handleSizeChange = (val: number) => {
  queryParams.pageSize = val
  getList()
}

// 页码变化
const handleCurrentChange = (val: number) => {
  queryParams.pageNum = val
  getList()
}

// 选择实体类
const handleSelect = (row: TemplateEntity) => {
  emit('select', row)
}

const restFormValue = () => {
  Object.assign(form, {
    id: '',
    name: '',
    tableName: '',
    entityName: '',
    dbType: '',
    idType: '',
    packageName: '',
    entityComment: '',
    author: '',
    dbCatalog: '',
    dbSchema: '',
    orderNum: 1,
    status: '',
    fcu: '',
    lcu: ''
  })
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增实体类'
  restFormValue()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: TemplateEntity) => {
  dialogTitle.value = '编辑实体类'
  restFormValue()
  Object.assign(form, row)
  dialogVisible.value = true
}

// 删除按钮操作
const handleDelete = async (row: TemplateEntity) => {
  try {
    if (!row.id) {
      ElMessage.error('无效的实体ID')
      return
    }
    await ElMessageBox.confirm('确认要删除该实体类吗？', '提示', {
      type: 'warning'
    })
    await deleteTemplateEntity(row.id)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    console.error('删除失败:', error)
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    const submitData: TemplateEntity = {
      ...form,
      id: form.id || ''  // 确保 id 有值
    }
    if (form.id) {
      await updateTemplateEntity(submitData)
      ElMessage.success('修改成功')
    } else {
      await addTemplateEntity(submitData)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    getList()
  } catch (error) {
    console.error('保存失败:', error)
  }
}

// 初始化
onMounted(async () => {
  await Promise.all([
    getList(),
    loadDbTypeOptions(),
    loadIdTypeOptions()
  ])
})
</script>

<style lang="scss" scoped>
.entity-list {
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

  .search-area {
    margin-bottom: 20px;

    .search-form {
      display: flex;
      align-items: center;
      margin-bottom: 0;

      :deep(.el-form-item) {
        margin-bottom: 0;
        margin-right: 10px;

        &:last-child {
          margin-right: 0;
        }
      }
    }
  }

  .pagination-wrapper {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
