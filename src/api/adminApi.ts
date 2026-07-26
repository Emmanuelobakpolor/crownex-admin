import { type AdminInfo, apiClient, clearStoredAuth, getStoredAuth, setStoredAuth } from './client'
import type {
  AdminCryptoOrder,
  AdminCryptoWithdrawal,
  AdminUser,
  CryptoFeeSetting,
  LoginResponse,
  OverviewStats,
  PaginatedCryptoOrders,
  PaginatedCryptoWithdrawals,
  PaginatedTransactions,
  PaginatedUsers,
} from './types'

export async function login(email: string, password: string): Promise<AdminInfo> {
  const data = await apiClient.request<LoginResponse>('/api/admin/login/', {
    method: 'POST',
    body: { email, password },
    auth: false,
  })
  setStoredAuth({ access: data.access, refresh: data.refresh, admin: data.admin })
  return data.admin
}

export async function logout(): Promise<void> {
  const stored = getStoredAuth()
  if (stored?.refresh) {
    try {
      await apiClient.request('/api/auth/logout/', {
        method: 'POST',
        body: { refresh: stored.refresh },
      })
    } catch {
      // Best-effort — always clear the local session even if the blacklist call fails.
    }
  }
  clearStoredAuth()
}

export function fetchOverview(): Promise<OverviewStats> {
  return apiClient.request<OverviewStats>('/api/admin/overview/')
}

export function fetchUsers(
  params: { search?: string; page?: number; page_size?: number } = {},
): Promise<PaginatedUsers> {
  return apiClient.request<PaginatedUsers>('/api/admin/users/', { params })
}

export function fetchUserDetail(id: number): Promise<AdminUser> {
  return apiClient.request<AdminUser>(`/api/admin/users/${id}/`)
}

export function fetchTransactions(
  params: { type?: string; page?: number; page_size?: number } = {},
): Promise<PaginatedTransactions> {
  return apiClient.request<PaginatedTransactions>('/api/admin/transactions/', { params })
}

export function fetchProfile(): Promise<AdminInfo> {
  return apiClient.request<AdminInfo>('/api/admin/profile/')
}

export function updateProfile(payload: {
  new_email?: string
  full_name?: string
  current_password: string
}): Promise<{ message: string; id: number; email: string; full_name: string }> {
  return apiClient.request('/api/admin/profile/', { method: 'PATCH', body: payload })
}

export function changePassword(payload: {
  current_password: string
  new_password: string
  new_password_confirm: string
}): Promise<{ message: string }> {
  return apiClient.request('/api/auth/change-password/', { method: 'POST', body: payload })
}

export function fetchCryptoFees(): Promise<CryptoFeeSetting[]> {
  return apiClient.request('/api/admin/fees/')
}

export function updateCryptoFee(
  id: number,
  payload: { flat_usd?: string; percent?: string; is_active?: boolean },
): Promise<CryptoFeeSetting> {
  return apiClient.request(`/api/admin/fees/${id}/`, { method: 'PATCH', body: payload })
}

export function fetchCryptoOrders(
  params: {
    status?: string
    type?: string
    search?: string
    page?: number
    page_size?: number
  } = {},
): Promise<PaginatedCryptoOrders> {
  return apiClient.request('/api/admin/crypto/orders/', { params })
}

export function actOnCryptoOrder(
  reference: string,
  action: 'approve' | 'reject' | 'confirm_deposit' | 'retry',
  note?: string,
): Promise<AdminCryptoOrder> {
  return apiClient.request(`/api/admin/crypto/orders/${reference}/`, {
    method: 'POST',
    body: { action, note },
  })
}

export function fetchCryptoWithdrawals(
  params: { status?: string; search?: string; page?: number; page_size?: number } = {},
): Promise<PaginatedCryptoWithdrawals> {
  return apiClient.request('/api/admin/crypto/withdrawals/', { params })
}

export function actOnCryptoWithdrawal(
  reference: string,
  action: 'complete' | 'reject',
  extra: { tx_id?: string; note?: string } = {},
): Promise<AdminCryptoWithdrawal> {
  return apiClient.request(`/api/admin/crypto/withdrawals/${reference}/`, {
    method: 'POST',
    body: { action, ...extra },
  })
}
