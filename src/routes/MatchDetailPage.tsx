import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getMatch } from '../api/matches'
import type { MatchResponse } from '../api/types'

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; match: MatchResponse }

export function MatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const matchId = Number(id)
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    getMatch(matchId)
      .then((match) => {
        if (!cancelled) setLoadState({ status: 'ready', match })
      })
      .catch(() => {
        if (!cancelled)
          setLoadState({ status: 'error', message: '경기 정보를 불러오지 못했습니다.' })
      })

    return () => {
      cancelled = true
    }
  }, [matchId])

  if (loadState.status === 'loading') return <p>불러오는 중...</p>
  if (loadState.status === 'error') {
    return (
      <p className="error" role="alert">
        {loadState.message}
      </p>
    )
  }

  const { match } = loadState

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>경기 #{match.id}</h1>
      </header>

      <section className="detail-section">
        <dl className="kv">
          <div>
            <dt>종목</dt>
            <dd>{match.matchType === 'SINGLES' ? '단식' : '복식'}</dd>
          </div>
          <div>
            <dt>일시</dt>
            <dd>{new Date(match.playedAt).toLocaleString('ko-KR')}</dd>
          </div>
          <div>
            <dt>승리 팀</dt>
            <dd>{match.winningSide}팀</dd>
          </div>
        </dl>
      </section>

      <section className="detail-section">
        <h2>팀</h2>
        <div className="team-columns">
          {match.teams.map((team) => (
            <div
              key={team.side}
              className={team.side === match.winningSide ? 'team-card winner' : 'team-card'}
            >
              <h3>
                {team.side}팀 {team.side === match.winningSide && '(승)'}
              </h3>
              <p>{team.setsWon}세트 승</p>
              <ul>
                {team.players.map((player) => (
                  <li key={player.playerId}>{player.fullName}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="detail-section">
        <h2>세트 스코어</h2>
        <table>
          <thead>
            <tr>
              <th>세트</th>
              <th>A팀</th>
              <th>B팀</th>
            </tr>
          </thead>
          <tbody>
            {match.sets.map((set) => (
              <tr key={set.setNumber}>
                <td>{set.setNumber}</td>
                <td>{set.teamAGames}</td>
                <td>{set.teamBGames}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="detail-section">
        <h2>점수 지급 내역</h2>
        <table>
          <thead>
            <tr>
              <th>선수</th>
              <th>결과</th>
              <th>획득 점수</th>
            </tr>
          </thead>
          <tbody>
            {match.pointTransactions.map((tx) => (
              <tr key={tx.playerId}>
                <td>{tx.fullName}</td>
                <td>{tx.role === 'WINNER' ? '승' : '패'}</td>
                <td>{tx.pointsAwarded}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
