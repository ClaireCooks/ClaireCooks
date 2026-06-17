import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth'
import { repository } from './services/github'
import ScrollToTop from '../shared/components/ScrollToTop.jsx'

const AuthorLayout = () => {
  const { isAuthenticated, authError, isAuthenticating, login, logout } = useAuth()
  const [tempToken, setTempToken] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
      <ScrollToTop />
      <header className="site-header">
        <div className="header-main">
          <NavLink className="brand" to="/" onClick={() => setIsMenuOpen(false)}>
            Claire Cooks <span style={{ fontSize: '12px', opacity: 0.5, marginLeft: '8px' }}>CMS</span>
          </NavLink>
          
          <button 
            className="menu-toggle" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}></span>
          </button>
        </div>

        <div className={`header-collapsible ${isMenuOpen ? 'is-open' : ''}`}>
          <nav className="site-nav">
            <NavLink to="/" end onClick={() => setIsMenuOpen(false)}>Dashboard</NavLink>
            <a href={repository.pagesBaseUrl} onClick={() => setIsMenuOpen(false)}>View Live Site &nearr;</a>
            <button className="btn" style={{ padding: '8px 16px', fontSize: '12px' }} onClick={() => { logout(); setIsMenuOpen(false); }}>Logout</button>
          </nav>
        </div>
      </header>

      
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default AuthorLayout
