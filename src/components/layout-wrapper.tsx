'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Sidebar } from '@/components/sidebar'
import { useCurrentUser } from '@/hooks/use-current-user'

interface LayoutWrapperProps {
  children: ReactNode
}

// Routes that show only content (no navbar/sidebar/footer)
const AUTH_ROUTES = ['/auth/login', '/auth/register', '/auth/verify-otp', '/landlord/register']

// Routes that use sidebar layout
const SIDEBAR_ROUTES = [
  '/tenant/dashboard',
  '/tenant/bookings',
  '/tenant/favorites',
  '/tenant/settings',
  '/landlord/dashboard',
  '/landlord/properties',
  '/landlord/bookings',
  '/landlord/settings',
  '/landlord/subscription',
  '/booking/pending',
]

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  const { user } = useCurrentUser()

  // Determine which layout to use
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname?.startsWith(route))
  const isSidebarRoute = SIDEBAR_ROUTES.some((route) => pathname?.startsWith(route)) ||
    pathname?.startsWith('/landlord/properties/checkout') ||
    pathname?.startsWith('/booking/') ||
    pathname?.startsWith('/landlord/subscription/pending')

  // Auth pages: no navbar, no sidebar, no footer
  if (isAuthRoute) {
    return <>{children}</>
  }

  // Dashboard/protected pages: sidebar + content
  if (isSidebarRoute) {
    const userRole = user?.role === 'LANDLORD' ? 'landlord' : 'tenant'
    const userName = user?.fullName || user?.username || 'User'
    const userEmail = user?.email || 'user@example.com'

    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar
          userRole={userRole}
          userName={userName}
          userEmail={userEmail}
          onLogout={() => {
            localStorage.removeItem('current_user')
            window.location.href = '/auth/login'
          }}
        />
        <main className="flex-1 w-full overflow-auto">
          {children}
        </main>
      </div>
    )
  }

  // Home and other public pages: navbar + content + footer
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  )
}
