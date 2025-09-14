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
              <el-button type="warning" @click="handleResourceSettings" v-if="isAdmin" style="margin-left: 8px;">
                <el-icon><Setting /></el-icon>
                资源设置
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
                  v-if="isFileTypePreviewable(row.originalFilename)"
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
      <el-table-column label="操作" width="240" align="center" fixed="right">
        <template #default="{ row }">
          <el-button
              link
              type="primary"
              @click="handleEdit(row)"
          >
            编辑
          </el-button>
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
      <!-- 上传说明 -->
      <div class="upload-tips">
        <el-alert
          v-if="fileConfigStore.config"
          title="文件上传说明"
          type="info"
          :closable="false"
          show-icon
        >
          <template #default>
            <div class="upload-tips-content">
              <p><strong>支持的文件类型：</strong>{{ allowedExtensions.join(', ') }}</p>
              <p><strong>文件大小限制：</strong>单个文件不超过 {{ maxFileSize }}MB</p>
              <p><strong>注意事项：</strong>请确保文件内容合法，上传前系统会自动校验文件类型和大小</p>
            </div>
          </template>
        </el-alert>

        <el-alert
          v-else
          title="文件上传配置未加载"
          type="warning"
          :closable="false"
          show-icon
        >
          <template #default>
            <div class="upload-tips-content">
              <p><strong>配置状态：</strong>文件上传配置未加载或配置不完整</p>
              <p><strong>解决方案：</strong>请刷新页面重试，或联系管理员检查系统配置</p>
              <p><strong>配置要求：</strong>需要配置上传URL、文件大小限制、允许的文件类型</p>
            </div>
          </template>
        </el-alert>
      </div>

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
              :on-change="handleFileChange"
              :limit="1"
              :multiple="false"
              :file-list="fileListUpload"
              :disabled="!fileConfigStore.config"
              :auto-upload="false"
              :show-file-list="false"
              class="file-uploader"
            >
              <el-button
                type="primary"
                :loading="isUploading"
                :disabled="!fileConfigStore.config"
              >
                <el-icon><Upload /></el-icon>
                {{ isUploading ? '上传中...' : (!fileConfigStore.config ? '配置未加载' : '选择文件') }}
              </el-button>
            </el-upload>
          </div>
        </el-form-item>

        <!-- 待上传文件列表 -->
        <el-form-item v-if="fileListUpload.length > 0" label="附件">
          <div class="attachment-container" style="display: flex !important; flex-wrap: wrap !important; gap: 20px !important; padding: 16px !important; background: #fafafa !important; border-radius: 12px !important; border: 2px dashed #e0e0e0 !important; min-height: 200px !important;">
            <!-- 已选择的文件 -->
            <div
              v-for="(file, index) in fileListUpload"
              :key="index"
              class="attachment-card"
              style="width: 200px !important; height: 240px !important; border: 1px solid #e0e0e0 !important; border-radius: 12px !important; display: flex !important; flex-direction: column !important; background: white !important; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08) !important; transition: all 0.3s ease !important; overflow: hidden !important;"
            >
              <!-- 文件预览区域 -->
              <div class="file-preview" style="width: 100% !important; height: 140px !important; display: flex !important; align-items: center !important; justify-content: center !important; overflow: hidden !important; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important; position: relative !important; border-bottom: 1px solid #f0f0f0 !important;">
                <!-- 图片文件 -->
                <div v-if="isImageFile(file)" class="image-preview" style="width: 100% !important; height: 100% !important; display: flex !important; align-items: center !important; justify-content: center !important;">
                  <img
                    :src="getFilePreviewUrl(file)"
                    :alt="file.name"
                    @error="handleImageError"
                    style="max-width: 100% !important; max-height: 100% !important; width: auto !important; height: auto !important; object-fit: contain !important; border-radius: 8px !important;"
                  />
                </div>

                <!-- 非图片文件 -->
                <div v-else class="file-preview-container" style="width: 100% !important; height: 100% !important; display: flex !important; align-items: center !important; justify-content: center !important; flex-direction: column !important;">
                  <img
                    :src="getFileTypeIcon(getFileType(file.name))"
                    :alt="file.name"
                    class="file-type-thumbnail"
                    style="max-width: 60px !important; max-height: 60px !important; width: auto !important; height: auto !important; object-fit: contain !important; margin-bottom: 8px !important;"
                  />
                  <span style="font-size: 12px !important; color: #666 !important; text-align: center !important;">{{ getFileType(file.name).toUpperCase() }}</span>
                </div>

                <!-- 右上角删除按钮 -->
                <el-badge
                  :value="'×'"
                  type="danger"
                  class="delete-badge-corner"
                  @click="removeFile(index)"
                  style="position: absolute !important; top: 8px !important; right: 8px !important; cursor: pointer !important; z-index: 10 !important;"
                >
                </el-badge>
              </div>

              <!-- 文件信息区域 -->
              <div class="file-info" style="padding: 12px !important; flex: 1 !important; display: flex !important; flex-direction: column !important; justify-content: center !important; background: white !important;">
                <div style="font-size: 13px !important; color: #333 !important; font-weight: 500 !important; margin-bottom: 4px !important; overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important;">{{ file.name }}</div>
                <div style="font-size: 11px !important; color: #999 !important;">{{ formatFileSize(file.raw ? file.raw.size : file.size) }}</div>
              </div>
            </div>

          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="openUpload = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitUpload"
            :loading="submitLoading"
            :disabled="fileListUpload.length === 0 || isUploading"
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 文件编辑对话框 -->
    <el-dialog
      :title="editTitle"
      v-model="openEdit"
      width="600px"
      @close="closeFileEdit"
      append-to-body
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="100px"
      >
         <el-form-item label="文件名" prop="fileNameWithoutExt">
           <div class="filename-input-container">
             <el-input
               v-model="editForm.fileNameWithoutExt"
               :placeholder="'请输入文件名' + fileExtension"
               clearable
               class="filename-input-with-suffix"
             >
               <template #suffix>
                 <span class="file-extension-suffix">{{ fileExtension }}</span>
               </template>
             </el-input>
           </div>
         </el-form-item>
        <el-form-item label="文件分组">
          <el-input :value="editForm.fileGroup" disabled />
        </el-form-item>

        <el-form-item label="文件类型">
          <el-input
            v-model="editForm.contentType"
            placeholder="请输入文件描述"
            disabled
          />
        </el-form-item>
        <el-form-item label="文件大小">
          <span class="file-size">{{ formatFileSize(editForm.size) }}</span>
        </el-form-item>

         <el-form-item label="文件信息">
           <div class="file-info-preview" style="width: 120px; border-radius: 5%;">
             <!-- 图片文件 -->
             <el-image
               v-if="editForm.fileGroup === 'image'"
               :src="getResourceUrl(editForm.fileUrl)"
               :preview-src-list="[getResourceUrl(editForm.fileUrl)]"
               :preview-teleported="true"
               fit="cover"
               class="form-preview-image"
             />
             <!-- 其他文件 -->
             <el-image
               v-else
               :src="getResourceUrl(editForm.logo || '')"
               fit="cover"
               class="form-preview-image"
             />
           </div>
         </el-form-item>


      </el-form>



      <template #footer>
        <span class="dialog-footer">
          <el-button @click="openEdit = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitEdit"
            :loading="editLoading"
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 资源设置对话框 -->
    <el-dialog :title="settingsTitle" v-model="openSettings" width="600px" @close="closeResourceSettings" append-to-body>
      <el-form ref="settingsFormRef" :model="settingsForm" :rules="settingsRules" label-width="120px">
        <el-form-item label="上传URL" prop="uploadUrl">
          <el-input
            v-model="settingsForm.uploadUrl"
            placeholder="请输入上传URL"
            clearable
          />
        </el-form-item>
        <el-form-item label="文件最大尺寸" prop="maxSize">
          <el-input-number
            v-model="settingsForm.maxSize"
            :min="1"
            :max="1024"
            placeholder="请输入文件最大尺寸"
            style="width: 100%"
          >
            <template #suffix>
              <span class="file-extension-suffix"> MB</span>
            </template>
          </el-input-number>
        </el-form-item>
        <el-form-item label="上传文件类型" prop="allowExtensions">
          <el-select
            v-model="settingsForm.allowExtensions"
            multiple
            filterable
            allow-create
            placeholder="请选择或输入允许的文件类型"
            style="width: 100%"
            clearable
            collapse-tags
            collapse-tags-tooltip
            :filter-method="filterFileTypes"
            :reserve-keyword="false"
          >
            <el-option
              v-for="ext in filteredFileTypeOptions"
              :key="ext.id"
              :label="`${ext.typeName} (${ext.extension})`"
              :value="ext.extension"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="文件预览URL" prop="previewUrl">
          <el-input
            v-model="settingsForm.previewUrl"
            placeholder="请输入文件预览URL"
            clearable
          />
        </el-form-item>
        <el-form-item label="预览文件类型" prop="previewType">
          <el-select
            v-model="settingsForm.previewType"
            multiple
            filterable
            allow-create
            placeholder="请选择或输入可预览的文件类型"
            style="width: 100%"
            clearable
            collapse-tags
            collapse-tags-tooltip
            :filter-method="filterPreviewTypes"
            :reserve-keyword="false"
          >
            <el-option
              v-for="ext in filteredPreviewTypeOptions"
              :key="ext.id"
              :label="`${ext.typeName} (${ext.extension})`"
              :value="ext.extension"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="是否启用预览" prop="hasPreview">
          <el-switch
            v-model="settingsForm.hasPreview"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeResourceSettings">取消</el-button>
          <el-button type="primary" @click="submitSettings" :loading="settingsLoading">确定</el-button>
        </div>
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
import {computed, onMounted, ref, reactive, defineAsyncComponent, watch} from 'vue'
import type {FormInstance, FormRules} from 'element-plus'
import {ElMessage, ElMessageBox} from 'element-plus'
import {Delete, Refresh, Search, Upload, View, WarningFilled, Download, Setting} from '@element-plus/icons-vue'
import {batchDeleteFileInfo, deleteFileInfo, updateFileInfo, type FileInfo, type FileListQuery, listFile} from '@/api/files/fileList'
import {updateFileConfig, type FileConfig} from '@/api/files/config'
import {findAllowFileTypeList, getFileTypeGroupData} from '@/api/files/fileType'
import type {FileType} from '@/types/fileType'
import {useUserStore} from '@/stores/user'
import {useFileConfigStore} from '@/stores/fileConfig'
import {getResourceUrl} from "@/config"
import { TokenCookie } from '@/utils/cookies'

