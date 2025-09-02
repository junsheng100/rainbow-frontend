<template>
  <div class="file-list-container">
    <!-- 搜索区域 -->
    <el-form :model="searchForm" ref="searchFormRef" :inline="true" class="search-form">
      <el-row :gutter="24">
        <el-col :span="24">
          <div class="search-item" style="float: left">
            <el-form-item prop="originalFilename" label="文件名">
              <el-input
                  v-model="searchForm.originalFilename"
                  placeholder="请输入文件名称"
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
                <el-icon><Upload /></el-icon>
                上传文件
              </el-button>
            </el-form-item>
          </div>
        </el-col>
      </el-row>
    </el-form>

    <!-- 批量操作工具栏 -->
    <div class="batch-actions" v-if="selectedFiles.length > 0">
      <el-popconfirm
          title="确定要删除选中的文件吗？"
          @confirm="handleBatchDelete"
      >
        <template #reference>
          <el-button type="danger">
            <el-icon>
              <Delete/>
            </el-icon>
            批量删除
          </el-button>
        </template>
      </el-popconfirm>
    </div>

    <!-- 文件列表表格 -->
    <el-table
        v-loading="loading"
        :data="fileList"
        class="file-table"
        stripe
        @selection-change="handleSelectionChange"
        :highlight-current-row="true"
        style="width: 100%; margin-top: 15px;"
    >
      <!-- 多选列 -->
      <el-table-column type="selection" width="55" />

      <!-- 序号列 -->
      <el-table-column prop="id" label="序号" width="60">
        <template #default="{ $index }">
          {{ (currentPage - 1) * pageSize + $index + 1 }}
        </template>
      </el-table-column>

      <!-- 文件名列 -->
      <el-table-column prop="originalFilename" label="文件名" width="320">
        <template #default="{ row }">
          <span  >
            {{ row.originalFilename }}
          </span>
        </template>
      </el-table-column>

      <!-- 文件信息列 -->
      <el-table-column prop="fileUrl" label="文件信息" min-width="120" show-overflow-tooltip>
        <template #default="{ row }">
          <div style="width: 80px;">
            <el-image
                v-if="row.fileGroup === 'image'"
                :src="getResourceUrl(row.fileUrl)"
                :preview-src-list="[getResourceUrl(row.fileUrl)]"
                :preview-teleported="true"
                fit="cover"
                class="table-preview-image"
            />
            <div v-else-if="isPdfFile(row.originalFilename)" class="file-preview-container">
              <el-image
                  :src="getResourceUrl(row.logo || '')"
                  fit="cover"
                  class="table-preview-image"
              />
              <el-button
                  type="primary"
                  size="small"
                  circle
                  class="preview-btn"
                  @click="handlePdfPreview(row)"
              >
                <el-icon><View /></el-icon>
              </el-button>
            </div>
            <div v-else-if="isPptxFile(row.originalFilename)" class="file-preview-container">
              <el-image
                  :src="getResourceUrl(row.logo || '')"
                  fit="cover"
                  class="table-preview-image"
              />
              <el-button
                  type="success"
                  size="small"
                  circle
                  class="preview-btn"
                  @click="handlePptxPreview(row)"
              >
                <el-icon><View /></el-icon>
              </el-button>
            </div>
            <div v-else-if="isVideoFile(row.originalFilename)" class="file-preview-container">
              <el-image
                  :src="getResourceUrl(row.logo || '')"
                  fit="cover"
                  class="table-preview-image"
              />
              <el-button
                  type="warning"
                  size="small"
                  circle
                  class="preview-btn"
                  @click="handleVideoPreview(row)"
              >
                <el-icon><View /></el-icon>
              </el-button>
            </div>
            <div v-else-if="isAudioFile(row.originalFilename)" class="file-preview-container">
              <el-image
                  :src="getResourceUrl(row.logo || '')"
                  fit="cover"
                  class="table-preview-image"
              />
              <el-button
                  type="info"
                  size="small"
                  circle
                  class="preview-btn"
                  @click="handleAudioPreview(row)"
              >
                <el-icon><View /></el-icon>
              </el-button>
            </div>
            <div v-else-if="isWordFile(row.originalFilename)" class="file-preview-container">
              <el-image
                  :src="getResourceUrl(row.logo || '')"
                  fit="cover"
                  class="table-preview-image"
              />
              <el-button
                  type="primary"
                  size="small"
                  circle
                  class="preview-btn"
                  @click="handleWordPreview(row)"
              >
                <el-icon><View /></el-icon>
              </el-button>
            </div>
            <div v-else-if="isExcelFile(row.originalFilename)" class="file-preview-container">
              <el-image
                  :src="getResourceUrl(row.logo || '')"
                  fit="cover"
                  class="table-preview-image"
              />
              <el-button
                  type="success"
                  size="small"
                  circle
                  class="preview-btn"
                  @click="handleExcelPreview(row)"
              >
                <el-icon><View /></el-icon>
              </el-button>
            </div>
            <div v-else-if="isPptFile(row.originalFilename)" class="file-preview-container">
              <el-image
                  :src="getResourceUrl(row.logo || '')"
                  fit="cover"
                  class="table-preview-image"
              />
              <el-button
                  type="warning"
                  size="small"
                  circle
                  class="preview-btn"
                  @click="handlePptPreview(row)"
              >
                <el-icon><View /></el-icon>
              </el-button>
            </div>

            <el-image
                v-else
                :src="getResourceUrl(row.logo || '')"
                fit="cover"
                class="table-preview-image"
            />
          </div>
        </template>
      </el-table-column>

      <!-- 文件分组列 -->
      <el-table-column prop="fileGroup" label="文件分组" width="120"/>

      <el-table-column prop="contentType" label="文件类型" width="200" >
        <template #default="{ row }">
          <span :title="row.contentType">
            {{ row.contentType && row.contentType.length > 16 ? row.contentType.substring(0, 16) + '...' : row.contentType }}
          </span>
        </template>
      </el-table-column>
      <!-- 文件大小列 -->
      <el-table-column prop="size" label="大小" width="120" align="center">
        <template #default="{ row }">
          {{ formatFileSize(row.size) }}
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template #default="{ row }">
          <el-button
              link
              type="success"
              @click="handleDownload(row)"
          >
            下载
          </el-button>
          <el-button
              link
              type="danger"
              class="delete-btn"
              @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>
    <!-- 文件上传对话框 -->
    <el-dialog
      :title="uploadTitle"
      v-model="openUpload"
      width="600px"
      @close="closeFileUpload"
      append-to-body
    >
      <el-form
        ref="uploadFormRef"
        :model="uploadForm"
        :rules="uploadRules"
        label-width="100px"
      >
        <el-form-item label="上传文件" prop="file">
          <div class="upload-wrapper">
            <!-- 上传组件 -->
            <el-upload
              :action="uploadUrl"
              :headers="uploadHeaders"
              :before-upload="validateBeforeUpload"
              :on-success="handleUploadSuccess"
              :on-error="handleUploadError"
              :on-exceed="handleExceed"
              :limit="5"
              :multiple="true"
              :file-list="fileListUpload"
              class="file-uploader"
            >
              <el-button type="primary" :loading="isUploading">
                <el-icon><Upload /></el-icon>
                {{ isUploading ? '上传中...' : '点击上传' }}
              </el-button>
            </el-upload>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="openUpload = false">取消</el-button>
          <el-button type="primary" @click="submitUpload" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 文件预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      :title="previewFile?.originalFilename || '文件预览'"
      width="60%"
      destroy-on-close
      append-to-body
      v-dialog-size-memory="'file-preview-dialog'"
    >
      <div class="preview-container">
        <!-- 图片预览 -->
        <img
            v-if="previewFile && isImageFile(previewFile.originalFilename)"
            :src="getUnifiedFileUrl(previewFile.fileUrl)"
            class="preview-image"
            alt="预览图片"
        />

        <!-- PDF预览 -->
        <div v-else-if="previewFile && isPdfFile(previewFile.originalFilename)" class="preview-content"
             style="display: flex; justify-content: center; align-items: center;">
          <iframe
              :src="getPdfPreviewUrl(previewFile.fileUrl)"
              class="preview-iframe"
              width="100%"
              style="min-height: 600px"
              frameborder="0"
          ></iframe>
        </div>

        <!-- PPTX预览 -->
        <div v-else-if="previewFile && isPptxFile(previewFile.originalFilename)" class="preview-content">
          <component :is="OfficePointComponent" :url="getResourceUrl(previewFile.fileUrl)" />
        </div>

        <!-- 视频预览 -->
        <div v-else-if="previewFile && isVideoFile(previewFile.originalFilename)" class="preview-content">
          <component :is="VideoPlayerComponent" :url="getUnifiedFileUrl(previewFile.fileUrl)" :title="previewFile.originalFilename" />
        </div>

        <!-- 音频预览 -->
        <div v-else-if="previewFile && isAudioFile(previewFile.originalFilename)" class="preview-content">
          <component :is="AudioPlayerComponent" :url="getUnifiedFileUrl(previewFile.fileUrl)" :title="previewFile.originalFilename" />
        </div>

        <!-- Word预览 -->
        <div v-else-if="previewFile && isWordFile(previewFile.originalFilename)" class="preview-content">
          <iframe
            :src="getOfficePreviewUrl(previewFile.fileUrl)"
            width="100%"
            height="600px"
            frameborder="0"
            style="border: none; border-radius: 8px;"
          ></iframe>
        </div>

        <!-- Excel预览 -->
        <div v-else-if="previewFile && isExcelFile(previewFile.originalFilename)" class="preview-content">
          <iframe
            :src="getOfficePreviewUrl(previewFile.fileUrl)"
            width="100%"
            height="600px"
            frameborder="0"
            style="border: none; border-radius: 8px;"
          ></iframe>
        </div>

        <!-- PPT预览 -->
        <div v-else-if="previewFile && isPptFile(previewFile.originalFilename)" class="preview-content">
          <iframe
            :src="getOfficePreviewUrl(previewFile.fileUrl)"
            width="100%"
            height="600px"
            frameborder="0"
            style="border: none; border-radius: 8px;"
          ></iframe>
        </div>

        <!-- 不支持预览 -->
        <div v-else class="preview-unsupported">
          <el-icon class="unsupported-icon">
            <WarningFilled/>
          </el-icon>
          <p>该文件类型不支持预览，请下载后查看</p>
          <el-button type="primary" @click="handleDownload(previewFile)">
            <el-icon>
              <Download/>
            </el-icon>
            下载文件
          </el-button>
        </div>
      </div>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, reactive, defineAsyncComponent} from 'vue'
