import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth'
import { repository } from './services/github'

const AuthorLayout = () => {
  const { isAuthenticated, authError, isAuthenticating, login, logout } = useAuth()
  const [tempToken, setTempToken] = useState('')

  const handleLogin = (event) => {
    event.preventDefault()
    login(tempToken)
  }

  if (!isAuthenticated) {
    return (
      <div className="site-layout author-app auth-gate">
        <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div className="author-panel" style={{ maxWidth: '400px', width: '100%' }}>
            <h2>Authenticate</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px' }}>
              Enter a GitHub token with contents access for <code>{repository.fullName}</code>.
            </p>
            <form onSubmit={handleLogin}>
              <div className="field-group">
                <label>GitHub Token</label>
                <input
                  type="password"
                  placeholder="github_pat_..."
                  value={tempToken}
                  onChange={(e) => setTempToken(e.target.value)}
                />
              </div>
              {authError ? (
                <p style={{ color: 'var(--danger)', marginTop: '16px', fontSize: '14px' }}>{authError}</p>
              ) : null}
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '24px' }}
                type="submit"
                disabled={isAuthenticating}
              >
                {isAuthenticating ? 'Checking GitHub...' : 'Unlock Workspace'}
              </button>
            </form>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="site-layout author-app">
      <header className="site-header">
        <NavLink className="brand" to="/">
          Claire Cooks <span style={{ fontSize: '12px', opacity: 0.5, marginLeft: '8px' }}>CMS</span>
        </NavLink>
        <nav className="site-nav">
          <NavLink to="/" end>Dashboard</NavLink>
          <a href={repository.pagesBaseUrl}>View Live Site &nearr;</a>
          <button className="btn" style={{ padding: '8px 16px', fontSize: '12px' }} onClick={logout}>Logout</button>
        </nav>
      </header>

      
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default AuthorLayout
