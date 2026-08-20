import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getPlayer, updatePlayer } from '../api/players'
import { ApiError } from '../api/client'

type LoadState = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready' }

export function PlayerEditPage() {
  const { id } = useParams<{ id: string }>()
  const playerId = Number(id)
  const navigate = useNavigate()

  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' })
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [active, setActive] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false

    getPlayer(playerId)
      .then((player) => {
        if (cancelled) return
        setFullName(player.fullName)
        setEmail(player.email ?? '')
        setActive(player.active)
        setLoadState({ status: 'ready' })
      })
      .catch(() => {
        if (!cancelled)
          setLoadState({ status: 'error', message: '선수 정보를 불러오지 못했습니다.' })
      })

    return () => {
      cancelled = true
    }
  }, [playerId])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await updatePlayer(playerId, {
        fullName,
        email: email.trim() === '' ? undefined : email,
        active,
      })
      navigate(`/players/${playerId}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '수정에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadState.status === 'loading') return <p>불러오는 중...</p>
  if (loadState.status === 'error') {
    return (
      <p className="error" role="alert">
        {loadState.message}
      </p>
    )
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>프로필 수정</h1>
      </header>

      <form className="member-form" onSubmit={handleSubmit}>
        <label>
          이름
          <input value={fullName} onChange={(event) => setFullName(event.target.value)} required />
        </label>
        <label>
          이메일
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
          />
          활성 상태
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" disabled={submitting}>
          {submitting ? '저장하는 중...' : '저장'}
        </button>
      </form>
    </div>
  )
}
