// Lighthouse配置文件
module.exports = {
  extends: 'lighthouse:default',
  settings: {
    // 只运行特定的审计类别
    onlyCategories: [
      'performance',
      'accessibility',
      'best-practices',
      'seo',
      'pwa'
    ],
    
    // 性能预算
    budgets: [
      {
        resourceSizes: [
          {
            resourceType: 'script',
            budget: 300 // KB
          },
          {
            resourceType: 'stylesheet',
            budget: 100 // KB
          },
          {
            resourceType: 'image',
            budget: 500 // KB
          },
          {
            resourceType: 'total',
            budget: 1000 // KB
          }
        ],
        timings: [
          {
            metric: 'interactive',
            budget: 3000 // ms
          },
          {
            metric: 'first-contentful-paint',
            budget: 1800 // ms
          },
          {
            metric: 'largest-contentful-paint',
            budget: 2500 // ms
          }
        ]
      }
    ],
    
    // 模拟移动设备
    formFactor: 'mobile',
    throttling: {
      rttMs: 150,
      throughputKbps: 1638.4,
      cpuSlowdownMultiplier: 4
    },
    screenEmulation: {
      mobile: true,
      width: 375,
      height: 667,
      deviceScaleFactor: 2
    }
  }
}
