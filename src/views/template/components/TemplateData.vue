<template>
  <div class="template-data">
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" class="search-form">
      <el-row :gutter="24">
        <el-col :span="24">
          <div class="search-item" style="float: left">
            <el-form-item label="模板名称">
              <el-input
                  v-model="queryParams.name"
                  placeholder="请输入模板名称"
                  clearable
                  @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleQuery">
                <el-icon>
                  <Search/>
                </el-icon>
                搜索
              </el-button>
              <el-button @click="resetQuery">
                <el-icon>
                  <Refresh/>
                </el-icon>
                重置
              </el-button>
            </el-form-item>
          </div>
          <div class="search-item" style="float: right">
            <el-form-item>
              <el-button type="success" @click="handleAdd">
                <el-icon>
                  <Plus/>
                </el-icon>
                新增
              </el-button>
              <el-button
                  type="danger"
                  :disabled="!selectedRows.length"
                  @click="handleBatchDelete"
              >
                <el-icon>
                  <Delete/>
                </el-icon>
                批量删除
              </el-button>
            </el-form-item>
          </div>
        </el-col>
      </el-row>
    </el-form>

    <!-- 表格区域 -->
    <el-table
        v-loading="loading"
        :data="tableData"
        class="template-table"
        stripe
        :highlight-current-row="true"
        @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55"/>
      <el-table-column label="序号" width="100" align="center">
        <template #default="{ $index }">
          {{ (queryParams.pageNum - 1) * queryParams.pageSize + $index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="文件名称" prop="fileName" min-width="150"/>
      <el-table-column label="说明" prop="description" min-width="150"/>
      <el-table-column label="创建时间" prop="fcd" min-width="150"/>
      <el-table-column label="创建人" prop="fcu" min-width="100"/>
      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handlePreview(row)">预览</el-button>
          <el-button link type="primary" @click="handleEdit(row)">编辑</el-button> <!-- 添加的编辑按钮 -->
          <el-button link type="primary" @click="handleDownload(row)">下载</el-button>
          <el-button link type="danger" @click="handleDelete(row)" class="delete-btn">删除</el-button>
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
        width="80%"
        class="template-dialog"
        destroy-on-close
        @close="handleCancel"
    >
      <div class="dialog-content">
        <!-- 左侧表单 -->
        <div class="left-panel">
          <el-form
              ref="formRef"
              :model="form"
              :rules="rules"
              label-width="100px"
              class="template-form"
          >
            <el-form-item label="实体类" prop="entityId">
              <el-select
                  v-model="form.entityId"
                  placeholder="请选择实体类"
                  @change="handleEntityChange"
                  :disabled="!!form.id"
              >
                <el-option
                    v-for="item in entityOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="模板配置" prop="configId">
              <el-select
                  v-model="form.configId"
                  placeholder="请选择模板配置"
                  @change="handleConfigChange"
                  :disabled="!!form.id"
              >
                <el-option
                    v-for="item in configOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="文件路径" prop="packageName" required>
              <el-tooltip
                  content="packageName"
                  placement="right"
                  effect="light"
              >
                <el-input v-model="form.packageName" placeholder="请输入package名称"/>
              </el-tooltip>
            </el-form-item>
            <el-form-item label="说明" prop="description">
              <el-tooltip
                  content="description"
                  placement="right"
                  effect="light"
              >
                <el-input
                    v-model="form.description"
                    type="textarea"
                    :rows="3"
                    :autosize="{ minRows: 3, maxRows: 6 }"
                    placeholder="请输入说明"
                    maxlength="255"
                    show-word-limit
                    resize="vertical"
                    @input="handleDescriptionInput"
                />
              </el-tooltip>
            </el-form-item>
          </el-form>
        </div>

        <!-- 右侧编辑器 -->
        <div class="right-panel">
          <div class="panel-header">
            <span class="panel-title">模板内容</span>
          </div>
          <div class="editor-wrapper">
            <Codemirror
                v-model="form.srcContent"
                placeholder="请输入模板内容"
                :style="{ height: '100%' }"
                :autofocus="true"
                :indent-with-tab="true"
                :tab-size="2"
                :extensions="editorExtensions"
                ref="editorRef"
            />
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 预览对话框 -->
    <el-dialog
        title="预览内容"
        v-model="previewVisible"
        width="800px"
        append-to-body
        class="markdown-preview-dialog"
        :close-on-click-modal="false"
        :close-on-press-escape="true"
    >
      <div class="preview-content" v-loading="previewLoading">
        <Codemirror
            v-model="previewContent"
            :style="{ height: '400px' }"
            :autofocus="false"
            :indent-with-tab="false"
            :extensions="extensions"
            :readonly="true"
            @mousedown.prevent
            @keydown.prevent
        />
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancelPreview">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, reactive, ref} from 'vue'
import type {FormInstance, FormRules} from 'element-plus'
import {ElMessage, ElMessageBox} from 'element-plus'
import {Delete, Plus, Refresh, Search} from '@element-plus/icons-vue'
import {Codemirror} from 'vue-codemirror'
import {oneDark} from '@codemirror/theme-one-dark'
import {javascript} from '@codemirror/lang-javascript'
import {EditorView} from '@codemirror/view'
import {EditorState} from '@codemirror/state'
import type {TemplateData, TemplateQueryParams, TemplateEntity, TemplateConfig} from '@/api/template/types'
import {
  getTemplateDataList,
  deleteTemplateData,
  batchDeleteTemplateData,
  getEntityList,
  getConfigList,
  addTemplateData,
  getTemplateConfigById,
  getTemplateEntityById
} from '@/api/template'

// Codemirror 配置 - 预览用
const extensions = [
  javascript(),
  oneDark,
  EditorState.readOnly.of(true),
  EditorView.editable.of(false),
  EditorState.tabSize.of(2),
  EditorView.lineWrapping,
  EditorState.phrases.of({
    "Read-only": "只读模式"
  })
]

// Codemirror 配置 - 编辑器用
const editorExtensions = [
  javascript(),
  oneDark
]

// 查询参数
const queryParams = reactive<TemplateQueryParams>({
  pageNum: 1,
  pageSize: 10,
  name: ''
})

// 表格数据
const loading = ref(false)
const tableData = ref<TemplateData[]>([])
const total = ref(0)
const selectedRows = ref<TemplateData[]>([])

// 表单数据
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()
const form = reactive<TemplateData>({
  id: '',
  fileName: '',
  packageName: '',
  entityId: '',
  configId: '',
  description: '',
  srcContent: '',
  content: '',
  status: '0'
})

// 预览数据
const previewVisible = ref(false)
const previewContent = ref('')
const previewLoading = ref(false)

// 表单校验规则
const rules = reactive<FormRules>({
  entityId: [{required: true, message: '请选择实体类', trigger: 'change'}],
  configId: [{required: true, message: '请选择模板配置', trigger: 'change'}],
  description: [
    { min: 0, max: 255, message: '说明长度不能超过255个字符', trigger: 'blur' }
  ]
})

// 实体类选项
const entityOptions = ref<Array<{ label: string; value: string }>>([])
// 模板配置选项
const configOptions = ref<Array<{ label: string; value: string }>>([])

// 获取列表
const getList = async () => {
  loading.value = true
  try {
    const res = await getTemplateDataList(queryParams)
    tableData.value = res.content
    total.value = res.total
  } catch (error) {
    console.error('获取列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 查询按钮点击
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

// 重置查询
const resetQuery = () => {
  queryParams.name = ''
  handleQuery()
}

// 表格选择变化
const handleSelectionChange = (selection: TemplateData[]) => {
  selectedRows.value = selection
}

// 获取实体类列表
const getEntityOptionList = async () => {
  try {
    const res = await getEntityList()
    entityOptions.value = (res || []).map((item: TemplateEntity) => ({
      label: item.entityName,
      value: item.id || ''
    }))
  } catch (error) {
    console.error('获取实体类列表失败:', error)
  }
}

// 获取模板配置列表
const getConfigOptionList = async () => {
  try {
    const res = await getConfigList()
    configOptions.value = (res || []).map((item: TemplateConfig) => ({
      label: item.name,
      value: item.id
    }))
  } catch (error) {
    console.error('获取模板配置列表失败:', error)
  }
}

// 实体类变化
const handleEntityChange = async () => {
  try {
    if (!form.entityId) return
    // 获取选中的实体类
    const selectedEntity = entityOptions.value.find(item => item.value === form.entityId)
    if (selectedEntity) {
      // 获取实体类详情
      const entity = await getTemplateEntityById(form.entityId)
      if (entity) {
        form.packageName = entity.packageName || ''
        form.fileName = entity.entityName || ''
      }
    }
  } catch (error) {
    console.error('获取实体类详情失败:', error)
    ElMessage.error('获取实体类详情失败')
  }
}

// 配置变化
const handleConfigChange = async () => {
  try {
    if (!form.configId) return
    // 获取选中的配置项
    const selectedConfig = configOptions.value.find(item => item.value === form.configId)
    if (selectedConfig) {
      // 获取模板配置详情
      const config = await getTemplateConfigById(form.configId)
      if (config) {
        form.srcContent = config.content || ''
      }
    }
  } catch (error) {
    console.error('获取模板内容失败:', error)
    ElMessage.error('获取模板内容失败')
  }
}

// 重置表单数据
const resetForm = () => {
  Object.assign(form, {
    id: '',
    fileName: '',
    packageName: '',
    entityId: '',
    configId: '',
    description: '',
    srcContent: '',
    content: '',
    status: '0'
  })
  // 重置表单校验状态
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 新增按钮点击
const handleAdd = () => {
  resetForm()
  dialogTitle.value = '新增模板数据'
  dialogVisible.value = true
}

// 编辑按钮点击
const handleEdit = (row: TemplateData) => {
  resetForm()
  dialogTitle.value = '编辑模板数据'
  // 设置新的数据
  Object.assign(form, row)
  dialogVisible.value = true
}

// 取消按钮点击
const handleCancel = () => {
  resetForm()
  dialogVisible.value = false
}

// 预览按钮点击
const handlePreview = async (row: TemplateData) => {
  previewLoading.value = true
  try {
    previewContent.value = row.content
    previewVisible.value = true
  } catch (error) {
    console.error('预览失败:', error)
    ElMessage.error('预览失败')
  } finally {
    previewLoading.value = false
  }
}

// 下载按钮点击
const handleDownload = async (row: TemplateData) => {
  try {

    if(row.fileName !== '' && row.fileName !== null && row.fileName !== undefined){
      // 创建Blob对象
      const blob = new Blob([row.content], {type: 'text/plain'})
      // 创建下载链接
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = row.fileName  // 使用文件名作为下载名称
      document.body.appendChild(link)
      link.click()
      // 清理
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      ElMessage.success('下载成功')
    }else{
      console.error('文件名称为空，不能下载')
    }

  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败')
  }
}

// 删除按钮点击
const handleDelete = async (row: TemplateData) => {
  try {
    if (!row.id) {
      ElMessage.error('无效的模板ID')
      return
    }
    await ElMessageBox.confirm('确认要删除该模板数据吗？', '提示', {
      type: 'warning'
    })
    await deleteTemplateData(row.id)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    console.error('删除失败:', error)
  }
}

// 批量删除按钮点击
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
        `确认要删除选中的 ${selectedRows.value.length} 个模板数据吗？`,
        '提示',
        {type: 'warning'}
    )
    const ids = selectedRows.value
      .map(row => row.id)
      .filter((id): id is string => Boolean(id))
    if (ids.length === 0) {
      ElMessage.warning('没有有效的模板ID')
      return
    }
    await batchDeleteTemplateData(ids)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    console.error('批量删除失败:', error)
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()

    await addTemplateData(form)
    ElMessage.success('保存成功')
    dialogVisible.value = false
    getList()
  } catch (error) {
    console.error('保存失败:', error)
  }
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

// 取消预览按钮点击
const handleCancelPreview = () => {
  previewVisible.value = false
  previewContent.value = ''
}

// 处理说明输入，保留中间和末尾的空格，只去除开头的空格
const handleDescriptionInput = (val: string) => {
  form.description = val.replace(/^\s+/, '')
}

onMounted(() => {
  getList()
  getEntityOptionList()
  getConfigOptionList()
})
</script>

<style lang="scss" scoped>
.template-data {
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

  .template-table {
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

  .markdown-preview-dialog {
    :deep(.el-dialog__body) {
      padding: 0;
    }
  }

  .preview-content {
    padding: 16px;
    background: #1e1e1e;

    :deep(.cm-editor) {
      height: 400px;
      cursor: default; // 使用默认光标

      .cm-scroller {
        font-family: 'Courier New', Courier, monospace;
        font-size: 14px;
      }

      .cm-gutters {
        border-right: 1px solid #333;
        background: #1e1e1e;
      }

      .cm-activeLineGutter {
        background-color: #2c313a;
      }

      // 禁用选择
      .cm-content {
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
      }

      // 隐藏光标
      .cm-cursor {
        display: none !important;
      }
    }
  }

  // 编辑对话框样式
  :deep(.template-dialog) {
    .el-dialog__body {
      padding: 0;
    }

    .dialog-content {
      display: flex;
      height: 600px;

      .left-panel {
        width: 400px;
        padding: 20px;
        border-right: 1px solid #dcdfe6;
        overflow-y: auto;

        .template-form {
          .el-form-item {
            margin-bottom: 18px;

            &:last-child {
              margin-bottom: 0;
            }

            .w-full {
              width: 100%;
            }
          }
        }
      }

      .right-panel {
        flex: 1;
        display: flex;
        flex-direction: column;
        background-color: #f5f7fa;

        .panel-header {
          padding: 12px 20px;
          border-bottom: 1px solid #dcdfe6;
          background-color: #fff;

          .panel-title {
            font-size: 14px;
            font-weight: 500;
            color: #303133;
          }
        }

        .editor-wrapper {
          flex: 1;
          padding: 20px;
          overflow: hidden;

          :deep(.cm-editor) {
            height: 100%;
            border-radius: 4px;
            border: 1px solid #dcdfe6;
          }

          :deep(.cm-scroller) {
            font-family: Consolas, Monaco, 'Courier New', monospace;
          }
        }
      }
    }

    .dialog-footer {
      padding: 10px 20px;
      text-align: right;
      border-top: 1px solid #dcdfe6;
    }
  }
}
</style>
