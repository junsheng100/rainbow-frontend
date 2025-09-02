<template>
  <el-dialog
    :model-value="visible"
    title="选择接口"
    width="1000px"
    :before-close="handleClose"
    destroy-on-close
  >
    <div class="interface-selector">
      <!-- 左侧菜单列表 -->
      <div class="menu-panel" style="width: 60%;">
        <div class="panel-header">
          <h4>接口类目</h4>
        </div>
        <!-- 添加搜索框 -->
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="请输入关键词搜索"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button icon="Search" @click="handleSearch" />
            </template>
          </el-input>
        </div>
        <el-table
          v-loading="loading"
          :data="menuList"
          @row-click="handleMenuSelect"
          highlight-current-row
          :height="400"
          stripe
          :border="false"
          class="no-border-table"
        >
          <el-table-column  label="序号" type="index"  width="60">
            <template #default="{ $index }">
              {{ (pagination.pageNum - 1) * pagination.pageSize + $index + 1 }}
            </template>
          </el-table-column>
          <el-table-column prop="description" label="菜单名称" width="150" />
          <el-table-column prop="requestUrl" label="基础路径" min-width="180" show-overflow-tooltip />
        </el-table>
      </div>

      <!-- 右侧接口列表 -->
      <div class="interface-panel">
        <div class="panel-header">
          <h4>接口列表</h4>
          <span v-if="selectedMenu" class="selected-menu">当前选择: {{ selectedMenu.description }}</span>
        </div>
        <el-table
          v-loading="loading"
          :data="currentInterfaces"
          @row-click="handleInterfaceSelect"
          highlight-current-row
          :height="400"
          :border="false"
          class="no-border-table"
        >
          <el-table-column prop="description" label="序号" width="80"  >
            <template #default="{ $index }">
              {{ $index + 1 }}
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" width="120" show-overflow-tooltip />
           <el-table-column prop="requestMethod" label="请求方法" width="100">
            <template #default="{ row }">
              <el-tag :type="getMethodTagType(row.requestMethod)">
                {{ row.requestMethod }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="requestUrl" label="URI"  min-width="150" />
        </el-table>
      </div>
    </div>

    <!-- 将分页组件移到 dialog-footer 区域 -->
    <template #footer>
      <div class="dialog-footer">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 20, 50, 100]"
          background
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
          style="flex: 1"
        />
        <div>
          <el-button @click="handleClose">取消</el-button>
          <el-button
            type="primary"
            @click="handleConfirm"
            :disabled="!selectedInterface"
          >
            确认选择
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {getMenuInterfaces} from '@/api/appdoc/category.ts'
import {MenuInterface ,InterfaceModel} from "@/types/appdoc.ts";
// import Template from "@/router/modules/template.ts";

// Props
interface Props {
  visible: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean]
  'select': [data: { baseUrl: string; interface: InterfaceModel }]
}>()

// 响应式数据
const loading = ref(false)
const menuList = ref<MenuInterface[]>([])
const selectedMenu = ref<MenuInterface | null>(null)
const selectedInterface = ref<InterfaceModel | null>(null)
// 添加搜索关键词和分页数据
const searchKeyword = ref('')
const pagination = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0
})
// 计算属性
const currentInterfaces = computed(() => {
  if (!selectedMenu.value) {
    return []
  }
  return selectedMenu.value.interfaceModelList || []
})

// 方法
const getMethodTagType = (method: string) => {
  const methodMap: Record<string, string> = {
    'GET': 'success',
    'POST': 'primary',
    'PUT': 'warning',
    'DELETE': 'danger',
    'PATCH': 'info'
  }
  return methodMap[method] || 'info'
}

const loadData = async () => {
  try {
    loading.value = true
    // 调用带分页参数的接口
    const params = {
      pageNum: pagination.value.pageNum,
      pageSize: pagination.value.pageSize,
      simpleName: searchKeyword.value || undefined
    }
    const res = await getMenuInterfaces(params)
    menuList.value = res.content || []
    pagination.value.total = res.total || 0

    // 默认选择第一个菜单
    if (res.content.length > 0) {
      selectedMenu.value = res.content[0]
    }
  } catch (error) {
    ElMessage.warning('没有查询到接口数据')
    console.warn('没有查询到接口数据:', error)
  } finally {
    loading.value = false
  }
}

// 添加搜索处理方法
const handleSearch = () => {
  pagination.value.pageNum = 1
  loadData()
}

// 添加分页处理方法
const handlePageChange = (pageNum: number) => {
  pagination.value.pageNum = pageNum
  loadData()
}

const handleSizeChange = (pageSize: number) => {
  pagination.value.pageSize = pageSize
  pagination.value.pageNum = 1
  loadData()
}

const handleMenuSelect = (row: MenuInterface) => {
  selectedMenu.value = row
  selectedInterface.value = null // 清空之前选择的接口
}

const handleInterfaceSelect = (row: InterfaceModel) => {
  selectedInterface.value = row
}

const handleConfirm = () => {
  if (!selectedMenu.value || !selectedInterface.value) {
    ElMessage.warning('请先选择接口')
    return
  }

  emit('select', {
    baseUrl: selectedMenu.value.requestUrl,
    interface: selectedInterface.value
  })

  handleClose()
}

const handleClose = () => {
  emit('update:visible', false)
  // 重置选择状态
  selectedMenu.value = null
  selectedInterface.value = null
  // 重置搜索关键词
  searchKeyword.value = ''
  // 重置分页
  pagination.value.pageNum = 1
  pagination.value.pageSize = 10
}

// 监听visible变化，当弹窗打开时加载数据
watch(() => props.visible, (newVal) => {
  if (newVal) {
    loadData()
  }
})

// 组件挂载时如果弹窗已打开则加载数据
onMounted(() => {
  if (props.visible) {
    loadData()
  }
})
</script>

<style scoped>
.interface-selector {
  display: flex;
  gap: 20px;
  height: 400px;
}

.menu-panel,
.interface-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.menu-panel {
  border-right: 1px solid #e4e7ed;
  padding-right: 10px;
}

.interface-panel {
  padding-left: 10px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 0 10px;
}

.panel-header h4 {
  margin: 0;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.selected-menu {
  font-size: 12px;
  color: #909399;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 4px;
}

/* 添加搜索框样式 */
.search-box {
  margin-bottom: 10px;
}

.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

:deep(.no-border-table) {
  border: none;
}

:deep(.no-border-table .el-table__inner-wrapper::before) {
  height: 0;
}

:deep(.no-border-table .el-table__cell) {
  border: none;
}

:deep(.el-table__header) {
  background-color: #fafafa;
}

:deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}

:deep(.el-table__row.current-row) {
  background-color: #ecf5ff;
}

/* 添加分页样式 */
:deep(.el-pagination) {
  white-space: nowrap;
}
</style>
