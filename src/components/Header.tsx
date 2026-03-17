"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
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
} from "lucide-react"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (scrolled && isMenuOpen) {
      setIsMenuOpen(false)
    }
  }, [scrolled])

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const lightAtTop = mounted && theme === "light" && !scrolled

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || lightAtTop
          ? "bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 z-50">
            <div className="tyrent-gradient w-8 h-8 rounded-lg flex items-center justify-center shadow-lg">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span
              className={`text-xl font-bold transition-colors duration-300 font-montserrat ${
                scrolled || lightAtTop ? "text-foreground" : "text-white"
              }`}
            >
              Tyrent
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link href="/">
              <Button
                variant="ghost"
                className={`text-sm font-medium rounded-full px-4 transition-colors duration-300 font-nunito ${
                  scrolled || lightAtTop ? "text-foreground hover:bg-accent" : "text-white hover:bg-white/10"
                }`}
              >
                Home
              </Button>
            </Link>
            <Link href="/properties">
              <Button
                variant="ghost"
                className={`text-sm font-medium rounded-full px-4 transition-colors duration-300 font-nunito ${
                  scrolled || lightAtTop ? "text-foreground hover:bg-accent" : "text-white hover:bg-white/10"
                }`}
              >
                Properties
              </Button>
            </Link>
            <Link href="/landlord/register">
              <Button
                variant="ghost"
                className={`text-sm font-medium rounded-full px-4 transition-colors duration-300 font-nunito ${
                  scrolled || lightAtTop ? "text-foreground hover:bg-accent" : "text-white hover:bg-white/10"
                }`}
              >
                Become a Landlord
              </Button>
            </Link>
            <Link href="/tenant/dashboard">
              <Button
                variant="ghost"
                className={`text-sm font-medium rounded-full px-4 transition-colors duration-300 font-nunito ${
                  scrolled || lightAtTop ? "text-foreground hover:bg-accent" : "text-white hover:bg-white/10"
                }`}
              >
                My Bookings
              </Button>
            </Link>
          </nav>

          {/* Right Side Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Theme Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className={`rounded-full transition-colors duration-300 ${
                  scrolled || lightAtTop ? "hover:bg-accent" : "hover:bg-white/10"
                }`}
                title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                {theme === "light" ? (
                  <Moon className={`h-5 w-5 ${scrolled || lightAtTop ? "text-muted-foreground" : "text-white"}`} />
                ) : (
                  <Sun className={`h-5 w-5 ${scrolled || lightAtTop ? "text-muted-foreground" : "text-white"}`} />
                )}
              </Button>
            )}

            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="icon" 
              className={`rounded-full transition-colors duration-300 ${
                scrolled || lightAtTop ? "hover:bg-accent" : "hover:bg-white/10"
              }`}
            >
              <Bell className={`h-5 w-5 ${scrolled || lightAtTop ? "text-muted-foreground" : "text-white"}`} />
            </Button>

            {/* Favorites */}
            <Link href="/tenant/dashboard">
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full transition-colors duration-300 ${
                  scrolled || lightAtTop ? "hover:bg-accent" : "hover:bg-white/10"
                }`}
              >
                <Heart className={`h-5 w-5 ${scrolled || lightAtTop ? "text-muted-foreground" : "text-white"}`} />
              </Button>
            </Link>

            {/* User Menu */}
            <div className={`flex items-center space-x-2 rounded-full p-1 border hover:shadow-md transition-all duration-300 cursor-pointer ${
              scrolled || lightAtTop
                ? "border-border bg-background" 
                : "border-white/30 bg-white/10 backdrop-blur-sm"
            }`}>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-transparent">
                <Menu className={`h-4 w-4 ${scrolled || lightAtTop ? "text-muted-foreground" : "text-white"}`} />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-transparent">
                <User className={`h-4 w-4 ${scrolled || lightAtTop ? "text-muted-foreground" : "text-white"}`} />
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden rounded-full z-50 ${
              scrolled || lightAtTop ? "hover:bg-accent" : "hover:bg-white/10"
            }`}
          >
            {isMenuOpen ? (
              <X className={`h-6 w-6 ${scrolled || lightAtTop ? "" : "text-white"}`} />
            ) : (
              <Menu className={`h-6 w-6 ${scrolled || lightAtTop ? "" : "text-white"}`} />
            )}
          </Button>
        </div>
      </div>

      {/* Modern Mobile Menu */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed top-16 left-0 right-0 bottom-0 bg-background z-40 md:hidden overflow-y-auto">
            <div className="container mx-auto px-4 py-6">
              {/* Navigation Links */}
              <div className="space-y-1 mb-8">
                <Link
                  href="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors group"
                >
                  <Home className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                  <span className="text-base font-medium text-foreground font-nunito">Home</span>
                </Link>
                <Link
                  href="/properties"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors group"
                >
                  <Search className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                  <span className="text-base font-medium text-foreground font-nunito">Browse Properties</span>
                </Link>
                <Link
                  href="/landlord/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors group"
                >
                  <Building2 className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                  <span className="text-base font-medium text-foreground font-nunito">Become a Landlord</span>
                </Link>
                <Link
                  href="/tenant/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors group"
                >
                  <LayoutDashboard className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                  <span className="text-base font-medium text-foreground font-nunito">My Bookings</span>
                </Link>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-sm font-semibold text-muted-foreground font-montserrat">Quick Actions</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/tenant/dashboard">
                    <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-border hover:bg-accent transition-colors w-full">
                      <Heart className="h-6 w-6 text-muted-foreground mb-2" />
                      <span className="text-xs font-medium font-nunito">Favorites</span>
                    </button>
                  </Link>
                  <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-border hover:bg-accent transition-colors">
                    <Bell className="h-6 w-6 text-muted-foreground mb-2" />
                    <span className="text-xs font-medium font-nunito">Notifications</span>
                  </button>
                </div>
              </div>

              {/* Auth Buttons */}
              <div className="space-y-3 px-4">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full justify-center font-nunito bg-transparent"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
                <Button
                  size="lg"
                  className="w-full justify-center tyrent-gradient text-white font-nunito"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </Button>
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
        </>
      )}
    </header>
  )
}