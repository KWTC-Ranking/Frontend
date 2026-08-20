export type PlayerRole = 'ADMIN' | 'MEMBER'
export type MatchType = 'SINGLES' | 'DOUBLES'
export type MatchSide = 'A' | 'B'
export type MatchOutcome = 'WINNER' | 'LOSER'

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
  numberOfElements: number
  empty: boolean
}

// ---------- auth ----------

export interface LoginResponse {
  token: string
  playerId: number
  username: string
  role: PlayerRole
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface PasswordResetRequest {
  newPassword: string
}

// ---------- players ----------

export interface PlayerCreateRequest {
  fullName: string
  email?: string
  username: string
  password: string
  role?: PlayerRole
}

export interface PlayerUpdateRequest {
  fullName?: string
  email?: string
  active?: boolean
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

export interface PlayerRankingResponse {
  matchType: MatchType
  points: number
  tier: number
  wins: number
  losses: number
  updatedAt: string
}

export interface PointHistoryEntryResponse {
  id: number
  matchId: number
  matchType: MatchType
  role: MatchOutcome
  basePoints: number
  tierWeight: number
  marginWeight: number
  winnerTierAtMatch: number
  loserTierAtMatch: number
  setMargin: number
  pointsBefore: number
  pointsAfter: number
  pointsAwarded: number
  createdAt: string
}

// ---------- leaderboard ----------

export interface LeaderboardEntry {
  rank: number
  playerId: number
  fullName: string
  points: number
  tier: number
  wins: number
  losses: number
}

// ---------- matches ----------

export interface MatchSetRequest {
  setNumber: number
  teamAGames: number
  teamBGames: number
}

export interface MatchSetResponse {
  setNumber: number
  teamAGames: number
  teamBGames: number
}

export interface MatchTeamRequest {
  side: MatchSide
  playerIds: number[]
}

export interface PlayerRef {
  playerId: number
  fullName: string
}

export interface MatchTeamResponse {
  side: MatchSide
  setsWon: number
  players: PlayerRef[]
}

export interface PointAwardResponse {
  playerId: number
  fullName: string
  role: MatchOutcome
  pointsAwarded: number
}

export interface MatchRecordRequest {
  matchType: MatchType
  playedAt?: string
  teams: MatchTeamRequest[]
  sets: MatchSetRequest[]
}

export interface MatchResponse {
  id: number
  matchType: MatchType
  playedAt: string
  winningSide: MatchSide
  teams: MatchTeamResponse[]
  sets: MatchSetResponse[]
  pointTransactions: PointAwardResponse[]
}

export interface MatchSummaryResponse {
  id: number
  matchType: MatchType
  playedAt: string
  winningSide: MatchSide
  teamASummary: string
  teamBSummary: string
}

// ---------- admin ----------

export interface TierWeightEntry {
  winnerTier: number
  loserTier: number
  weight: number
}

export interface TierWeightMatrixResponse {
  entries: TierWeightEntry[]
}

export interface TierWeightUpdateRequest {
  entries: TierWeightEntry[]
}
