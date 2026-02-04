export interface User {
    id: string
    email?: string
    role?: string
    created_at?: string
    subscription_status?: string
}

export interface Profile {
    id: string
    username?: string
    avatar_url?: string
    full_name?: string
    website?: string
}

export interface Subscription {
    plan_type: string
    status: string
    current_period_end: string
}

export interface PlanConfig {
    name: string
    daily_generate_limit: number
    daily_export_limit: number
    features: string[]
}

export interface GuideHistory {
    id: string
    user_id: string
    account_name: string
    created_at: string
}
