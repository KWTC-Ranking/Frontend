import { apiFetch } from './client'
import type { LeaderboardEntry, MatchType } from './types'

export function getLeaderboard(matchType: MatchType): Promise<LeaderboardEntry[]> {
  const path = matchType === 'SINGLES' ? '/api/leaderboards/singles' : '/api/leaderboards/doubles'
  return apiFetch<LeaderboardEntry[]>(path)
}
