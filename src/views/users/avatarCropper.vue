<template>
  <div class="avatar-cropper
">
    <div class="loading-container" v-if="isLoading">
      <el-skeleton style="width: 100%" animated>
        <template #template>
          <div style="padding: 14px">
            <el-skeleton-item variant="image" style="width: 100%; height: 200px" />
          </div>
        </template>
      </el-skeleton>
      <div class="loading-text">正在加载头像...</div>
    </div>

    <div class="upload-container" v-else-if="!imageUrl">
      <el-upload
        class="upload-button"
        :action="action"
        :headers="headers"
        :before-upload="handleBeforeUpload"
        :show-file-list="false"
        accept="image/jpeg,image/png,image/webp"
      >
        <el-button type="primary" :loading="isUploading">
          <el-icon><Upload /></el-icon>
          {{ isUploading ? '上传中...' : '选择图片' }}
        </el-button>
        <template #tip>
          <div class="upload-tip">支持 jpg
、png、webp 格式，大小不超过 10MB</div>
        </template>
      </el-upload>
    </div>

    <div v-if="imageUrl" class="cropper-container">
      <vue-cropper
        ref="cropperRef"
        :img="imageUrl"
        :info="true"
        :autoCrop="true"
        :autoCropWidth="200"
        :autoCropHeight="200"
        :fixedBox="true"
        :centerBox="true"
        @realTime="handleRealTime"
        @img-load="handleImgLoad"
        @img-error="handleImgError"
      />
    </div>

    <div v-if="imageUrl" class="preview-container">
      <div class="preview-title">预览效果</div>
      <div class="preview-box" :style="previewStyle"></div>
    </div>

    <div v-if="imageUrl" class="cropper-actions">
      <el-button-group>
        <el-button type="primary" @click="handleRotateLeft">
          <el-icon><Refresh /></el-icon>
          向左旋转
        </el-button>
        <el-button type="primary" @click="handleRotateRight">
          <el-icon><Refresh /></el-icon>
          向右旋转
        </el-button>
      </el-button-group>
      <el-button type="success" @click="handleCropImage">
        <el-icon><Crop /></el-icon>
        确认裁剪
      </el-button>
      <el-button @click="handleCancel">
        <el-icon><Close /></el-icon>
        取消
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload, Refresh, Crop, Close } from '@element-plus/icons-vue'
import { VueCropper } from 'vue-cropper'
import 'vue-cropper/dist/index.css'

const props = defineProps({
  action: {
    type: String,
    required: true
  },
  headers: {
    type: Object,
    default: () => ({})
  },
  maxSize: {
    type: Number,
    default: 10 // 默认10MB
  },
  existingAvatar: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['crop-success', 'crop-error', 'cancel'])

// 响应式数据
const isUploading = ref(false)
const isLoading = ref(false)
const imageUrl = ref('')
const cropperRef = ref<any>(null)

// 监听现有头像
watch(() => props.existingAvatar, (newValue) => {
  if (newValue && !imageUrl.value) {
    isLoading.value = true
    // 创建一个新的图片对象来预加载
    const img = new Image()
    img.onload = () => {
      imageUrl.value = newValue
      isLoading.value = false
    }
    img.onerror = () => {
      isLoading.value = false
      ElMessage.error('头像加载失败')
    }
    img.src = newValue
  }
}, { immediate: true })

// 初始化时设置现有头像
onMounted(() => {
  if (props.existingAvatar) {
    isLoading.value = true
    const img = new Image()
    img.onload = () => {
      imageUrl.value = props.existingAvatar
      isLoading.value = false
    }
    img.onerror = () => {
      isLoading.value = false
      ElMessage.error('头像加载失败')
    }
    img.src = props.existingAvatar
  }
})

// 预览样式
const previewStyle = ref({
  width: '100px',
  height: '100px',
  overflow: 'hidden',
  margin: '0 auto',
  border: '1px solid #ccc',
  backgroundImage: '',
  backgroundSize: 'contain',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat'
})

// 上传前验证
const handleBeforeUpload = (file: File) => {
  const isImage = /\.(jpg|jpeg|png|webp)$/i.test(file.name)
  const isLtMaxSize = file.size / 1024 / 1024 < props.maxSize

  if (!isImage) {
    ElMessage.error(`只能上传 jpg、jpeg、png、webp 格式的图片！`)
    return false
  }

  if (!isLtMaxSize) {
    ElMessage.error(`图片大小不能超过 ${props.maxSize}MB！`)
    return false
  }

  isUploading.value = true

  // 读取文件并设置到裁剪组件
  const reader = new FileReader()
  reader.onload = (e) => {
    imageUrl.value = e.target?.result as string
    isUploading.value = false
  }
  reader.readAsDataURL(file)

  return false // 阻止自动上传，改为裁剪后手动上传
}

// 实时预览
const handleRealTime = (data: any) => {
  previewStyle.value.backgroundImage = `url(${data.url})`
}

const handleImgLoad = () =>{

}
const handleImgError = () =>{

}

// 向左旋转
const handleRotateLeft = () => {
  cropperRef.value?.rotateLeft()
}

// 向右旋转
const handleRotateRight = () => {
  cropperRef.value?.rotateRight()
}

// 确认裁剪
const handleCropImage = () => {
  if (!cropperRef.value) return

  cropperRef.value.getCropBlob(async (blob: Blob) => {
    try {
      isUploading.value = true

      const formData = new FormData()
      formData.append('file', blob, 'avatar.png')

      const response = await fetch(props.action, {
        method: 'POST',
        headers: props.headers,
        body: formData
      })

      const result = await response.json()

      if (result.code === 200 && result.data) {
        emit('crop-success', result.data)
        ElMessage.success('上传成功')
      } else {
        emit('crop-error', result)
        ElMessage.error(result.msg || '上传失败，请重试')
      }
    } catch (error) {
      emit('crop-error', error)
      ElMessage.error('上传失败，请重试')
    } finally {
      isUploading.value = false
    }
  })
}

// 取消裁剪
const handleCancel = () => {
  imageUrl.value = ''
  emit('cancel')
}
</script>

<style lang="scss" scoped>
.avatar-cropper {
  .upload-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 20px 0;

    .upload-tip {
      color: #909399;
      font-size: 12px;
      margin-top: 8px;
    }
  }

  .cropper-container {
    height: 300px;
    margin-bottom: 20px;
  }

  .preview-container {
    margin-bottom: 20px;

    .preview-title {
      text-align: center;
      margin-bottom: 10px;
      color: #606266;
    }

    .preview-box {
      width: 100px;
      height: 100px;
      overflow: hidden;
      margin: 0 auto;
      border: 1px solid #ccc;
    }
  }

  .cropper-actions {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-bottom: 20px;
  }
}
</style>
