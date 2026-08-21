import { apiFetch, buildQuery } from './client'
import type {
  MatchType,
  Page,
  PasswordResetRequest,
  PlayerCreateRequest,
  PlayerRankingResponse,
  PlayerResponse,
  PlayerUpdateRequest,
  PointHistoryEntryResponse,
} from './types'

export function createPlayer(request: PlayerCreateRequest): Promise<PlayerResponse> {
  return apiFetch<PlayerResponse>('/api/players', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function listPlayers(active?: boolean): Promise<PlayerResponse[]> {
  return apiFetch<PlayerResponse[]>(`/api/players${buildQuery({ active })}`)
}

export function getPlayer(id: number): Promise<PlayerResponse> {
  return apiFetch<PlayerResponse>(`/api/players/${id}`)
}

export function updatePlayer(id: number, request: PlayerUpdateRequest): Promise<PlayerResponse> {
  return apiFetch<PlayerResponse>(`/api/players/${id}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

export function resetPlayerPassword(id: number, request: PasswordResetRequest): Promise<void> {
  return apiFetch<void>(`/api/players/${id}/password`, {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

/** Only succeeds if the player has never played a match; the backend returns 409 otherwise. */
export function deletePlayer(id: number): Promise<void> {
  return apiFetch<void>(`/api/players/${id}`, { method: 'DELETE' })
}

export function getPlayerRankings(id: number): Promise<PlayerRankingResponse[]> {
  return apiFetch<PlayerRankingResponse[]>(`/api/players/${id}/rankings`)
}

export function getPlayerPointHistory(
  id: number,
  params: { matchType?: MatchType; page?: number; size?: number } = {},
): Promise<Page<PointHistoryEntryResponse>> {
  return apiFetch<Page<PointHistoryEntryResponse>>(
    `/api/players/${id}/point-history${buildQuery(params)}`,
  )
}