import type {FormInstance, FormRules} from 'element-plus'
import {ElMessage, ElMessageBox} from 'element-plus'
import {Delete, Refresh, Search, Upload, View, WarningFilled, Download} from '@element-plus/icons-vue'
import {batchDeleteFileInfo, deleteFileInfo,getPreviewUrl, type FileInfo, type FileListQuery, listFile} from '@/api/files/fileList'
import {useUserStore} from '@/stores/user'
import {getResourceUrl} from "@/config"

// 用户信息
const userStore = useUserStore()

// 动态导入组件
const OfficePointComponent = defineAsyncComponent(() => import('@/components/FilePreview/pptx/OfficePoint.vue'))
const VideoPlayerComponent = defineAsyncComponent(() => import('@/components/FilePreview/video/VideoViewPlayer.vue'))
const AudioPlayerComponent = defineAsyncComponent(() => import('@/components/FilePreview/audio/AudioViewPlayer.vue'))
// 是否显示弹出层
const openUpload = ref(false)
// 弹出层标题
const uploadTitle = ref('')

// 表单引用
const searchFormRef = ref<FormInstance>()

// 搜索表单
const searchForm = ref<FileListQuery>({
  originalFilename: ''
})

// 文件列表状态
const fileList = ref<FileInfo[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const selectedFiles = ref<FileInfo[]>([])

// 预览状态
const previewDialogVisible = ref(false)
const previewFile = ref<FileInfo | null>(null)
const previewServerUrl = ref<string>('')

// 上传相关的响应式数据
const isUploading = ref(false)
const submitLoading = ref(false)
const uploadFormRef = ref<FormInstance>()
const fileListUpload = ref<any[]>([])

// 上传表单数据
const uploadForm = reactive({
  file: ''
})

// 上传表单验证规则
const uploadRules = reactive<FormRules>({})

// 上传配置
const uploadUrl =  '/web/api/files/upload'
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${userStore.token}`
}))

// 提交上传
const submitUpload = async () => {
  if (!uploadFormRef.value) return

  try {
    await uploadFormRef.value.validate()
    submitLoading.value = true

    if (fileListUpload.value.length === 0) {
      ElMessage.warning('请选择要上传的文件')
      return
    }

    // 关闭对话框并刷新列表
    openUpload.value = false
    fetchFileList()
    ElMessage.success('上传成功')
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败')
  } finally {
    submitLoading.value = false
  }
}

// 关闭上传对话框
const closeFileUpload = () => {
  openUpload.value = false
  fileListUpload.value = []
  uploadFormRef.value?.clearValidate()
}

// 上传前验证
const validateBeforeUpload = (file: File) => {
  // 检查文件大小（100MB限制）
  const maxSize = 100 * 1024 * 1024
  if (file.size > maxSize) {
    ElMessage.error('文件大小不能超过100MB')
    return false
  }

  isUploading.value = true
  return true
}

// 处理上传成功
const handleUploadSuccess = (response: any, uploadFile: any) => {
  isUploading.value = false
  if (response.code === 200) {
    ElMessage.success(`文件 ${uploadFile.name} 上传成功`)
    fileListUpload.value.push({
      name: uploadFile.name,
      url: response.data
    })
    // 上传成功后刷新文件列表
    fetchFileList()
  } else {
    ElMessage.error(response.msg || '上传失败')
  }
}

// 处理上传错误
const handleUploadError = (error: any, uploadFile: any) => {
  console.error('上传文件失败:', error)
  isUploading.value = false
  ElMessage.error(`文件 ${uploadFile.name} 上传失败`)
}

// 处理超出上传限制
const handleExceed = () => {
  ElMessage.warning('一次最多只能上传5个文件')
}

// 初始化
onMounted(() => {
  fetchFileList()
  fetchPreviewServerUrl()
})

// 打开上传对话框
const handleAdd = () => {
  uploadTitle.value = "文件上传";
  openUpload.value = true;
  fileListUpload.value = [];
  if (uploadFormRef.value) {
    uploadFormRef.value.resetFields();
  }
}

// 获取预览服务器URL
const fetchPreviewServerUrl = async () => {
  try {
    const response = await getPreviewUrl()
    if (response) {
      previewServerUrl.value = response
      console.log('获取到预览服务器URL:', previewServerUrl.value)
    }
  } catch (error) {
    console.error('获取预览服务器URL失败:', error)
    // 如果获取失败，使用默认值
    previewServerUrl.value = 'http://127.0.0.1:8012'
  }
}

// 获取文件列表
const fetchFileList = async () => {
  loading.value = true
  try {
    const params: FileListQuery = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      originalFilename: searchForm.value.originalFilename || undefined
    }

    const response = await listFile(params)
    fileList.value = response.content
    total.value = response.total
  } catch (error) {
    console.error('获取文件列表失败:', error)
    ElMessage.error('获取文件列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索按钮操作
const handleQuery = () => {
  currentPage.value = 1
  fetchFileList()
}

// 重置按钮操作
const resetQuery = () => {
  searchFormRef.value?.resetFields()
  handleQuery()
}

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  fetchFileList()
}

// 处理当前页变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchFileList()
}

// 处理文件下载
const handleDownload = (file: FileInfo | null) => {
  if (!file?.fileUrl) return

  const downloadUrl = getResourceUrl(file.fileUrl)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = file.originalFilename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 处理文件删除
const handleDelete = async (row: FileInfo) => {
  try {
    await ElMessageBox.confirm('确定要删除该文件吗？', '警告', {
      type: 'warning'
    })

    await deleteFileInfo(row.id)
    ElMessage.success('删除成功')
    fetchFileList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除文件失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 处理批量删除
const handleBatchDelete = async () => {
  const ids = selectedFiles.value.map(file => file.id)
  try {
    await batchDeleteFileInfo(ids)
    ElMessage.success('批量删除成功')
    fetchFileList()
  } catch (error) {
    console.error('批量删除失败:', error)
    ElMessage.error('批量删除失败')
  }
}

// 处理表格选择变化
const handleSelectionChange = (selection: FileInfo[]) => {
  selectedFiles.value = selection
}

// 判断是否为PDF文件
const isPdfFile = (filename: string) => {
  const lowerCaseFilename = filename.toLowerCase()
  return lowerCaseFilename.endsWith('.pdf')
}

// 判断是否为PPTX文件
const isPptxFile = (filename: string) => {
  const lowerCaseFilename = filename.toLowerCase()
  return lowerCaseFilename.endsWith('.pptx') || lowerCaseFilename.endsWith('.ppt')
}

// 判断是否为视频文件
const isVideoFile = (filename: string) => {
  const lowerCaseFilename = filename.toLowerCase()
  return lowerCaseFilename.endsWith('.mp4') ||
         lowerCaseFilename.endsWith('.avi') ||
         lowerCaseFilename.endsWith('.mov') ||
         lowerCaseFilename.endsWith('.wmv') ||
         lowerCaseFilename.endsWith('.flv') ||
         lowerCaseFilename.endsWith('.webm') ||
         lowerCaseFilename.endsWith('.mkv') ||
         lowerCaseFilename.endsWith('.m4v')
}

// 判断是否为音频文件
const isAudioFile = (filename: string) => {
  const lowerCaseFilename = filename.toLowerCase()
  return lowerCaseFilename.endsWith('.mp3') ||
         lowerCaseFilename.endsWith('.wav') ||
         lowerCaseFilename.endsWith('.flac') ||
         lowerCaseFilename.endsWith('.aac') ||
         lowerCaseFilename.endsWith('.ogg') ||
         lowerCaseFilename.endsWith('.wma') ||
         lowerCaseFilename.endsWith('.m4a') ||
         lowerCaseFilename.endsWith('.opus')
}

// 判断是否为Word文件
const isWordFile = (filename: string) => {
  const lowerCaseFilename = filename.toLowerCase()
  return lowerCaseFilename.endsWith('.doc') || lowerCaseFilename.endsWith('.docx')
}

// 判断是否为Excel文件
const isExcelFile = (filename: string) => {
  const lowerCaseFilename = filename.toLowerCase()
  return lowerCaseFilename.endsWith('.xls') || lowerCaseFilename.endsWith('.xlsx')
}

// 判断是否为PPT文件
const isPptFile = (filename: string) => {
  const lowerCaseFilename = filename.toLowerCase()
  return lowerCaseFilename.endsWith('.ppt') || lowerCaseFilename.endsWith('.pptx')
}

// 判断是否为图片文件
const isImageFile = (filename: string) => {
  const lowerCaseFilename = filename.toLowerCase()
  return lowerCaseFilename.endsWith('.jpg') || lowerCaseFilename.endsWith('.jpeg') || lowerCaseFilename.endsWith('.png') || lowerCaseFilename.endsWith('.gif')
}

// 处理PDF预览
const handlePdfPreview = (file: FileInfo) => {
  previewFile.value = file
  previewDialogVisible.value = true
}

// 处理PPTX预览
const handlePptxPreview = (file: FileInfo) => {
  previewFile.value = file
  previewDialogVisible.value = true
}

// 处理视频预览
const handleVideoPreview = (file: FileInfo) => {
  previewFile.value = file
  previewDialogVisible.value = true
}

// 处理音频预览
const handleAudioPreview = (file: FileInfo) => {
  previewFile.value = file
  previewDialogVisible.value = true
}

// 处理Word预览
const handleWordPreview = (file: FileInfo) => {
  previewFile.value = file
  previewDialogVisible.value = true
}

// 处理Excel预览
const handleExcelPreview = (file: FileInfo) => {
  previewFile.value = file
  previewDialogVisible.value = true
}

// 处理PPT预览
const handlePptPreview = (file: FileInfo) => {
  previewFile.value = file
  previewDialogVisible.value = true
}

// 获取统一的文件URL（处理localhost问题）
const getUnifiedFileUrl = (fileUrl: string) => {
  const resourceUrl = getResourceUrl(fileUrl)

  // 如果已经是完整URL，直接返回
  if (resourceUrl.startsWith('http')) {
    return resourceUrl
  }

  // 构建完整的文件URL，使用当前域名和端口
  const serverHost = window.location.hostname
  const serverPort = window.location.port

  // 如果端口是80或443，则不添加端口号
  const portSuffix = (serverPort === '80' || serverPort === '443' || !serverPort) ? '' : `:${serverPort}`
  return `http://${serverHost}${portSuffix}${resourceUrl}`
}

