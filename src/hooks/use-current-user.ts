import { useEffect, useState } from 'react'

export interface CurrentUser {
  id: string
  username: string
  email: string
  role: 'LANDLORD' | 'TENANT' | 'SUPER_ADMIN' | 'ADMIN'
  fullName?: string
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Try to get user from localStorage or session
        const userStr = localStorage.getItem('current_user')
        if (userStr) {
          setUser(JSON.parse(userStr))
        } else {
          // Fallback to API call if needed
          // const response = await fetch('/api/user/me')
          // if (response.ok) {
          //   const userData = await response.json()
          //   setUser(userData)
          // }
        }
      } catch (error) {
        console.error('Failed to load user:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  return { user, loading }
}
