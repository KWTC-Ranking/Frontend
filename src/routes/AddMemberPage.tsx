import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { createPlayer } from '../api/players'
import { ApiError } from '../api/client'
import type { PlayerResponse, PlayerRole } from '../api/types'

export function AddMemberPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<PlayerRole>('MEMBER')
  const [initialTier, setInitialTier] = useState(4)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [addedMembers, setAddedMembers] = useState<PlayerResponse[]>([])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const created = await createPlayer({
        fullName,
        email: email.trim() === '' ? undefined : email,
        username,
        password,
        role,
        initialTier,
      })
      setAddedMembers((previous) => [created, ...previous])
      setFullName('')
      setEmail('')
      setUsername('')
      setPassword('')
      setRole('MEMBER')
      setInitialTier(4)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '회원 추가에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page admin-page">
      <header className="admin-header">
        <h1>회원 추가</h1>
        <Link to="/">리더보드로 돌아가기</Link>
      </header>

      <form className="member-form" onSubmit={handleSubmit}>
        <label>
          이름
          <input value={fullName} onChange={(event) => setFullName(event.target.value)} required />
        </label>
        <label>
          이메일 (선택)
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label>
          아이디
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            minLength={3}
            maxLength={50}
            required
          />
        </label>
        <label>
          초기 비밀번호
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
        </label>
        <label>
          역할
          <select value={role} onChange={(event) => setRole(event.target.value as PlayerRole)}>
            <option value="MEMBER">MEMBER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </label>
        <label>
          시작 티어
          <select
            value={initialTier}
            onChange={(event) => setInitialTier(Number(event.target.value))}
          >
            <option value={1}>티어 1 (최상위)</option>
            <option value={2}>티어 2</option>
            <option value={3}>티어 3</option>
            <option value={4}>티어 4 (최하위 / 실력 미확인)</option>
          </select>
        </label>
        <p className="hint">
          단식·복식 모두 이 티어로 시작합니다. 실제 경기 결과가 쌓이면 점수에 따라 자동으로
          재조정되니, 대략적인 실력만 골라주시면 됩니다.
        </p>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting}>
          {submitting ? '추가하는 중...' : '회원 추가'}
        </button>
      </form>

      {addedMembers.length > 0 && (
        <div className="added-list">
          <h2>방금 추가한 회원</h2>
          <ul>
            {addedMembers.map((member) => (
              <li key={member.id}>
                {member.fullName} ({member.username}) · {member.role}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
