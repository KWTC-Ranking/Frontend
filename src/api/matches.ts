import { apiFetch, buildQuery } from './client'
import type {
  MatchRecordRequest,
  MatchResponse,
  MatchScoreCorrectionRequest,
  MatchSummaryResponse,
  MatchType,
  Page,
} from './types'

export function recordMatch(request: MatchRecordRequest): Promise<MatchResponse> {
  return apiFetch<MatchResponse>('/api/matches', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

/** Admin-only: corrects a mistakenly entered set score. Teams/players cannot be changed. */
export function correctMatchScore(id: number, request: MatchScoreCorrectionRequest): Promise<MatchResponse> {
  return apiFetch<MatchResponse>(`/api/matches/${id}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

/** Admin-only: permanently deletes a match and undoes the points/wins/losses it awarded. */
export function deleteMatch(id: number): Promise<void> {
  return apiFetch<void>(`/api/matches/${id}`, { method: 'DELETE' })
}

export function listMatches(
  params: { matchType?: MatchType; playerId?: number; page?: number; size?: number } = {},
): Promise<Page<MatchSummaryResponse>> {
  return apiFetch<Page<MatchSummaryResponse>>(`/api/matches${buildQuery(params)}`)
}

export function getMatch(id: number): Promise<MatchResponse> {
  return apiFetch<MatchResponse>(`/api/matches/${id}`)
}
