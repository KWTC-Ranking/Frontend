import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listMatches } from '../api/matches'
import { Pagination } from '../components/Pagination'
import type { Page, MatchSummaryResponse } from '../api/types'

const PAGE_SIZE = 20

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; page: Page<MatchSummaryResponse> }

export function MatchListPage() {
  const [pageNumber, setPageNumber] = useState(0)
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    listMatches({ page: pageNumber, size: PAGE_SIZE })
      .then((page) => {
        if (!cancelled) setLoadState({ status: 'ready', page })
      })
      .catch(() => {
        if (!cancelled)
          setLoadState({ status: 'error', message: '경기 목록을 불러오지 못했습니다.' })
      })

    return () => {
      cancelled = true
    }
  }, [pageNumber])

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
        <>
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
                {loadState.page.content.map((match) => (
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
                {loadState.page.content.length === 0 && (
                  <tr>
                    <td colSpan={6}>아직 기록된 경기가 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            page={loadState.page.number}
            totalPages={loadState.page.totalPages}
            totalElements={loadState.page.totalElements}
            onPageChange={setPageNumber}
          />
        </>
      )}
    </div>
  )
}
