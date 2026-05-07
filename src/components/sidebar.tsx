'use client'

import { useState } from 'react'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  userRole?: 'landlord' | 'tenant'
  userName?: string
  userEmail?: string
  onLogout: () => void
}

export function Sidebar({
  userRole = 'tenant',
  userName = 'User',
  userEmail = 'user@example.com',
  onLogout,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  const navigationItems =
    userRole === 'landlord'
      ? [
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
            label: 'Bookings',
            icon: MapPin,
            href: '/landlord/bookings',
            children: [],
          },
          {
            label: 'Settings',
            icon: Settings,
            href: '/landlord/settings',
            children: [],
          },
        ]
      : [
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
            icon: Building2,
            href: '/tenant/favorites',
            children: [],
          },
          {
            label: 'Settings',
            icon: Settings,
            href: '/tenant/settings',
            children: [],
          },
        ]

  const isActive = (href: string) => {
    return pathname?.startsWith(href)
  }

  const handleLogout = () => {
    onLogout()
    router.push('/')
  }

  const toggleMenu = (label: string) => {
    setExpandedMenu(expandedMenu === label ? null : label)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-primary text-white p-2 rounded-lg shadow-lg hover:bg-primary/90 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={isOpen ? { x: 0 } : { x: -320 }}
        transition={{ type: 'spring', damping: 20 }}
        className="fixed left-0 top-0 z-40 h-screen w-80 bg-gradient-to-b from-background to-secondary border-r border-border flex flex-col shadow-xl lg:translate-x-0 lg:relative lg:animate-none"
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-primary font-montserrat">Tyrent</h1>
          <p className="text-xs text-muted-foreground mt-1 font-nunito">House Hunting</p>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white">
              <User size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground font-nunito">{userName}</p>
              <p className="text-xs text-muted-foreground font-nunito truncate">{userEmail}</p>
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
              <div key={item.label}>
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
                      {item.children?.map((child) => {
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

        {/* Logout Button */}
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
      </motion.aside>

      {/* Main Content Spacer for Desktop */}
      <div className="hidden lg:block w-80" />
    </>
  )
}
