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

export interface PlayerCreateRequest {
  fullName: string
  email?: string
  username: string
  password: string
  role?: PlayerRole
}

export interface PlayerResponse {
  id: number
  fullName: string
  email?: string
  username: string
  role: PlayerRole
  active: boolean
  createdAt: string
}
