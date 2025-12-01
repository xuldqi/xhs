// 端到端测试脚本
// 注意: 需要安装 puppeteer: npm install --save-dev puppeteer

const puppeteer = require('puppeteer')
const fs = require('fs')

class E2ETest {
  constructor(baseUrl = 'http://localhost:5173') {
    this.baseUrl = baseUrl
    this.browser = null
    this.page = null
    this.results = []
  }

  async init() {
    console.log('🚀 启动端到端测试...')
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    this.page = await this.browser.newPage()
    
    // 设置视口
    await this.page.setViewport({ width: 1920, height: 1080 })
    
    // 监听控制台错误
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('页面错误:', msg.text())
      }
    })
    
    // 监听页面错误
    this.page.on('pageerror', error => {
      console.error('页面异常:', error.message)
    })
  }

  async runTest(testName, testFn) {
    console.log(`\n📋 测试: ${testName}`)
    const startTime = Date.now()
    
    try {
      await testFn()
      const duration = Date.now() - startTime
      console.log(`✅ 通过 (${duration}ms)`)
      this.results.push({
        name: testName,
        status: 'passed',
        duration,
        error: null
      })
    } catch (error) {
      const duration = Date.now() - startTime
      console.log(`❌ 失败: ${error.message}`)
      this.results.push({
        name: testName,
        status: 'failed',
        duration,
        error: error.message
      })
    }
  }

  async testHomePage() {
    await this.runTest('首页加载', async () => {
      await this.page.goto(this.baseUrl, { waitUntil: 'networkidle0' })
      
      // 检查页面标题
      const title = await this.page.title()
      if (!title || title.includes('Vite')) {
        throw new Error('页面标题未正确设置')
      }
      
      // 检查主要元素
      await this.page.waitForSelector('#app', { timeout: 5000 })
      
      // 检查导航栏
      const nav = await this.page.$('nav, .nav, .navbar, header')
      if (!nav) {
        throw new Error('未找到导航栏')
      }
      
      // 检查主要内容区域
      const main = await this.page.$('main, .main, .content')
      if (!main) {
        throw new Error('未找到主要内容区域')
      }
    })
  }

  async testNavigation() {
    await this.runTest('导航功能', async () => {
      await this.page.goto(this.baseUrl)
      
      // 测试知识库导航
      const knowledgeLink = await this.page.$('a[href*="knowledge"], a[href="/knowledge"]')
      if (knowledgeLink) {
        await knowledgeLink.click()
        await this.page.waitForNavigation({ waitUntil: 'networkidle0' })
        const url = this.page.url()
        if (!url.includes('knowledge')) {
          throw new Error('知识库页面导航失败')
        }
      }
      
      // 返回首页
      await this.page.goto(this.baseUrl)
      
      // 测试案例库导航
      const casesLink = await this.page.$('a[href*="cases"], a[href="/cases"]')
      if (casesLink) {
        await casesLink.click()
        await this.page.waitForNavigation({ waitUntil: 'networkidle0' })
        const url = this.page.url()
        if (!url.includes('cases')) {
          throw new Error('案例库页面导航失败')
        }
      }
    })
  }

  async testResponsiveDesign() {
    await this.runTest('响应式设计', async () => {
      await this.page.goto(this.baseUrl)
      
      // 测试桌面端
      await this.page.setViewport({ width: 1920, height: 1080 })
      await this.page.waitForTimeout(1000)
      
      // 测试平板端
      await this.page.setViewport({ width: 768, height: 1024 })
      await this.page.waitForTimeout(1000)
      
      // 测试手机端
      await this.page.setViewport({ width: 375, height: 667 })
      await this.page.waitForTimeout(1000)
      
      // 检查页面是否正常显示
      const body = await this.page.$('body')
      const bodyWidth = await body.evaluate(el => el.scrollWidth)
      if (bodyWidth > 400) {
        throw new Error('移动端页面宽度超出屏幕')
      }
    })
  }

  async testPerformance() {
    await this.runTest('性能测试', async () => {
      // 清除缓存
      await this.page.setCacheEnabled(false)
      
      const startTime = Date.now()
      await this.page.goto(this.baseUrl, { waitUntil: 'networkidle0' })
      const loadTime = Date.now() - startTime
      
      if (loadTime > 5000) {
        throw new Error(`页面加载时间过长: ${loadTime}ms`)
      }
      
      // 检查性能指标
      const metrics = await this.page.metrics()
      if (metrics.JSHeapUsedSize > 50 * 1024 * 1024) { // 50MB
        throw new Error('JavaScript 内存使用过多')
      }
    })
  }

  async testAccessibility() {
    await this.runTest('可访问性测试', async () => {
      await this.page.goto(this.baseUrl)
      
      // 检查页面是否有 alt 属性的图片
      const imagesWithoutAlt = await this.page.$$eval('img:not([alt])', imgs => imgs.length)
      if (imagesWithoutAlt > 0) {
        console.warn(`发现 ${imagesWithoutAlt} 个图片缺少 alt 属性`)
      }
      
      // 检查是否有适当的标题结构
      const headings = await this.page.$$eval('h1, h2, h3, h4, h5, h6', headings => 
        headings.map(h => h.tagName)
      )
      if (headings.length === 0) {
        throw new Error('页面缺少标题结构')
      }
      
      // 检查是否有 h1 标签
      const h1Count = headings.filter(tag => tag === 'H1').length
      if (h1Count === 0) {
        throw new Error('页面缺少 H1 标签')
      }
      if (h1Count > 1) {
        console.warn('页面有多个 H1 标签')
      }
    })
  }

  async testSEO() {
    await this.runTest('SEO 检查', async () => {
      await this.page.goto(this.baseUrl)
      
      // 检查页面标题
      const title = await this.page.title()
      if (!title || title.length < 10) {
        throw new Error('页面标题过短或缺失')
      }
      if (title.length > 60) {
        console.warn('页面标题可能过长')
      }
      
      // 检查 meta description
      const description = await this.page.$eval('meta[name="description"]', 
        el => el.getAttribute('content')).catch(() => null)
      if (!description) {
        throw new Error('缺少 meta description')
      }
      if (description.length < 120 || description.length > 160) {
        console.warn('meta description 长度不理想')
      }
    })
  }

  async testForms() {
    await this.runTest('表单功能', async () => {
      await this.page.goto(this.baseUrl)
      
      // 查找表单
      const forms = await this.page.$$('form')
      for (const form of forms) {
        // 检查表单是否有提交按钮
        const submitButton = await form.$('button[type="submit"], input[type="submit"]')
        if (!submitButton) {
          console.warn('表单缺少提交按钮')
        }
      }
    })
  }

  async testErrorHandling() {
    await this.runTest('错误处理', async () => {
      // 测试 404 页面
      await this.page.goto(`${this.baseUrl}/non-existent-page`)
      await this.page.waitForTimeout(2000)
      
      // 检查是否显示了错误页面或重定向到首页
      const url = this.page.url()
      const pageContent = await this.page.content()
      if (url.includes('non-existent-page') && !pageContent.includes('404')) {
        console.warn('404 页面处理可能需要改进')
      }
    })
  }

  async generateReport() {
    const passed = this.results.filter(r => r.status === 'passed').length
    const failed = this.results.filter(r => r.status === 'failed').length
    const total = this.results.length
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total,
        passed,
        failed,
        successRate: Math.round((passed / total) * 100)
      },
      results: this.results,
      environment: {
        baseUrl: this.baseUrl,
        userAgent: await this.page.evaluate(() => navigator.userAgent),
        viewport: await this.page.viewport()
      }
    }
    
    // 保存 JSON 报告
    fs.writeFileSync('e2e-test-report.json', JSON.stringify(report, null, 2))
    
    // 生成 Markdown 报告
    let markdown = `# 端到端测试报告\n\n`
    markdown += `**测试时间**: ${new Date().toLocaleString()}\n`
    markdown += `**测试 URL**: ${this.baseUrl}\n`
    markdown += `**总测试数**: ${total}\n`
    markdown += `**通过**: ${passed}\n`
    markdown += `**失败**: ${failed}\n`
    markdown += `**成功率**: ${report.summary.successRate}%\n\n`
    markdown += `## 测试结果\n\n`
    
    this.results.forEach(result => {
      const status = result.status === 'passed' ? '✅' : '❌'
      markdown += `${status} ${result.name} (${result.duration}ms)\n`
      if (result.error) {
        markdown += `   错误: ${result.error}\n`
      }
    })
    
    fs.writeFileSync('e2e-test-report.md', markdown)
    
    console.log('\n✅ 测试报告已生成:')
    console.log('   - e2e-test-report.json')
    console.log('   - e2e-test-report.md')
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close()
    }
  }

  async run() {
    try {
      await this.init()
      
      // 运行所有测试
      await this.testHomePage()
      await this.testNavigation()
      await this.testResponsiveDesign()
      await this.testPerformance()
      await this.testAccessibility()
      await this.testSEO()
      await this.testForms()
      await this.testErrorHandling()
      
      // 生成报告
      await this.generateReport()
      
      // 输出总结
      const passed = this.results.filter(r => r.status === 'passed').length
      const failed = this.results.filter(r => r.status === 'failed').length
      const total = this.results.length
      
      console.log('\n================================')
      console.log('端到端测试完成!')
      console.log(`总测试数: ${total}`)
      console.log(`✅ 通过: ${passed}`)
      console.log(`❌ 失败: ${failed}`)
      console.log(`成功率: ${Math.round((passed / total) * 100)}%`)
      
      if (failed > 0) {
        console.log('\n失败的测试:')
        this.results
          .filter(r => r.status === 'failed')
          .forEach(r => console.log(`  - ${r.name}: ${r.error}`))
      }
      
      await this.cleanup()
      
      process.exit(failed > 0 ? 1 : 0)
    } catch (error) {
      console.error('测试运行失败:', error)
      await this.cleanup()
      process.exit(1)
    }
  }
}

// 运行测试
if (require.main === module) {
  const baseUrl = process.argv[2] || 'http://localhost:5173'
  const test = new E2ETest(baseUrl)
  test.run()
}

module.exports = E2ETest
