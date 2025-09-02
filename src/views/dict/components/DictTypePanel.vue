<template>
  <div class="dict-type-panel">
    <!-- 搜索表单 -->
    <el-form :model="searchForm" inline>
      <el-form-item>

          <el-form-item prop="dictName" label="字典名称" >
          <el-input
            v-model="searchForm.dictName"
            placeholder="请输入字典名称"
            clearable
            @keyup.enter="handleSearch"
          />
          </el-form-item>

          <el-tooltip content="搜索" placement="top">
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="重置" placement="top">
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>

            </el-button>
          </el-tooltip>
          <el-tooltip content="新增字典类型" placement="top">
            <el-button type="success" @click="handleAdd">
              <el-icon><Plus /></el-icon>

            </el-button>
          </el-tooltip>

      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table
      v-loading="dictStore.loading"
      :data="dictStore.dictTypeList"
      @selection-change="handleSelectionChange"
      @row-click="handleRowClick"
      stripe
      :highlight-current-row="true"
    >
      <el-table-column label="字典名称" prop="dictName" show-overflow-tooltip />
      <el-table-column label="字典类型" prop="dictType" show-overflow-tooltip />
      <el-table-column label="启用" align="center" width="100">
        <template #default="{ row }">
          <el-switch
            v-model="row.disabled"
            :active-value="'0'"
            :inactive-value="'1'"
            @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="remark" show-overflow-tooltip />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" @click.stop="handleEdit(row)">
                <el-icon><Edit /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="danger" @click.stop="handleDelete(row)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :total="dictStore.dictTypeTotal"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 表单弹窗 -->
    <DictTypeForm
      v-model="showForm"
      :form-data="formData"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Delete,
  Edit,
  Plus
} from '@element-plus/icons-vue'
import { useDictStore } from '@/stores/dict'
import type { SysDictType } from '@/api/dict/type'
import DictTypeForm from './DictTypeForm.vue'

const dictStore = useDictStore()

// 搜索表单
const searchForm = reactive({
  dictName: '',
  dictType: ''
})


// 分页参数
const pagination = reactive({
  pageNum: 1,
  pageSize: 10
})

// 选中的行
const selectedIds = ref<number[]>([])

// 表单相关
const showForm = ref(false)
const formData = ref<Partial<SysDictType>>({})

// 加载数据
const loadData = () => {
  dictStore.loadDictTypeList({
    pageNum: pagination.pageNum,
    pageSize: pagination.pageSize,
    dictName: searchForm.dictName,
    dictType: searchForm.dictType
  }).then(() => {
    // 如果有数据且没有选中的字典类型，自动选中第一行
    if (dictStore.dictTypeList.length > 0 && !dictStore.currentDictType) {
      handleRowClick(dictStore.dictTypeList[0])
    }
  })
}

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1
  loadData()
}

// 重置
const handleReset = () => {
  searchForm.dictName = ''
  searchForm.dictType = ''
  pagination.pageNum = 1
  loadData()
}

// 新增
const handleAdd = () => {
  formData.value = {}
  showForm.value = true
}

// 修改
const handleEdit = (row: SysDictType) => {
  formData.value = { ...row }
  showForm.value = true
}

// 删除
const handleDelete = async (row: SysDictType) => {
  try {
    await ElMessageBox.confirm('确认要删除该字典类型吗？', '提示', {
      type: 'warning'
    })
    await dictStore.deleteDictType(row.dictId!)
    ElMessage.success('删除成功')
    loadData()
  } catch (err: any) {
    // 根据异常处理优化规范，优先显示服务端返回的错误提示
    if (err && err.response && err.response.data && err.response.data.msg) {
      ElMessage.error(err.response.data.msg)
    } else if (err && err.message) {
      ElMessage.error(err.message)
    } else {
      ElMessage.error('删除失败')
    }
  }
}

// 状态变更
const handleStatusChange = async (row: SysDictType) => {
  try {
    await dictStore.updateDictType(row)
    ElMessage.success('修改成功')
    // 如果是当前选中的字典类型，则刷新字典数据
    if (row.dictType === dictStore.currentDictType) {
      dictStore.refreshDictData()
    }
  } catch (err) {
    ElMessage.error('修改失败')
    // 还原状态
    row.disabled = row.disabled === '0' ? '1' : '0'
  }
}

// 表格选择
const handleSelectionChange = (selection: SysDictType[]) => {
  selectedIds.value = selection.map(item => item.dictId!)
}

// 行点击
const handleRowClick = (row: SysDictType) => {
  dictStore.setCurrentDictType(row.dictType)
}

// 分页大小改变
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  pagination.pageNum = 1
  loadData()
}

// 页码改变
const handleCurrentChange = (val: number) => {
  pagination.pageNum = val
  loadData()
}

// 表单提交成功
const handleFormSuccess = () => {
  showForm.value = false
  loadData()
  // 如果修改的是当前选中的字典类型，则刷新字典数据
  if (formData.value?.dictType === dictStore.currentDictType) {
    dictStore.refreshDictData()
  }
}

// 初始化
onMounted(() => {
  loadData()
})

// 暴露方法供父组件调用
defineExpose({
  handleAdd
})
</script>

<style lang="scss" scoped>
.dict-type-panel {
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

  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 8px;
  }

  .pagination-container {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