// 用户信息
const userStore = useUserStore()

// 文件配置
const fileConfigStore = useFileConfigStore()

// 判断是否为系统管理员
const isAdmin = computed(() => {
  return userStore.userInfo?.roles?.some(role => role === 'admin') || false
})

// 动态导入组件
const OfficePointComponent = defineAsyncComponent(() => import('@/components/FilePreview/pptx/OfficePoint.vue'))
const VideoPlayerComponent = defineAsyncComponent(() => import('@/components/FilePreview/video/VideoViewPlayer.vue'))
const AudioPlayerComponent = defineAsyncComponent(() => import('@/components/FilePreview/audio/AudioViewPlayer.vue'))
// 是否显示弹出层
const openUpload = ref(false)
// 弹出层标题
const uploadTitle = ref('')

// 编辑相关状态
const openEdit = ref(false)
const editTitle = ref('')
const editLoading = ref(false)
const editFormRef = ref<FormInstance>()

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

// 编辑表单数据
const editForm = reactive<FileInfo & { fileNameWithoutExt: string }>({
  id: 0,
  fileName: '',
  size: 0,
  FileInfo: '',
  originalFilename: '',
  fileUrl: '',
  fileExt: '',
  fileType: '',
  contentType: '',
  filePath: '',
  logo: '',
  fileGroup: '',
  fileNameWithoutExt: ''
})

