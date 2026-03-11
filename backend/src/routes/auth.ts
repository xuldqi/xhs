import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query } from '../db'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET

function getJwtSecret(): string {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured')
    }
    return JWT_SECRET
}

function normalizeEmail(email: string): string {
    return email.trim().toLowerCase()
}

function isStrongPassword(password: string): boolean {
    // 至少 8 位，包含字母和数字，限制最大长度防止异常输入
    if (password.length < 8 || password.length > 128) return false
    const hasLetter = /[A-Za-z]/.test(password)
    const hasNumber = /\d/.test(password)
    return hasLetter && hasNumber
}

// 注册
router.post('/register', async (req, res) => {
    try {
        const { email: rawEmail, password } = req.body

        if (!rawEmail || !password) {
            return res.status(400).json({ error: 'Email and password are required' })
        }

        const email = normalizeEmail(rawEmail)

        if (!isStrongPassword(password)) {
            return res.status(400).json({
                error: 'Password is too weak',
                message: '密码至少 8 位，且需包含字母和数字'
            })
        }

        // Hash password
        const salt = await bcrypt.genSalt(10)
        const passwordHash = await bcrypt.hash(password, salt)

        // Insert user
        const result = await query(
            `INSERT INTO users (email, password_hash) 
       VALUES ($1, $2) 
       RETURNING id, email, role, subscription_status, created_at`,
            [email, passwordHash]
        )

        const user = result.rows[0]

        // Generate Token
        const token = jwt.sign({ id: user.id }, getJwtSecret(), { expiresIn: '7d' })

        res.status(201).json({
            user,
            session: { access_token: token }
        })
    } catch (error: any) {
        console.error('Register error:', error)
        if (error instanceof Error && error.message.includes('JWT_SECRET')) {
            return res.status(500).json({ error: 'Auth service misconfigured' })
        }
        if (error.code === '23505') { // Unique violation
            return res.status(400).json({ error: 'Email already registered' })
        }
        res.status(500).json({ error: 'Internal server error' })
    }
})

// 登录
router.post('/login', async (req, res) => {
    try {
        const { email: rawEmail, password } = req.body

        if (!rawEmail || !password) {
            return res.status(400).json({ error: 'Email and password are required' })
        }

        const email = normalizeEmail(rawEmail)

        const result = await query('SELECT * FROM users WHERE email = $1', [email])
        const user = result.rows[0]

        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' })
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash)
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid credentials' })
        }

        // Generate Token
        const token = jwt.sign({ id: user.id }, getJwtSecret(), { expiresIn: '7d' })

        // Return user without password
        const { password_hash, ...userWithoutPassword } = user

        res.json({
            user: userWithoutPassword,
            session: { access_token: token }
        })
    } catch (error) {
        console.error('Login error:', error)
        if (error instanceof Error && error.message.includes('JWT_SECRET')) {
            return res.status(500).json({ error: 'Auth service misconfigured' })
        }
        res.status(500).json({ error: 'Internal server error' })
    }
})

// 获取当前用户
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader) {
            return res.status(401).json({ error: 'No token provided' })
        }

        const token = authHeader.split(' ')[1]
        const decoded: any = jwt.verify(token, getJwtSecret())

        const result = await query(
            'SELECT id, email, role, subscription_status, subscription_end_date, created_at FROM users WHERE id = $1',
            [decoded.id]
        )

        const user = result.rows[0]
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        res.json({ user })
    } catch (error) {
        if (error instanceof Error && error.message.includes('JWT_SECRET')) {
            return res.status(500).json({ error: 'Auth service misconfigured' })
        }
        res.status(401).json({ error: 'Invalid token' })
    }
})

export default router
