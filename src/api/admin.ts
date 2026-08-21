import { apiFetch } from './client'
import type { DataResetResponse, TierWeightMatrixResponse, TierWeightUpdateRequest } from './types'

export function getTierWeights(): Promise<TierWeightMatrixResponse> {
  return apiFetch<TierWeightMatrixResponse>('/api/admin/tier-weights')
}

export function updateTierWeights(
  request: TierWeightUpdateRequest,
): Promise<TierWeightMatrixResponse> {
  return apiFetch<TierWeightMatrixResponse>('/api/admin/tier-weights', {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

/** Irreversible: wipes every match/ranking and every non-admin player. */
export function resetTestData(): Promise<DataResetResponse> {
  return apiFetch<DataResetResponse>('/api/admin/data/reset-test-data', { method: 'POST' })
}
