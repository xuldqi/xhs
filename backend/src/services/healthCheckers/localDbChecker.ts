/**
 * Local Database Health Checker
 * 
 * 检查本地 PostgreSQL 数据库连接
 */

import {
    IServiceHealthChecker,
    ServiceHealthResult,
    ServiceDiagnostics,
    Recommendation
} from '../../types/health'
import { query } from '../../db'

export class LocalDbChecker implements IServiceHealthChecker {
    readonly serviceName = 'localdb'

    /**
     * 检查本地数据库健康状态
     */
    async check(timeout: number = 5000): Promise<ServiceHealthResult> {
        const startTime = Date.now()

        try {
            // 执行简单的数据库查询来测试连接
            // 使用 Promise.race 实现超时
            const checkPromise = query('SELECT 1 as health_check')

            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error('Operation timeout')), timeout)
            })

            await Promise.race([checkPromise, timeoutPromise])

            const latency = Date.now() - startTime

            return {
                status: 'ok',
                message: 'Local database connection successful',
                latency,
                metadata: {
                    connected: true
                }
            }
        } catch (error: any) {
            const latency = Date.now() - startTime

            if (error.message === 'Operation timeout') {
                return {
                    status: 'error',
                    message: `Local DB connection timeout after ${timeout}ms`,
                    latency,
                    error: {
                        code: 'TIMEOUT',
                        message: `Connection timeout after ${timeout}ms`
                    }
                }
            }

            return {
                status: 'error',
                message: `Local DB check failed: ${error.message}`,
                latency,
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
        const config = {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || '5432',
            user: process.env.DB_USER || 'postgres',
            db: process.env.DB_NAME || 'postgres'
        }

        const diagnostics: any = {
            connected: false,
            config: config
        }

        const recommendations: Recommendation[] = []

        try {
            const result = await this.check(5000)
            diagnostics.connected = result.status === 'ok'
            diagnostics.latency = result.latency

            if (!diagnostics.connected && result.error) {
                diagnostics.error = result.error

                // 生成建议
                if (result.error.code === 'TIMEOUT') {
                    recommendations.push({
                        severity: 'critical',
                        service: 'localdb',
                        issue: 'Database connection timeout',
                        solution: `Check if DB host '${config.host}' is reachable. In Docker/Dokploy, use the service name (e.g. 'postgres') instead of 'localhost'.`,
                        documentation: 'https://docs.docker.com/network/'
                    })
                } else if (result.error.message.includes('password')) {
                    recommendations.push({
                        severity: 'critical',
                        service: 'localdb',
                        issue: 'Authentication failed',
                        solution: 'Verify DB_PASSWORD matches your database container password.',
                        documentation: ''
                    })
                } else {
                    recommendations.push({
                        severity: 'critical',
                        service: 'localdb',
                        issue: 'Connection failed',
                        solution: `Ensure database container is running and accessible at ${config.host}:${config.port}`,
                        documentation: ''
                    })
                }
            }
        } catch (error: any) {
            diagnostics.error = {
                code: 'DIAGNOSTIC_FAILED',
                message: error.message
            }
        }

        return {
            serviceName: this.serviceName,
            healthy: diagnostics.connected,
            details: diagnostics,
            error: diagnostics.error,
            recommendations
        }
    }
}
