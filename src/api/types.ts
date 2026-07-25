import type { AdminInfo } from './client'

export interface LoginResponse {
  message: string
  admin: AdminInfo
  access: string
  refresh: string
}

export interface OverviewStats {
  total_users: number
  active_users: number
  new_users_this_week: number
  new_users_growth_pct: number | null
  deposit_today_ngn: string
  deposit_all_time_ngn: string
  deposit_count: number
  withdrawal_today_ngn: string
  withdrawal_all_time_ngn: string
  withdrawal_count: number
  vtu_total_ngn: string
  vtu_count: number
  giftcard_total_ngn: string
  giftcard_count: number
}

export interface AdminUser {
  id: number
  name: string
  email: string
  phone: string | null
  balance_ngn: string
  status: 'Active' | 'Inactive'
  is_verified: boolean
  last_active: string
  date_joined: string
}

export interface PaginatedUsers {
  count: number
  page: number
  page_size: number
  num_pages: number
  results: AdminUser[]
}

export type TransactionCategory =
  | 'deposit'
  | 'withdrawal'
  | 'airtime'
  | 'data'
  | 'cable'
  | 'electricity'
  | 'giftcard'

export interface AdminTransaction {
  id: string
  type: TransactionCategory
  user_email: string
  user_name: string
  description: string
  amount: string
  currency: string
  status: string
  reference: string
  created_at: string
}

export interface PaginatedTransactions {
  count: number
  page: number
  page_size: number
  results: AdminTransaction[]
}
