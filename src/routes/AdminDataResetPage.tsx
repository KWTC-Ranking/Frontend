import { useState } from 'react'
import { resetTestData } from '../api/admin'
import { ApiError } from '../api/client'
import type { DataResetResponse } from '../api/types'

const CONFIRM_PHRASE = '삭제합니다'

export function AdminDataResetPage() {
  const [confirmText, setConfirmText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<DataResetResponse | null>(null)

  async function handleReset() {
    if (confirmText !== CONFIRM_PHRASE) return
    if (
      !window.confirm(
        '정말로 모든 경기 기록과 회원(관리자 제외)을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      )
    ) {
      return
    }
    setSubmitting(true)
    setError(null)
    setResult(null)
    try {
      const response = await resetTestData()
      setResult(response)
      setConfirmText('')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '초기화에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>테스트 데이터 초기화</h1>
      </header>

      <p className="hint">
        모든 경기 기록, 랭킹 점수, 그리고 관리자를 제외한 모든 회원 계정을 영구적으로
        삭제합니다. 실제 동아리 회원을 등록하기 전, 테스트하면서 만든 데이터를 정리할 때만
        사용하세요. <strong>되돌릴 수 없습니다.</strong>
      </p>

      <div className="member-form">
        <label>
          계속하려면 아래에 <strong>{CONFIRM_PHRASE}</strong>를 입력하세요
          <input
            type="text"
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            placeholder={CONFIRM_PHRASE}
          />
        </label>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {result && (
          <p className="success">
            삭제 완료 — 회원 {result.deletedPlayers}명, 경기 {result.deletedMatches}건, 랭킹{' '}
            {result.deletedRankings}건이 삭제되었습니다.
          </p>
        )}

        <button onClick={handleReset} disabled={submitting || confirmText !== CONFIRM_PHRASE}>
          {submitting ? '삭제하는 중...' : '전체 초기화'}
        </button>
      </div>
    </div>
  )
}
