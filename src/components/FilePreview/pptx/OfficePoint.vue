<template>
  <div id="pptxview">
    <iframe :src="getPptUrl" :width="width" :height="height" :style="style"
            :scrolling="scrolling"></iframe>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

interface Props {
  url: string
  width?: string
  height?: string
  style?: string
  scrolling?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: '1280px',
  height: '780px',
  style: 'border: none',
  scrolling: 'none'
})

const fileUrl = ref('')

const getPptUrl = computed(() => {
  return fileUrl.value
})

const getFileUrl = () => {
  fileUrl.value = ""
  const protocol = window.location.protocol
  const host = window.location.host
  fileUrl.value = protocol + "//" + host + "/pptx/index.html?fileUrl=" + encodeURIComponent(props.url)
  console.log('OfficePoint - fileUrl:', fileUrl.value)
  return fileUrl.value
}

onMounted(() => {
  getFileUrl()
  console.log("OfficePoint - Component mounted, fileUrl:", fileUrl.value)
})

// 确保组件有默认导出
defineOptions({
  name: 'OfficePoint'
})
</script>

<style scoped>
#pptxview {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
