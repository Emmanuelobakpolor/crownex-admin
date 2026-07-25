export function formatNgn(value: string | number): string {
  const num = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(num)) return '₦0'
  return `₦${num.toLocaleString('en-NG', { maximumFractionDigits: 2 })}`
}

export function formatNumber(value: string | number): string {
  const num = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(num)) return '0.00'
  return num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function timeAgo(isoDate: string): string {
  const date = new Date(isoDate)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`
  return date.toLocaleDateString()
}
