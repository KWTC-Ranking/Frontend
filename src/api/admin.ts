import { apiFetch } from './client'
import type { TierWeightMatrixResponse, TierWeightUpdateRequest } from './types'

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
