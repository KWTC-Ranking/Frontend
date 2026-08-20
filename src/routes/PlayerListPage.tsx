import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listPlayers } from '../api/players'
import type { PlayerResponse } from '../api/types'

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; players: PlayerResponse[] }

export function PlayerListPage() {
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' })

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
        <table>
          <thead>
            <tr>
              <th>이름</th>
              <th>아이디</th>
              <th>역할</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {loadState.players.map((player) => (
              <tr key={player.id}>
                <td>
                  <Link to={`/players/${player.id}`}>{player.fullName}</Link>
                </td>
                <td>{player.username}</td>
                <td>{player.role}</td>
                <td>{player.active ? '활성' : '비활성'}</td>
              </tr>
            ))}
            {loadState.players.length === 0 && (
              <tr>
                <td colSpan={4}>등록된 회원이 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
