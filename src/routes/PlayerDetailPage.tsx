import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  deletePlayer,
  getPlayer,
  getPlayerPointHistory,
  getPlayerRankings,
  resetPlayerPassword,
  updatePlayer,
} from '../api/players'
import { ApiError } from '../api/client'
import { Pagination } from '../components/Pagination'
import type { Page, PlayerRankingResponse, PlayerResponse, PointHistoryEntryResponse } from '../api/types'
import { useAuth } from '../context/useAuth'

const HISTORY_PAGE_SIZE = 15

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'ready'
      player: PlayerResponse
      rankings: PlayerRankingResponse[]
    }

type HistoryState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; page: Page<PointHistoryEntryResponse> }

export function PlayerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const playerId = Number(id)
  const { user } = useAuth()
  const navigate = useNavigate()

  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' })
  const [historyPageNumber, setHistoryPageNumber] = useState(0)
  const [historyState, setHistoryState] = useState<HistoryState>({ status: 'loading' })
  const [newPassword, setNewPassword] = useState('')
  const [resetMessage, setResetMessage] = useState<{ text: string; ok: boolean } | null>(null)
  const [resetSubmitting, setResetSubmitting] = useState(false)
  const [togglingActive, setTogglingActive] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    Promise.all([getPlayer(playerId), getPlayerRankings(playerId)])
      .then(([player, rankings]) => {
        if (!cancelled) setLoadState({ status: 'ready', player, rankings })
      })
      .catch(() => {
        if (!cancelled)
          setLoadState({ status: 'error', message: '선수 정보를 불러오지 못했습니다.' })
      })

    return () => {
      cancelled = true
    }
  }, [playerId])

  useEffect(() => {
    let cancelled = false

    getPlayerPointHistory(playerId, { page: historyPageNumber, size: HISTORY_PAGE_SIZE })
      .then((page) => {
        if (!cancelled) setHistoryState({ status: 'ready', page })
      })
      .catch(() => {
        if (!cancelled)
          setHistoryState({ status: 'error', message: '점수 변동 이력을 불러오지 못했습니다.' })
      })

    return () => {
      cancelled = true
    }
  }, [playerId, historyPageNumber])

  async function handleResetPassword(event: FormEvent) {
    event.preventDefault()
    setResetMessage(null)
    setResetSubmitting(true)
    try {
      await resetPlayerPassword(playerId, { newPassword })
      setResetMessage({ text: '비밀번호를 초기화했습니다.', ok: true })
      setNewPassword('')
    } catch (err) {
      setResetMessage({
        text: err instanceof ApiError ? err.message : '비밀번호 초기화에 실패했습니다.',
        ok: false,
      })
    } finally {
      setResetSubmitting(false)
    }
  }

  async function handleToggleActive() {
    if (loadState.status !== 'ready') return
    setTogglingActive(true)
    try {
      const updated = await updatePlayer(loadState.player.id, { active: !loadState.player.active })
      setLoadState((previous) =>
        previous.status === 'ready' ? { ...previous, player: updated } : previous,
      )
    } catch {
      // leave state as-is; the button just stops spinning and can be retried
    } finally {
      setTogglingActive(false)
    }
  }

  async function handleDelete() {
    if (loadState.status !== 'ready') return
    const hasHistory = loadState.rankings.length > 0
    const confirmMessage = hasHistory
      ? `${loadState.player.fullName} 님을 삭제하시겠습니까? 계정과 개인 기록이 사라지고, 함께한 경기에는 "(탈퇴한 회원)"으로 표시됩니다. 이 작업은 되돌릴 수 없습니다.`
      : `${loadState.player.fullName} 님을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`
    if (!window.confirm(confirmMessage)) {
      return
    }
    setDeleting(true)
    setDeleteError(null)
    try {
      await deletePlayer(loadState.player.id)
      navigate('/players')
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : '삭제에 실패했습니다.')
    } finally {
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

  const { player, rankings } = loadState

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>{player.fullName}</h1>
        {user?.role === 'ADMIN' && (
          <div className="header-actions">
            <Link to={`/players/${player.id}/edit`}>프로필 수정</Link>
            <button onClick={handleToggleActive} disabled={togglingActive}>
              {player.active ? '비활성화' : '활성화'}
            </button>
            <button onClick={handleDelete} disabled={deleting}>
              삭제
            </button>
          </div>
        )}
        {deleteError && (
          <p className="error" role="alert">
            {deleteError}
          </p>
        )}
      </header>

      <section className="detail-section">
        <h2>기본 정보</h2>
        <dl className="kv">
          <div>
            <dt>아이디</dt>
            <dd>{player.username}</dd>
          </div>
          <div>
            <dt>이메일</dt>
            <dd>{player.email ?? '-'}</dd>
          </div>
          <div>
            <dt>역할</dt>
            <dd>{player.role}</dd>
          </div>
          <div>
            <dt>상태</dt>
            <dd>{player.active ? '활성' : '비활성'}</dd>
          </div>
        </dl>
      </section>

      <section className="detail-section">
        <h2>랭킹</h2>
        {rankings.length === 0 ? (
          <p>아직 경기 기록이 없습니다.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>종목</th>
                  <th>티어</th>
                  <th>승</th>
                  <th>패</th>
                  <th>점수</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((ranking) => (
                  <tr key={ranking.matchType}>
                    <td>{ranking.matchType === 'SINGLES' ? '단식' : '복식'}</td>
                    <td>{ranking.tier}</td>
                    <td>{ranking.wins}</td>
                    <td>{ranking.losses}</td>
                    <td>{ranking.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="detail-section">
        <h2>점수 변동 이력</h2>
        {historyState.status === 'loading' && <p>불러오는 중...</p>}
        {historyState.status === 'error' && (
          <p className="error" role="alert">
            {historyState.message}
          </p>
        )}
        {historyState.status === 'ready' && historyState.page.content.length === 0 && (
          <p>아직 이력이 없습니다.</p>
        )}
        {historyState.status === 'ready' && historyState.page.content.length > 0 && (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>경기</th>
                    <th>결과</th>
                    <th>게임격차</th>
                    <th>티어가중치</th>
                    <th>마진가중치</th>
                    <th>획득점수</th>
                  </tr>
                </thead>
                <tbody>
                  {historyState.page.content.map((entry) => (
                    <tr key={entry.id}>
                      <td>
                        <Link to={`/matches/${entry.matchId}`}>#{entry.matchId}</Link>
                      </td>
                      <td>{entry.role === 'WINNER' ? '승' : '패'}</td>
                      <td>{entry.gameMargin}</td>
                      <td>{entry.tierWeight}</td>
                      <td>{entry.marginWeight}</td>
                      <td>{entry.pointsAwarded}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={historyState.page.number}
              totalPages={historyState.page.totalPages}
              totalElements={historyState.page.totalElements}
              onPageChange={setHistoryPageNumber}
            />
          </>
        )}
      </section>

      {user?.role === 'ADMIN' && (
        <section className="detail-section">
          <h2>비밀번호 초기화</h2>
          <form className="member-form" onSubmit={handleResetPassword}>
            <label>
              새 비밀번호
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                minLength={8}
                required
              />
            </label>
            {resetMessage && (
              <p className={resetMessage.ok ? 'success' : 'error'}>{resetMessage.text}</p>
            )}
            <button type="submit" disabled={resetSubmitting}>
              {resetSubmitting ? '처리 중...' : '초기화'}
            </button>
          </form>
        </section>
      )}
    </div>
  )
}
