'use client'

import { useState, useEffect } from 'react'

const CORRECT_PASSWORD = 'ericcrump2026'

export default function PasswordProtection({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // Check if already authenticated (stored in sessionStorage)
  useEffect(() => {
    const authStatus = sessionStorage.getItem('authenticated')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    
    const trimmedPassword = password.trim()
    if (trimmedPassword === CORRECT_PASSWORD) {
      setIsAuthenticated(true)
      sessionStorage.setItem('authenticated', 'true')
      setPassword('')
    } else {
      setError('Incorrect password. Please try again.')
      setPassword('')
    }
  }

  if (isAuthenticated) {
    return children
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full mx-4 border border-gray-200">
        <div className="text-center mb-8">
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Password Required</h2>
          <p className="text-gray-600 text-base">Please enter the password to access this site.</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter password"
              autoFocus
              autoComplete="current-password"
            />
            {error && (
              <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}
          </div>
          
          <button
            type="submit"
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-semibold text-base shadow-lg hover:shadow-xl"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  )
}

