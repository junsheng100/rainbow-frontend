<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    :width="dialogWidth"
    :height="dialogHeight"
    :top="top"
    :modal="modal"
    :append-to-body="appendToBody"
    :lock-scroll="lockScroll"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :show-close="showClose"
    :destroy-on-close="destroyOnClose"
    :center="center"
    :draggable="draggable"
    :resize="resize"
    :before-close="handleBeforeClose"
    @close="handleClose"
    @open="handleOpen"
    :style="dialogStyle"
    ref="dialogRef"
  >
    <slot />
    <template #footer v-if="$slots.footer">
      <slot name="footer" />
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useDialogSizeStore } from '@/stores/dialogSize'

interface Props {
  modelValue: boolean
  title?: string
  width?: string | number
  height?: string | number
  top?: string
  modal?: boolean
  appendToBody?: boolean
  lockScroll?: boolean
  closeOnClickModal?: boolean
  closeOnPressEscape?: boolean
  showClose?: boolean
  destroyOnClose?: boolean
  center?: boolean
  draggable?: boolean
  resize?: boolean
  beforeClose?: (done: () => void) => void
  dialogKey?: string // 用于标识不同dialog的唯一key
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  width: '50%',
  height: 'auto',
  top: '15vh',
  modal: true,
  appendToBody: true,
  lockScroll: true,
  closeOnClickModal: true,
  closeOnPressEscape: true,
  showClose: true,
  destroyOnClose: false,
  center: false,
  draggable: true,
  resize: true,
  dialogKey: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'close': []
  'open': []
}>()

const dialogSizeStore = useDialogSizeStore()
const dialogRef = ref()
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

// 计算dialog的尺寸，优先使用存储的尺寸
const dialogWidth = computed(() => {
  if (!props.dialogKey) return props.width
  
  const savedSize = dialogSizeStore.getDialogSize(props.dialogKey)
  return savedSize?.width || props.width
})

const dialogHeight = computed(() => {
  if (!props.dialogKey) return props.height
  
  const savedSize = dialogSizeStore.getDialogSize(props.dialogKey)
  return savedSize?.height || props.height
})

// dialog样式
const dialogStyle = computed(() => {
  if (!props.dialogKey) return {}
  
  const savedSize = dialogSizeStore.getDialogSize(props.dialogKey)
  if (!savedSize) return {}
  
  return {
    transform: savedSize.transform || '',
    left: savedSize.left || '',
    top: savedSize.top || ''
  }
})

// 处理dialog打开
const handleOpen = () => {
  emit('open')
  
  // 如果有存储的位置信息，在下一个tick应用
  if (props.dialogKey) {
    nextTick(() => {
      const savedSize = dialogSizeStore.getDialogSize(props.dialogKey)
      if (savedSize && dialogRef.value) {
        const dialogEl = dialogRef.value.$el
        if (dialogEl) {
          if (savedSize.transform) {
            dialogEl.style.transform = savedSize.transform
          }
          if (savedSize.left) {
            dialogEl.style.left = savedSize.left
          }
          if (savedSize.top) {
            dialogEl.style.top = savedSize.top
          }
        }
      }
    })
  }
}

// 处理dialog关闭
const handleClose = () => {
  emit('close')
  
  // 保存当前dialog的尺寸和位置
  if (props.dialogKey && dialogRef.value) {
    const dialogEl = dialogRef.value.$el
    if (dialogEl) {
      const rect = dialogEl.getBoundingClientRect()
      const style = window.getComputedStyle(dialogEl)
      
      const sizeData = {
        width: rect.width + 'px',
        height: rect.height + 'px',
        transform: style.transform,
        left: style.left,
        top: style.top
      }
      
      dialogSizeStore.saveDialogSize(props.dialogKey, sizeData)
    }
  }
}

// 处理beforeClose
const handleBeforeClose = (done: () => void) => {
  if (props.beforeClose) {
    props.beforeClose(done)
  } else {
    done()
  }
}

// 监听dialog可见性变化
watch(dialogVisible, (newVal) => {
  if (newVal) {
    // dialog打开时的处理
    nextTick(() => {
      if (props.dialogKey && dialogRef.value) {
        const savedSize = dialogSizeStore.getDialogSize(props.dialogKey)
        if (savedSize) {
          const dialogEl = dialogRef.value.$el
          if (dialogEl) {
            // 应用保存的尺寸和位置
            if (savedSize.width) {
              dialogEl.style.width = savedSize.width
            }
            if (savedSize.height) {
              dialogEl.style.height = savedSize.height
            }
            if (savedSize.transform) {
              dialogEl.style.transform = savedSize.transform
            }
            if (savedSize.left) {
              dialogEl.style.left = savedSize.left
            }
            if (savedSize.top) {
              dialogEl.style.top = savedSize.top
            }
          }
        }
      }
    })
  }
})
</script>

<style lang="scss" scoped>
:deep(.el-dialog) {
  transition: all 0.3s ease;
  
  // 确保dialog可以调整大小
  resize: both;
  overflow: auto;
  
  // 最小尺寸限制
  min-width: 300px;
  min-height: 200px;
}

:deep(.el-dialog__header) {
  cursor: move;
  user-select: none;
}

:deep(.el-dialog__body) {
  overflow: auto;
}
</style>
