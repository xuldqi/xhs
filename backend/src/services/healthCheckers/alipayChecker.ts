/**
 * Alipay Health Checker
 * 
 * 检查支付宝配置和服务状态
 */

import {
  IServiceHealthChecker,
  ServiceHealthResult,
  ServiceDiagnostics,
  AlipayDiagnostics,
  Recommendation
} from '../../types/health'

export class AlipayChecker implements IServiceHealthChecker {
  readonly serviceName = 'alipay'

  /**
   * 检查支付宝服务健康状态
   */
  async check(timeout: number = 5000): Promise<ServiceHealthResult> {
    try {
      // 验证配置
      const appId = process.env.ALIPAY_APP_ID
      const privateKey = process.env.ALIPAY_PRIVATE_KEY
      const publicKey = process.env.ALIPAY_PUBLIC_KEY
      const gateway = process.env.ALIPAY_GATEWAY

      if (!appId || !privateKey || !publicKey || !gateway) {
        return {
          status: 'error',
          message: 'Alipay configuration is incomplete',
          error: {
            code: 'CONFIG_INCOMPLETE',
            message: 'One or more Alipay configuration parameters are missing'
          }
        }
      }

      // 验证密钥格式
      const privateKeyValid = this.isValidRSAKey(privateKey)
      const publicKeyValid = this.isValidRSAKey(publicKey)

      if (!privateKeyValid || !publicKeyValid) {
        return {
          status: 'error',
          message: 'Alipay key format is invalid',
          error: {
            code: 'INVALID_KEY_FORMAT',
            message: `Private key valid: ${privateKeyValid}, Public key valid: ${publicKeyValid}`
          }
        }
      }

      // 验证网关可达性
      const gatewayReachable = await this.checkGatewayReachability(gateway, timeout)

      if (!gatewayReachable) {
        return {
          status: 'warning',
          message: 'Alipay gateway is not reachable',
          metadata: {
            initialized: true,
            gatewayReachable: false
          }
        }
      }

      return {
        status: 'ok',
        message: 'Alipay configuration is valid',
        metadata: {
          initialized: true,
          gatewayReachable: true
        }
      }
    } catch (error: any) {
      return {
        status: 'error',
        message: `Alipay check failed: ${error.message}`,
        error: {
          code: 'CHECK_FAILED',
          message: error.message,
          stack: error.stack
        }
      }
    }
  }

