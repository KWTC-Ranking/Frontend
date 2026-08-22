import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { correctMatchScore, getMatch } from '../api/matches'
import { ApiError } from '../api/client'
import type { MatchResponse } from '../api/types'

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; match: MatchResponse }

export function MatchEditPage() {
  const { id } = useParams<{ id: string }>()
  const matchId = Number(id)
  const navigate = useNavigate()

  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' })
  const [teamAGames, setTeamAGames] = useState('')
  const [teamBGames, setTeamBGames] = useState('')
  const [hadMultipleSets, setHadMultipleSets] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false

    getMatch(matchId)
      .then((match) => {
        if (cancelled) return
        const firstSet = match.sets[0]
        setTeamAGames(firstSet ? String(firstSet.teamAGames) : '')
        setTeamBGames(firstSet ? String(firstSet.teamBGames) : '')
        setHadMultipleSets(match.sets.length > 1)
        setLoadState({ status: 'ready', match })
      })
      .catch(() => {
        if (!cancelled) setLoadState({ status: 'error', message: '경기 정보를 불러오지 못했습니다.' })
      })

    return () => {
      cancelled = true
    }
  }, [matchId])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    const gamesA = Number(teamAGames)
    const gamesB = Number(teamBGames)
    if (Number.isNaN(gamesA) || Number.isNaN(gamesB)) {
      setError('세트 스코어를 숫자로 입력해주세요.')
      return
    }

    setSubmitting(true)
    try {
      await correctMatchScore(matchId, { sets: [{ setNumber: 1, teamAGames: gamesA, teamBGames: gamesB }] })
      navigate(`/matches/${matchId}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '점수 수정에 실패했습니다.')
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

  const { match } = loadState

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>경기 #{match.id} 점수 수정</h1>
        <Link to={`/matches/${match.id}`}>경기 상세로</Link>
      </header>

      <section className="detail-section">
        <h2>팀</h2>
        <div className="team-columns">
          {match.teams.map((team) => (
            <div key={team.side} className="team-card">
              <h3>{team.side}팀</h3>
              <ul>
                {team.players.map((player, index) => (
                  <li key={player.playerId ?? `deleted-${index}`}>{player.fullName}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <form className="match-form" onSubmit={handleSubmit}>
        <div className="set-inputs">
          <div className="set-inputs-header">
            <span>세트 스코어</span>
          </div>
          {hadMultipleSets && (
            <p className="hint">이 경기는 세트가 여러 개로 기록되어 있습니다. 저장하면 아래 스코어 하나로 합쳐집니다.</p>
          )}
          <div className="set-row">
            <input
              type="number"
              min={0}
              placeholder="A팀 게임"
              value={teamAGames}
              onChange={(event) => setTeamAGames(event.target.value)}
              required
            />
            <span>:</span>
            <input
              type="number"
              min={0}
              placeholder="B팀 게임"
              value={teamBGames}
              onChange={(event) => setTeamBGames(event.target.value)}
              required
            />
          </div>
        </div>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting}>
          {submitting ? '저장하는 중...' : '점수 수정 저장'}
        </button>
      </form>
    </div>
  )
}
