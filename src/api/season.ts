import { apiFetch } from './client'
import type { SeasonStateResponse, SeasonStateUpdateRequest } from './types'

/** Any logged-in member can read this (not admin-only) — used to show whether new matches are accepted. */
export function getSeasonState(): Promise<SeasonStateResponse> {
  return apiFetch<SeasonStateResponse>('/api/season')
}

/** Admin-only: opens/closes the season. Existing matches (view/correct/delete) are unaffected either way. */
export function updateSeasonState(request: SeasonStateUpdateRequest): Promise<SeasonStateResponse> {
  return apiFetch<SeasonStateResponse>('/api/admin/season', {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}
