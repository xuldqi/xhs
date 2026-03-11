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
    nickname?: string
    email?: string
    phone?: string
    currentPlan?: string
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
    plan_type: string
    name: string
    price: number
    duration_days: number | null
    daily_generate_limit: number
    daily_export_limit: number
    history_limit: number
    priority: boolean
    features: string[] | { customTemplate?: boolean; [key: string]: any }
}

export interface GuideHistory {
    id: string
    user_id: string
    account_name: string
    created_at: string
}
