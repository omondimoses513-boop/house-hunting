"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { useRouter, usePathname } from "next/navigation"
import { AUTH_CHANGED_EVENT, getSession, signOut } from "@/lib/auth"
import { dashboardRouteForRole } from "@/lib/route-guards"
import {
  Menu,
  Bell,
  LogIn,
  UserPlus,
  X,
  Home,
  Search,
  Sun,
  Moon,
  LayoutDashboard,
  Heart,
  Building2,
} from "lucide-react"

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [sessionRole, setSessionRole] = useState<string | null>(null)
  const [sessionName, setSessionName] = useState<string | null>(null)
  const [hasNotifications, setHasNotifications] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const sync = () => {
      const session = getSession()
      setSessionRole(session?.user.role ?? null)
      setSessionName(session?.user.fullName ?? null)
    }
    sync()
    window.addEventListener("storage", sync)
    window.addEventListener(AUTH_CHANGED_EVENT, sync)
    return () => {
      window.removeEventListener("storage", sync)
      window.removeEventListener(AUTH_CHANGED_EVENT, sync)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light")

  const lightAtTop = mounted && theme === "light" && !scrolled
  const dashboardHref = sessionRole ? dashboardRouteForRole(sessionRole as any) : "/auth/login"
  const showMyBookings = sessionRole !== "landlord" && sessionRole !== "admin"

  const textColor = scrolled || lightAtTop ? "text-foreground" : "text-white"
  const mutedColor = scrolled || lightAtTop ? "text-muted-foreground" : "text-white/70"
  const ghostHover = scrolled || lightAtTop ? "hover:bg-accent" : "hover:bg-white/10"
  const outlineStyle = scrolled || lightAtTop
    ? "border-border text-foreground hover:bg-accent"
    : "border-white/30 text-white hover:bg-white/10"

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/properties", label: "Properties" },
    ...(showMyBookings ? [{ href: "/tenant/dashboard", label: "My Bookings" }] : []),
  ]

  const mobileNavLinks = [
    { href: "/", label: "Home", Icon: Home },
    { href: "/properties", label: "Browse Properties", Icon: Search },
    //{ href: "/landlord/register", label: "Become a Landlord", Icon: Building2 },
    ...(showMyBookings ? [{ href: "/tenant/dashboard", label: "My Bookings", Icon: Heart }] : []),
    ...(sessionRole ? [{ href: dashboardHref, label: "Dashboard", Icon: LayoutDashboard }] : []),
  ]

  const mobileMenuOverlay =
    mounted && isMenuOpen
      ? createPortal(
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[200] md:hidden pointer-events-auto bg-black/60 dark:bg-black/70 backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Menu Panel */}
            <div className="fixed top-16 left-0 right-0 bottom-0 z-[210] md:hidden overflow-y-auto pointer-events-auto bg-background border-t border-border shadow-2xl">
              <div className="container mx-auto px-4 py-6">

                {/* Navigation Links */}
                <div className="space-y-1 mb-8">
                  {mobileNavLinks.map(({ href, label, Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors group ${
                        isActive(href) ? "bg-primary/10 text-primary" : "hover:bg-accent"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isActive(href) ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                      <span className={`text-base font-medium font-nunito ${isActive(href) ? "text-primary" : "text-foreground"}`}>
                        {label}
                      </span>
                      {isActive(href) && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </Link>
                  ))}
                </div>

                {/* Auth Buttons */}
                <div className="space-y-3 px-4">
                  {sessionRole ? (
                    <>
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full justify-center font-nunito bg-transparent"
                        asChild
                      >
                        <Link href="/profile">Profile</Link>
                      </Button>
                      <Button
                        size="lg"
                        className="w-full justify-center tyrent-gradient text-white font-nunito"
                        onClick={() => {
                          signOut()
                          setSessionRole(null)
                          setSessionName(null)
                          setIsMenuOpen(false)
                          router.push("/auth/login")
                        }}
                      >
                        Sign out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full justify-center font-nunito bg-transparent"
                        asChild
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Link href="/auth/login">
                          <LogIn className="h-4 w-4 mr-2" />
                          Sign In
                        </Link>
                      </Button>
                      <Button
                        size="lg"
                        className="w-full justify-center tyrent-gradient text-white font-nunito"
                        asChild
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Link href="/auth/register">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Sign Up
                        </Link>
                      </Button>
                    </>
                  )}
                </div>

                {/* Theme Toggle */}
                {mounted && (
                  <div className="flex items-center justify-between px-4 py-4 mt-6 border-t border-border">
                    <span className="text-sm font-medium text-foreground font-nunito">
                      {theme === "light" ? "Light Mode" : "Dark Mode"}
                    </span>
                    <Button variant="outline" size="icon" onClick={toggleTheme} className="rounded-full bg-transparent">
                      {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </>,
          document.body,
        )
      : null

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[70] transition-all duration-500 pointer-events-auto ${
        scrolled || lightAtTop
          ? "bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center z-50 shrink-0">
            <Image
              src="/tyrent_logo.png"
              alt="Tyrent"
              width={110}
              height={36}
              className="object-contain"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href}>
                <Button
                  variant="ghost"
                  className={`relative text-sm font-medium rounded-full px-4 transition-colors duration-300 font-nunito ${
                    isActive(href)
                      ? scrolled || lightAtTop
                        ? "text-primary bg-primary/10 hover:bg-primary/15"
                        : "text-white bg-white/15 hover:bg-white/20"
                      : `${textColor} ${ghostHover}`
                  }`}
                >
                  {label}
                  {isActive(href) && (
                    <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                      scrolled || lightAtTop ? "bg-primary" : "bg-white"
                    }`} />
                  )}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="hidden md:flex items-center space-x-1">
            {mounted && (
              <>
                {sessionRole ? (
                  <>
                    {/* Dashboard with first name */}
                    <Button
                      asChild
                      variant={isActive(dashboardHref) ? "secondary" : "outline"}
                      className={`font-nunito bg-transparent ${
                        isActive(dashboardHref) ? "" : outlineStyle
                      }`}
                    >
                      <Link href={dashboardHref}>
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        {sessionName ? sessionName.split(" ")[0] : "Dashboard"}
                      </Link>
                    </Button>

                    {/* Profile */}
                    <Button
                      asChild
                      variant="ghost"
                      className={`font-nunito ${
                        isActive("/profile")
                          ? scrolled || lightAtTop
                            ? "text-primary bg-primary/10"
                            : "text-white bg-white/15"
                          : `${textColor} ${ghostHover}`
                      }`}
                    >
                      <Link href="/profile">Profile</Link>
                    </Button>

                    {/* Sign out */}
                    <Button
                      variant="ghost"
                      className={`font-nunito ${mutedColor} ${ghostHover}`}
                      onClick={() => {
                        signOut()
                        setSessionRole(null)
                        setSessionName(null)
                        router.push("/auth/login")
                      }}
                    >
                      Sign out
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      asChild
                      variant="outline"
                      className={`font-nunito bg-transparent ${outlineStyle}`}
                    >
                      <Link href="/auth/register">Sign up</Link>
                    </Button>
                    <Button
                      asChild
                      className={`font-nunito ${
                        scrolled || lightAtTop
                          ? "tyrent-gradient text-white"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      <Link href="/auth/login">Sign in</Link>
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full transition-colors duration-300 relative ${ghostHover}`}
            >
              <Bell className={`h-5 w-5 ${mutedColor}`} />
              {hasNotifications && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-background" />
              )}
            </Button>

            {/* Theme Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className={`rounded-full transition-colors duration-300 ${ghostHover}`}
                title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                {theme === "light" ? (
                  <Moon className={`h-5 w-5 ${mutedColor}`} />
                ) : (
                  <Sun className={`h-5 w-5 ${mutedColor}`} />
                )}
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={() => setIsMenuOpen((v) => !v)}
            className={`md:hidden rounded-full relative z-[90] ${ghostHover}`}
          >
            {isMenuOpen ? (
              <X className={`h-6 w-6 ${textColor}`} />
            ) : (
              <Menu className={`h-6 w-6 ${textColor}`} />
            )}
          </Button>
        </div>
      </div>

      {mobileMenuOverlay}
    </header>
  )
}