import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="app-shell">
      <nav className="topnav">
        <div className="topnav-brand">KWTC 랭킹</div>
        <div className="topnav-links">
          <NavLink to="/" end>
            리더보드
          </NavLink>
          <NavLink to="/matches">경기 목록</NavLink>
          <NavLink to="/matches/new">경기 등록</NavLink>
          <NavLink to="/players">회원</NavLink>
          {user?.role === 'ADMIN' && <NavLink to="/admin/members/new">회원 추가</NavLink>}
          {user?.role === 'ADMIN' && <NavLink to="/admin/tier-weights">티어 가중치</NavLink>}
          {user?.role === 'ADMIN' && <NavLink to="/admin/data-reset">데이터 초기화</NavLink>}
        </div>
        <div className="topnav-session">
          <NavLink to="/change-password">
            {user?.username} · {user?.role}
          </NavLink>
          <button onClick={logout}>로그아웃</button>
        </div>
      </nav>
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="app-footer">제작 강현서 · 배급 김도현</footer>
    </div>
  )
}
