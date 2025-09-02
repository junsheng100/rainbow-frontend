<template>
  <div class="wallpaper-container">
    <!-- 页面头部 -->
    <!-- 搜索区域 -->
    <el-form :model="searchForm" ref="queryForm" :inline="true" class="search-form">
      <el-row :gutter="24">
        <el-col :span="24">
          <div class="search-item" style="float: left">
            <el-form-item prop="startDate" label="日期">
              <el-date-picker
                  v-model="searchForm.startDate"
                  type="date"
                  placeholder="选择日期"
                  format="YYYYMMDD"
                  value-format="YYYYMMDD"
                  clearable
                  @change="handleSearch"
              />
            </el-form-item>
            <el-form-item prop="title" label="标题">
              <el-input
                  v-model="searchForm.title"
                  placeholder="请输入标题"
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
              <el-button @click="handleReset">
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
            </el-form-item>
            <!--
            <el-form-item>
              <el-button type="primary" @click="handleSync">
                <el-icon>
                  <Plus/>
                </el-icon>
                刷新
              </el-button>
            </el-form-item>
            -->
          </div>
        </el-col>
      </el-row>
    </el-form>

    <!-- 表格区域 -->
    <el-card class="table-card" shadow="hover">
      <el-table
          v-loading="loading"
          :data="tableData"
          class="wallpaper-table"
          stripe
          :highlight-current-row="true"
      >

        <el-table-column prop="id" label="ID" width="80" v-if="false"/>
        <el-table-column label="序号" type="index" width="60">
          <template #default="{ $index }">
            {{ (pagination.current - 1) * pagination.size + $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" width="180"/>
        <el-table-column prop="copyright" label="版权" min-width="180"/>
        <el-table-column prop="localPath" label="预览图" width="120">
          <template #default="{ row }">
            <el-image
                :src="getImageUrl(row)"
                :preview-src-list="[getImageUrl(row)]"
                :preview-teleported="true"
                fit="cover"
                class="preview-image"
            />
          </template>
        </el-table-column>

        <el-table-column prop="isFeatured" label="是否精选" width="100">
          <template #default="{ row }">
            <el-switch
                v-model="row.isFeatured"
                @change="handleiRowChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="isLogin" label="登录页可见" width="100" v-if="userStore.userInfo.userType == 'ADMIN'">
          <template #default="{ row }">
            <el-switch
                v-model="row.isLogin"
                @change="handleiRowChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="isWork" label="工作区可见" width="100">
          <template #default="{ row }">
            <el-switch
                v-model="row.isWork"
                @change="handleiRowChange(row)"
            />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button link type="primary" @click="handleEdit(row)">
                <el-icon>
                  <Edit/>
                </el-icon>
                编辑
              </el-button>
              <el-button link type="danger" @click="handleDelete(row)">
                <el-icon>
                  <Delete/>
                </el-icon>
                删除
              </el-button>
            </div>
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
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
        v-model="dialogVisible"
        :title="isEdit ? '编辑壁纸' : '新增壁纸'"
        width="600px"
        height="680px"
        @close="handleDialogClose"
    >
      <el-form
          ref="formRef"
          :model="wallpaperForm"
          :rules="formRules"
          label-width="100px"
      >

        <el-row>
          <el-form-item label="标题" prop="title">
            <el-input v-model="wallpaperForm.title"/>
          </el-form-item>
        </el-row>
        <el-row>
          <el-form-item label="壁纸信息" prop="copyright">
            <el-input v-model="wallpaperForm.copyright" style="width: 360px"/>
          </el-form-item>
        </el-row>
        <el-row>
          <el-form-item label="本地图片" prop="localPath">
            <div class="upload-wrapper">
              <!-- 图片预览区域 -->
              <div v-if="wallpaperForm.localPath" class="preview-container">
                <el-image
                    :src="getImageUrl(wallpaperForm)"
                    fit="contain"
                    class="preview-image"
                >
                  <template #error>
                    <div class="image-error">
                      <el-icon>
                        <Picture/>
                      </el-icon>
                      <span>图片加载失败</span>
                    </div>
                  </template>
                </el-image>

                <el-button
                    type="danger"
                    size="small"
                    circle
                    class="remove-image"
                    @click="handleRemoveImage"
                >
                  <el-icon>
                    <Delete/>
                  </el-icon>
                </el-button>
              </div>

              <!-- 上传组件 -->
              <div class="upload-container">
                <el-upload
                    v-bind="uploadProps"
                    class="upload-button"
                >
                  <el-button
                      type="primary"
                      :loading="isUploading"
                      :disabled="!!wallpaperForm.localPath"
                  >
                    <el-icon>
                      <Upload/>
                    </el-icon>
                    {{ isUploading ? '上传中...' : '上传图片' }}
                  </el-button>
                  <template #tip>
                    <div class="upload-tip">支持 jpg、png、webp 格式，大小不超过 10MB</div>
                  </template>
                </el-upload>
              </div>
            </div>
          </el-form-item>
        </el-row>
        <el-row>
          <el-col :span="6">
            <el-form-item label="是否精选" prop="isFeatured">
              <el-switch v-model="wallpaperForm.isFeatured"/>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="用于登录页" prop="isLogin">
              <el-switch v-model="wallpaperForm.isLogin"/>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="用户工作区" prop="isWork">
              <el-switch v-model="wallpaperForm.isWork"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-form-item label="排序" prop="orderNum">
            <el-input-number v-model="wallpaperForm.orderNum" :min="1" :max="9999" controls-position="right"/>
          </el-form-item>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted, computed} from 'vue'
import type {FormInstance, FormRules} from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Edit,
  Delete,
  Upload,
  Picture
} from '@element-plus/icons-vue'
import {
  getWallpaperPage,
  createWallpaper,
  updateWallpaper,
  deleteWallpaper,
  type Wallpaper,
  type WallpaperQueryParams
} from '@/api/files/wallpaper.ts'
import {useUserStore} from '@/stores/user'
import {ElMessage, ElMessageBox} from 'element-plus'
import {getResourceUrl} from '@/config'
import {handleError} from '@/utils/errorHandler'
import {getToken} from '@/utils/auth.ts'

