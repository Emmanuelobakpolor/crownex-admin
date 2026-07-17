export type TxType = 'Swap' | 'Deposit' | 'Withdrawal'
export type TxStatus = 'Completed' | 'Pending' | 'Failed'
export type PageId = 'overview' | 'users' | 'transaction' | 'fees' | 'settings'

export interface Transaction {
  id: string
  type: TxType
  user: string
  asset: string
  amount: string
  fee: string
  status: TxStatus
}

export interface UserRow {
  name: string
  email: string
  balance?: string
  gender?: string
  status: 'Active' | 'Inactive'
  lastActive: string
}

export const recentTransactions: Transaction[] = [
  {
    id: 'TX-88201',
    type: 'Swap',
    user: 'Jane Jones',
    asset: 'ETH → BTC',
    amount: '$200.00',
    fee: '$41.25',
    status: 'Completed',
  },
  {
    id: 'TX-88201',
    type: 'Deposit',
    user: 'Jones John',
    asset: 'BTC',
    amount: '$200.00',
    fee: '$41.25',
    status: 'Completed',
  },
  {
    id: 'TX-88201',
    type: 'Withdrawal',
    user: 'Jane Jones',
    asset: 'ETH',
    amount: '$200.00',
    fee: '$41.25',
    status: 'Completed',
  },
  {
    id: 'TX-88201',
    type: 'Swap',
    user: 'Jane Jones',
    asset: 'ETH → BTC',
    amount: '$200.00',
    fee: '$41.25',
    status: 'Completed',
  },
  {
    id: 'TX-88201',
    type: 'Deposit',
    user: 'Jane Jones',
    asset: 'BTC',
    amount: '$200.00',
    fee: '$41.25',
    status: 'Completed',
  },
  {
    id: 'TX-88201',
    type: 'Withdrawal',
    user: 'Jane Jones',
    asset: 'ETH',
    amount: '$200.00',
    fee: '$41.25',
    status: 'Completed',
  },
  {
    id: 'TX-88201',
    type: 'Deposit',
    user: 'Jane Jones',
    asset: 'BTC',
    amount: '$200.00',
    fee: '$41.25',
    status: 'Completed',
  },
  {
    id: 'TX-88201',
    type: 'Swap',
    user: 'Jane Jones',
    asset: 'ETH → BTC',
    amount: '$200.00',
    fee: '$41.25',
    status: 'Completed',
  },
  {
    id: 'TX-88201',
    type: 'Deposit',
    user: 'Jane Jones',
    asset: 'BTC',
    amount: '$200.00',
    fee: '$41.25',
    status: 'Completed',
  },
]

export const users: UserRow[] = [
  {
    name: 'Jane Jones',
    email: 'janejones@gmail.com',
    balance: '$200.00',
    status: 'Active',
    lastActive: '2 hours ago',
  },
  {
    name: 'Jane Jones',
    email: 'janejones@gmail.com',
    balance: '$200.00',
    status: 'Active',
    lastActive: '2 hours ago',
  },
  {
    name: 'Jane Jones',
    email: 'janejones@gmail.com',
    balance: '$200.00',
    status: 'Active',
    lastActive: '2 hours ago',
  },
  {
    name: 'Jane Jones',
    email: 'janejones@gmail.com',
    balance: '$200.00',
    status: 'Active',
    lastActive: '2 hours ago',
  },
  {
    name: 'Jane Jones',
    email: 'janejones@gmail.com',
    balance: '$200.00',
    status: 'Active',
    lastActive: '2 hours ago',
  },
  {
    name: 'Jane Jones',
    email: 'janejones@gmail.com',
    balance: '$200.00',
    status: 'Active',
    lastActive: '2 hours ago',
  },
  {
    name: 'Jane Jones',
    email: 'janejones@gmail.com',
    balance: '$200.00',
    status: 'Active',
    lastActive: '2 hours ago',
  },
  {
    name: 'Jane Jones',
    email: 'janejones@gmail.com',
    balance: '$200.00',
    status: 'Active',
    lastActive: '2 hours ago',
  },
  {
    name: 'Jane Jones',
    email: 'janejones@gmail.com',
    gender: 'Female',
    status: 'Active',
    lastActive: '2 hours ago',
  },
  {
    name: 'Jane Jones',
    email: 'janejones@gmail.com',
    gender: 'Female',
    status: 'Active',
    lastActive: '2 hours ago',
  },
  {
    name: 'Jane Jones',
    email: 'janejones@gmail.com',
    gender: 'Female',
    status: 'Active',
    lastActive: '2 hours ago',
  },
  {
    name: 'Jane Jones',
    email: 'janejones@gmail.com',
    gender: 'Female',
    status: 'Active',
    lastActive: '2 hours ago',
  },
  {
    name: 'Jane Jones',
    email: 'janejones@gmail.com',
    gender: 'Female',
    status: 'Active',
    lastActive: '2 hours ago',
  },
]
