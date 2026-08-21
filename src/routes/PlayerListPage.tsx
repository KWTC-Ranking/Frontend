import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deletePlayer, listPlayers, updatePlayer } from '../api/players'
import { ApiError } from '../api/client'
import type { PlayerResponse } from '../api/types'
import { useAuth } from '../context/useAuth'

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; players: PlayerResponse[] }

export function PlayerListPage() {
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' })
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [deleteErrors, setDeleteErrors] = useState<Record<number, string>>({})
  const { user } = useAuth()

  useEffect(() => {
    let cancelled = false

    listPlayers()
      .then((players) => {
        if (!cancelled) setLoadState({ status: 'ready', players })
      })
      .catch(() => {
        if (!cancelled)
          setLoadState({ status: 'error', message: '회원 목록을 불러오지 못했습니다.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  async function toggleActive(player: PlayerResponse) {
    setPendingId(player.id)
    try {
      const updated = await updatePlayer(player.id, { active: !player.active })
      setLoadState((previous) =>
        previous.status === 'ready'
          ? {
              status: 'ready',
              players: previous.players.map((p) => (p.id === updated.id ? updated : p)),
            }
          : previous,
      )
    } catch {
      // leave the row as-is; the button simply stops spinning and can be retried
    } finally {
      setPendingId(null)
    }
  }

  async function handleDelete(player: PlayerResponse) {
    if (!window.confirm(`${player.fullName} 님을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return
    }
    setPendingId(player.id)
    setDeleteErrors((previous) => {
      const next = { ...previous }
      delete next[player.id]
      return next
    })
    try {
      await deletePlayer(player.id)
      setLoadState((previous) =>
        previous.status === 'ready'
          ? { status: 'ready', players: previous.players.filter((p) => p.id !== player.id) }
          : previous,
      )
    } catch (err) {
      const message =
        err instanceof ApiError && err.status === 409
          ? '경기 기록이 있어 삭제할 수 없습니다. 대신 비활성화를 사용하세요.'
          : '삭제에 실패했습니다.'
      setDeleteErrors((previous) => ({ ...previous, [player.id]: message }))
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>회원</h1>
      </header>

      {loadState.status === 'loading' && <p>불러오는 중...</p>}
      {loadState.status === 'error' && (
        <p className="error" role="alert">
          {loadState.message}
        </p>
      )}

      {loadState.status === 'ready' && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>이름</th>
                <th>아이디</th>
                <th>역할</th>
                <th>상태</th>
                {user?.role === 'ADMIN' && <th></th>}
              </tr>
            </thead>
            <tbody>
              {loadState.players.map((player) => (
                <tr key={player.id} className={player.active ? '' : 'inactive-row'}>
                  <td>
                    <Link to={`/players/${player.id}`}>{player.fullName}</Link>
                  </td>
                  <td>{player.username}</td>
                  <td>{player.role}</td>
                  <td>
                    <span className={player.active ? 'status-pill active' : 'status-pill inactive'}>
                      {player.active ? '활성' : '비활성'}
                    </span>
                  </td>
                  {user?.role === 'ADMIN' && (
                    <td>
                      <button
                        onClick={() => toggleActive(player)}
                        disabled={pendingId === player.id}
                      >
                        {player.active ? '비활성화' : '활성화'}
                      </button>{' '}
                      <button
                        onClick={() => handleDelete(player)}
                        disabled={pendingId === player.id}
                      >
                        삭제
                      </button>
                      {deleteErrors[player.id] && (
                        <p className="error row-error">{deleteErrors[player.id]}</p>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {loadState.players.length === 0 && (
                <tr>
                  <td colSpan={user?.role === 'ADMIN' ? 5 : 4}>등록된 회원이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