  /**
   * 获取详细诊断信息
   */
  async diagnose(): Promise<ServiceDiagnostics> {
    const appId = process.env.ALIPAY_APP_ID
    const privateKey = process.env.ALIPAY_PRIVATE_KEY
    const publicKey = process.env.ALIPAY_PUBLIC_KEY
    const gateway = process.env.ALIPAY_GATEWAY

    const diagnostics: AlipayDiagnostics = {
      initialized: false,
      appIdConfigured: !!appId,
      privateKeyConfigured: !!privateKey,
      publicKeyConfigured: !!publicKey,
      gatewayReachable: false,
      keyFormat: {
        privateKeyValid: false,
        publicKeyValid: false
      }
    }

    const recommendations: Recommendation[] = []

    // 验证 APP ID
    if (!appId) {
      recommendations.push({
        severity: 'critical',
        service: 'alipay',
        issue: 'ALIPAY_APP_ID is not configured',
        solution: 'Add ALIPAY_APP_ID to your .env file. Get it from Alipay Open Platform',
        documentation: 'https://open.alipay.com/'
      })
    } else if (!/^\d{16,20}$/.test(appId)) {
      recommendations.push({
        severity: 'critical',
        service: 'alipay',
        issue: 'ALIPAY_APP_ID format is invalid',
        solution: 'APP ID should be a 16-20 digit number',
        documentation: 'https://open.alipay.com/'
      })
    }

    // 验证私钥
    if (!privateKey) {
      recommendations.push({
        severity: 'critical',
        service: 'alipay',
        issue: 'ALIPAY_PRIVATE_KEY is not configured',
        solution: 'Add ALIPAY_PRIVATE_KEY to your .env file. Generate using Alipay key generation tool (PKCS8 format, without BEGIN/END markers)',
        documentation: 'https://opendocs.alipay.com/common/02kipl'
      })
    } else {
      diagnostics.keyFormat.privateKeyValid = this.isValidRSAKey(privateKey)
      
      if (!diagnostics.keyFormat.privateKeyValid) {
        recommendations.push({
          severity: 'critical',
          service: 'alipay',
          issue: 'ALIPAY_PRIVATE_KEY format is invalid',
          solution: 'Private key should be in PKCS8 format, Base64 encoded, without BEGIN/END markers and line breaks',
          documentation: 'https://opendocs.alipay.com/common/02kipl'
        })
      }
    }

    // 验证公钥
    if (!publicKey) {
      recommendations.push({
        severity: 'critical',
        service: 'alipay',
        issue: 'ALIPAY_PUBLIC_KEY is not configured',
        solution: 'Add ALIPAY_PUBLIC_KEY to your .env file. Get it from Alipay Open Platform (without BEGIN/END markers)',
        documentation: 'https://opendocs.alipay.com/common/02kipl'
      })
    } else {
      diagnostics.keyFormat.publicKeyValid = this.isValidRSAKey(publicKey)
      
      if (!diagnostics.keyFormat.publicKeyValid) {
        recommendations.push({
          severity: 'critical',
          service: 'alipay',
          issue: 'ALIPAY_PUBLIC_KEY format is invalid',
          solution: 'Public key should be Base64 encoded, without BEGIN/END markers and line breaks',
          documentation: 'https://opendocs.alipay.com/common/02kipl'
        })
      }
    }

    // 验证网关
    if (!gateway) {
      recommendations.push({
        severity: 'critical',
        service: 'alipay',
        issue: 'ALIPAY_GATEWAY is not configured',
        solution: 'Add ALIPAY_GATEWAY to your .env file. Use https://openapi.alipay.com/gateway.do for production or sandbox URL for testing',
        documentation: 'https://opendocs.alipay.com/common/02kkv7'
      })
    } else {
      try {
        new URL(gateway)
        
        // 检查是否是沙箱环境
        if (gateway.includes('sandbox')) {
          recommendations.push({
            severity: 'info',
            service: 'alipay',
            issue: 'Using Alipay sandbox environment',
            solution: 'Switch to production gateway (https://openapi.alipay.com/gateway.do) for live payments',
            documentation: 'https://opendocs.alipay.com/common/02kkv7'
          })
        }

        // 检查网关可达性
        diagnostics.gatewayReachable = await this.checkGatewayReachability(gateway, 5000)
        
        if (!diagnostics.gatewayReachable) {
          recommendations.push({
            severity: 'warning',
            service: 'alipay',
            issue: 'Alipay gateway is not reachable',
            solution: 'Check your network connection and firewall settings. Verify the gateway URL is correct.',
            documentation: 'https://opendocs.alipay.com/common/02kkv7'
          })
        }
      } catch {
        recommendations.push({
          severity: 'critical',
          service: 'alipay',
          issue: 'ALIPAY_GATEWAY URL format is invalid',
          solution: 'Gateway should be a valid HTTPS URL',
          documentation: 'https://opendocs.alipay.com/common/02kkv7'
        })
      }
    }

    // 判断是否初始化
    diagnostics.initialized = 
      diagnostics.appIdConfigured &&
      diagnostics.privateKeyConfigured &&
      diagnostics.publicKeyConfigured &&
      diagnostics.keyFormat.privateKeyValid &&
      diagnostics.keyFormat.publicKeyValid

    return {
      serviceName: this.serviceName,
      healthy: diagnostics.initialized && diagnostics.gatewayReachable,
      details: diagnostics,
      error: diagnostics.initialized ? undefined : {
        code: 'NOT_INITIALIZED',
        message: 'Alipay configuration is incomplete or invalid'
      },
      recommendations
    }
  }

  /**
   * 验证 RSA 密钥格式
   */
  private isValidRSAKey(key: string): boolean {
    // 检查是否是 Base64 编码
    const base64Regex = /^[A-Za-z0-9+/]+=*$/
    
    // 移除可能的空格和换行
    const cleanKey = key.replace(/\s/g, '')
    
    // 检查长度和格式
    return cleanKey.length > 100 && base64Regex.test(cleanKey)
  }

  /**
   * 检查网关可达性
   */
  private async checkGatewayReachability(gateway: string, timeout: number): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(gateway, {
        method: 'GET',
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      // 支付宝网关通常会返回错误响应（因为没有参数），但能连接就说明可达
      return response.status !== 0
    } catch (error: any) {
      // 如果是 abort 错误，说明超时
      if (error.name === 'AbortError') {
        return false
      }
      
      // 其他网络错误也认为不可达
      return false
    }
  }
}