// 响应式数据
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const tableData = ref<Wallpaper[]>([])
const formRef = ref<FormInstance>()
const userStore = useUserStore()

// 搜索表单
const searchForm = reactive<WallpaperQueryParams>({
  page: 1,
  size: 10,
  startDate: undefined,
  title: undefined,
})

// 分页数据
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})


// 壁纸表单
interface WallpaperForm {
  id?: number
  startDate: string
  fullStartDate: string
  endDate: string
  url: string
  urlBase: string
  title: string
  copyright: string
  copyrightLink: string
  localPath: string
  isFeatured: boolean
  isLogin: boolean
  isWork: boolean,
  orderNum: number
}

const wallpaperForm = reactive<WallpaperForm>({
  startDate: '',
  fullStartDate: '',
  endDate: '',
  url: '',
  urlBase: '',
  title: '',
  copyright: '',
  copyrightLink: '',
  localPath: '',
  isFeatured: false,
  isLogin: false,
  isWork: false,
  orderNum: 1
})

// 表单验证规则
const formRules: FormRules = {

  title: [
    {max: 200, message: '标题不能超过200个字符', trigger: 'blur'}
  ],
  copyright: [
    {max: 1000, message: '版权信息不能超过1000个字符', trigger: 'blur'}
  ],
  copyrightLink: [
    {max: 500, message: '版权链接不能超过500个字符', trigger: 'blur'}
  ]
}

// 图片路径处理函数
const getImageUrl = (row: Wallpaper) => {
  if (!row) {
    console.warn('输入数据为空')
    return ''
  }

  if (row.localPath) {
    try {
      const url = getResourceUrl(row.localPath)
      // console.log('生成的本地图片 URL:', url)
      return url
    } catch (error) {
      console.error('生成图片 URL 出错:', error)
      return ''
    }
  }

  // console.log('使用备选 URL:', row.fullUrl || row.url)
  return row.fullUrl || row.url
}

// 初始化数据
const initData = () => {
  getTableData()
}

// 获取表格数据
const getTableData = async () => {
  try {
    loading.value = true
    const params: WallpaperQueryParams = {
      ...searchForm,
      page: pagination.current,
      size: pagination.size
    }
    const response = await getWallpaperPage(params)
    tableData.value = response.content
    pagination.total = response.total || 0

  } catch (error) {
    handleError(error, '获取壁纸列表')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  getTableData()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    startDate: undefined,
    title: undefined,
    downloadStatus: undefined,
    isFeatured: undefined
  })
  pagination.current = 1
  getTableData()
}

// 分页大小改变
const handleSizeChange = (val: number) => {
  pagination.size = val
  pagination.current = 1
  getTableData()
}

// 当前页改变
const handleCurrentChange = (val: number) => {
  pagination.current = val
  getTableData()
}

// 新增壁纸
const handleAdd = () => {
  isEdit.value = false
  dialogVisible.value = true
  resetForm()
}


// 编辑壁纸
const handleEdit = (row: Wallpaper) => {
  isEdit.value = true
  dialogVisible.value = true
  Object.assign(wallpaperForm, row)
}

const handleiRowChange = async (row: Wallpaper) => {
  await updateWallpaper(row as Wallpaper)
  ElMessage.success('更新成功')
}

