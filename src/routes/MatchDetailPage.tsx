import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteMatch, getMatch } from '../api/matches'
import { ApiError } from '../api/client'
import type { MatchResponse } from '../api/types'
import { useAuth } from '../context/useAuth'

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; match: MatchResponse }

export function MatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const matchId = Number(id)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' })
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

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

  async function handleDelete() {
    if (!window.confirm('이 경기를 삭제하시겠습니까? 지급된 포인트/승패가 모두 되돌려지고, 이 작업은 되돌릴 수 없습니다.')) {
      return
    }
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteMatch(matchId)
      navigate('/matches')
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : '삭제에 실패했습니다.')
      setDeleting(false)
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

  const { match } = loadState

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>경기 #{match.id}</h1>
        {user?.role === 'ADMIN' && (
          <div className="header-actions">
            <Link to={`/matches/${match.id}/edit`}>점수 수정</Link>
            <button onClick={handleDelete} disabled={deleting}>
              삭제
            </button>
          </div>
        )}
      </header>
      {deleteError && (
        <p className="error" role="alert">
          {deleteError}
        </p>
      )}

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
                {team.players.map((player, index) => (
                  <li key={player.playerId ?? `deleted-${index}`}>{player.fullName}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="detail-section">
        <h2>세트 스코어</h2>
        <div className="table-wrap">
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
        </div>
      </section>

      <section className="detail-section">
        <h2>점수 지급 내역</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>선수</th>
                <th>결과</th>
                <th>획득 점수</th>
              </tr>
            </thead>
            <tbody>
              {match.pointTransactions.map((tx, index) => (
                <tr key={tx.playerId ?? `deleted-${index}`}>
                  <td>{tx.fullName}</td>
                  <td>{tx.role === 'WINNER' ? '승' : '패'}</td>
                  <td>{tx.pointsAwarded}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
