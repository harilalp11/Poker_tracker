import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { login as apiLogin, register as apiRegister, getCurrentUser } from '@/api/auth'
import { useToast } from '@/hooks/useToast'

interface User {
  _id: string
  email: string
  username: string
  totalProfit: number
  preferredStakes: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, username: string) => Promise<void>
  logout: () => void
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

// FIXED: Export the provider component with a stable name for Fast Refresh
export function AuthProvider({ children }: AuthProviderProps) {
  console.log('AuthContext: AuthProvider component rendering')
  
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  console.log('AuthContext: Rendering with state - user:', !!user, 'loading:', loading)

  // Check for existing auth on mount
  useEffect(() => {
    console.log('AuthContext: useEffect triggered - checking initial auth state')
    
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken')
      console.log('AuthContext: Access token exists:', !!token)
      
      if (token) {
        console.log('AuthContext: Token preview:', token.substring(0, 50) + '...')
        try {
          console.log('AuthContext: Attempting to fetch current user')
          const userData = await getCurrentUser()
          console.log('AuthContext: Successfully fetched user:', userData.user.email)
          setUser(userData.user)
        } catch (error) {
          console.error('AuthContext: Failed to fetch user:', error)
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        }
      } else {
        console.log('AuthContext: No access token found')
      }
      
      setLoading(false)
    }

    checkAuth()

    // Listen for storage changes (token refresh)
    console.log('AuthContext: Setting up storage event listener')
    const handleStorageChange = (e: StorageEvent) => {
      console.log('AuthContext: Storage change detected:', e.key, 'New value exists:', !!e.newValue)
      
      if (e.key === 'accessToken') {
        if (e.newValue) {
          console.log('AuthContext: New access token detected, fetching user data')
          getCurrentUser()
            .then((userData) => {
              console.log('AuthContext: Successfully fetched user after token update:', userData.user.email)
              setUser(userData.user)
            })
            .catch((error) => {
              console.error('AuthContext: Failed to fetch user after token update:', error)
              setUser(null)
            })
        } else {
          console.log('AuthContext: Access token removed, logging out user')
          setUser(null)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      console.log('AuthContext: Removing storage event listener')
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const login = async (email: string, password: string) => {
    console.log('AuthContext: Login attempt for:', email)
    try {
      const response = await apiLogin(email, password)
      console.log('AuthContext: Login successful for:', email)
      
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      setUser(response.user)
      
      toast({
        title: "Success",
        description: "Login successful",
      })
    } catch (error) {
      console.error('AuthContext: Login failed:', error)
      toast({
        title: "Error",
        description: error.message || "Login failed",
        variant: "destructive",
      })
      throw error
    }
  }

  const register = async (email: string, password: string, username: string) => {
    console.log('AuthContext: Register attempt for:', email)
    try {
      const response = await apiRegister(email, password, username)
      console.log('AuthContext: Registration successful for:', email)
      
      localStorage.setItem('accessToken', response.accessToken)
      setUser(response.user)
      
      toast({
        title: "Success",
        description: "Registration successful",
      })
    } catch (error) {
      console.error('AuthContext: Registration failed:', error)
      toast({
        title: "Error",
        description: error.message || "Registration failed",
        variant: "destructive",
      })
      throw error
    }
  }

  const logout = () => {
    console.log('AuthContext: Logout called')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
    
    toast({
      title: "Success",
      description: "Logged out successfully",
    })
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// FIXED: Export the hook as a separate named export for Fast Refresh compatibility
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// FIXED: Add displayName for better debugging
AuthProvider.displayName = 'AuthProvider'