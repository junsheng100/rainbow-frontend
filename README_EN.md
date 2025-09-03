# 🌈 Rainbow View - Modern Management System Frontend

[![Vue](https://img.shields.io/badge/Vue-3.4.15-4FC08D?style=flat-square&logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.19-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Element Plus](https://img.shields.io/badge/Element%20Plus-2.7.3-409EFF?style=flat-square&logo=element)](https://element-plus.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> A modern enterprise-level management system frontend framework built with Vue 3 + TypeScript + Vite, supporting multiple layout modes, providing rich component libraries and excellent development experience.

## ✨ Core Features

### 🎨 Multi-Layout System

- **Classic Layout**: Traditional management system layout with top navigation bar and left sidebar menu
- **Windows Layout**: Complete Windows 10 desktop experience
  - 🖥️ Desktop icon system with customizable backgrounds
  - 🪟 Complete window management system (drag, resize, minimize/maximize)
  - 📱 Taskbar and start menu
  - 🔧 System tray and notifications
- **MacBook Layout**: macOS-style layout (in development)

### 🚀 Technical Advantages

- **Modern Tech Stack**: Vue 3 Composition API + TypeScript + Vite
- **Component Design**: Rich reusable component library
- **State Management**: Pinia state management with persistence support
- **Internationalization**: Built-in i18n multi-language support
- **Theme System**: Theme switching and customization support
- **Permission Control**: Complete permission management system

### 📱 User Experience

- **Responsive Design**: Support for multiple screen sizes
- **Performance Optimization**: Route lazy loading, component on-demand loading
- **Error Handling**: Intelligent error prompts and exception handling
- **Accessibility**: Support for keyboard navigation and screen readers

## 🛠️ Technology Stack

### Core Framework

- **Vue 3.4.15** - Progressive JavaScript framework
- **TypeScript 5.3.0** - Type-safe JavaScript superset
- **Vite 5.4.19** - Next-generation frontend build tool

### UI Framework

- **Element Plus 2.7.3** - Vue 3 component library
- **Sass** - CSS preprocessor
- **SVG Icons** - Vector icon system

### State Management & Routing

- **Pinia 2.1.7** - Vue state management library
- **Vue Router 4.2.5** - Vue.js official router

### Development Tools

- **ESLint** - Code quality checking
- **Prettier** - Code formatting
- **Vue TSC** - Vue type checking

### Functional Components

- **CodeMirror 6** - Code editor
- **ECharts 5.6.0** - Data visualization charts
- **WangEditor 5.1.23** - Rich text editor
- **Vue PDF Embed** - PDF document preview
- **Vue Office** - Office document preview

## 📁 Project Structure

```
rainbow-frontend/
├── 📁 src/                    # Source code directory
│   ├── 📁 api/               # API interface definitions
│   ├── 📁 assets/            # Static resources
│   │   └── 📁 icons/         # SVG icons
│   ├── 📁 components/        # Public components
│   │   ├── 📁 ChangePassword/    # Password change component
│   │   ├── 📁 CronExpression/    # Cron expression component
│   │   ├── 📁 FilePreview/       # File preview component
│   │   ├── 📁 GlobalDialog/      # Global dialog component
│   │   ├── 📁 Layout/            # Layout-related components
│   │   ├── 📁 Menus/             # Menu components
│   │   ├── 📁 SliderVerify/      # Slider verification component
│   │   └── 📁 UserProfile/       # User profile component
│   ├── 📁 composables/       # Composable functions
│   ├── 📁 config/            # Configuration files
│   ├── 📁 directives/        # Custom directives
│   ├── 📁 hooks/             # Custom Hooks
│   ├── 📁 i18n/              # Internationalization config
│   ├── 📁 layouts/           # Layout components
│   ├── 📁 router/            # Router configuration
│   ├── 📁 stores/            # State management
│   ├── 📁 styles/            # Global styles
│   ├── 📁 types/             # TypeScript type definitions
│   ├── 📁 utils/             # Utility functions
│   ├── 📁 views/             # Page components
│   ├── 📄 App.vue            # Root component
│   ├── 📄 main.ts            # Application entry
│   └── 📄 env.d.ts           # Environment type declarations
├── 📁 public/                # Public resources
├── 📁 document/              # Project documentation
├── 📄 package.json           # Project dependencies
├── 📄 vite.config.ts         # Vite configuration
├── 📄 tsconfig.json          # TypeScript configuration
└── 📄 README.md              # Project description
```

## 🚀 Quick Start

### Requirements

- **Node.js**: 18.0.0 or higher
- **npm**: 8.0.0 or higher
- **Browser**: Chrome 70+, Firefox 65+, Safari 12+, Edge 79+

### Install Dependencies

```bash
# Clone project
git clone <repository-url>
cd rainbow-frontend

# Install dependencies
npm install
```

### Development Environment

```bash
# Start development server
npm run dev

# Access address: http://localhost:8008
```

### Production Build

```bash
# Build production version
npm run build

# Build staging version
npm run build:staging

# Preview build results
npm run preview
```

### Code Quality

```bash
# Type checking
npm run type-check

# Code linting
npm run lint

# Code formatting
npm run format
```

## 🔧 Configuration

### Environment Variables

The project supports multi-environment configuration with the following main environment variables:

```bash
# Development server configuration
VITE_DEV_SERVER_PORT=8008
VITE_DEV_SERVER_HOST=0.0.0.0

# API proxy configuration
VITE_DEV_PROXY_TARGET=http://127.0.0.1:8080

# Application base path
VITE_APP_BASE_PATH=/

# Build configuration
VITE_ENABLE_SOURCEMAP=false
VITE_DROP_CONSOLE=true
```

### Proxy Configuration

The development environment has configured API proxy support for the following paths:

- `/api/*` → Backend API interfaces
- `/web/*` → Legacy path compatibility
- `/resources/*` → Static resource files

## 🎯 Core Features

### Authentication System

- 🔐 JWT Token authentication
- 🎯 Slider verification code
- 🔒 Password strength validation
- 🔄 Automatic Token refresh

### User Management

- 👤 User information management
- 🔑 Password modification
- 🌍 Multi-language support
- 🎨 Theme switching

### File Processing

- 📄 PDF document preview
- 📝 Office document preview
- 🖼️ Image cropping and preview
- 📁 File upload and download

### Development Tools

- 💻 Code editor
- 📊 Data visualization
- ✏️ Rich text editing
- 🕐 Cron job configuration

## 📚 Development Guide

### Adding New Components

1. Create components in the `src/components/` directory
2. Follow Vue 3 Composition API specifications
3. Add TypeScript type definitions
4. Write component documentation and tests

### Adding New Pages

1. Create page components in the `src/views/` directory
2. Add route configuration in `src/router/`
3. Configure page permissions and menus

### State Management

- Use Pinia for state management
- Create Stores in the `src/stores/` directory
- Support persistent storage

### Internationalization

- Add language packs in the `src/i18n/` directory
- Use the `useI18n()` composable function
- Support dynamic language switching

## 🧪 Testing

```bash
# Run tests (to be added)
npm run test

# Run test coverage (to be added)
npm run test:coverage
```

## 📦 Deployment

### Docker Deployment

```dockerfile
# Build image
docker build -t rainbow-frontend .

# Run container
docker run -p 80:80 rainbow-frontend
```

### Static Deployment

```bash
# Build project
npm run build

# Deploy dist directory to web server
```

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Vue.js](https://vuejs.org/) - Progressive JavaScript framework
- [Element Plus](https://element-plus.org/) - Vue 3 component library
- [Vite](https://vitejs.dev/) - Next-generation frontend build tool
- [Pinia](https://pinia.vuejs.org/) - Vue state management library

## 📞 Contact Us

- **Project Repository**: [GitHub Repository]
- **Issue Reports**: [Issues]
- **Feature Suggestions**: [Discussions]

---

⭐ If this project helps you, please give us a star!
