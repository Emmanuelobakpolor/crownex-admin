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
  profile_picture: string | null
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

export type CryptoFeeType = 'buy' | 'sell' | 'swap' | 'withdraw'

export interface CryptoFeeSetting {
  id: number
  fee_type: CryptoFeeType
  flat_usd: string
  percent: string
  is_active: boolean
  updated_at: string
}

export type CryptoOrderType = 'buy' | 'sell' | 'swap'

export type CryptoOrderStatus =
  | 'pending_payment'
  | 'payment_received'
  | 'waiting_deposit'
  | 'processing'
  | 'completed'
  | 'failed'

export interface CryptoLogEntry {
  event: string
  detail: string
  created_at: string
}

export interface AdminCryptoOrder {
  id: string
  reference: string
  user_email: string
  order_type: CryptoOrderType
  coin: string
  to_coin: string
  coin_amount: string
  to_coin_amount: string | null
  rate_ngn: string
  to_rate_ngn: string | null
  fee_ngn: string
  total_ngn: string
  status: CryptoOrderStatus
  quidax_order_id: string
  payment_proof: string | null
  needs_review: boolean
  note: string
  created_at: string
  updated_at: string
  logs: CryptoLogEntry[]
}

export interface PaginatedCryptoOrders {
  count: number
  page: number
  page_size: number
  num_pages: number
  results: AdminCryptoOrder[]
}

export type CryptoWithdrawalStatus = 'processing' | 'completed' | 'failed' | 'rejected'

export interface AdminCryptoWithdrawal {
  id: string
  reference: string
  user_email: string
  coin: string
  network: string
  address: string
  amount: string
  fee_coin: string
  net_amount: string
  status: CryptoWithdrawalStatus
  quidax_withdrawal_id: string
  tx_id: string
  note: string
  created_at: string
  updated_at: string
  logs: CryptoLogEntry[]
}

export interface PaginatedCryptoWithdrawals {
  count: number
  page: number
  page_size: number
  num_pages: number
  results: AdminCryptoWithdrawal[]
}

export type KycStatus = 'pending' | 'approved' | 'rejected' | 'review'

export interface AdminKycVerification {
  id: number
  user_email: string
  id_type: string
  id_number: string
  full_name: string
  date_of_birth: string
  address: string
  selfie: string | null
  id_document: string | null
  reference_id: string
  match_score: string | null
  status: KycStatus
  reviewer_note: string
  created_at: string
  updated_at: string
  logs: CryptoLogEntry[]
}

export interface PaginatedKycVerifications {
  count: number
  page: number
  page_size: number
  num_pages: number
  results: AdminKycVerification[]
}

export type CardStatus = 'pending' | 'active' | 'frozen' | 'terminated'

export interface AdminCardTransaction {
  reference: string
  type: 'funding' | 'withdrawal'
  status: 'pending' | 'completed' | 'failed'
  amount_display: string
  ngn_amount: string | null
  description: string
  created_at: string
}

export interface AdminVirtualCard {
  id: number
  user_email: string
  status: CardStatus
  created_status: string
  card_brand: string
  masked_pan: string
  cardholder_name: string
  balance_display: string
  created_at: string
  updated_at: string
  logs: CryptoLogEntry[]
  transactions: AdminCardTransaction[]
}

export interface PaginatedVirtualCards {
  count: number
  page: number
  page_size: number
  num_pages: number
  results: AdminVirtualCard[]
}

export interface MasterBalanceRow {
  coin: string
  name: string
  supported: boolean
  on_quidax: boolean
  master_balance: string
  master_locked: string
  users_available: string
  users_reserved: string
  users_total: string
  difference: string
}

export interface MasterBalances {
  fetched_at: string
  rows: MasterBalanceRow[]
}
