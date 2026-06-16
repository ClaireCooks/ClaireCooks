import { useState, useEffect } from 'react'
import { setToken } from './services/github'
import { AuthContext } from './auth-context'

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(sessionStorage.getItem('gh_pat') || '')
  const isAuthenticated = Boolean(token)

  useEffect(() => {
    if (token) {
      setToken(token)
      sessionStorage.setItem('gh_pat', token)
    } else {
      sessionStorage.removeItem('gh_pat')
    }
  }, [token])

  const login = (newToken) => {
    setTokenState(newToken)
  }

  const logout = () => {
    setTokenState('')
  }

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