// 删除壁纸
const handleDelete = async (row: Wallpaper) => {
  try {
    await ElMessageBox.confirm(
        `确定要删除壁纸"${row.title || row.startDate}"吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )
    await deleteWallpaper(row.id!)
    ElMessage.success('删除成功')
    getTableData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除壁纸失败:', error)
      ElMessage.error('删除壁纸失败')
    }
  }
}


// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitLoading.value = true

    // 处理日期格式
    if (wallpaperForm.startDate) {
      wallpaperForm.fullStartDate = wallpaperForm.startDate + '00'
      wallpaperForm.endDate = wallpaperForm.startDate
    }

    if (isEdit.value) {
      await updateWallpaper(wallpaperForm as Wallpaper)
      ElMessage.success('更新成功')
    } else {
      await createWallpaper(wallpaperForm as Wallpaper)
      ElMessage.success('创建成功')
    }

    dialogVisible.value = false
    getTableData()
  } catch (error) {
    console.error('保存壁纸失败:', error)
    ElMessage.error('保存失败')
  } finally {
    submitLoading.value = false
  }
}

// 关闭弹窗
const handleDialogClose = () => {
  dialogVisible.value = false
  resetForm()
}

// 重置表单
const resetForm = () => {
  Object.assign(wallpaperForm, {
    startDate: '',
    fullStartDate: '',
    endDate: '',
    url: '',
    urlBase: '',
    title: '',
    copyright: '',
    copyrightLink: '',
    localPath: '',
    isFeatured: false
  })
  formRef.value?.clearValidate()
}

// 上传相关
const uploadUrl = '/web/api/wallpaper/upload'  // 使用相对路径

console.log('上传 URL:', uploadUrl)

const uploadHeaders = computed(() => {
  const token = getToken();
  console.log('当前 token:', token ? '存在' : '不存在')
  if (!token) {
    ElMessage.error('未登录或登录已过期，请重新登录')
    return {}
  }
  const headers = {
    Authorization: `Bearer ${token}`,
    'X-Requested-With': 'XMLHttpRequest'  // 添加 AJAX 标识
  }

  return headers
})

// 上传配置
const uploadProps = computed(() => ({
  action: uploadUrl,
  headers: uploadHeaders.value,
  'show-file-list': false,
  'before-upload': handleBeforeUpload,
  'on-success': handleUploadSuccess,
  'on-error': handleUploadError,
  accept: 'image/jpeg,image/png,image/webp',
  multiple: false,
  withCredentials: true  // 允许发送 cookies
}))

// 上传状态
const isUploading = ref(false)

// 上传前验证
const handleBeforeUpload = (file: File) => {

  const isImage = /\.(jpg|jpeg|png|webp)$/i.test(file.name)
  const isLt10M = file.size / 1024 / 1024 < 10

  console.log('文件验证结果:', {
    isImage,
    isLt10M,
    allowedTypes: 'jpg|jpeg|png|webp'
  })

  if (!isImage) {
    ElMessage.error('只能上传 jpg、jpeg、png、webp 格式的图片！')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB！')
    return false
  }

  const token = getToken();
  console.log('上传前 token 检查:', token ? '存在' : '不存在')
  if (!token) {
    ElMessage.error('未登录或登录已过期，请重新登录')
    return false
  }

  isUploading.value = true
  return true
}

// 上传成功回调
const handleUploadSuccess = (response: any) => {

  isUploading.value = false

  if (response.code === 200 && response.data) {

    wallpaperForm.localPath = response.data
    ElMessage.success('上传成功')
  } else {
    console.error('上传失败，响应:', response)
    ElMessage.error(response.msg || '上传失败，请重试')
    wallpaperForm.localPath = ''
  }
}

// 上传失败回调
const handleUploadError = (error: any) => {
  console.error('上传错误:', error)
  isUploading.value = false

  let errorMessage = '上传失败，请重试'
  if (error.response) {
    console.error('错误响应:', {
      status: error.response.status,
      statusText: error.response.statusText,
      data: error.response.data
    })
    errorMessage = error.response.data?.msg || errorMessage
  }

  console.log('显示错误消息:', errorMessage)
  ElMessage.error(errorMessage)
  wallpaperForm.localPath = ''
}

// 移除图片
const handleRemoveImage = () => {
  console.log("#####", wallpaperForm.localPath)
  // wallpaperForm.localPath = ''
}

// 生命周期
onMounted(() => {
  initData()
})
</script>

<style lang="scss" scoped>
.wallpaper-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;

  .search-form {
    background-color: #fff;
    padding: 10px;
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

  .table-card {
    margin-top: 0;
    flex: 1;
    display: flex;
    flex-direction: column;

    .wallpaper-table {
      flex: 1;

      .preview-image {
        width: 80px;
        height: 45px;
        border-radius: 4px;
        cursor: pointer;
      }

      .action-buttons {
        display: flex;
        justify-content: center;
        gap: 8px;
      }
    }

    .pagination-wrapper {
      margin-top: 16px;
      display: flex;
      justify-content: flex-end;
    }
  }

  .dialog-footer {
    text-align: right;
  }

  .upload-wrapper {
    display: flex;
    gap: 16px;
    align-items: flex-start;

    .preview-container {
      width: 200px;
      height: 112px;
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid var(--el-border-color);

      .preview-image {
        width: 100%;
        height: 100%;
      }

      .image-error {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--el-fill-color-light);
        color: var(--el-text-color-secondary);
      }
    }

    .upload-button {
      width: 200px;
      height: 112px;
      border: 1px dashed var(--el-border-color);
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: var(--el-color-primary);
        color: var(--el-color-primary);
      }

      .el-icon {
        font-size: 24px;
        margin-bottom: 8px;
      }
    }
  }
}
</style>
