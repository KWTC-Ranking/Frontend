import { apiFetch } from './client'
import type { PlayerCreateRequest, PlayerResponse } from './types'

export function createPlayer(request: PlayerCreateRequest): Promise<PlayerResponse> {
  return apiFetch<PlayerResponse>('/api/players', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}
