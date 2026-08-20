import { useCallback, useState, type ReactNode } from 'react'
import { login as loginRequest } from '../api/auth'
import { setStoredToken } from '../api/client'
import { AuthContext, type AuthUser } from './auth-context'

const USER_STORAGE_KEY = 'ranking.user'

function loadStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadStoredUser)

  const login = useCallback(async (username: string, password: string) => {
    const response = await loginRequest(username, password)
    const authUser: AuthUser = {
      playerId: response.playerId,
      username: response.username,
      role: response.role,
    }
    setStoredToken(response.token)
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authUser))
    setUser(authUser)
  }, [])

  const logout = useCallback(() => {
    setStoredToken(null)
    localStorage.removeItem(USER_STORAGE_KEY)
    setUser(null)
  }, [])

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}
