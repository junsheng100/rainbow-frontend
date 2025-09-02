<template>
  <div class="icon-select">
    <el-popover
      v-model="visible"
      placement="bottom-start"
      :width="540"
      trigger="click"
    >
      <template #reference>
        <el-input
          v-model="displayIcon"
          placeholder="点击选择图标"
          readonly
          @click="visible = true"
        >
          <template #prefix>
            <el-icon v-if="currentIcon && !isSvgIcon">
              <component :is="currentIcon" />
            </el-icon>
            <svg-icon v-else-if="currentIcon && isSvgIcon" :icon-class="currentIcon" />
          </template>
        </el-input>
      </template>

      <div class="icon-list">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="默认 图标" name="element">
            <el-input
              v-model="searchText"
              placeholder="搜索图标"
              clearable
              class="search-input"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <div class="icon-grid">
              <div
                v-for="icon in filteredElementIcons"
                :key="icon"
                class="icon-item"
                @click="handleSelectElementIcon(icon)"
              >
                <el-icon>
                  <component :is="icon" />
                </el-icon>
                <span class="icon-name">{{ icon }}</span>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="SVG 图标" name="svg">
            <el-input
              v-model="searchText"
              placeholder="搜索图标"
              clearable
              class="search-input"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <div class="icon-grid">
              <div
                v-for="icon in filteredSvgIcons"
                :key="icon"
                class="icon-item"
                @click="handleSelectSvgIcon(icon)"
              >
                <svg-icon :icon-class="icon" />
                <span class="icon-name">{{ icon }}</span>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-popover>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import * as ElementPlusIcons from '@element-plus/icons-vue';
import { Search } from '@element-plus/icons-vue';
import SvgIcon from '@/components/SvgIcon/index.vue';

const props = defineProps<{
  modelValue?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const visible = ref(false);
const searchText = ref('');
const activeTab = ref('element');
const svgIcons = ref<string[]>([]);
const isSvgIcon = ref(false);

// 获取所有 Element Plus 图标
const elementIcons = Object.keys(ElementPlusIcons).filter(name => name !== 'default');

// 当前选中的图标
const currentIcon = computed({
  get: () => {
    const icon = props.modelValue || '';
    // 如果图标名称以 'svg-' 开头，则是 SVG 图标
    if (icon.startsWith('svg-')) {
      isSvgIcon.value = true;
      return icon.substring(4); // 移除 'svg-' 前缀
    } else {
      isSvgIcon.value = false;
      return icon;
    }
  },
  set: (value) => {
    if (isSvgIcon.value) {
      emit('update:modelValue', `svg-${value}`);
    } else {
      emit('update:modelValue', value);
    }
  }
});

// 显示的图标名称
const displayIcon = computed(() => {
  if (isSvgIcon.value && currentIcon.value) {
    return `svg-${currentIcon.value}`;
  }
  return currentIcon.value;
});

// 过滤后的 Element Plus 图标列表
const filteredElementIcons = computed(() => {
  if (!searchText.value) return elementIcons;
  return elementIcons.filter(icon =>
    icon.toLowerCase().includes(searchText.value.toLowerCase())
  );
});

// 过滤后的 SVG 图标列表
const filteredSvgIcons = computed(() => {
  if (!searchText.value) return svgIcons.value;
  return svgIcons.value.filter(icon =>
    icon.toLowerCase().includes(searchText.value.toLowerCase())
  );
});

// 选择 Element Plus 图标
const handleSelectElementIcon = (icon: string) => {
  isSvgIcon.value = false;
  currentIcon.value = icon;
  visible.value = false;
};

// 选择 SVG 图标
const handleSelectSvgIcon = (icon: string) => {
  isSvgIcon.value = true;
  currentIcon.value = icon;
  visible.value = false;
};

// 获取所有 SVG 图标
onMounted(() => {
  // 获取所有 SVG 图标
  const svgFiles = import.meta.glob('@/assets/icons/svg/*.svg', { eager: true });
  svgIcons.value = Object.keys(svgFiles).map(key => {
    const filename = key.split('/').pop() || '';
    return filename.replace('.svg', '');
  });
});
</script>

<style lang="scss" scoped>
.icon-select {
  width: 100%;
}

.icon-list {
  .search-input {
    margin-bottom: 12px;
  }

  .icon-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 12px;
    max-height: 360px;
    overflow-y: auto;

    .icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px 8px;
      cursor: pointer;
      border-radius: 4px;
      transition: background-color 0.2s;

      &:hover {
        background-color: var(--el-color-primary-light-9);
      }

      .el-icon, .svg-icon {
        font-size: 24px;
        margin-bottom: 8px;
      }

      .icon-name {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        text-align: center;
        word-break: break-all;
      }
    }
  }
}
</style>