// 文件名和扩展名的分离
const fileExtension = ref('')

// 资源设置相关
const openSettings = ref(false)
const settingsTitle = ref('')
const settingsLoading = ref(false)
const settingsFormRef = ref<FormInstance>()

// 资源设置表单数据
const settingsForm = reactive({
  previewUrl: '',
  uploadUrl: '',
  maxSize: 10,
  allowExtensions: [] as string[],
  previewType: [] as string[],
  fileExt: '',
  hasPreview: true
})

// 文件扩展名选项
const fileExtensionOptions = ref<FileType[]>([])
const filteredFileTypeOptions = ref<FileType[]>([])
const filteredPreviewTypeOptions = ref<FileType[]>([])

// 文件类型分组数据
const fileTypeGroupData = ref<Record<string, string[]>>({})

// 获取允许的文件类型列表
const loadFileTypeOptions = async () => {
  try {
    const response = await findAllowFileTypeList()
    if (response && Array.isArray(response)) {
      fileExtensionOptions.value = response
      filteredFileTypeOptions.value = response
      updatePreviewTypeOptions()
    }
  } catch (error) {
    console.error('获取文件类型列表失败:', error)
    ElMessage.error('获取文件类型列表失败')
  }
}

// 获取文件类型分组数据
const loadFileTypeGroupData = async () => {
  try {
    const response = await getFileTypeGroupData()
    if (response) {
      fileTypeGroupData.value = response
    }
  } catch (error) {
    console.error('获取文件类型分组数据失败:', error)
    ElMessage.error('获取文件类型分组数据失败')
  }
}

// 更新预览文件类型选项
const updatePreviewTypeOptions = () => {
  const availableOptions = fileExtensionOptions.value.filter(option =>
    settingsForm.allowExtensions.includes(option.extension)
  )
  filteredPreviewTypeOptions.value = availableOptions
}

// 筛选文件类型
const filterFileTypes = (query: string) => {
  if (!query) {
    filteredFileTypeOptions.value = fileExtensionOptions.value
    return
  }

  filteredFileTypeOptions.value = fileExtensionOptions.value.filter(option => {
    const typeName = option.typeName.toLowerCase()
    const extension = option.extension.toLowerCase()
    const searchQuery = query.toLowerCase()

    return typeName.includes(searchQuery) || extension.includes(searchQuery)
  })
}

