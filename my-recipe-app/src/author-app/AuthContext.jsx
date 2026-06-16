import React, { createContext, useContext, useState, useEffect } from 'react'
import { setToken } from './services/github'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(sessionStorage.getItem('gh_pat') || '')
  const [isAuthenticated, setIsAuthenticated] = useState(!!token)

  useEffect(() => {
    if (token) {
      setToken(token)
      sessionStorage.setItem('gh_pat', token)
      setIsAuthenticated(true)
    } else {
      setIsAuthenticated(false)
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

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
