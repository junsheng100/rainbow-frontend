<template>
  <div class="show-file-view">
    <div v-html="docxHtml" class="docx-table docx-paragraph"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps, watch } from 'vue'
import mammoth from 'mammoth'

interface Props {
  url: string
}

const props = defineProps<Props>()

const docxHtml = ref('')

const readFileUrl = async (url: string) => {
  try {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    
    const result = await mammoth.convertToHtml({ arrayBuffer: new Uint8Array(arrayBuffer) })
    docxHtml.value = result.value
  } catch (error) {
    console.error('读取Word文件失败:', error)
  }
}

onMounted(() => {
  if (props.url) {
    readFileUrl(props.url)
  }
})

watch(() => props.url, (newUrl) => {
  if (newUrl) {
    readFileUrl(newUrl)
  }
})

defineOptions({
  name: 'WordView'
})
</script>

<style scoped>
/* 全局样式覆盖 */
.docx-table {
  border-collapse: collapse;
  width: 100%;
  height: 600px;
  overflow: hidden auto;
}

.docx-paragraph {
  margin: 8px 0;
  padding: 10px;
}
</style>
