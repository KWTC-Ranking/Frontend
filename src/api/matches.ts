import { apiFetch, buildQuery } from './client'
import type {
  MatchRecordRequest,
  MatchResponse,
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

export function listMatches(
  params: { matchType?: MatchType; playerId?: number; page?: number; size?: number } = {},
): Promise<Page<MatchSummaryResponse>> {
  return apiFetch<Page<MatchSummaryResponse>>(`/api/matches${buildQuery(params)}`)
}

export function getMatch(id: number): Promise<MatchResponse> {
  return apiFetch<MatchResponse>(`/api/matches/${id}`)
}
