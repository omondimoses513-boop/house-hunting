'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Building2,
  MapPin,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
  Heart,
  Users,
  BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AUTH_CHANGED_EVENT, getSession, signOut } from '@/lib/auth'

type NavChild = { label: string; href: string }

type NavItem = {
  label: string
  icon: React.ElementType
  href: string
  children: NavChild[]
}

function getNavigationItems(role: string): NavItem[] {
  switch (role) {
    case 'landlord':
      return [
        {
          label: 'Dashboard',
          icon: LayoutDashboard,
          href: '/landlord/dashboard',
          children: [],
        },
        {
          label: 'Properties',
          icon: Building2,
          href: '/landlord/properties',
          children: [
            { label: 'All Properties', href: '/landlord/properties' },
            { label: 'Add New', href: '/landlord/properties/new' },
          ],
        },
        {
          label: 'Profile',
          icon: User,
          href: '/landlord/profile',
          children: [],
        },
      ]

    case 'super_admin':
    case 'admin':
      return [
        {
          label: 'Dashboard',
          icon: LayoutDashboard,
          href: '/admin/dashboard',
          children: [],
        },
        {
          label: 'Users',
          icon: Users,
          href: '/admin/users',
          children: [
            { label: 'All Users', href: '/admin/users' },
            { label: 'Landlords', href: '/admin/users/landlords' },
            { label: 'Tenants', href: '/admin/users/tenants' },
          ],
        },
        {
          label: 'Properties',
          icon: Building2,
          href: '/admin/properties',
          children: [],
        },
        {
          label: 'Analytics',
          icon: BarChart3,
          href: '/admin/analytics',
          children: [],
        },
        {
          label: 'Profile',
          icon: User,
          href: '/admin/profile',
          children: [],
        },
      ]

    // tenant (default)
    default:
      return [
        {
          label: 'Dashboard',
          icon: LayoutDashboard,
          href: '/tenant/dashboard',
          children: [],
        },
        {
          label: 'Bookings',
          icon: MapPin,
          href: '/tenant/bookings',
          children: [],
        },
        {
          label: 'Favorites',
          icon: Heart,
          href: '/tenant/favorites',
          children: [],
        },
        {
          label: 'Profile',
          icon: User,
          href: '/tenant/profile',
          children: [],
        },
      ]
  }
}

function getRoleLabel(role: string): string {
  switch (role) {
    case 'landlord':
      return 'Landlord Portal'
    case 'super_admin':
    case 'admin':
      return 'Admin Portal'
    default:
      return 'Tenant Portal'
  }
}

function getRoleBadgeLabel(role: string): string {
  switch (role) {
    case 'super_admin':
      return 'Super Admin'
    case 'admin':
      return 'Admin'
    case 'landlord':
      return 'Landlord'
    default:
      return 'Tenant'
  }
}

// Derive initials from a full name for the avatar
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

interface SidebarProps {
  onLogout?: () => void
}

export function Sidebar({ onLogout }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)

  // Session-derived state — mirrors header pattern
  const [sessionRole, setSessionRole] = useState<string>('tenant')
  const [sessionName, setSessionName] = useState<string>('User')
  const [sessionEmail, setSessionEmail] = useState<string>('user@example.com')

  const pathname = usePathname()
  const router = useRouter()

  // Sync session reactively (same as header)
  useEffect(() => {
    const sync = () => {
      const session = getSession()
      setSessionRole(session?.user.role ?? 'tenant')
      setSessionName(session?.user.fullName ?? 'User')
      setSessionEmail(session?.user.email ?? 'user@example.com')
    }
    sync()
    window.addEventListener('storage', sync)
    window.addEventListener(AUTH_CHANGED_EVENT, sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener(AUTH_CHANGED_EVENT, sync)
    }
  }, [])

  // Track mobile breakpoint
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close mobile menu when switching to desktop
  useEffect(() => {
    if (!isMobile) setIsOpen(false)
  }, [isMobile])

  const navigationItems = getNavigationItems(sessionRole)
  const isActive = (href: string) => pathname?.startsWith(href)

  const handleLogout = () => {
    signOut()
    setSessionRole('tenant')
    setSessionName('User')
    setSessionEmail('user@example.com')
    onLogout?.()
    router.push('/')
  }

  const toggleMenu = (label: string) => {
    setExpandedMenu(expandedMenu === label ? null : label)
  }

  const initials = getInitials(sessionName)

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-primary font-montserrat">Tyrent</h1>
        <p className="text-xs text-muted-foreground mt-1 font-nunito">
          {getRoleLabel(sessionRole)}
        </p>
      </div>

      {/* User Profile — role-aware */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          {/* Avatar with initials */}
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white shrink-0 font-semibold text-sm font-montserrat">
            {initials || <User size={20} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground font-nunito truncate">
              {sessionName}
            </p>
            <p className="text-xs text-muted-foreground font-nunito truncate">
              {sessionEmail}
            </p>
            {/* Role badge */}
            <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary font-nunito">
              {getRoleBadgeLabel(sessionRole)}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const hasChildren = item.children && item.children.length > 0
          const itemIsActive = isActive(item.href)
          const menuIsExpanded = expandedMenu === item.label

          return (
            <div key={item.label} className="mb-1">
              {hasChildren ? (
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-nunito font-medium ${
                    itemIsActive
                      ? 'bg-primary/15 text-primary shadow-sm'
                      : 'text-foreground hover:bg-secondary/50'
                  }`}
                >
                  <Icon size={20} />
                  <span className="flex-1 text-left">{item.label}</span>
                  <motion.div
                    animate={{ rotate: menuIsExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={18} />
                  </motion.div>
                </button>
              ) : (
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-nunito font-medium ${
                    itemIsActive
                      ? 'bg-primary/15 text-primary shadow-sm'
                      : 'text-foreground hover:bg-secondary/50'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              )}

              {/* Submenu */}
              <AnimatePresence>
                {hasChildren && menuIsExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {item.children.map((child) => {
                      const childIsActive = isActive(child.href)
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setIsOpen(false)}
                          className={`block px-4 py-2 pl-12 text-sm rounded-lg transition-colors duration-200 font-nunito ${
                            childIsActive
                              ? 'text-primary font-semibold'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {child.label}
                        </Link>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full gap-2 font-nunito"
        >
          <LogOut size={18} />
          Logout
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-primary text-white p-2 rounded-lg shadow-lg hover:bg-primary/90 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile: overlay + animated sidebar */}
      {isMobile && (
        <>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black/50 z-30"
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isOpen && (
              <motion.aside
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="fixed left-0 top-0 z-40 h-screen w-80 bg-gradient-to-b from-background to-secondary border-r border-border flex flex-col shadow-xl"
              >
                {sidebarContent}
              </motion.aside>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Desktop: always-visible static sidebar */}
      {!isMobile && (
        <aside className="hidden lg:flex flex-col h-screen w-80 sticky top-0 bg-gradient-to-b from-background to-secondary border-r border-border shadow-xl">
          {sidebarContent}
        </aside>
      )}
    </>
  )
}