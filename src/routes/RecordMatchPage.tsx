import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { listPlayers } from '../api/players'
import { recordMatch } from '../api/matches'
import { ApiError } from '../api/client'
import type { MatchResponse, MatchType, PlayerResponse } from '../api/types'

function playersForMatchType(matchType: MatchType): number {
  return matchType === 'SINGLES' ? 1 : 2
}

export function RecordMatchPage() {
  const [players, setPlayers] = useState<PlayerResponse[]>([])
  const [matchType, setMatchType] = useState<MatchType>('SINGLES')
  const [teamAPlayers, setTeamAPlayers] = useState<string[]>([''])
  const [teamBPlayers, setTeamBPlayers] = useState<string[]>([''])
  const [teamAGames, setTeamAGames] = useState('')
  const [teamBGames, setTeamBGames] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<MatchResponse | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    listPlayers(true)
      .then(setPlayers)
      .catch(() => {
        /* player dropdown just stays empty; the form will surface an error on submit */
      })
  }, [])

  function handleMatchTypeChange(next: MatchType) {
    setMatchType(next)
    const count = playersForMatchType(next)
    setTeamAPlayers(Array.from({ length: count }, () => ''))
    setTeamBPlayers(Array.from({ length: count }, () => ''))
  }

  function updateTeamPlayer(side: 'A' | 'B', index: number, value: string) {
    const setter = side === 'A' ? setTeamAPlayers : setTeamBPlayers
    setter((previous) => previous.map((playerId, i) => (i === index ? value : playerId)))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setResult(null)

    const teamAIds = teamAPlayers.map(Number)
    const teamBIds = teamBPlayers.map(Number)
    if (teamAPlayers.some((v) => v === '') || teamBPlayers.some((v) => v === '')) {
      setError('모든 선수를 선택해주세요.')
      return
    }

    const gamesA = Number(teamAGames)
    const gamesB = Number(teamBGames)
    if (Number.isNaN(gamesA) || Number.isNaN(gamesB)) {
      setError('세트 스코어를 숫자로 입력해주세요.')
      return
    }

    setSubmitting(true)
    try {
      const response = await recordMatch({
        matchType,
        teams: [
          { side: 'A', playerIds: teamAIds },
          { side: 'B', playerIds: teamBIds },
        ],
        sets: [{ setNumber: 1, teamAGames: gamesA, teamBGames: gamesB }],
      })
      setResult(response)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '경기 기록에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>경기 등록</h1>
        <Link to="/matches">경기 목록</Link>
      </header>

      <form className="match-form" onSubmit={handleSubmit}>
        <label>
          종목
          <select
            value={matchType}
            onChange={(event) => handleMatchTypeChange(event.target.value as MatchType)}
          >
            <option value="SINGLES">단식</option>
            <option value="DOUBLES">복식</option>
          </select>
        </label>

        <div className="team-inputs">
          <fieldset>
            <legend>A팀</legend>
            {teamAPlayers.map((value, index) => (
              <select
                key={index}
                value={value}
                onChange={(event) => updateTeamPlayer('A', index, event.target.value)}
                required
              >
                <option value="">선수 선택</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.fullName}
                  </option>
                ))}
              </select>
            ))}
          </fieldset>

          <fieldset>
            <legend>B팀</legend>
            {teamBPlayers.map((value, index) => (
              <select
                key={index}
                value={value}
                onChange={(event) => updateTeamPlayer('B', index, event.target.value)}
                required
              >
                <option value="">선수 선택</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.fullName}
                  </option>
                ))}
              </select>
            ))}
          </fieldset>
        </div>

        <div className="set-inputs">
          <div className="set-inputs-header">
            <span>세트 스코어</span>
          </div>
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
          {submitting ? '기록하는 중...' : '경기 기록'}
        </button>
      </form>

      {result && (
        <div className="match-result">
          <h2>기록 완료 — 경기 #{result.id}</h2>
          <p>승리 팀: {result.winningSide}팀</p>
          <ul>
            {result.pointTransactions.map((tx) => (
              <li key={tx.playerId}>
                {tx.fullName} · {tx.role === 'WINNER' ? '승' : '패'} · {tx.pointsAwarded}점 획득
              </li>
            ))}
          </ul>
          <Link to={`/matches/${result.id}`}>경기 상세 보기</Link>
        </div>
      )}
    </div>
  )
}
