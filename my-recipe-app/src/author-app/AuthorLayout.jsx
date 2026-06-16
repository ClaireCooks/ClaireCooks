import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'

const AuthorLayout = () => {
  const { isAuthenticated, login, logout } = useAuth()
  const [tempToken, setTempToken] = useState('')

  if (!isAuthenticated) {
    return (
      <div className="site-layout author-app auth-gate">
        <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div className="author-panel" style={{ maxWidth: '400px', width: '100%' }}>
            <h2>Authenticate</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px' }}>
              Enter your GitHub Personal Access Token (PAT) with <code>repo</code> scope to access the CMS.
            </p>
            <div className="field-group">
              <label>Personal Access Token</label>
              <input 
                type="password" 
                placeholder="ghp_..." 
                value={tempToken}
                onChange={(e) => setTempToken(e.target.value)}
              />
            </div>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '24px' }}
              onClick={() => login(tempToken)}
            >
              Unlock Workspace
            </button>
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
          <a href="/ClaireCooks/">View Live Site &nearr;</a>
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