// 筛选预览文件类型
const filterPreviewTypes = (query: string) => {
  const availableOptions = fileExtensionOptions.value.filter(option =>
    settingsForm.allowExtensions.includes(option.extension)
  )

  if (!query) {
    filteredPreviewTypeOptions.value = availableOptions
    return
  }

  filteredPreviewTypeOptions.value = availableOptions.filter(option => {
    const typeName = option.typeName.toLowerCase()
    const extension = option.extension.toLowerCase()
    const searchQuery = query.toLowerCase()

    return typeName.includes(searchQuery) || extension.includes(searchQuery)
  })
}

// 编辑表单验证规则
const editRules = reactive<FormRules>({
  fileNameWithoutExt: [
    { required: true, message: '文件名不能为空', trigger: 'blur' },
    { min: 1, max: 200, message: '文件名长度在 1 到 200 个字符', trigger: 'blur' },
    {
      pattern: /^[^<>:"/\\|?*\x00-\x1f]*$/,
      message: '文件名不能包含非法字符',
      trigger: 'blur'
    }
  ]
})

// 资源设置表单验证规则
const settingsRules = reactive<FormRules>({
  uploadUrl: [
    { required: true, message: '上传URL不能为空', trigger: 'blur' },
    {
      pattern: /^(https?:\/\/)?(([0-9]{1,3}\.){3}[0-9]{1,3}|([\da-z\.-]+)\.([a-z\.]{2,6})|localhost)(:[0-9]{1,5})?([\/\w \.-]*)*\/?$|^\/.*$/,
      message: '请输入有效的URL（支持相对路径和绝对路径）',
      trigger: 'blur'
    }
  ],
  maxSize: [
    { required: true, message: '文件最大尺寸不能为空', trigger: 'blur' },
    { type: 'number', min: 1, max: 1024, message: '文件大小必须在1-1024MB之间', trigger: 'blur' }
  ],
  allowExtensions: [
    { required: true, message: '请选择至少一种文件类型', trigger: 'change' }
  ],
  previewUrl: [
    {
      pattern: /^(https?:\/\/)?(([0-9]{1,3}\.){3}[0-9]{1,3}|([\da-z\.-]+)\.([a-z\.]{2,6})|localhost)(:[0-9]{1,5})?([\/\w \.-]*)*\/?$|^\/.*$/,
      message: '请输入有效的URL（支持相对路径和绝对路径）',
      trigger: 'blur'
    }
  ]
})

// 上传配置
const uploadUrl = computed(() => {
  if (!fileConfigStore.config?.uploadUrl) {
    console.warn('文件上传配置未设置，请先配置上传URL')
    return ''
  }
  return fileConfigStore.config.uploadUrl
})
const uploadHeaders = computed(() => ({
  Authorization: `${TokenCookie.getTokenType() || 'Bearer'} ${userStore.token}`
}))

// 文件大小限制（MB）
const maxFileSize = computed(() => fileConfigStore.config?.maxSize || 10)

// 允许的文件扩展名
const allowedExtensions = computed(() => fileConfigStore.config?.allowExtensions || [])

// 预览服务URL
const previewServerUrl = computed(() => fileConfigStore.config?.previewUrl || 'http://127.0.0.1:8012')

// 判断是否应该显示预览按钮
const shouldShowPreviewButton = computed(() => {
  // 检查是否启用预览
  if (!fileConfigStore.config?.hasPreview) {
    return false
  }

  // 检查预览URL是否配置
  if (!fileConfigStore.config?.previewUrl) {
    return false
  }

  return true
})

// 判断文件类型是否在预览范围内
const isFileTypePreviewable = (filename: string) => {
  if (!shouldShowPreviewButton.value) {
    return false
  }

  const previewTypes = fileConfigStore.config?.previewType || []
  if (previewTypes.length === 0) {
    return false
  }

  const extension = filename.toLowerCase().split('.').pop()
  return previewTypes.includes(extension || '')
}

// 处理文件选择变化
const handleFileChange = (file: any, fileList: any[]) => {
  console.log('文件选择变化:', file, fileList)
  console.log('文件详情:', {
    name: file.name,
    type: file.raw?.type,
    size: file.size,
    raw: file.raw
  })
  
  // 如果文件状态是ready，进行验证
  if (file.status === 'ready' && file.raw) {
    const isValid = validateBeforeUpload(file.raw)
    if (!isValid) {
      // 验证失败，移除文件
      fileListUpload.value = fileList.filter(f => f.uid !== file.uid)
      return
    }
  }
  
  // 只保留已选择的文件，过滤掉上传中的文件
  fileListUpload.value = fileList.filter(f => f.status !== 'uploading' && f.status !== 'success')
}

// 格式化文件大小
const formatFileSize = (size: number) => {
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(1) + ' KB'
  } else if (size < 1024 * 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(1) + ' MB'
  } else {
    return (size / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
  }
}

// 移除文件
const removeFile = (index: number) => {
  fileListUpload.value.splice(index, 1)
}

// 判断是否为图片文件
const isImageFile = (file: any) => {
  // 检查文件扩展名
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i
  if (imageExtensions.test(file.name)) {
    return true
  }

  // 检查MIME类型
  if (file.raw && file.raw.type) {
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml']
    return imageTypes.includes(file.raw.type)
  }

  return false
}

// 获取文件预览URL
const getFilePreviewUrl = (file: any) => {
  if (file.raw) {
    return URL.createObjectURL(file.raw)
  }
  // 如果没有raw文件，尝试使用url属性
  if (file.url) {
    return file.url
  }
  return ''
}

// 处理图片加载错误
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}


