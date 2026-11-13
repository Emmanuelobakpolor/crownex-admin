import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  fetchSupportConversations,
  fetchSupportThread,
  sendSupportMessage,
  setSupportStatus,
  setSupportTyping,
} from '../api/adminApi'
import { ApiError } from '../api/client'
import type { SupportConversation, SupportMessage } from '../api/types'
import { IconChatDots, IconSend } from '../components/Icons'
import { UserAvatar } from '../components/UserAvatar'
import './Support.css'

// The API has no websocket, so the inbox and the open thread poll.
const LIST_POLL_MS = 4000
const THREAD_POLL_MS = 2000
// The app shows "typing…" for 6s after each ping (support/models.py TYPING_TTL).
const TYPING_PING_MS = 3000
const TYPING_IDLE_MS = 4000

const FILTERS: { id: 'open' | 'resolved' | 'all'; label: string }[] = [
  { id: 'open', label: 'Open' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'all', label: 'All' },
]

const QUICK_REPLIES = [
  'Hi! Thanks for reaching out — how can I help?',
  'Could you share the transaction reference so I can check?',
  'Thanks, I’m looking into this now.',
  'This has been resolved. Is there anything else I can help with?',
]

interface LocalMessage extends SupportMessage {
  pending?: boolean
  failed?: boolean
  localKey?: string
}

function displayName(c: SupportConversation) {
  return c.user.full_name || c.user.email
}

function TypingDots({ small = false }: { small?: boolean }) {
  return (
    <span className={`typing-dots ${small ? 'small' : ''}`} aria-label="typing">
      <i />
      <i />
      <i />
    </span>
  )
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function formatDay(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: d.getFullYear() === today.getFullYear() ? undefined : 'numeric',
  })
}

function shortAgo(iso: string | null) {
  if (!iso) return ''
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'now'
  if (s < 3600) return `${Math.floor(s / 60)}m`
  if (s < 86400) return `${Math.floor(s / 3600)}h`
  if (s < 604800) return `${Math.floor(s / 86400)}d`
  return new Date(iso).toLocaleDateString([], { day: 'numeric', month: 'short' })
}

interface Props {
  onUnreadChange?: (count: number) => void
}

