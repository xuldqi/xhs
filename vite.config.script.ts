/**
 * @description 用于执行 Node.js 脚本的 Vite 配置
 *
 * 这个配置使得我们可以在 Vite 的生态系统内，利用其强大的解析能力
 * (如路径别名)来运行后台 TypeScript 脚本。
 */
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // 这个配置不会打包任何东西，只是为了提供一个 Node.js 运行环境
  build: {
    // 指定入口文件为我们的脚本运行器
    lib: {
      entry: resolve(__dirname, 'scripts/runner.ts'),
      name: 'ScriptRunner',
      // 输出格式为 CommonJS，因为我们是在 Node.js 环境中运行
      formats: ['cjs']
    },
    // 指定输出目录，但我们实际上不会使用这些输出文件
    outDir: 'dist/scripts',
    // 禁用 manifest 生成
    manifest: false,
    // 在构建时清空输出目录
    emptyOutDir: true,
  },
  // 关键部分：确保路径别名能被正确解析
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  // 仅用于运行，不需要插件
  plugins: []
})
