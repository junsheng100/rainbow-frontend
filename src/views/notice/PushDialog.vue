<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="emit('update:visible', $event)"
    :title="title"
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
      <el-form-item label="公告标题" prop="noticeTitle">
        <el-input v-model="form.noticeTitle" disabled />
      </el-form-item>
      <el-form-item label="推送方式" prop="pushTimeType">
        <el-select v-model="form.pushTimeType" placeholder="请选择推送方式">
          <el-option label="立即推送" value="0" />
          <el-option label="延迟推送" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="推送时间" prop="pushTime" v-if="form.pushTimeType === '1'">
        <el-date-picker
          v-model="form.pushTime"
          type="datetime"
          placeholder="选择推送时间"
          style="width: 100%"
          :disabled-date="disabledDate"
          :disabled-time="disabledTime"
        />
      </el-form-item>
      <el-form-item label="推送类型" prop="pushType">
        <el-select v-model="form.pushType" placeholder="请选择推送类型">
          <el-option label="全部推送" value="0" />
          <el-option label="推送到部门以及下属部门" value="1" />
          <el-option label="推送到本部门" value="2" />
        </el-select>
      </el-form-item>

      <el-form-item label="推送部门" prop="deptIds">
        <el-tree-select
          v-model="form.deptIds"
          :data="departmentOptions"
          :props="{ label: 'deptName', value: 'deptId', children: 'children' }"
          multiple
          filterable
          placeholder="请选择推送部门"
          check-strictly
          clearable
          style="width: 100%"
          @select="handleSelectUser"
          :disabled="form.pushType === '0'"
        />
      </el-form-item>
      <el-form-item label="推送人员" prop="users">
        <el-select
          v-model="form.userIds"
          multiple
          filterable
          remote
          reserve-keyword
          placeholder="请输入关键词搜索人员"
          :remote-method="searchUsers"
          :loading="usersLoading"
          style="width: 100%"
          :searchable="false"
          :disabled="form.pushType === '0'"
        >
          <el-option
            v-for="item in userOptions"
            :key="item.userId"
            :label="item.nickname"
            :value="item.userId"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, PropType, defineEmits, defineProps, watch, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { formatDate } from '@/utils/date'
import {DeptInfo, DeptUserInfo, getDeptSelectList, getDeptUserList} from '@/api/system/dept.ts'
import { listUser } from '@/api/users/user.ts'
import {UserInfo} from "@/types/user.ts";

// 定义接口
export interface PushFormData {
  noticeId: number;
  noticeTitle: string;
  pushTimeType: '0' | '1'; // 推送方式：0:immediate-立即推送/ 1:delayed-延迟推送
  pushTime: Date | null;
  pushType: string;
  deptIds: number[];
  userIds: string[];
}

// 定义提交数据的接口
interface PushSubmitData extends Omit<PushFormData, 'pushTime'> {
  pushTime: string; // 提交时转换为字符串格式
}


// 定义属性
const props = defineProps({
  // 是否显示弹窗
  visible: {
    type: Boolean,
    default: false
  },
  // 弹窗标题
  title: {
    type: String,
    default: '推送设置'
  },
  // 表单数据
  formData: {
    type: Object as PropType<PushFormData>,
    required: true
  }
})

// 定义事件
const emit = defineEmits(['update:visible', 'submit', 'cancel'])

// 表单引用
const formRef = ref<FormInstance>()

// 表单数据
const form = reactive<PushFormData>({
  noticeId: 0,
  noticeTitle: '',
  pushTimeType: '0', // 默认立即推送
  pushTime: null,
  pushType: '0', // 默认全部推送
  deptIds: [],
  userIds: []
})

// 禁用当前日期之前的日期
const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 8.64e7 // 禁用今天之前的日期
}

// 禁用当前时间之前的时间
const disabledTime = (date: Date) => {
  const now = new Date()
  const isToday = new Date(date).toDateString() === now.toDateString()

  if (isToday) {
    return {
      hours: () => Array.from({ length: now.getHours() }, (_, i) => i),
      minutes: (hour: number) => {
        if (hour === now.getHours()) {
          return Array.from({ length: now.getMinutes() }, (_, i) => i)
        }
        return []
      }
    }
  }
  return {
    hours: () => [],
    minutes: () => []
  }
}

// 部门选项
const departmentOptions = ref<DeptInfo[]>([])
const deptIdsLoading = ref(false)

// 用户选项
const userOptions = ref<UserInfo[]>([])
const usersLoading = ref(false)

