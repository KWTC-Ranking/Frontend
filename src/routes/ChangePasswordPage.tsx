import { useState, type FormEvent } from 'react'
import { changePassword } from '../api/auth'
import { ApiError } from '../api/client'

export function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(false)
    setSubmitting(true)
    try {
      await changePassword(currentPassword, newPassword)
      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '비밀번호 변경에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>비밀번호 변경</h1>
      </header>

      <form className="member-form" onSubmit={handleSubmit}>
        <label>
          현재 비밀번호
          <input
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        <label>
          새 비밀번호
          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {success && <p className="success">비밀번호가 변경되었습니다.</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? '변경하는 중...' : '비밀번호 변경'}
        </button>
      </form>
    </div>
  )
}
