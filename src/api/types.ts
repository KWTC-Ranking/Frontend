export type PlayerRole = 'ADMIN' | 'MEMBER'
export type MatchType = 'SINGLES' | 'DOUBLES'

export interface LoginResponse {
  token: string
  playerId: number
  username: string
  role: PlayerRole
}

export interface LeaderboardEntry {
  rank: number
  playerId: number
  fullName: string
  points: number
  tier: number
  wins: number
  losses: number
}