// 获取文件类型
const getFileType = (filename: string) => {
  if (isPdfFile(filename)) return 'pdf'
  if (isPptxFile(filename)) return 'pptx'
  if (isPptFile(filename)) return 'ppt'
  if (isWordFile(filename)) return 'word'
  if (isExcelFile(filename)) return 'excel'
  if (isVideoFile(filename)) return 'video'
  if (isAudioFile(filename)) return 'audio'
  return 'default'
}

// 获取文件类型图标
const getFileTypeIcon = (fileType: string) => {
  const iconMap: Record<string, string> = {
    pdf: '/src/assets/logo/png/pdf.png',
    pptx: '/src/assets/logo/png/ppt.png', // 使用ppt图标作为pptx
    ppt: '/src/assets/logo/png/ppt.png',
    word: '/src/assets/logo/png/word.png',
    excel: '/src/assets/logo/png/excel.jpg',
    video: '/src/assets/logo/png/video.png',
    audio: '/src/assets/logo/png/audio.png',
    default: '/src/assets/logo/png/file.png'
  }

  // 如果图标文件不存在，使用默认图标
  return iconMap[fileType] || iconMap.default
}

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

    // 开始上传文件
    isUploading.value = true
    const file = fileListUpload.value[0]

    if (file.raw) {
      try {
        // 创建FormData
        const formData = new FormData()
        formData.append('file', file.raw)

        // 发送上传请求
        const response = await fetch(uploadUrl.value, {
          method: 'POST',
          headers: uploadHeaders.value,
          body: formData
        })

        const result = await response.json()

        if (result.code === 200) {
          ElMessage.success(`文件 ${file.name} 上传成功`)
        } else {
          ElMessage.error(`文件 ${file.name} 上传失败: ${result.msg}`)
        }
      } catch (error) {
        console.error(`文件 ${file.name} 上传失败:`, error)
        ElMessage.error(`文件 ${file.name} 上传失败`)
      }
    }

    isUploading.value = false

    // 关闭对话框并刷新列表
    openUpload.value = false
    fileListUpload.value = []
    fetchFileList()
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败')
    isUploading.value = false
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
  console.log('开始校验文件:', file.name, '大小:', file.size, '类型:', file.type)

  // 0. 检查上传配置是否完整
  if (!fileConfigStore.config) {
    ElMessage.error('文件上传配置未加载，请刷新页面重试')
    return false
  }

  if (!fileConfigStore.config.uploadUrl) {
    ElMessage.error('文件上传URL未配置，请联系管理员设置')
    return false
  }

  if (!fileConfigStore.config.maxSize) {
    ElMessage.error('文件大小限制未配置，请联系管理员设置')
    return false
  }

  if (!fileConfigStore.config.allowExtensions || fileConfigStore.config.allowExtensions.length === 0) {
    ElMessage.error('允许的文件类型未配置，请联系管理员设置')
    return false
  }

  // 1. 检查文件名
  if (!file.name || file.name.trim() === '') {
    ElMessage.error('文件名不能为空')
    return false
  }

  // 2. 检查文件名长度
  if (file.name.length > 255) {
    ElMessage.error('文件名过长，请使用更短的文件名')
    return false
  }

  // 3. 检查文件名是否包含非法字符
  const invalidChars = /[<>:"/\\|?*\x00-\x1f]/
  if (invalidChars.test(file.name)) {
    ElMessage.error('文件名包含非法字符，请重命名后上传')
    return false
  }

  // 4. 检查文件大小限制
  const maxSizeBytes = maxFileSize.value * 1024 * 1024
  if (file.size > maxSizeBytes) {
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2)
    ElMessage.error(`文件 "${file.name}" 大小 ${fileSizeMB}MB 超过限制，最大允许 ${maxFileSize.value}MB`)
    return false
  }

  // 5. 检查文件是否为空
  if (file.size === 0) {
    ElMessage.error(`文件 "${file.name}" 为空文件，请选择有效文件`)
    return false
  }

  // 6. 检查文件扩展名
  const fileExtension = file.name.split('.').pop()?.toLowerCase()
  if (!fileExtension) {
    ElMessage.error(`文件 "${file.name}" 没有扩展名，请添加正确的文件扩展名`)
    return false
  }

  if (allowedExtensions.value.length > 0) {
    if (!allowedExtensions.value.includes(fileExtension)) {
      ElMessage.error(`文件 "${file.name}" 类型不支持，允许的类型：${allowedExtensions.value.join(', ')}`)
      return false
    }
  }

  // 7. 检查MIME类型（额外验证）
  if (file.type) {
    const allowedMimeTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
      'audio/mp3', 'audio/wav', 'audio/mpeg'
    ]

    // 如果MIME类型不在允许列表中，给出警告但不阻止上传
    if (!allowedMimeTypes.includes(file.type)) {
      console.warn(`文件 "${file.name}" 的MIME类型 "${file.type}" 不在标准列表中，但允许上传`)
    }
  }

  console.log('文件校验通过:', file.name)
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
  ElMessage.warning('一次只能上传1个文件')
}

