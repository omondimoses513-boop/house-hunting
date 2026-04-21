"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { useRouter } from "next/navigation"
import { AUTH_CHANGED_EVENT, getSession, signOut } from "@/lib/auth"
import { dashboardRouteForRole } from "@/lib/route-guards"
import {
  Menu,
  User,
  Heart,
  Bell,
  Building2,
  LogIn,
  UserPlus,
  X,
  Home,
  Search,
  Sun,
  Moon,
  LayoutDashboard,
  CircleUserRound,
} from "lucide-react"
import { TyrentLogoMark } from "@/components/TyrentLogo"

export default function Header() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [sessionRole, setSessionRole] = useState<string | null>(null)
  const [sessionName, setSessionName] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

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
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  // Resolve actual applied theme from the <html> class (handles "system" correctly)
  const resolvedTheme =
    mounted
      ? document.documentElement.classList.contains("dark")
        ? "dark"
        : "light"
      : "light"

  // Transparent header only when truly in light mode at page top
  const isTransparent = mounted && resolvedTheme === "light" && !scrolled

  // Icon color logic based on resolved theme
  const iconColor = isTransparent
    ? "text-foreground"
    : resolvedTheme === "dark" && !scrolled
      ? "text-white"
      : "text-muted-foreground"

  const toggleIconColor = iconColor

  const dashboardHref = sessionRole ? dashboardRouteForRole(sessionRole as any) : "/auth/login"
  const showMyBookings = sessionRole !== "landlord" && sessionRole !== "admin"

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[70] transition-all duration-500 pointer-events-auto ${
        scrolled || isTransparent
          ? "bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 z-50">
            <div className="tyrent-gradient w-8 h-8 rounded-lg flex items-center justify-center shadow-lg">
              <TyrentLogoMark className="h-5 w-5 text-white" />
            </div>
            <span
              className={`text-xl font-bold transition-colors duration-300 font-montserrat ${
                scrolled || isTransparent ? "text-foreground" : "text-white"
              }`}
            >
              Tyrent
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {[
              { href: "/", label: "Home" },
              { href: "/properties", label: "Properties" },
              ...(showMyBookings ? [{ href: "/tenant/dashboard", label: "My Bookings" }] : []),
            ].map(({ href, label }) => (
              <Link key={href} href={href}>
                <Button
                  variant="ghost"
                  className={`text-sm font-medium rounded-full px-4 transition-colors duration-300 font-nunito ${
                    scrolled || isTransparent ? "text-foreground hover:bg-accent" : "text-white hover:bg-white/10"
                  }`}
                >
                  {label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Dashboard / Auth */}
            {mounted && (
              <>
                {sessionRole ? (
                  <>
                    <Button
                      asChild
                      variant="outline"
                      className={`font-nunito bg-transparent ${
                        scrolled || isTransparent ? "" : "border-white/30 text-white hover:bg-white/10"
                      }`}
                    >
                      <Link href="/profile">
                        <CircleUserRound className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className={`font-nunito bg-transparent ${
                        scrolled || isTransparent ? "" : "border-white/30 text-white hover:bg-white/10"
                      }`}
                    >
                      <Link href={dashboardHref}>
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        {sessionName ? sessionName.split(" ")[0] : "Dashboard"}
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className={`font-nunito ${
                        scrolled || isTransparent ? "text-foreground" : "text-white hover:bg-white/10"
                      }`}
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
                      className={`font-nunito bg-transparent ${
                        scrolled || isTransparent ? "" : "border-white/30 text-white hover:bg-white/10"
                      }`}
                    >
                      <Link href="/auth/register">Sign up</Link>
                    </Button>
                    <Button
                      asChild
                      className={`font-nunito ${
                        scrolled || isTransparent
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

            {/* Theme Toggle — fixed visibility */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className={`rounded-full transition-colors duration-300 ${
                  scrolled || isTransparent ? "hover:bg-accent" : "hover:bg-white/10"
                }`}
                title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                {theme === "light" ? (
                  <Moon className={`h-5 w-5 ${toggleIconColor}`} />
                ) : (
                  <Sun className={`h-5 w-5 ${toggleIconColor}`} />
                )}
              </Button>
            )}

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full transition-colors duration-300 ${
                scrolled || isTransparent ? "hover:bg-accent" : "hover:bg-white/10"
              }`}
            >
              <Bell className={`h-5 w-5 ${iconColor}`} />
            </Button>

            {/* Favorites */}
            {sessionRole === "landlord" || sessionRole === "admin" ? (
              <Link href={dashboardHref}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-full transition-colors duration-300 ${
                    scrolled || isTransparent ? "hover:bg-accent" : "hover:bg-white/10"
                  }`}
                >
                  <LayoutDashboard className={`h-5 w-5 ${iconColor}`} />
                </Button>
              </Link>
            ) : (
              <Link href="/tenant/dashboard">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-full transition-colors duration-300 ${
                    scrolled || isTransparent ? "hover:bg-accent" : "hover:bg-white/10"
                  }`}
                >
                  <Heart className={`h-5 w-5 ${iconColor}`} />
                </Button>
              </Link>
            )}

            {/* User Menu */}
            <div
              className={`flex items-center space-x-2 rounded-full p-1 border hover:shadow-md transition-all duration-300 cursor-pointer ${
                scrolled || isTransparent
                  ? "border-border bg-background"
                  : "border-white/30 bg-white/10 backdrop-blur-sm"
              }`}
            >
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-transparent">
                <Menu className={`h-4 w-4 ${iconColor}`} />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-transparent">
                <User className={`h-4 w-4 ${iconColor}`} />
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={() => setIsMenuOpen((v) => !v)}
            className={`md:hidden rounded-full relative z-[90] ${
              scrolled || isTransparent ? "hover:bg-accent" : "hover:bg-white/10"
            }`}
          >
            {isMenuOpen ? (
              <X className={`h-6 w-6 ${scrolled || isTransparent ? "" : "text-white"}`} />
            ) : (
              <Menu className={`h-6 w-6 ${scrolled || isTransparent ? "" : "text-white"}`} />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <>
          {/* Backdrop — boosted opacity so it's clearly visible on light mode too */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] md:hidden pointer-events-auto"
            onClick={() => setIsMenuOpen(false)}
          />
          {/* Side drawer — only 80% width so backdrop shows on the right */}
          <div className="fixed top-0 left-0 bottom-0 w-[80%] max-w-sm bg-background z-[85] md:hidden overflow-y-auto pointer-events-auto shadow-2xl">
            <div className="container mx-auto px-4 pt-20 pb-6">
              {/* Navigation Links */}
              <div className="space-y-1 mb-8">
                {[
                  { href: "/", label: "Home", Icon: Home },
                  { href: "/properties", label: "Browse Properties", Icon: Search },
                  ...(showMyBookings
                    ? [{ href: "/tenant/dashboard", label: "My Bookings", Icon: LayoutDashboard }]
                    : []),
                ].map(({ href, label, Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors group"
                  >
                    <Icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                    <span className="text-base font-medium text-foreground font-nunito">{label}</span>
                  </Link>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-sm font-semibold text-muted-foreground font-montserrat">Quick Actions</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {sessionRole === "landlord" || sessionRole === "admin" ? (
                    <Link href={dashboardHref}>
                      <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-border hover:bg-accent transition-colors w-full">
                        <LayoutDashboard className="h-6 w-6 text-muted-foreground mb-2" />
                        <span className="text-xs font-medium font-nunito">Dashboard</span>
                      </button>
                    </Link>
                  ) : (
                    <Link href="/tenant/dashboard">
                      <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-border hover:bg-accent transition-colors w-full">
                        <Heart className="h-6 w-6 text-muted-foreground mb-2" />
                        <span className="text-xs font-medium font-nunito">Favorites</span>
                      </button>
                    </Link>
                  )}
                  <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-border hover:bg-accent transition-colors">
                    <Bell className="h-6 w-6 text-muted-foreground mb-2" />
                    <span className="text-xs font-medium font-nunito">Notifications</span>
                  </button>
                </div>
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
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Link href="/profile">
                        <CircleUserRound className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full justify-center font-nunito bg-transparent"
                      asChild
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Link href={dashboardHref}>
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
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

              {/* Theme Toggle in mobile menu — always visible */}
              {mounted && (
                <div className="flex items-center justify-between px-4 py-4 mt-6 border-t border-border">
                  <span className="text-sm font-medium text-foreground font-nunito">
                    {theme === "light" ? "Light Mode" : "Dark Mode"}
                  </span>
                  <Button variant="outline" size="icon" onClick={toggleTheme} className="rounded-full bg-transparent">
                    {theme === "light" ? (
                      <Moon className="h-5 w-5 text-foreground" />
                    ) : (
                      <Sun className="h-5 w-5 text-foreground" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  )
}