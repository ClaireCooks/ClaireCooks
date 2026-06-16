import { useState, useEffect } from 'react'
import { setToken, verifyRepositoryAccess } from './services/github'
import { AuthContext } from './auth-context'

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(sessionStorage.getItem('gh_pat') || '')
  const [authError, setAuthError] = useState('')
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const isAuthenticated = Boolean(token)

  useEffect(() => {
    if (token) {
      setToken(token)
      sessionStorage.setItem('gh_pat', token)
    } else {
      sessionStorage.removeItem('gh_pat')
    }
  }, [token])

  const login = async (newToken) => {
    const normalizedToken = newToken.trim()
    setAuthError('')

    if (!normalizedToken) {
      setAuthError('Enter a GitHub token before unlocking the workspace.')
      return false
    }

    setIsAuthenticating(true)

    try {
      setToken(normalizedToken)
      await verifyRepositoryAccess()
      setTokenState(normalizedToken)
      return true
    } catch (error) {
      setToken('')
      setTokenState('')
      setAuthError(error.message)
      return false
    } finally {
      setIsAuthenticating(false)
    }
  }

  const logout = () => {
    setToken('')
    setTokenState('')
    setAuthError('')
  }

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, authError, isAuthenticating, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
