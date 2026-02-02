/**
 * @description Vite 脚本运行器
 * 
 * 该文件是所有后台脚本的统一入口点。
 * 它利用 Vite 的强大能力在 Node.js 环境中执行 TypeScript 脚本，
 * 同时完美地支持路径别名、环境变量等。
 *
 * 如何使用 (在 package.json 中配置后):
 * npm run script <scriptName> [args...]
 * 
 * 例如:
 * npm run script populate-content
 */
import { exec } from 'child_process'
import path from 'path'

const SCRIPT_DIR = path.resolve(__dirname)

async function runScript() {
  const args = process.argv.slice(2)
  if (args.length === 0) {
    console.error('❌ 请提供要运行的脚本名称。')
    console.log('用法: npm run script <scriptName>')
    process.exit(1)
  }

  const scriptName = args[0]
  const scriptPath = path.join(SCRIPT_DIR, `${scriptName}.ts`)

  try {
    // 动态导入并执行目标脚本
    console.log(`🚀 正在执行脚本: ${scriptName}...`)
    await import(scriptPath)
  } catch (error) {
    console.error(`❌ 执行脚本 "${scriptName}" 时发生错误:`)
    if (error instanceof Error && (error as any).code === 'MODULE_NOT_FOUND') {
      console.error(`  - 错误: 找不到脚本文件 "${scriptPath}"。`)
      console.error('  - 请确保脚本名称正确。')
    } else {
      console.error(error)
    }
    process.exit(1)
  }
}

runScript()
