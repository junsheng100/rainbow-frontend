<template>
  <div class="audio-player-container">
    <audio 
      ref="audioPlayer"
      controls 
      :title="title"
      autoplay
      loop
      class="audio-player"
      preload="metadata"
      @ended="onAudioEnded"
      @play="onAudioPlay"
      @pause="onAudioPause"
      @timeupdate="onTimeUpdate"
    >
      <source :src="url" :type="type" />
      您的浏览器不支持 audio 标签。
    </audio>
    
    <!-- 音频信息显示 -->
    <div class="audio-info" v-if="audioInfo">
      <div class="audio-title">{{ title }}</div>
      <div class="audio-duration" v-if="duration">
        时长: {{ formatDuration(duration) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, withDefaults } from 'vue'

interface Props {
  url: string
  type?: string
  title?: string
}

withDefaults(defineProps<Props>(), {
  type: 'audio/mpeg',
  title: '音频播放器'
})

const audioPlayer = ref<HTMLAudioElement>()
const duration = ref<number>(0)
const audioInfo = ref<boolean>(false)

const onAudioEnded = () => {
  console.log('音频播放结束')
}

const onAudioPlay = () => {
  console.log('音频开始播放')
}

const onAudioPause = () => {
  console.log('音频暂停播放')
}

const onTimeUpdate = () => {
  if (audioPlayer.value && !duration.value) {
    duration.value = audioPlayer.value.duration
    audioInfo.value = true
  }
}

const formatDuration = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '00:00'
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

const playAudio = () => {
  audioPlayer.value?.play()
}

const pauseAudio = () => {
  audioPlayer.value?.pause()
}

// 暴露方法给父组件
defineExpose({
  playAudio,
  pauseAudio
})

defineOptions({
  name: 'AudioViewPlayer'
})
</script>

<style scoped>
.audio-player-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.audio-player {
  width: 100%;
  max-width: 500px;
  height: 60px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.audio-info {
  text-align: center;
  color: #606266;
}

.audio-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #303133;
}

.audio-duration {
  font-size: 14px;
  color: #909399;
}
</style>
