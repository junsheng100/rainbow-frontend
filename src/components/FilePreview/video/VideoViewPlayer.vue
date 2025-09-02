<template>
  <div class="video-player-container">
    <video 
      ref="videoPlayer" 
      controls 
      loop 
      :title="title" 
      autoplay
      class="video-player"
      preload="metadata"
    >
      <source :src="url" :type="type">
      您的浏览器不支持 video 标签。
    </video>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, withDefaults } from 'vue'

interface Props {
  url: string
  type?: string
  title?: string
}

withDefaults(defineProps<Props>(), {
  type: 'video/mp4',
  title: '视频播放器'
})

const videoPlayer = ref<HTMLVideoElement>()

defineOptions({
  name: 'VideoViewPlayer'
})
</script>

<style scoped>
.video-player-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.video-player {
  max-width: 100%;
  max-height: 600px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
