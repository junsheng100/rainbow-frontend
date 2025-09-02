<template>
  <div class="template-config">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" class="search-form">
      <el-row :gutter="24">
        <el-col :span="24">
          <div class="search-item" style="float: left">
            <el-form-item prop="name">
              <el-input
                v-model="queryParams.name"
                placeholder="搜索模板"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleQuery">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button @click="resetQuery">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </div>
          <div class="search-item" style="float: right">
            <el-form-item>
              <el-button type="success" @click="handleAdd">
                <el-icon><Plus /></el-icon>
                新增
              </el-button>
              <el-button
                type="danger"
                :disabled="selectedRows.length === 0"
                @click="handleBatchDelete"
              >
                <el-icon><Delete /></el-icon>
                批量删除
              </el-button>
            </el-form-item>
          </div>
        </el-col>
      </el-row>
    </el-form>

    <!-- 表格 -->
    <el-table
      v-loading="loading"
      :data="tableData"
      class="template-table"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" width="80" align="center">
        <template #default="scope">
          {{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="模板名称" prop="name" show-overflow-tooltip />
      <el-table-column label="文件类型" prop="suffix" show-overflow-tooltip />
      <el-table-column label="是否实例" prop="isEntity" width="100">
        <template #default="{ row }">
          <el-tag :type="row.isEntity ? 'success' : 'info'">
            {{ row.isEntity ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="说明" prop="description" show-overflow-tooltip />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handlePreview(row)">
            预览
          </el-button>
          <el-button link type="primary" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button link type="danger" @click="handleDelete(row)">
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
      width="80%"
      class="template-dialog"
      destroy-on-close
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
            <el-form-item label="模板名称" prop="name" required>
              <el-input v-model="form.name" placeholder="请输入模板名称" />
            </el-form-item>
            <el-form-item label="文件后缀名" prop="suffix" required>
              <el-input v-model="form.suffix" placeholder="请输入文件后缀名" />
            </el-form-item>
            <el-form-item label="是否实例" prop="isEntity">
              <el-switch v-model="form.isEntity" />
            </el-form-item>
            <el-form-item label="说明" prop="description">
              <el-input
                  v-model="form.description"
                  type="textarea"
                  :rows="2"
                  :autosize="{ minRows: 2, maxRows: 4 }"
                  placeholder="请输入说明"
                  resize="vertical"
                  show-word-limit
                  maxlength="255"
                  @input="(val) => form.description = val.replace(/^\s+/, '')"
              />
            </el-form-item>
            <el-form-item label="排序号" prop="orderNum">
              <el-input-number
                v-model="form.orderNum"
                :min="1"
                placeholder="请输入排序号"
                class="w-full"
                controls-position="right"
              />
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
              v-model="form.content"
              placeholder="请输入模板内容"
              :style="{ height: '100%' }"
              :autofocus="true"
              :indent-with-tab="true"
              :tab-size="2"
              :extensions="extensions"
              ref="editorRef"
            />
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 预览对话框 -->
    <el-dialog
      title="模板预览"
      v-model="previewVisible"
      width="800px"
      append-to-body
      class="preview-dialog"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
    >
      <div class="preview-content">
        <Codemirror
          v-model="previewContent"
          :style="{ height: '500px' }"
          :autofocus="false"
          :indent-with-tab="false"
          :extensions="previewExtensions"
          :readonly="true"
          @mousedown.prevent
          @keydown.prevent
        />
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Delete
} from '@element-plus/icons-vue'
import type { TemplateConfig, TemplateQueryParams } from '@/api/template/types'
import {
  getTemplateConfigList,
  deleteTemplateConfig,
  batchDeleteTemplateConfig,
  addTemplateConfig,
  updateTemplateConfig
} from '@/api/template'
import { Codemirror } from 'vue-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import { EditorState } from '@codemirror/state'

// 查询参数
const queryParams = reactive<TemplateQueryParams>({
  pageNum: 1,
  pageSize: 10,
  name: ''
})

// 表格数据
const loading = ref(false)
const tableData = ref<TemplateConfig[]>([])
const total = ref(0)
const selectedRows = ref<TemplateConfig[]>([])

// 表单数据
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()
const form = reactive<TemplateConfig>({
  id: '',
  name: '',
  content: '',
  suffix: '',
  isEntity: false,
  description: '',
  orderNum: 0
})

// 预览数据
const previewVisible = ref(false)
const previewContent = ref('')

// 表单校验规则
const rules = reactive<FormRules>({
  name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  suffix: [{ required: true, message: '请输入文件后缀名称', trigger: 'blur' }],
  content: [{ required: true, message: '请输入模板内容', trigger: 'blur' }]
})

// CodeMirror 配置
const extensions = [javascript(), oneDark]

// 预览用的 CodeMirror 配置
const previewExtensions = [
  javascript(),
  oneDark,
  EditorState.readOnly.of(true),
  EditorView.editable.of(false),
  EditorState.tabSize.of(2),
  EditorView.lineWrapping
]

// CodeMirror 编辑器实例
const editorRef = ref()

// 获取列表
const getList = async () => {
  loading.value = true
  try {
    const res = await getTemplateConfigList(queryParams)
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
const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
}

// 新增按钮点击
const handleAdd = () => {
  dialogTitle.value = '新增模板'
  Object.assign(form, {
    id: '',
    name: '',
    content: '',
    suffix: '',
    description: '',
    orderNum: 0
  })
  dialogVisible.value = true
}

// 编辑按钮点击
const handleEdit = (row: any) => {
  dialogTitle.value = '编辑模板'
  // 先重置表单数据
  Object.assign(form, {
    id: '',
    name: '',
    content: '',
    isEntity: false,
    suffix: '',
    description: '',
    orderNum: 0
  })
  // 再设置新的数据
  Object.assign(form, row)
  dialogVisible.value = true
}

// 预览按钮点击
const handlePreview = (row: any) => {
  previewContent.value = row.content
  previewVisible.value = true
}

// 删除按钮点击
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确认要删除该模板吗？', '提示', {
      type: 'warning'
    })
    await deleteTemplateConfig(row.id)
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
      `确认要删除选中的 ${selectedRows.value.length} 个模板吗？`,
      '提示',
      { type: 'warning' }
    )
    const ids = selectedRows.value.map(row => row.id)
    await batchDeleteTemplateConfig(ids)
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
    if (form.id) {
      await updateTemplateConfig(form)
    } else {
      await addTemplateConfig(form)
    }
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

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.template-config {
  padding: 10px 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;

  .search-form {
    background-color: #fff;
    padding: 20px;
    margin-bottom: 15px;
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

    .search-item {
      display: flex;
      align-items: center;

      .el-form-item {
        margin-bottom: 0;
        margin-right: 10px;

        &:last-child {
          margin-right: 0;
        }
      }
    }
  }

  .toolbar {
    margin: 10px 0;
  }

  .template-table {
    margin-top: 15px;
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

  .preview-content {
    max-height: 500px;
    overflow-y: auto;

    pre {
      margin: 0;
      padding: 10px;
      background: #f5f7fa;
      border-radius: 4px;
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

.preview-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.preview-content {
  padding: 16px;
  background: #1e1e1e;

  :deep(.cm-editor) {
    height: 500px;
    cursor: default;

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

    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    &::-webkit-scrollbar-thumb {
      background: #424242;
      border-radius: 4px;

      &:hover {
        background: #505050;
      }
    }

    &::-webkit-scrollbar-track {
      background: #2d2d2d;
      border-radius: 4px;
    }
  }
}
</style>
