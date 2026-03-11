import { Pool, PoolConfig } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const dbPassword = process.env.DB_PASSWORD

const dbConfig: PoolConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
    ...(dbPassword ? { password: dbPassword } : {}),
}

console.log('🔌 Database Configuration:')
console.log(`   Host: ${dbConfig.host}`)
console.log(`   Port: ${dbConfig.port}`)
console.log(`   User: ${dbConfig.user}`)
console.log(`   Database: ${dbConfig.database}`)
// Mask password in logs
const maskedPassword = dbPassword ? '******' : 'NOT SET'
console.log(`   Password: ${maskedPassword}`)

if (!dbPassword) {
    console.warn('⚠️ DB_PASSWORD is not set, attempting DB connection without password')
}

const pool = new Pool(dbConfig)

// 初始化数据库表
export const initDb = async () => {
    const client = await pool.connect()
    try {
        console.log('📦 Initializing local database tables...')

        await client.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`)

        // 用户表
        await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        subscription_status TEXT DEFAULT 'free',
        subscription_end_date TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)


        await client.query(`
      CREATE TABLE IF NOT EXISTS automation_tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workflow_id TEXT NOT NULL,
        workflow_title TEXT NOT NULL,
        topic TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'queued',
        trigger_mode TEXT NOT NULL DEFAULT 'manual',
        source TEXT NOT NULL DEFAULT 'content-factory',
        payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        external_id TEXT,
        error_message TEXT,
        next_run_at TIMESTAMP WITH TIME ZONE,
        dispatched_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)

        await client.query(`ALTER TABLE automation_tasks ADD COLUMN IF NOT EXISTS result_payload JSONB DEFAULT NULL;`)
        await client.query(`ALTER TABLE automation_tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;`)
        await client.query(`ALTER TABLE automation_tasks ADD COLUMN IF NOT EXISTS next_run_at TIMESTAMP WITH TIME ZONE;`)
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_automation_tasks_created_at
      ON automation_tasks (created_at DESC);
    `)
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_automation_tasks_scheduler
      ON automation_tasks (trigger_mode, next_run_at, status);
    `)
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_automation_tasks_workflow_status
      ON automation_tasks (workflow_id, status);
    `)

        console.log('✅ Local database initialized successfully')
    } catch (err) {
        console.error('❌ Failed to initialize database:', err)
        throw err
    } finally {
        client.release()
    }
}

export const query = async (text: string, params?: any[]) => {
    const start = Date.now()
    try {
        const res = await pool.query(text, params)
        const duration = Date.now() - start
        // Log slow queries
        if (duration > 1000) {
            console.warn(`⚠️  Slow query (${duration}ms): ${text.substring(0, 100)}...`)
        }
        return res
    } catch (error) {
        console.error('❌ Database query error:', {
            text: text.substring(0, 100),
            error: (error as Error).message
        })
        throw error
    }
}
export default pool
