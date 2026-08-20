import { useEffect, useState, type FormEvent } from 'react'
import { getTierWeights, updateTierWeights } from '../api/admin'
import { ApiError } from '../api/client'
import type { TierWeightEntry } from '../api/types'

const TIERS = [1, 2, 3, 4]

function cellKey(winnerTier: number, loserTier: number): string {
  return `${winnerTier}-${loserTier}`
}

type LoadState = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready' }

export function AdminTierWeightsPage() {
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' })
  const [weights, setWeights] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false

    getTierWeights()
      .then((matrix) => {
        if (cancelled) return
        const next: Record<string, string> = {}
        for (const entry of matrix.entries) {
          next[cellKey(entry.winnerTier, entry.loserTier)] = String(entry.weight)
        }
        setWeights(next)
        setLoadState({ status: 'ready' })
      })
      .catch(() => {
        if (!cancelled)
          setLoadState({ status: 'error', message: '가중치 매트릭스를 불러오지 못했습니다.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  function handleCellChange(winnerTier: number, loserTier: number, value: string) {
    setWeights((previous) => ({ ...previous, [cellKey(winnerTier, loserTier)]: value }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(false)

    const entries: TierWeightEntry[] = []
    for (const winnerTier of TIERS) {
      for (const loserTier of TIERS) {
        const raw = weights[cellKey(winnerTier, loserTier)]
        const weight = Number(raw)
        if (!raw || Number.isNaN(weight) || weight <= 0) {
          setError(
            `승자 티어 ${winnerTier} / 패자 티어 ${loserTier} 가중치 값이 올바르지 않습니다.`,
          )
          return
        }
        entries.push({ winnerTier, loserTier, weight })
      }
    }

    setSubmitting(true)
    try {
      await updateTierWeights({ entries })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '가중치 저장에 실패했습니다.')
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

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>티어 가중치</h1>
      </header>
      <p className="hint">
        승자 티어(행) × 패자 티어(열) 조합별 점수 가중치입니다. 숫자가 클수록 그 조합으로 이겼을 때
        더 많은 점수를 받습니다.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="table-wrap">
          <table className="matrix-table">
            <thead>
              <tr>
                <th>승자\패자</th>
                {TIERS.map((tier) => (
                  <th key={tier}>티어 {tier}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIERS.map((winnerTier) => (
                <tr key={winnerTier}>
                  <th>티어 {winnerTier}</th>
                  {TIERS.map((loserTier) => (
                    <td key={loserTier}>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={weights[cellKey(winnerTier, loserTier)] ?? ''}
                        onChange={(event) =>
                          handleCellChange(winnerTier, loserTier, event.target.value)
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {success && <p className="success">저장했습니다.</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? '저장하는 중...' : '저장'}
        </button>
      </form>
    </div>
  )
}
