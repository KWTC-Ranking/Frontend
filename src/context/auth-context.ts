import { createContext } from 'react'
import type { PlayerRole } from '../api/types'

export interface AuthUser {
  playerId: number
  username: string
  role: PlayerRole
}

export interface AuthContextValue {
  user: AuthUser | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
