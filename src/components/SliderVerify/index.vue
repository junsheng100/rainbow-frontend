<template>
  <div class="slider-verify" ref="sliderRef">
    <div class="slider-track">
      <div class="slider-bg"></div>
      <div class="slider-text">{{ sliderText }}</div>
    </div>
    <div
      class="slider-button"
      :class="{ 'slider-button--success': isSuccess }"
      :style="{ left: buttonLeft + 'px' }"
      @mousedown="handleMouseDown"
    >
      <i class="el-icon-arrow-right"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  onSuccess?: () => void
  onFail?: () => void
}>()

const sliderRef = ref<HTMLElement | null>(null)
const buttonLeft = ref(0)
const isSuccess = ref(false)
const sliderText = ref('向右滑动完成验证')
const isDragging = ref(false)
const startX = ref(0)
const maxLeft = ref(0)

const handleMouseDown = (e: MouseEvent) => {
  if (isSuccess.value) return
  isDragging.value = true
  startX.value = e.clientX - buttonLeft.value
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return
  const moveX = e.clientX - startX.value
  buttonLeft.value = Math.max(0, Math.min(moveX, maxLeft.value))
}

const handleMouseUp = () => {
  if (!isDragging.value) return
  isDragging.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)

  if (buttonLeft.value >= maxLeft.value - 5) {
    isSuccess.value = true
    sliderText.value = '验证通过'
    props.onSuccess?.()
  } else {
    buttonLeft.value = 0
    props.onFail?.()
  }
}

onMounted(() => {
  if (sliderRef.value) {
    maxLeft.value = sliderRef.value.clientWidth - 40
  }
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})
</script>

<style lang="scss" scoped>
.slider-verify {
  position: relative;
  width: 100%;
  height: 40px;
  background-color: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;

  .slider-track {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    .slider-bg {
      position: absolute;
      left: 0;
      top: 0;
      width: 0;
      height: 100%;
      background-color: #409eff;
      transition: width 0.1s;
    }

    .slider-text {
      position: relative;
      z-index: 1;
      color: #666;
      font-size: 14px;
    }
  }

  .slider-button {
    position: absolute;
    top: 0;
    left: 0;
    width: 40px;
    height: 40px;
    background-color: #fff;
    box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;

    &:hover {
      background-color: #f5f5f5;
    }

    &--success {
      background-color: #67c23a;
      color: #fff;
    }
  }
}
</style> 