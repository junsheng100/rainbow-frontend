# 🌈 Rainbow View - 现代化管理系统前端

[![Vue](https://img.shields.io/badge/Vue-3.4.15-4FC08D?style=flat-square&logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.19-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Element Plus](https://img.shields.io/badge/Element%20Plus-2.7.3-409EFF?style=flat-square&logo=element)](https://element-plus.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> 一个基于 Vue 3 + TypeScript + Vite 构建的现代化企业级管理系统前端框架，提供丰富的组件库和优秀的开发体验。

## ✨ 核心特性

### 🎨 系统特性

- **现代化界面**: 基于 Element Plus 的现代化管理系统界面
- **响应式设计**: 支持多种屏幕尺寸和设备
- **组件化架构**: 高度模块化的组件设计
- **主题系统**: 支持主题切换和自定义

### 🚀 技术优势

- **现代化技术栈**: Vue 3 Composition API + TypeScript + Vite
- **组件化设计**: 丰富的可复用组件库
- **状态管理**: Pinia 状态管理，支持持久化
- **国际化**: 内置 i18n 多语言支持
- **主题系统**: 支持主题切换和自定义
- **权限控制**: 完整的权限管理系统

### 📱 用户体验

- **响应式设计**: 支持多种屏幕尺寸
- **性能优化**: 路由懒加载、组件按需加载
- **错误处理**: 智能错误提示和异常处理
- **无障碍访问**: 支持键盘导航和屏幕阅读器

## 🛠️ 技术栈

### 核心框架

- **Vue 3.4.15** - 渐进式 JavaScript 框架
- **TypeScript 5.3.0** - 类型安全的 JavaScript 超集
- **Vite 5.4.19** - 下一代前端构建工具

### UI 框架

- **Element Plus 2.7.3** - Vue 3 组件库
- **Sass** - CSS 预处理器
- **SVG Icons** - 矢量图标系统

### 状态管理 & 路由

- **Pinia 2.1.7** - Vue 状态管理库
- **Vue Router 4.2.5** - Vue.js 官方路由管理器

### 开发工具

- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **Vue TSC** - Vue 类型检查

### 功能组件

- **CodeMirror 6** - 代码编辑器
- **ECharts 5.6.0** - 数据可视化图表
- **WangEditor 5.1.23** - 富文本编辑器
- **Vue PDF Embed** - PDF 文档预览
- **Vue Office** - Office 文档预览

## 📁 项目结构

```
rainbow-frontend/
├── 📁 src/                    # 源代码目录
│   ├── 📁 api/               # API 接口定义
│   ├── 📁 assets/            # 静态资源
│   │   └── 📁 icons/         # SVG 图标
│   ├── 📁 components/        # 公共组件
│   │   ├── 📁 ChangePassword/    # 密码修改组件
│   │   ├── 📁 CronExpression/    # 定时表达式组件
│   │   ├── 📁 FilePreview/       # 文件预览组件
│   │   ├── 📁 GlobalDialog/      # 全局对话框组件
│   │   ├── 📁 Layout/            # 布局相关组件
│   │   ├── 📁 Menus/             # 菜单组件
│   │   ├── 📁 SliderVerify/      # 滑块验证组件
│   │   └── 📁 UserProfile/       # 用户资料组件
│   ├── 📁 composables/       # 组合式函数
│   ├── 📁 config/            # 配置文件
│   ├── 📁 directives/        # 自定义指令
│   ├── 📁 hooks/             # 自定义 Hooks
│   ├── 📁 i18n/              # 国际化配置
│   ├── 📁 layouts/           # 布局组件
│   ├── 📁 router/            # 路由配置
│   ├── 📁 stores/            # 状态管理
│   ├── 📁 styles/            # 全局样式
│   ├── 📁 types/             # TypeScript 类型定义
│   ├── 📁 utils/             # 工具函数
│   ├── 📁 views/             # 页面组件
│   ├── 📄 App.vue            # 根组件
│   ├── 📄 main.ts            # 应用入口
│   └── 📄 env.d.ts           # 环境类型声明
├── 📁 public/                # 公共资源
├── 📁 document/              # 项目文档
├── 📄 package.json           # 项目依赖
├── 📄 vite.config.ts         # Vite 配置
├── 📄 tsconfig.json          # TypeScript 配置
└── 📄 README.md              # 项目说明
```

## 🚀 快速开始

### 环境要求

- **Node.js**: 18.0.0 或更高版本
- **npm**: 8.0.0 或更高版本
- **浏览器**: Chrome 70+, Firefox 65+, Safari 12+, Edge 79+

### 安装依赖

```bash
# 克隆项目
git clone <repository-url>
cd rainbow-frontend

# 安装依赖
npm install
```

### 开发环境

```bash
# 启动开发服务器
npm run dev

# 访问地址: http://localhost:8008
```

### 生产构建

```bash
# 构建生产版本
npm run build

# 构建测试版本
npm run build:staging

# 预览构建结果
npm run preview
```

### 代码质量

```bash
# 类型检查
npm run type-check

# 代码检查
npm run lint

# 代码格式化
npm run format
```

## 🔧 配置说明

### 环境变量

项目支持多环境配置，主要环境变量包括：

```bash
# 开发服务器配置
VITE_DEV_SERVER_PORT=8008
VITE_DEV_SERVER_HOST=0.0.0.0

# API 代理配置
VITE_DEV_PROXY_TARGET=http://127.0.0.1:8080

# 应用基础路径
VITE_APP_BASE_PATH=/

# 构建配置
VITE_ENABLE_SOURCEMAP=false
VITE_DROP_CONSOLE=true
```

### 代理配置

开发环境已配置 API 代理，支持以下路径：

- `/api/*` → 后端 API 接口
- `/web/*` → 兼容旧版本路径
- `/resources/*` → 静态资源文件

## 🎯 核心功能

### 认证系统

- 🔐 JWT Token 认证
- 🎯 滑块验证码
- 🔒 密码强度验证
- 🔄 自动 Token 刷新

### 用户管理

- 👤 用户信息管理
- 🔑 密码修改
- 🌍 多语言支持
- 🎨 主题切换

### 文件处理

- 📄 PDF 文档预览
- 📝 Office 文档预览
- 🖼️ 图片裁剪和预览
- 📁 文件上传下载

### 开发工具

- 💻 代码编辑器
- 📊 数据可视化
- ✏️ 富文本编辑
- 🕐 定时任务配置


## 📚 开发指南

### 添加新组件

1. 在 `src/components/` 目录创建组件
2. 遵循 Vue 3 Composition API 规范
3. 添加 TypeScript 类型定义
4. 编写组件文档和测试

### 添加新页面

1. 在 `src/views/` 目录创建页面组件
2. 在 `src/router/` 中添加路由配置
3. 配置页面权限和菜单

### 状态管理

- 使用 Pinia 进行状态管理
- 在 `src/stores/` 目录创建 Store
- 支持持久化存储

### 国际化

- 在 `src/i18n/` 目录添加语言包
- 使用 `useI18n()` 组合式函数
- 支持动态语言切换

## 🧪 测试

```bash
# 运行测试（待添加）
npm run test

# 运行测试覆盖率（待添加）
npm run test:coverage
```

## 📦 部署

### Docker 部署

```dockerfile
# 构建镜像
docker build -t rainbow-frontend .

# 运行容器
docker run -p 80:80 rainbow-frontend
```

### 静态部署

```bash
# 构建项目
npm run build

# 部署 dist 目录到 Web 服务器
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE) - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Element Plus](https://element-plus.org/) - Vue 3 组件库
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [Pinia](https://pinia.vuejs.org/) - Vue 状态管理库

## 📞 联系我们

- **QQ**: 304299340
- **E-Mail**: junsheng100@foxmail.com
- **项目地址**: [GitHub Repository]
- **问题反馈**: [Issues]
- **功能建议**: [Discussions]

---

⭐ 如果这个项目对您有帮助，请给我们一个星标！