// 初始化
onMounted(async () => {
  // 加载文件配置和文件类型分组数据
  try {
    await Promise.all([
      fileConfigStore.loadFileConfig(true), // 强制刷新配置
      loadFileTypeGroupData() // 加载文件类型分组数据
    ])
    console.log('文件配置已更新:', fileConfigStore.config)
    console.log('文件类型分组数据已加载:', fileTypeGroupData.value)
  } catch (error) {
    console.error('加载配置失败:', error)
    ElMessage.error('加载配置失败')
  }

  fetchFileList()
  fetchPreviewServerUrl()
})

// 打开上传对话框
const handleAdd = async () => {
  // 检查配置是否已加载
  if (!fileConfigStore.config) {
    try {
      await fileConfigStore.loadFileConfig(true)
    } catch (error) {
      ElMessage.error('加载文件上传配置失败，请检查系统配置')
      return
    }
  }

  // 再次检查配置是否完整
  if (!fileConfigStore.config?.uploadUrl) {
    ElMessage.error('资源设置不能为空，请先配置上传URL')
    return
  }

  uploadTitle.value = "文件上传";
  openUpload.value = true;
  fileListUpload.value = [];
  if (uploadFormRef.value) {
    uploadFormRef.value.resetFields();
  }
}

// 获取预览服务器URL（已废弃，现在从文件配置中获取）
const fetchPreviewServerUrl = async () => {
  // 预览服务器URL现在从文件配置中获取，此函数保留用于兼容性
  console.log('预览服务器URL从文件配置中获取:', previewServerUrl.value)
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
  const extension = filename.toLowerCase().split('.').pop() || ''
  return fileTypeGroupData.value.application?.includes(extension) && extension === 'pdf'
}

// 判断是否为PPTX文件
const isPptxFile = (filename: string) => {
  const extension = filename.toLowerCase().split('.').pop() || ''
  return fileTypeGroupData.value.application?.includes(extension) && (extension === 'pptx' || extension === 'ppt')
}

// 判断是否为视频文件
const isVideoFile = (filename: string) => {
  const extension = filename.toLowerCase().split('.').pop() || ''
  return fileTypeGroupData.value.video?.includes(extension) || false
}

// 判断是否为音频文件
const isAudioFile = (filename: string) => {
  const extension = filename.toLowerCase().split('.').pop() || ''
  return fileTypeGroupData.value.audio?.includes(extension) || false
}

// 判断是否为Word文件
const isWordFile = (filename: string) => {
  const extension = filename.toLowerCase().split('.').pop() || ''
  return fileTypeGroupData.value.application?.includes(extension) && (extension === 'doc' || extension === 'docx')
}

// 判断是否为Excel文件
const isExcelFile = (filename: string) => {
  const extension = filename.toLowerCase().split('.').pop() || ''
  return fileTypeGroupData.value.application?.includes(extension) && extension === 'xlsx'
}

// 判断是否为PPT文件
const isPptFile = (filename: string) => {
  const extension = filename.toLowerCase().split('.').pop() || ''
  return fileTypeGroupData.value.application?.includes(extension) && (extension === 'ppt' || extension === 'pptx')
}


// 检查预览配置
const checkPreviewConfig = () => {
  // 检查是否启用预览
  if (!fileConfigStore.config?.hasPreview) {
    ElMessage.warning('文件预览功能未启用')
    return false
  }

  // 检查预览URL是否配置
  if (!fileConfigStore.config?.previewUrl) {
    ElMessage.error('预览URL未配置，无法预览文件')
    return false
  }

  return true
}

// 处理PDF预览
const handlePdfPreview = (file: FileInfo) => {
  if (!checkPreviewConfig()) return

  previewFile.value = file
  previewDialogVisible.value = true
}

