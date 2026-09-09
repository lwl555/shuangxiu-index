import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  // emptyOutDir 关闭：本地构建环境的安全删除壳会把 rmSync 拦截为 fail-closed，
  // 关掉清空即可避免每次构建卡死；旧哈希产物不会被 index.html 引用，无害。
  build: { outDir: 'dist', assetsDir: 'assets', emptyOutDir: false },
})
