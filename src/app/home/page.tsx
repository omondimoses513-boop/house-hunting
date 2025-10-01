'use client'

import React from 'react'
import Hero from '@/app/home/components/Hero'
import SearchFilters from '@/components/SearchFilters'
import FeaturedProperties from '@/app/home/components/FeaturedProperties'
import HowItWorks from '@/app/home/components/HowItWorks'
import TrustSafety from '@/app/home/components/TrustSafety'
import PopularLocations from '@/app/home/components/PopularLocations'
import LandlordsSection from '@/app/home/components/LandloardsSection'

export default function HomePage() {
  return (
    <main className="-mt-18 bg-background text-foreground">
      <Hero />
      <SearchFilters />
      <FeaturedProperties />
      <HowItWorks />
      <TrustSafety />
      <PopularLocations />
      <LandlordsSection />
    </main>
  )
}