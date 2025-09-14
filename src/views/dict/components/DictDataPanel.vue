<template>
  <div class="dict-data-panel">
    <!-- 搜索表单 -->
    <el-form :model="searchForm" inline>
      <el-form-item label="字典标签">
        <el-input
            v-model="searchForm.dictLabel"
            placeholder="请输入字典标签"
            clearable
            @keyup.enter="handleSearch"
        />
      </el-form-item>
      <el-form-item>
        <el-tooltip content="搜索" placement="top">
          <el-button type="primary" @click="handleSearch">
            <el-icon>
              <Search/>
            </el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="重置" placement="top">
          <el-button @click="handleReset">
            <el-icon>
              <Refresh/>
            </el-icon>

          </el-button>
        </el-tooltip>
        <el-tooltip content="新增字典数据" placement="top" offset="8">
          <el-button type="success" @click="handleAdd">
            <el-icon>
              <Plus/>
            </el-icon>

          </el-button>
        </el-tooltip>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->

    <!-- 数据表格 -->
    <el-table
        v-loading="dictStore.loading"
        :data="dictStore.dictDataList"
        @selection-change="handleSelectionChange"
        :highlight-current-row="true"
        stripe
    >
      <el-table-column label="字典排序" prop="dictSort" width="100" align="center"/>
      <el-table-column label="数据标签" prop="dictLabel" min-width="100" show-overflow-tooltip>
      </el-table-column>
      <el-table-column label="数据名称" prop="dictName" min-width="100" show-overflow-tooltip>
      </el-table-column>
      <el-table-column label="字典键值" prop="dictValue" show-overflow-tooltip/>
      <el-table-column label="启用" align="center" width="100">
        <template #default="{ row }">
          <el-switch
              v-model="row.disabled"
              :active-value="'0'"
              :inactive-value="'1'"
              @change="handledisabledChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" @click="handleEdit(row)">
                <el-icon>
                  <Edit/>
                </el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="danger" @click="handleDelete(row)">
                <el-icon>
                  <Delete/>
                </el-icon>
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
          :total="dictStore.dictDataTotal"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>

    <!-- 表单弹窗 -->
    <DictDataForm
        v-model="showForm"
        :form-data="formData"
        @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, watch} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {useDictStore} from '@/stores/dict'
import type {SysDictData, SysDictDataParams} from '@/api/dict/data'
// @ts-ignore
import DictDataForm from './DictDataForm.vue'

const dictStore = useDictStore()

// 搜索表单
const searchForm = reactive<Omit<SysDictDataParams, 'pageNum' | 'pageSize'>>({
  dictLabel: '',
  dictValue: undefined
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
const formData = ref<Partial<SysDictData>>({})

// 加载数据
const loadData = () => {
  if (!dictStore.currentDictType) return

  dictStore.loadDictDataList({
    pageNum: pagination.pageNum,
    pageSize: pagination.pageSize,
    dictLabel: searchForm.dictLabel,
    dictValue: searchForm.dictValue
  })
}

// 监听当前字典类型变化
watch(() => dictStore.currentDictType, () => {
  pagination.pageNum = 1
  loadData()
})

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1
  loadData()
}

// 重置
const handleReset = () => {
  searchForm.dictLabel = ''
  searchForm.dictValue = undefined
  pagination.pageNum = 1
  loadData()
}

// 新增
const handleAdd = () => {
  // 重置表单数据，只保留必要的初始值
  formData.value = {
    dictType: dictStore.currentDictType!,
    disabled: '0',
    dictSort: 0,
    isDefault: 'N'
  }
  showForm.value = true
}

// 修改
const handleEdit = (row: SysDictData) => {
  formData.value = {...row}
  showForm.value = true
}

// 删除
const handleDelete = async (row: SysDictData) => {
  try {
    await ElMessageBox.confirm('确认要删除该字典数据吗？', '提示', {
      type: 'warning'
    })
    await dictStore.deleteDictData(row.dictCode!)
    ElMessage.success('删除成功')
    loadData()
  } catch (err: any) {
    // 根据异常处理优化规范，优先显示服务端返回的错误提示
    if (err && err.message) {
      ElMessage.error(err.message)
    } else {
      ElMessage.error('删除失败')
    }
  }
}


// 状态变更
const handledisabledChange = async (row: SysDictData) => {
  try {
    await dictStore.updateDictData(row)
    ElMessage.success('修改成功')
  } catch (err) {
    ElMessage.error('修改失败')
    // 还原状态
    row.disabled = row.disabled === '0' ? '1' : '0'
  }
}

// 表格选择
const handleSelectionChange = (selection: SysDictData[]) => {
  selectedIds.value = selection.map(item => item.dictCode!)
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
  // 清空表单数据
  formData.value = {}
  loadData()
}
</script>

<style lang="scss" scoped>
.dict-data-panel {
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
