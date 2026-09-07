import { useEffect, useState } from 'react'
import { getSeasonState, updateSeasonState } from '../api/season'
import { ApiError } from '../api/client'

type LoadState = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready' }

export function AdminSeasonPage() {
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' })
  const [open, setOpen] = useState(true)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false

    getSeasonState()
      .then((state) => {
        if (cancelled) return
        setOpen(state.open)
        setUpdatedAt(state.updatedAt)
        setLoadState({ status: 'ready' })
      })
      .catch(() => {
        if (!cancelled) setLoadState({ status: 'error', message: '시즌 상태를 불러오지 못했습니다.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  async function handleToggle() {
    const next = !open
    const confirmed = window.confirm(
      next
        ? '시즌을 다시 열까요? 지금부터 새 경기 기록이 다시 가능해집니다.'
        : '시즌을 마감할까요? 마감 중에는 새 경기 기록만 막히고, 랭킹/전적 조회와 관리자의 기존 경기 수정·삭제는 계속 가능합니다.',
    )
    if (!confirmed) return

    setError(null)
    setSubmitting(true)
    try {
      const state = await updateSeasonState({ open: next })
      setOpen(state.open)
      setUpdatedAt(state.updatedAt)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '시즌 상태 변경에 실패했습니다.')
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
        <h1>시즌 상태</h1>
      </header>
      <p className="hint">
        마감하면 새 경기 기록(<code>경기 등록</code>)만 막힙니다. 리더보드, 경기 목록/상세, 전적
        조회는 마감 중에도 그대로 보이고, 관리자의 기존 경기 스코어 정정·삭제도 계속 가능합니다.
      </p>

      <div className="member-form">
        <p>
          현재 상태:{' '}
          <strong style={{ color: open ? 'inherit' : '#c0392b' }}>
            {open ? '열림 (경기 기록 가능)' : '마감 (경기 기록 불가)'}
          </strong>
        </p>
        {updatedAt && <p className="hint">마지막 변경: {new Date(updatedAt).toLocaleString('ko-KR')}</p>}

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <button onClick={handleToggle} disabled={submitting}>
          {submitting ? '변경하는 중...' : open ? '시즌 마감하기' : '시즌 다시 열기'}
        </button>
      </div>
    </div>
  )
}