// 获取PDF预览URL
const getPdfPreviewUrl = (fileUrl: string) => {
  // 使用代理后的资源URL，通过/resources代理来移除X-Frame-Options
  const resourceUrl = getResourceUrl(fileUrl)
  // 如果URL已经是相对路径，直接使用
  if (resourceUrl.startsWith('/')) {
    return resourceUrl
  }
  // 如果是完整URL，转换为代理路径
  return resourceUrl.replace(/^https?:\/\/[^\/]+/, '')
}

// 获取预览服务URL
const getPreviewServerUrl = () => {
  return previewServerUrl.value || 'http://127.0.0.1:8012'
}

// 获取Office文件预览URL
const getOfficePreviewUrl = (fileUrl: string) => {
  const previewServer = getPreviewServerUrl()
  const fullUrl = getUnifiedFileUrl(fileUrl)

  console.log('预览服务地址:', previewServer)
  console.log('文件完整URL:', fullUrl)

  // Base64编码文件URL
  const base64Url = btoa(encodeURIComponent(fullUrl))
  let previewUrl = `${previewServer}/onlinePreview?url=${encodeURIComponent(base64Url)}`
  console.log('最终预览URL:', previewUrl)

  return previewUrl
}






// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>


<style lang="scss" scoped>
.file-list-container {
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

  .batch-actions {
    margin-top: 16px;
    margin-bottom: 0;
  }

  .file-table {
    margin-top: 0;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }

  .preview-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    width: 100%;
    height: 100%;
  }

  .preview-content {
    width: 100%;
    height: 600px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .preview-image {
    max-width: 100%;
    max-height: 600px;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  }

  .preview-iframe {
    flex: 1;
    width: 60%;
    height: 60vh;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    margin: auto;
  }

  .table-preview-image {
    width: 50px;
    height: 50px;
    object-fit: contain;
    border-radius: 4px;
  }

  .file-preview-container {
    position: relative;
    display: inline-block;
  }

  .preview-btn {
    position: absolute;
    top: -5px;
    right: -5px;
    width: 20px;
    height: 20px;
    font-size: 10px;
    z-index: 1;
  }

  .preview-unsupported {
    text-align: center;
    padding: 40px;
  }

  .unsupported-icon {
    font-size: 48px;
    color: #e6a23c;
    margin-bottom: 20px;
  }



  .upload-wrapper {
    display: flex;
    flex-direction: column;
  }

  .file-uploader {
    width: 100%;
  }

  .dialog-footer {
    text-align: right;
  }

  .preview-link {
    color: #409eff;
    cursor: pointer;
    text-decoration: underline;
  }

  .delete-btn {
    color: var(--el-color-danger);
    &:hover {
      color: var(--el-color-danger-light-3);
    }
  }
}
</style>
