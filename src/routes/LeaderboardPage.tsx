import { useEffect, useState } from 'react'
import { getLeaderboard } from '../api/leaderboard'
import type { LeaderboardEntry, MatchType } from '../api/types'

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; entries: LeaderboardEntry[] }

export function LeaderboardPage() {
  const [matchType, setMatchType] = useState<MatchType>('SINGLES')
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    getLeaderboard(matchType)
      .then((data) => {
        if (!cancelled) setLoadState({ status: 'ready', entries: data })
      })
      .catch(() => {
        if (!cancelled)
          setLoadState({ status: 'error', message: '리더보드를 불러오지 못했습니다.' })
      })

    return () => {
      cancelled = true
    }
  }, [matchType])

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>리더보드</h1>
      </header>

      <div className="tabs" role="tablist">
        <button
          role="tab"
          aria-selected={matchType === 'SINGLES'}
          className={matchType === 'SINGLES' ? 'active' : ''}
          onClick={() => setMatchType('SINGLES')}
        >
          단식
        </button>
        <button
          role="tab"
          aria-selected={matchType === 'DOUBLES'}
          className={matchType === 'DOUBLES' ? 'active' : ''}
          onClick={() => setMatchType('DOUBLES')}
        >
          복식
        </button>
      </div>

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
              <th>순위</th>
              <th>이름</th>
              <th>티어</th>
              <th>승</th>
              <th>패</th>
              <th>점수</th>
            </tr>
          </thead>
          <tbody>
            {loadState.entries.map((entry) => (
              <tr key={entry.playerId}>
                <td>{entry.rank}</td>
                <td>{entry.fullName}</td>
                <td>{entry.tier}</td>
                <td>{entry.wins}</td>
                <td>{entry.losses}</td>
                <td>{entry.points}</td>
              </tr>
            ))}
            {loadState.entries.length === 0 && (
              <tr>
                <td colSpan={6}>아직 기록이 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
