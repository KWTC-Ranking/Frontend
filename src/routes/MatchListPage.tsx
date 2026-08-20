import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listMatches } from '../api/matches'
import type { MatchSummaryResponse } from '../api/types'

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; matches: MatchSummaryResponse[] }

export function MatchListPage() {
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    listMatches({ size: 30 })
      .then((page) => {
        if (!cancelled) setLoadState({ status: 'ready', matches: page.content })
      })
      .catch(() => {
        if (!cancelled)
          setLoadState({ status: 'error', message: '경기 목록을 불러오지 못했습니다.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>경기 목록</h1>
        <Link to="/matches/new">경기 등록</Link>
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
                <th>경기</th>
                <th>종목</th>
                <th>일시</th>
                <th>A팀</th>
                <th>B팀</th>
                <th>승리</th>
              </tr>
            </thead>
            <tbody>
              {loadState.matches.map((match) => (
                <tr key={match.id}>
                  <td>
                    <Link to={`/matches/${match.id}`}>#{match.id}</Link>
                  </td>
                  <td>{match.matchType === 'SINGLES' ? '단식' : '복식'}</td>
                  <td>{new Date(match.playedAt).toLocaleString('ko-KR')}</td>
                  <td>{match.teamASummary}</td>
                  <td>{match.teamBSummary}</td>
                  <td>{match.winningSide}팀</td>
                </tr>
              ))}
              {loadState.matches.length === 0 && (
                <tr>
                  <td colSpan={6}>아직 기록된 경기가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
