import { useState } from 'react'

const PALETTE = ['#0d47c4', '#7c3aed', '#0284c7', '#16a34a', '#c026d3', '#ea580c', '#0891b2']

function colorFor(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0][0]!.toUpperCase()
  return (parts[0][0]! + parts[parts.length - 1][0]!).toUpperCase()
}

interface UserAvatarProps {
  name: string
  src?: string | null
  size?: number
}

export function UserAvatar({ name, src, size = 36 }: UserAvatarProps) {
  const [failed, setFailed] = useState(false)

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        className="user-avatar-img"
        style={{ width: size, height: size }}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <div
      className="user-avatar-fallback"
      style={{ width: size, height: size, background: colorFor(name || '?'), fontSize: size * 0.4 }}
    >
      {initialsFor(name)}
    </div>
  )
}
