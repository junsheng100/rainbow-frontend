import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 根据当前工作目录中的 `mode` 加载 .env 文件
  const env = loadEnv(mode, process.cwd())

  return {
    base: env.VITE_APP_BASE_PATH || '/',
    plugins: [
      vue(),
      createSvgIconsPlugin({
        // 指定需要缓存的图标文件夹
        iconDirs: [path.resolve(process.cwd(), 'src/assets/icons/svg')],
        // 指定symbolId格式
        symbolId: 'icon-[name]',
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      port: parseInt(env.VITE_DEV_SERVER_PORT || '8008'),
      //host: env.VITE_DEV_SERVER_HOST || '0.0.0.0', // 允许外部访问
      host:  '0.0.0.0', // 允许外部访问
      disableHostCheck: true,
      proxy: {
        // 代理所有 API 请求到后端服务器
        '/api': {
          target: env.VITE_DEV_PROXY_TARGET || 'http://127.0.0.1:8080',
          changeOrigin: true,
          secure: false,
          ws: true,
          rewrite: (path) => path.replace(/^\/api/, ''),  // 移除前缀 /api
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              // 设置正确的 Origin 头
              proxyReq.setHeader('Origin', `http://${env.VITE_DEV_SERVER_HOST || '127.0.0.1'}:${env.VITE_DEV_SERVER_PORT || '8008'}`)
              console.log('Proxying API request:', req.url, 'to', _options.target && req.url ? _options.target + req.url : 'unknown target')
            })
          }
        },
        // 兼容旧的 /web 路径
        '/web': {
          target: env.VITE_DEV_PROXY_TARGET || 'http://127.0.0.1:8080',
          changeOrigin: true,
          secure: false,
          ws: true,
          rewrite: (path) => path.replace(/^\/web/, ''),  // 移除前缀 /web
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              // 设置正确的 Origin 头
              proxyReq.setHeader('Origin', `http://${env.VITE_DEV_SERVER_HOST || '127.0.0.1'}:${env.VITE_DEV_SERVER_PORT || '8008'}`)
              console.log('Proxying API request:', req.url, 'to', _options.target && req.url ? _options.target + req.url : 'unknown target')
            })
          }
        },
        '/resources': {
          target: env.VITE_DEV_PROXY_TARGET || 'http://127.0.0.1:8080',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/resources/, ''),  // 移除前缀 /resources
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              // 设置正确的 Origin 头
              proxyReq.setHeader('Origin', `http://${env.VITE_DEV_SERVER_HOST || '127.0.0.1'}:${env.VITE_DEV_SERVER_PORT || '8008'}`)
              console.log('Proxying resource request:', req.url, 'to', _options.target && req.url ? _options.target + req.url : 'unknown target')
            })
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              // 移除X-Frame-Options头部，允许iframe显示
              delete proxyRes.headers['x-frame-options']
              delete proxyRes.headers['X-Frame-Options']
              console.log('Proxying resource request:', req.url, 'removed X-Frame-Options')
            })
          }
        },

      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: env.VITE_ENABLE_SOURCEMAP === 'true',
      // 生产环境移除 console
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: env.VITE_DROP_CONSOLE === 'true',
          drop_debugger: env.VITE_DROP_CONSOLE === 'true'
        }
      }
    },
    // 环境变量配置
    define: {
      __APP_ENV__: JSON.stringify(env.VITE_NODE_ENV)
    }
  }
})
