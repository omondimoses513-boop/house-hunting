'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { PageRoutes } from "@/constants/page-routes"
import { 
  Search, 
  MapPin, 
  Home, 
  Shield,
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [user, setUser] = useState<any>(null)
  const [showTenantWarning, setShowTenantWarning] = useState(false)
  const router = useRouter()
  
  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1920&q=80',
      title: 'Modern Apartments',
      subtitle: 'in Westlands',
      price: 'From KES 45,000/mo',
      features: ['2-3 Bedrooms', 'Gym & Pool', 'Secure Parking']
    },
    {
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&q=80',
      title: 'Luxury Penthouses',
      subtitle: 'in Kilimani',
      price: 'From KES 85,000/mo',
      features: ['Rooftop Terrace', 'City Views', 'Smart Home']
    },
    {
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=80',
      title: 'Family Homes',
      subtitle: 'in Karen',
      price: 'From KES 120,000/mo',
      features: ['4+ Bedrooms', 'Garden', 'Guest House']
    },
    {
      image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1920&q=80',
      title: 'Studio Apartments',
      subtitle: 'in CBD',
      price: 'From KES 25,000/mo',
      features: ['Furnished', '24/7 Security', 'High-Speed WiFi']
    }
  ]

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('current_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [slides.length])

  const handleListPropertyClick = () => {
    // Check if user exists and has appropriate role
    if (!user) {
      // Not logged in, redirect to login
      router.push('/auth/login')
      return
    }

    const userRole = user?.role
    const isAllowed = userRole === 'LANDLORD' || userRole === 'ADMIN' || userRole === 'SUPER_ADMIN'

    if (!isAllowed) {
      // Show toast and warning to tenant
      toast.error('Landlord Account Required', {
        description: 'You must have a landlord account to list properties. Please sign in or create a landlord account.',
        duration: 4000,
      })
      setShowTenantWarning(true)
      return
    }

    // Allowed user, redirect to create property
    router.push(PageRoutes.LANDLORD_CREATE_PROPERTY)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <section className="relative overflow-hidden bg-background">
      {/* 3D Carousel Background */}
      <div className="absolute inset-0 perspective-1000">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            className="absolute inset-0"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('${slides[currentSlide].image}')`,
              }}
            />
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating 3D Property Cards */}
      <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden lg:block">
        <motion.div
          className="relative w-80 h-96"
          animate={{ 
            rotateY: [0, 360],
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {slides.map((slide, index) => (
            <motion.div
              key={index}
              className="absolute inset-0 w-80 h-96 rounded-2xl overflow-hidden shadow-2xl"
              style={{
                transform: `rotateY(${index * 90}deg) translateZ(160px)`,
                backfaceVisibility: 'hidden',
              }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative h-full bg-card border border-border">
                <div 
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: `url('${slide.image}')` }}
                />
                <div className="p-4 bg-gradient-to-b from-card/90 to-card">
                  <h3 className="text-lg font-bold text-foreground">{slide.title}</h3>
                  <p className="text-sm text-muted-foreground">{slide.subtitle}</p>
                  <p className="text-primary font-bold mt-2">{slide.price}</p>
                  <div className="mt-3 space-y-1">
                    {slide.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-xs text-muted-foreground">
                        <CheckCircle className="h-3 w-3 mr-1 text-primary" />
                        <span className="">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="relative min-h-screen container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <motion.div 
          className="text-white w-full max-w-3xl"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Main Headline with 3D Text Effect */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold mb-4 leading-tight">
              <span className="block">Making</span>
              <motion.span 
                className="block text-primary relative"
                animate={{ 
                  textShadow: [
                    '0 0 20px rgba(var(--primary-rgb), 0.5)',
                    '0 0 40px rgba(var(--primary-rgb), 0.8)',
                    '0 0 20px rgba(var(--primary-rgb), 0.5)'
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  transform: 'perspective(500px) rotateX(15deg)',
                  transformOrigin: 'center bottom'
                }}
              >
                House Hunting
              </motion.span>
              <span className="block">Easier For You</span>
            </h1>
          </motion.div>
          
          {/* Animated Property Info */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="flex items-center space-x-4 text-white/90">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-lg">
                  <span className="font-semibold">{slides[currentSlide].title}</span> {slides[currentSlide].subtitle}
                </span>
              </div>
              <div className="md:flex items-center space-x-6 mt-3">
                <span className="text-2xl font-bold text-primary">{slides[currentSlide].price}</span>
                <div className="flex space-x-3">
                  {slides[currentSlide].features.map((feature, index) => (
                    <span key={index} className="text-sm bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full font-nunito">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Stats with 3D Cards */}
          {/*<motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {[
              { value: '24hrs', label: 'Response Time', icon: Clock },
              { value: '100%', label: 'Verified', icon: Shield },
              { value: '360°', label: 'Virtual Tours', icon: Home },
              { value: '0%', label: 'Agent Fees', icon: Star }
            ].map((stat, index) => (
              <motion.div 
                key={stat.label}
                className="relative group"
                whileHover={{ 
                  scale: 1.05,
                  rotateY: 15,
                  z: 50
                }}
                transition={{ duration: 0.3 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 transform transition-all duration-300 group-hover:bg-white/20">
                  <stat.icon className="h-5 w-5 text-primary mb-2" />
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-white/70">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>*/}

          {/* CTA Buttons with 3D Effect */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <motion.div
              whileHover={{ scale: 1.05, rotateX: -5 }}
              whileTap={{ scale: 0.95 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-base rounded-xl shadow-2xl min-w-[200px] transition-all duration-300"
                style={{
                  boxShadow: '0 10px 30px rgba(var(--primary-rgb), 0.4)',
                }}
                asChild
              >
                <Link href={PageRoutes.PROPERTIES}>
                  <Search className="mr-2 h-5 w-5" />
                  Start Searching
                </Link>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, rotateX: -5 }}
              whileTap={{ scale: 0.95 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white hover:text-foreground font-semibold px-8 py-6 text-base rounded-xl backdrop-blur-sm bg-white/10 min-w-[200px] transition-all duration-300"
                onClick={handleListPropertyClick}
              >
                <Home className="mr-2 h-5 w-5" />
                List Your Property
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Carousel Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-4">
        <motion.button
          onClick={prevSlide}
          className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft className="h-5 w-5" />
        </motion.button>
        
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide 
                  ? 'w-8 bg-primary' 
                  : 'w-2 bg-white/40 hover:bg-white/60'
              }`}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </div>
        
        <motion.button
          onClick={nextSlide}
          className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronRight className="h-5 w-5" />
        </motion.button>
      </div>

      {/* 3D Floating Elements */}
      <motion.div 
        className="absolute top-20 left-20 w-32 h-32"
        animate={{ 
          rotateZ: 360,
          y: [0, -30, 0],
        }}
        transition={{ 
          rotateZ: { duration: 20, repeat: Infinity, ease: "linear" },
          y: { duration: 4, repeat: Infinity }
        }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-3xl" />
      </motion.div>

      {/* Tenant Warning Modal */}
      <AnimatePresence>
        {showTenantWarning && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTenantWarning(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 max-w-sm w-full mx-4"
            >
              <div className="bg-card border border-border rounded-2xl shadow-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-amber-500/20 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Only for Landlords</h3>
                </div>
                
                <p className="text-muted-foreground mb-6">
                  Property listing is only available for landlords and administrators. As a tenant, you can browse and book properties.
                </p>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowTenantWarning(false)}
                    className="flex-1"
                  >
                    Continue Browsing
                  </Button>
                  <Button
                    className="flex-1 bg-primary hover:bg-primary/90"
                    onClick={() => {
                      setShowTenantWarning(false)
                      router.push('/auth/login')
                    }}
                  >
                    Sign In as Landlord
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </section>
  )
}