// 处理PPTX预览
const handlePptxPreview = (file: FileInfo) => {
  if (!checkPreviewConfig()) return

  previewFile.value = file
  previewDialogVisible.value = true
}

// 处理视频预览
const handleVideoPreview = (file: FileInfo) => {
  if (!checkPreviewConfig()) return

  previewFile.value = file
  previewDialogVisible.value = true
}

// 处理音频预览
const handleAudioPreview = (file: FileInfo) => {
  if (!checkPreviewConfig()) return

  previewFile.value = file
  previewDialogVisible.value = true
}

// 处理Word预览
const handleWordPreview = (file: FileInfo) => {
  if (!checkPreviewConfig()) return

  previewFile.value = file
  previewDialogVisible.value = true
}

// 处理Excel预览
const handleExcelPreview = (file: FileInfo) => {
  if (!checkPreviewConfig()) return

  previewFile.value = file
  previewDialogVisible.value = true
}

// 处理PPT预览
const handlePptPreview = (file: FileInfo) => {
  if (!checkPreviewConfig()) return

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
  return previewServerUrl.value
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

// 处理文件编辑
const handleEdit = (row: FileInfo) => {
  editTitle.value = '编辑文件信息'
  openEdit.value = true

  // 复制文件信息到编辑表单
  Object.assign(editForm, {
    id: row.id,
    fileName: row.fileName,
    size: row.size,
    FileInfo: row.FileInfo,
    originalFilename: row.originalFilename,
    fileUrl: row.fileUrl,
    fileExt: row.fileExt,
    fileType: row.fileType,
    contentType: row.contentType,
    filePath: row.filePath,
    logo: row.logo,
    fileGroup: row.fileGroup
  })

  // 分离文件名和扩展名
  const lastDotIndex = row.originalFilename.lastIndexOf('.')
  if (lastDotIndex > 0) {
    editForm.fileNameWithoutExt = row.originalFilename.substring(0, lastDotIndex)
    fileExtension.value = row.originalFilename.substring(lastDotIndex)
  } else {
    editForm.fileNameWithoutExt = row.originalFilename
    fileExtension.value = ''
  }

  // 清除表单验证
  editFormRef.value?.clearValidate()
}

// 提交编辑
const submitEdit = async () => {
  if (!editFormRef.value) return

  try {
    await editFormRef.value.validate()
    editLoading.value = true

    // 合并文件名和扩展名
    editForm.originalFilename = editForm.fileNameWithoutExt + fileExtension.value

    await updateFileInfo(editForm)
    ElMessage.success('文件信息更新成功')
    openEdit.value = false
    fetchFileList()
  } catch (error) {
    console.error('更新文件信息失败:', error)
    ElMessage.error('更新文件信息失败')
  } finally {
    editLoading.value = false
  }
}

// 关闭编辑对话框
const closeFileEdit = () => {
  openEdit.value = false
  editFormRef.value?.clearValidate()
}

// 处理资源设置
const handleResourceSettings = async () => {
  settingsTitle.value = '资源设置'
  openSettings.value = true

  // 加载文件类型选项和分组数据
  await Promise.all([
    loadFileTypeOptions(),
    loadFileTypeGroupData()
  ])

  // 从store中加载当前配置
  if (fileConfigStore.config) {
    settingsForm.previewUrl = fileConfigStore.config.previewUrl || ''
    settingsForm.uploadUrl = fileConfigStore.config.uploadUrl || ''
    settingsForm.maxSize = fileConfigStore.config.maxSize || 10
    settingsForm.allowExtensions = fileConfigStore.config.allowExtensions || []
    settingsForm.previewType = fileConfigStore.config.previewType || []
    settingsForm.hasPreview = fileConfigStore.config.hasPreview !== false

    // 更新预览文件类型选项
    updatePreviewTypeOptions()
  }

  // 清除表单验证
  settingsFormRef.value?.clearValidate()
}

// 提交资源设置
const submitSettings = async () => {
  if (!settingsFormRef.value) return

  try {
    await settingsFormRef.value.validate()
    settingsLoading.value = true

    const configData: FileConfig = {
      previewUrl: settingsForm.previewUrl,
      uploadUrl: settingsForm.uploadUrl,
      maxSize: settingsForm.maxSize,
      allowExtensions: settingsForm.allowExtensions,
      previewType: settingsForm.previewType,
      fileExt: settingsForm.allowExtensions.join(','),
      hasPreview: settingsForm.hasPreview
    }

    await updateFileConfig(configData)
    ElMessage.success('资源设置更新成功')
    openSettings.value = false

    // 重新加载文件配置
    await fileConfigStore.loadFileConfig(true)
  } catch (error) {
    console.error('更新资源设置失败:', error)
    ElMessage.error('更新资源设置失败')
  } finally {
    settingsLoading.value = false
  }
}

// 关闭资源设置对话框
const closeResourceSettings = () => {
  openSettings.value = false
  settingsFormRef.value?.clearValidate()
}

// 监听上传文件类型变化，自动更新预览文件类型选项
watch(() => settingsForm.allowExtensions, () => {
  updatePreviewTypeOptions()
  // 过滤掉不在允许列表中的预览类型
  settingsForm.previewType = settingsForm.previewType.filter(type =>
    settingsForm.allowExtensions.includes(type)
  )
}, { deep: true })






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

  /* 上传说明样式 */
  .upload-tips {
    margin-bottom: 20px;

    .upload-tips-content {
      p {
        margin: 8px 0;
        line-height: 1.5;

        strong {
          color: #409eff;
        }
      }
    }
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

  // 附件容器样式
  .attachment-container {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 16px !important;
    max-height: 300px !important;
    overflow-y: auto !important;
    padding: 8px !important;
  }

  .attachment-card {
    position: relative !important;
    width: 200px !important;
    height: 240px !important;
    background: white !important;
    border: 1px solid #e0e0e0 !important;
    border-radius: 12px !important;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08) !important;
    transition: all 0.3s ease !important;
    overflow: hidden !important;
    display: flex !important;
    flex-direction: column !important;

    &:hover {
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
      transform: translateY(-4px) !important;
      border-color: #409eff !important;
    }
  }

  .file-preview {
    position: relative !important;
    width: 100% !important;
    height: 120px !important;
    background: var(--el-fill-color-lighter) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    overflow: hidden !important;
    flex-shrink: 0 !important;
  }

  .image-preview {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      max-width: 100%;
      max-height: 100%;
      width: auto;
      height: auto;
      object-fit: contain;
      border-radius: 4px;
    }
  }

  .file-preview-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .file-type-thumbnail {
    max-width: 80px;
    max-height: 80px;
    width: auto;
    height: auto;
    object-fit: contain;
    border-radius: 4px;
  }

  .preview-btn {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 2;
  }

  .file-preview-container:hover .preview-btn {
    opacity: 1;
  }

  .file-preview-container:hover .file-type-thumbnail {
    opacity: 0.7;
  }

  .add-file-card {
    cursor: pointer;
    border: 2px dashed var(--el-border-color);
    background: var(--el-fill-color-lighter);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    &:hover {
      border-color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }
  }

  .add-file-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: var(--el-text-color-secondary);
  }

  .add-file-icon {
    font-size: 32px;
    margin-bottom: 8px;
    color: var(--el-color-primary);
  }

  .add-file-text {
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }

  .action-buttons {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    background: white;
    flex: 1;
    justify-content: center;

    .delete-badge-corner {
      transition: all 0.2s ease !important;

      &:hover {
        transform: scale(1.1) !important;

        .el-badge__content {
          background: #f56c6c !important;
          transform: scale(1.1) !important;
        }
      }

      .el-badge__content {
        background: #f56c6c !important;
        border: 2px solid #fff !important;
        color: #fff !important;
        font-size: 14px !important;
        font-weight: bold !important;
        min-width: 24px !important;
        height: 24px !important;
        line-height: 24px !important;
        border-radius: 50% !important;
        padding: 0 !important;
        transition: all 0.2s ease !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
      }
    }

    .el-button {
      width: 100%;
      justify-content: flex-start;
      font-size: 12px;
      padding: 4px 8px;
      height: 28px;
      line-height: 1.2;

      .el-icon {
        margin-right: 4px;
        font-size: 12px;
      }
    }
  }

  // 编辑对话框样式
  .edit-file-preview {
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
    margin-top: 20px;

    .file-info-display {
      width: 100%;

      .file-name-display {
        font-size: 16px;
        font-weight: 500;
        color: #333;
        margin-bottom: 8px;
        word-break: break-all;
        line-height: 1.4;
        text-align: center;
      }

      .file-details {
        display: flex;
        flex-direction: column;
        gap: 4px;
        align-items: center;

        .file-size {
          font-size: 14px;
          color: #666;
        }

        .file-type {
          font-size: 12px;
          color: #999;
          background: #e9ecef;
          padding: 2px 6px;
          border-radius: 4px;
          display: inline-block;
          max-width: fit-content;
        }
      }
    }
  }

  // 表单中的文件信息预览样式
  .file-info-preview {
    width: 80px;
    height: 80px;
    position: relative;
    display: inline-block;

    .form-preview-image {
      width: 80px;
      height: 80px;
      object-fit: contain;
      border-radius: 4px;
      border: 1px solid #e0e0e0;
    }
  }

  // 文件名输入框样式
  .filename-input-container {
    .filename-input-with-suffix {
      :deep(.el-input__suffix) {
        .file-extension-suffix {
          color: #909399;
          font-size: 14px;
          font-weight: 400;
          padding-right: 8px;
          user-select: none;
          pointer-events: none;
        }
      }
    }
  }
}
</style>