// 表单验证规则
const rules = reactive<FormRules>({
  pushTimeType: [
    { required: true, message: '请选择推送方式', trigger: 'change' }
  ],
  pushTime: [
    {
      required: true,
      message: '请选择推送时间',
      trigger: 'change',
      validator: (_rule, value, callback) => {
        if (form.pushTimeType === '1') {
          if (!value) {
            callback(new Error('请选择推送时间'))
          } else if (new Date(value) <= new Date()) {
            callback(new Error('推送时间不能早于当前时间'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      }
    }
  ],
  pushType: [
    { required: true, message: '请选择推送类型', trigger: 'change' }
  ]
})

// 监听表单数据变化
watch(
  () => props.formData,
  (newVal) => {
    if (newVal) {
      Object.assign(form, newVal)
    }
  },
  { deep: true, immediate: true }
)

// 将部门列表转换为树形结构
const buildDeptTree = (depts: DeptInfo[], parentId:  number | null = null): DeptInfo[] => {
  const tree: DeptInfo[] = []

  depts.forEach(dept => {
    if ((parentId === null && !dept.parentId) || dept.parentId === parentId) {
      const children = buildDeptTree(depts, dept.deptId)
      if (children.length > 0) {
        dept.children = children
      }
      tree.push(dept)
    }
  })

  return tree
}

// 加载部门数据
const loaddeptIds = async () => {
  deptIdsLoading.value = true
  try {
    const res = await getDeptSelectList()
    const deptList = res || []
    departmentOptions.value = buildDeptTree(deptList)
  } catch (error) {
    console.error('加载部门数据失败:', error)
  } finally {
    deptIdsLoading.value = false
  }
}

// 监听对话框显示状态，当显示时加载部门数据
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      loaddeptIds()
    }
  }
)

// 组件挂载时也加载部门数据
onMounted(() => {
  if (props.visible) {
    loaddeptIds()
  }
})


const handleSelectUser =() =>{
}
// 根据部门ID加载用户列表
const loadUsersBydeptIds = async (deptIds: number[]) => {
  if (!deptIds || deptIds.length === 0) {
    userOptions.value = []
    return
  }

  usersLoading.value = true
  try {
    // 修改: 确保传递给后端的参数类型正确，添加类型检查
    const deptIdsArray = Array.isArray(deptIds) ? deptIds : [deptIds];
    // 确保所有ID都是数字类型
    const numericDeptIds = deptIdsArray.map(id => {
      if (typeof id === 'string') {
        return Number(id);
      }
      return id;
    }).filter(id => !isNaN(id)); // 过滤掉无效的数字

    const res = await getDeptUserList(form.pushType, numericDeptIds)
    // console.log('部门用户数据:', JSON.stringify(res))
    userOptions.value = res || []
  } catch (error) {
    console.error('获取部门用户列表失败:', error)
  } finally {
    usersLoading.value = false
  }
}

// 监听推送类型变化
watch(
  () => form.pushType,
  (newVal) => {
    if (newVal === '0') {
      // 如果选择全部推送，清空部门和用户选择
      form.deptIds = []
      form.userIds = []
    }
  }
)

// 监听部门选择变化
watch(
  () => form.deptIds,
  (newVal) => {
    if (newVal && newVal.length > 0) {
      loadUsersBydeptIds(newVal)
    } else {
      userOptions.value = []
    }
  }
)

// 搜索用户
const searchUsers = async (query: string) => {
  if (query) {
    usersLoading.value = true
    try {
      // 如果有选择部门，则在部门内搜索用户
      if (form.deptIds && form.deptIds.length > 0) {
        // 确保部门ID是数字类型
        const numericDeptIds = form.deptIds.map(id => {
          if (typeof id === 'string') {
            return Number(id);
          }
          return id;
        }).filter(id => !isNaN(id)); // 过滤掉无效的数字

        const res = await getDeptUserList(form.pushType, numericDeptIds)
        // 过滤包含查询关键词的用户
        userOptions.value = (res || []).filter((user: DeptUserInfo) =>
          user.userName.toLowerCase().includes(query.toLowerCase())
        )
      } else {
        // 如果没有选择部门，则全局搜索用户
        const res = await listUser()
        // 根据API返回结构获取用户列表
        userOptions.value = res.content || []
      }
    } catch (error) {
      console.error('获取用户列表失败:', error)
    } finally {
      usersLoading.value = false
    }
  } else if (form.deptIds && form.deptIds.length > 0) {
    // 如果清空搜索关键词但有选择部门，则显示部门内所有用户
    loadUsersBydeptIds(form.deptIds)
  } else {
    userOptions.value = []
  }
}

// 提交表单
const submitForm = () => {
  // 如果是立即推送，设置为当前时间
  if (form.pushTimeType === '0') {
    form.pushTime = new Date()
  } else if (!form.pushTime) {
    // 如果是延迟推送但推送时间为空，显示错误消息
    ElMessage.error('推送时间不能为空')
    return false
  }

  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      // 确保 deptIds 是数字数组
      const numericDeptIds = Array.isArray(form.deptIds)
        ? form.deptIds.map((id: any) => Number(id)).filter((id: number) => !isNaN(id))
        : []

      // 确保 userIds 是字符串数组
      const stringUserIds = Array.isArray(form.userIds)
        ? form.userIds.map((id: any) => String(id))
        : []

      // 创建提交数据对象，使用PushSubmitData接口
      const formData: PushSubmitData = {
        ...form,
        deptIds: numericDeptIds,
        userIds: stringUserIds,
        // 格式化推送时间为 yyyy-MM-dd HH:mm:ss
        pushTime: formatDate(form.pushTime!, 'yyyy-MM-dd HH:mm:ss')
      }
      emit('submit', formData)
      handleClose()
    }
  })
}

// 初始表单状态
const initialFormState: PushFormData = {
  noticeId: 0,
  noticeTitle: '',
  pushTimeType: '0',
  pushTime: null,
  pushType: '0',
  deptIds: [],
  userIds: []
}

// 重置表单到初始状态
const resetForm = () => {
  Object.assign(form, {
    noticeId: initialFormState.noticeId,
    noticeTitle: initialFormState.noticeTitle,
    pushTimeType: initialFormState.pushTimeType,
    pushTime: null,
    pushType: initialFormState.pushType,
    deptIds: [],
    userIds: []
  })
  userOptions.value = []
  formRef.value?.clearValidate()
}

// 监听推送方式变化
watch(
  () => form.pushTimeType,
  (val) => {
    if (val === '0') {
      form.pushTime = null
    } else if (val === '1' && !form.pushTime) {
      // 设置默认时间为当前时间后1小时
      const defaultTime = new Date()
      defaultTime.setHours(defaultTime.getHours() + 1)
      form.pushTime = defaultTime
    }
  }
)

// 关闭弹窗
const handleClose = () => {
  emit('update:visible', false)
  emit('cancel')
  resetForm()
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