export function Support({ onUnreadChange }: Props) {
  const [filter, setFilter] = useState<'open' | 'resolved' | 'all'>('open')
  const [search, setSearch] = useState('')
  const [conversations, setConversations] = useState<SupportConversation[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [active, setActive] = useState<SupportConversation | null>(null)
  const [messages, setMessages] = useState<LocalMessage[]>([])
  const [threadLoading, setThreadLoading] = useState(false)
  const [draft, setDraft] = useState('')
  const [statusBusy, setStatusBusy] = useState(false)

  // Latest messages for the poll timer, which outlives individual renders.
  const messagesRef = useRef<LocalMessage[]>([])
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  // Ids already present when a thread was opened — only later ones animate in.
  const [initialIds, setInitialIds] = useState<Set<number>>(() => new Set())
  const scrollRef = useRef<HTMLDivElement>(null)
  const stickToBottom = useRef(true)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const lastTypingPing = useRef(0)
  const typingIdle = useRef<number | undefined>(undefined)
  const localSeq = useRef(0)

  // ─── Inbox ────────────────────────────────────────────────────────────────

  const loadList = useCallback(
    (quiet: boolean) => {
      if (!quiet) setListLoading(true)
      fetchSupportConversations({
        status: filter === 'all' ? undefined : filter,
        search: search || undefined,
        page_size: 100,
      })
        .then((data) => {
          setConversations(data.results)
          setListError(null)
          onUnreadChange?.(data.unread_total)
        })
        .catch((err: unknown) => {
          if (!quiet) setListError(err instanceof ApiError ? err.message : 'Failed to load chats.')
        })
        .finally(() => setListLoading(false))
    },
    [filter, search, onUnreadChange],
  )

  useEffect(() => {
    const first = window.setTimeout(() => loadList(false), 250)
    const timer = window.setInterval(() => loadList(true), LIST_POLL_MS)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(timer)
    }
  }, [loadList])

  // ─── Thread ───────────────────────────────────────────────────────────────

  function openThread(id: number) {
    if (id === selectedId) return
    setSelectedId(id)
    setThreadLoading(true)
    setMessages([])
    setInitialIds(new Set())
    setActive(conversations.find((c) => c.id === id) ?? null)
    setDraft('')
    stickToBottom.current = true
  }

  useEffect(() => {
    if (selectedId == null) return
    let cancelled = false
    let polling = false

    fetchSupportThread(selectedId)
      .then((data) => {
        if (cancelled) return
        setInitialIds(new Set(data.messages.map((m) => m.id)))
        setMessages(data.messages)
        setActive(data.conversation)
        // Opening a thread reads it — clear its unread pill right away.
        setConversations((prev) =>
          prev.map((c) => (c.id === selectedId ? { ...c, unread_count: 0 } : c)),
        )
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setThreadLoading(false)
      })

    const timer = window.setInterval(() => {
      if (polling) return
      polling = true
      const lastId = [...messagesRef.current].reverse().find((m) => m.id > 0)?.id
      fetchSupportThread(selectedId, lastId)
        .then((data) => {
          if (cancelled) return
          setActive(data.conversation)
          if (data.messages.length) {
            setMessages((prev) => {
              const known = new Set(prev.map((m) => m.id))
              return [...prev, ...data.messages.filter((m) => !known.has(m.id))]
            })
          }
        })
        .catch(() => {})
        .finally(() => {
          polling = false
        })
    }, THREAD_POLL_MS)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [selectedId])

  // Follow new messages unless the admin has scrolled up to read history.
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight
  }, [messages, active?.user_is_typing])

  function onThreadScroll() {
    const el = scrollRef.current
    if (!el) return
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
  }

  // ─── Typing + sending ─────────────────────────────────────────────────────

  function ping(typing: boolean) {
    if (selectedId == null) return
    setSupportTyping(selectedId, typing).catch(() => {})
  }

  function onDraftChange(value: string) {
    setDraft(value)
    window.clearTimeout(typingIdle.current)
    if (!value.trim()) {
      if (lastTypingPing.current) {
        lastTypingPing.current = 0
        ping(false)
      }
      return
    }
    const now = Date.now()
    if (now - lastTypingPing.current >= TYPING_PING_MS) {
      lastTypingPing.current = now
      ping(true)
    }
    typingIdle.current = window.setTimeout(() => {
      lastTypingPing.current = 0
      ping(false)
    }, TYPING_IDLE_MS)
  }

  // Stop "typing…" if the admin switches threads or leaves the page mid-draft.
  useEffect(() => {
    const id = selectedId
    return () => {
      window.clearTimeout(typingIdle.current)
      if (id != null && lastTypingPing.current) {
        lastTypingPing.current = 0
        setSupportTyping(id, false).catch(() => {})
      }
    }
  }, [selectedId])

  async function deliver(conversationId: number, msg: LocalMessage) {
    try {
      const saved = await sendSupportMessage(conversationId, msg.body)
      setMessages((prev) => {
        const withoutDupe = prev.filter((m) => m.id !== saved.id)
        return withoutDupe.map((m) =>
          m.localKey === msg.localKey ? { ...saved, localKey: msg.localKey } : m,
        )
      })
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                last_message: { body: saved.body, sender_type: 'admin' },
                last_message_at: saved.created_at,
              }
            : c,
        ),
      )
    } catch {
      setMessages((prev) =>
        prev.map((m) => (m.localKey === msg.localKey ? { ...m, pending: false, failed: true } : m)),
      )
    }
  }

  function send(text?: string) {
    const body = (text ?? draft).trim()
    if (!body || selectedId == null) return
    localSeq.current += 1
    const msg: LocalMessage = {
      id: -localSeq.current,
      sender_type: 'admin',
      sender_name: 'You',
      body,
      created_at: new Date().toISOString(),
      pending: true,
      localKey: `local-${localSeq.current}`,
    }
    if (text === undefined) setDraft('')
    window.clearTimeout(typingIdle.current)
    lastTypingPing.current = 0 // the server clears typing on send
    stickToBottom.current = true
    setMessages((prev) => [...prev, msg])
    void deliver(selectedId, msg)
    inputRef.current?.focus()
  }

  function retry(msg: LocalMessage) {
    if (selectedId == null) return
    setMessages((prev) =>
      prev.map((m) => (m.localKey === msg.localKey ? { ...m, pending: true, failed: false } : m)),
    )
    void deliver(selectedId, msg)
  }

  async function toggleStatus() {
    if (!active) return
    const next = active.status === 'open' ? 'resolved' : 'open'
    setStatusBusy(true)
    try {
      await setSupportStatus(active.id, next)
      setActive({ ...active, status: next })
      loadList(true)
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'Could not update the chat.')
    } finally {
      setStatusBusy(false)
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  const readAt = active?.user_last_read_at ? new Date(active.user_last_read_at).getTime() : 0
  const lastSeenAdminId = [...messages]
    .reverse()
    .find(
      (m) => m.sender_type === 'admin' && m.id > 0 && new Date(m.created_at).getTime() <= readAt,
    )?.id

  return (
    <div className="support-page">
      <div className="page-intro">
        <h1>Support chat</h1>
        <p>Reply to users in real time — they see your replies and when you’re typing in the app.</p>
      </div>

      <section className="card support-shell">
        {/* Inbox */}
        <aside className={`support-inbox ${selectedId != null ? 'has-selection' : ''}`}>
          <div className="support-inbox-head">
            <input
              type="search"
              className="support-search"
              placeholder="Search name, email or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="support-filters">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={filter === f.id ? 'active' : ''}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="support-list">
            {listLoading && conversations.length === 0 ? (
              Array.from({ length: 6 }).map((_, i) => <div key={i} className="support-row skeleton" />)
            ) : listError ? (
              <p className="support-empty-note">{listError}</p>
            ) : conversations.length === 0 ? (
              <p className="support-empty-note">No {filter === 'all' ? '' : filter} chats yet.</p>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`support-row ${selectedId === c.id ? 'selected' : ''} ${
                    c.unread_count > 0 ? 'unread' : ''
                  }`}
                  onClick={() => openThread(c.id)}
                >
                  <UserAvatar name={displayName(c)} src={c.user.profile_picture} size={42} />
                  <div className="support-row-body">
                    <div className="support-row-top">
                      <span className="support-row-name">{displayName(c)}</span>
                      <span className="support-row-time">{shortAgo(c.last_message_at)}</span>
                    </div>
                    <div className="support-row-bottom">
                      {c.user_is_typing ? (
                        <span className="support-row-typing">
                          typing <TypingDots small />
                        </span>
                      ) : (
                        <span className="support-row-preview">
                          {c.last_message?.sender_type === 'admin' && <b>You: </b>}
                          {c.last_message?.body ?? ''}
                        </span>
                      )}
                      {c.unread_count > 0 && (
                        <span key={c.unread_count} className="support-unread">
                          {c.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Thread */}
        <div className="support-thread">
          {selectedId == null || !active ? (
            <div className="support-placeholder">
              <div className="support-placeholder-icon">
                <IconChatDots width={34} height={34} />
              </div>
              <h3>Pick a conversation</h3>
              <p>Messages from the app land here. Unread chats are highlighted.</p>
            </div>
          ) : (
            <>
              <header className="support-thread-head">
                <button
                  type="button"
                  className="support-back"
                  onClick={() => setSelectedId(null)}
                  aria-label="Back to inbox"
                >
                  ←
                </button>
                <UserAvatar name={displayName(active)} src={active.user.profile_picture} size={44} />
                <div className="support-thread-who">
                  <strong>{displayName(active)}</strong>
                  <span className={active.user_is_typing ? 'is-typing' : ''}>
                    {active.user_is_typing ? (
                      <>
                        typing <TypingDots small />
                      </>
                    ) : (
                      [active.user.email, active.user.phone].filter(Boolean).join(' · ')
                    )}
                  </span>
                </div>
                <span className={`support-status ${active.status}`}>{active.status}</span>
                <button
                  type="button"
                  className="support-resolve"
                  onClick={toggleStatus}
                  disabled={statusBusy}
                >
                  {active.status === 'open' ? 'Mark resolved' : 'Reopen'}
                </button>
              </header>

              <div className="support-messages" ref={scrollRef} onScroll={onThreadScroll}>
                {threadLoading && messages.length === 0 ? (
                  <div className="support-loading">
                    <TypingDots />
                  </div>
                ) : (
                  messages.map((m, i) => {
                    const prev = messages[i - 1]
                    const next = messages[i + 1]
                    const newDay =
                      !prev || new Date(prev.created_at).toDateString() !== new Date(m.created_at).toDateString()
                    const grouped = (a?: LocalMessage, b?: LocalMessage) =>
                      !!a &&
                      !!b &&
                      a.sender_type === b.sender_type &&
                      Math.abs(new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) < 300000 &&
                      new Date(a.created_at).toDateString() === new Date(b.created_at).toDateString()
                    const first = !grouped(prev, m)
                    const last = !grouped(m, next)
                    const mine = m.sender_type === 'admin'
                    const isNew = !initialIds.has(m.id)
                    return (
                      <Fragment key={m.localKey ?? m.id}>
                        {newDay && (
                          <div className="support-day">
                            <span>{formatDay(m.created_at)}</span>
                          </div>
                        )}
                        <div
                          className={`support-msg ${mine ? 'mine' : 'theirs'} ${first ? 'first' : ''} ${
                            last ? 'last' : ''
                          } ${isNew ? 'enter' : ''} ${m.pending ? 'pending' : ''} ${m.failed ? 'failed' : ''}`}
                        >
                          {first && (
                            <span className="support-msg-name">
                              {mine ? m.sender_name : displayName(active)}
                            </span>
                          )}
                          <div
                            className="support-bubble"
                            onClick={m.failed ? () => retry(m) : undefined}
                            title={new Date(m.created_at).toLocaleString()}
                          >
                            {m.body}
                          </div>
                          {(last || m.failed) && (
                            <span className="support-msg-meta">
                              {m.failed ? (
                                'Not sent · click to retry'
                              ) : (
                                <>
                                  {formatTime(m.created_at)}
                                  {mine && m.pending && ' · Sending…'}
                                  {mine && m.id === lastSeenAdminId && (
                                    <em className="support-seen"> · Seen ✓✓</em>
                                  )}
                                </>
                              )}
                            </span>
                          )}
                        </div>
                      </Fragment>
                    )
                  })
                )}

                {active.user_is_typing && (
                  <div className="support-msg theirs first last enter">
                    <div className="support-bubble typing-bubble">
                      <TypingDots />
                    </div>
                  </div>
                )}
              </div>

              <div className="support-quick">
                {QUICK_REPLIES.map((q) => (
                  <button key={q} type="button" onClick={() => send(q)}>
                    {q}
                  </button>
                ))}
              </div>

              <form
                className="support-composer"
                onSubmit={(e) => {
                  e.preventDefault()
                  send()
                }}
              >
                <textarea
                  ref={inputRef}
                  rows={1}
                  maxLength={2000}
                  placeholder={`Reply to ${displayName(active)}…  (Enter to send, Shift+Enter for a new line)`}
                  value={draft}
                  onChange={(e) => onDraftChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      send()
                    }
                  }}
                />
                <button type="submit" className="support-send" disabled={!draft.trim()} aria-label="Send">
                  <IconSend />
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
