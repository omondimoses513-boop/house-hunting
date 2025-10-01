'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-provider'
import { 
  Search, 
  Menu, 
  User, 
  Heart, 
  Bell, 
  Building2,
  LogIn,
  UserPlus
} from 'lucide-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 
        ${scrolled
            ? "bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm" 
            : "bg-transparent"}
      `}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="tyrent-gradient dark:tyrent-gradient-dark w-8 h-8 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className={`text-xl font-bold transition-colors duration-300 ${
                scrolled ? 'text-foreground' : 'text-white font-semibold'
              }`}>
                Tyrent
              </span>
            </Link>
          </div>

          {/* Right Side Navigation */}
          <div className="flex items-center space-x-4">
            {/* Become a Host */}
            <Link href="/host" className="hidden lg:block">
              <Button 
                variant="ghost" 
                className={`text-sm font-medium rounded-full px-4 py-2 transition-colors duration-300 ${
                  scrolled 
                    ? 'text-foreground hover:bg-accent' 
                    : 'text-white font-semibold hover:bg-white/10'
                }`}
              >
                Become a landlord
              </Button>
            </Link>

            {/* Theme Toggle */}
            <div className={scrolled ? '' : 'text-white'}>
              <ThemeToggle />
            </div>

            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="icon" 
              className={`hidden sm:flex rounded-full transition-colors duration-300 ${
                scrolled 
                  ? 'hover:bg-accent' 
                  : 'hover:bg-white/10'
              }`}
            >
              <Bell className={`h-5 w-5 transition-colors duration-300 ${
                scrolled ? 'text-muted-foreground' : 'text-white'
              }`} />
            </Button>

            {/* Favorites */}
            <Button 
              variant="ghost" 
              size="icon" 
              className={`hidden sm:flex rounded-full transition-colors duration-300 ${
                scrolled 
                  ? 'hover:bg-accent' 
                  : 'hover:bg-white/10'
              }`}
            >
              <Heart className={`h-5 w-5 transition-colors duration-300 ${
                scrolled ? 'text-muted-foreground' : 'text-white'
              }`} />
            </Button>

            {/* User Menu */}
            <div className={`flex items-center space-x-2 rounded-full p-1 hover:shadow-md transition-all duration-300 cursor-pointer ${
              scrolled 
                ? 'border border-border' 
                : 'border border-white/30 bg-white/10'
            }`}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full"
              >
                <Menu className={`h-4 w-4 transition-colors duration-300 ${
                  scrolled ? 'text-muted-foreground' : 'text-white'
                }`} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full"
              >
                <User className={`h-5 w-5 transition-colors duration-300 ${
                  scrolled ? 'text-muted-foreground' : 'text-white'
                }`} />
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={scrolled ? '' : 'text-white hover:bg-white/10'}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md py-4 space-y-2">
            <Link href="/listings" className="block px-4 py-2 text-sm text-foreground hover:bg-accent rounded">
              Browse Listings
            </Link>
            <Link href="/host" className="block px-4 py-2 text-sm text-foreground hover:bg-accent rounded">
              Become a Landlord
            </Link>
            <div className="px-4 py-2 border-t border-border">
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
                <Button size="sm" className="flex-1 tyrent-gradient dark:tyrent-gradient-dark">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}