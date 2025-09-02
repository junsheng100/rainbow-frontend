import SvgIcon from '@/components/SvgIcon/index.vue';
import type { App } from 'vue';

// 导入所有 svg 图标
const svgFiles = import.meta.glob('@/assets/icons/svg/*.svg', { eager: true });
const svgIcons = Object.keys(svgFiles).map(key => {
  const name = key.match(/\/([^/]+)\.svg$/)?.[1];
  return name || '';
}).filter(Boolean);

// 注册 svg sprite
const requireAll = (requireContext: Record<string, any>) => {
  return Object.keys(requireContext).map(key => requireContext[key]);
};

// 使用 import.meta.glob 导入所有 SVG 文件
const svgRequire = import.meta.glob('@/assets/icons/svg/*.svg', { eager: true });
requireAll(svgRequire);

export const loadSvg = (app: App) => {
  // 全局注册 svg-icon 组件（同步方式）
  app.component('svg-icon', SvgIcon);
};

export const getSvgIcons = () => svgIcons;
