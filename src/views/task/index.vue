<template>
  <!-- ... existing code ... -->
  <div class="task-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" class="search-form">
      <el-row :gutter="24">
        <el-col :span="24">
          <div class="search-item" style="float: left">
            <el-form-item label="任务名称" prop="taskName">
              <el-input
                  v-model="queryParams.taskName"
                  placeholder="请输入任务名称"
                  clearable
                  style="width: 200px"
                  @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="运行状态" prop="runStatus">
              <el-select
                  v-model="queryParams.runStatus"
                  placeholder="运行状态"
                  clearable
                  style="width: 100px"
              >
                <el-option label="待运行" :value="0"/>
                <el-option label="运行中" :value="1"/>
              </el-select>
            </el-form-item>
            <el-form-item label="可用状态" prop="disabled">
              <el-select
                  v-model="queryParams.disabled"
                  placeholder="可用状态"
                  clearable
                  style="width: 100px"
              >
                <el-option label="启用" :value="0"/>
                <el-option label="禁用" :value="1"/>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </div>
          <div class="search-item" style="float: right">
            <el-button
                type="primary"
                plain
                icon="Plus"
                @click="handleAdd"
            >
              新增
            </el-button>
          </div>
        </el-col>
      </el-row>
    </el-form>


    <el-table v-loading="loading" :data="taskList" @selection-change="handleSelectionChange">
      <el-table-column label="任务名称" align="center" prop="taskName" :show-overflow-tooltip="true"/>
      <el-table-column label="实例名称" align="center" prop="beanName" :show-overflow-tooltip="true"/>
      <el-table-column label="方法名称" align="center" prop="methodName" :show-overflow-tooltip="true"/>
      <el-table-column label="Cron表达式" align="center" prop="cronExpression" :show-overflow-tooltip="true"/>
      <el-table-column label="运行状态" align="center" prop="runStatus">
        <template #default="scope">
          <el-tag :type="scope.row.runStatus === 1 ? 'success' : 'info'">
            {{ scope.row.runStatus === 1 ? '运行中' : '待运行' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="可用状态" align="center" prop="disabled">
        <template #default="scope">
          <el-switch
              v-model="scope.row.disabled"
              :active-value="0"
              :inactive-value="1"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="显示顺序" align="center" prop="orderNum"/>

      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
              type="primary"
              icon="Edit"
              circle
              @click="handleUpdate(scope.row)"
              v-hasPermi="['task:config:edit']"
          />
          <el-button
              type="danger"
              icon="Delete"
              circle
              @click="handleDelete(scope.row)"
              v-hasPermi="['task:config:remove']"
          />
        </template>
      </el-table-column>
    </el-table>


    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>


    <!-- 添加或修改任务配置对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="taskRef" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="任务名称" prop="taskName">
              <el-input v-model="form.taskName" placeholder="请输入任务名称"/>
            </el-form-item>
          </el-col>
                      <el-col :span="12">
              <el-form-item label="Cron表达式" prop="cronExpression">
                <div class="cron-input-wrapper">
                  <el-input
                    v-model="form.cronExpression"
                    placeholder="请输入Cron表达式"
                    readonly
                    @click="showCronDialog = true"
                  >
                    <template #append>
                      <el-button @click="showCronDialog = true" type="primary" :icon="Edit">
                        配置
                      </el-button>
                    </template>
                  </el-input>
                </div>
              </el-form-item>
            </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="实例名称" prop="beanName">
              <el-input v-model="form.beanName" placeholder="请输入实例名称"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="方法名称" prop="methodName">
              <el-input v-model="form.methodName" placeholder="请输入方法名称"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="可用状态">
              <el-radio-group v-model="form.disabled">
                <el-radio :label="0">启用</el-radio>
                <el-radio :label="1">禁用</el-radio>
              </el-radio-group>
            </el-form-item>

          </el-col>
          <el-col :span="12">
            <el-form-item label="显示顺序" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="任务参数">
              <el-button type="primary" @click="addParam">添加参数</el-button>
              <el-table :data="form.params" style="margin-top: 10px" :border="false">
                <el-table-column label="参数值" width="400">
                  <template #default="scope">
                    <el-input type="textarea" v-model="scope.row.params" placeholder="请输入参数值"/>
                  </template>
                </el-table-column>
                <el-table-column label="显示顺序" width="150">
                  <template #default="scope">
                    <el-input-number v-model="scope.row.orderNum" controls-position="right" :min="1"/>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100">
                  <template #default="scope">
                    <el-button type="danger" @click="removeParam(scope.$index)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Cron表达式配置对话框 -->
    <el-dialog
      title="Cron表达式配置"
      v-model="showCronDialog"
      width="800px"
      append-to-body
      :close-on-click-modal="false"
    >
      <CronExpression
        v-model="form.cronExpression"
        @change="handleCronChange"
      />
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="showCronDialog = false">确 定</el-button>
          <el-button @click="showCronDialog = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted, toRefs} from 'vue'
import {ElForm, ElMessage, ElMessageBox} from 'element-plus'
import {Edit} from '@element-plus/icons-vue'
// @ts-ignore
import CronExpression from '@/components/CronExpression/index.vue'
import { useUserStore } from '@/stores/user'
import {
  getTaskList,
  getTaskById,
  addTask,
  updateTask,
  deleteTask,
  getTaskParams,
  updateTaskParams
} from '@/api/task/config'
import {TaskConfig, TaskConfigParams} from '@/types/task'

const loading = ref(true)
const showSearch = ref(true)
const ids = ref<Array<string>>([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')
const open = ref(false)
const showCronDialog = ref(false)
const taskList = ref<Array<TaskConfig>>([])
const taskParams = ref<Array<TaskConfigParams>>([])

// 用户store
const userStore = useUserStore()


// 分页数据
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})


const data = reactive({
  form: {} as TaskConfig,
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    taskName: undefined,
    runStatus: undefined,
    disabled: undefined
  },
  rules: {
    taskName: [{required: true, message: '任务名称不能为空', trigger: 'blur'}],
    beanName: [{required: true, message: '实例名称不能为空', trigger: 'blur'}],
    cronExpression: [{required: true, message: 'Cron表达式不能为空', trigger: 'blur'}],
    orderNum: [{required: true, message: '显示顺序不能为空', trigger: 'blur'}]
  }
})

const {queryParams, form, rules} = toRefs(data)

const queryRef = ref(ElForm)
const taskRef = ref(ElForm)


/** 查询任务列表 */
function getList() {
  loading.value = true
  getTaskList(queryParams.value).then(response => {
    taskList.value = response.content
    total.value = response.total
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

// 当前页改变
const handleCurrentChange = (val: number) => {
  pagination.current = val
  getList()
}

// 分页大小改变
const handleSizeChange = (val: number) => {
  pagination.size = val
  pagination.current = 1
  getList()
}


/** 参照岗位管理页面，添加状态切换处理函数 */
function handleStatusChange(row: TaskConfig) {
  let text = row.disabled === 0 ? "启用" : "禁用"
  ElMessageBox.confirm('确认要"' + text + '""' + row.taskName + '"任务吗？', "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(function () {
    return updateTask(row)
  }).then(() => {
    ElMessage.success(text + "成功")
  }).catch(function () {
    row.disabled = row.disabled === 0 ? 1 : 0
  })
}

/** 查询 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置 */
function resetQuery() {
  queryRef.value.resetFields()
  handleQuery()
}

/** 多选框选中数据 */
function handleSelectionChange(selection: Array<TaskConfig>) {
  ids.value = selection.map(item => item.id).filter((id): id is string => id !== undefined)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
 reset()
  open.value = true
  title.value = '添加任务配置'
}

/** 修改按钮操作 */
function handleUpdate(row?: TaskConfig) {
  reset()
  const id = row?.id || ids.value[0]
  if (!id) return
  getTaskById(id).then(response => {
    form.value = response
    title.value = '修改任务配置'
    open.value = true
  })
  getTaskParams(id).then((response: TaskConfigParams[]) => {
    taskParams.value = response || []
  })
}

/** 提交表单 */
function submitForm() {
  taskRef.value.validate((valid: boolean) => {
    if (valid) {
      form.value.params = taskParams.value;

      console.log("##### TaskConfig:",JSON.stringify(form))

      if (form.value.id) {
        updateTask(form.value).then(() => {
          ElMessage.success('修改成功')
          open.value = false
          getList()
        }).catch((error: unknown) => {
          console.error('修改任务失败:', error)
          ElMessage.error(error instanceof Error ? error.message : '修改失败')
        })
      } else {
        addTask(form.value).then((response: TaskConfig) => {
          const configId = response.id
          // 保存参数
          if (taskParams.value.length > 0 && configId) {
            taskParams.value.forEach(param => {
              param.configId = configId
            })
            updateTaskParams(configId, taskParams.value).catch((error: unknown) => {
              console.error('保存任务参数失败:', error)
              ElMessage.error('任务创建成功，但参数保存失败')
            })
          }
          ElMessage.success('新增成功')
          open.value = false
          getList()
        }).catch((error: unknown) => {
          console.error('新增任务失败:', error)
          ElMessage.error(error instanceof Error ? error.message : '新增失败')
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row?: TaskConfig) {
  const deleteIds = row?.id ? [row.id] : ids.value.filter(id => id !== undefined)
  const runningTasks = row ? (row.runStatus === 1 ? [row.taskName] : []) :
      taskList.value.filter(task => task.id && deleteIds.includes(task.id) && task.runStatus === 1)
          .map(task => task.taskName)

  if (runningTasks.length > 0) {
    ElMessageBox.alert(`任务"${runningTasks.join(', ')}"正在运行中，无法删除！`, '提示', {
      type: 'warning'
    })
    return
  }

  ElMessageBox.confirm('是否确认删除选中的数据项？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return deleteTask(deleteIds.filter(id => id !== undefined).join(','))
  }).then(() => {
    getList()
    ElMessage.success('删除成功')
  })
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 表单重置 */
function reset() {
  form.value = {
    id: undefined,
    taskName: '',
    beanName: '',
    methodName: '',
    cronExpression: '',
    disabled: 0,
    runStatus: 0,
    orderNum: 0
  }
  // taskParams.value = []
  // taskRef.value?.resetFields()
}

/** 添加参数 */
function addParam() {
  taskParams.value.push({
    params: '',
    orderNum: taskParams.value.length+1
  })
}

/** 删除参数 */
function removeParam(index: number) {
  taskParams.value.splice(index, 1)
}

/** Cron表达式变化处理 */
function handleCronChange(value: string) {
  form.value.cronExpression = value
}

onMounted(() => {
  // 确保用户权限信息已加载
  if (!userStore.permissions.length) {
    userStore.getUserInfo().then(() => {
      console.log('调度页面 - 用户权限已加载:', userStore.permissions)
      getList()
    }).catch(() => {
      getList()
    })
  } else {
    console.log('调度页面 - 用户权限已存在:', userStore.permissions)
    getList()
  }
})

</script>


<style lang="scss" scoped>
.task-container {
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
  }
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.cron-input-wrapper {
  .el-input-group__append {
    padding: 0;

    .el-button {
      border: none;
      border-radius: 0;
      margin: 0;
      height: 100%;
    }
  }
}
</style>
