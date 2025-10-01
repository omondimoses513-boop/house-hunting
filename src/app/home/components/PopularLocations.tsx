'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'

export default function PopularLocations() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  }

  const locations = [
    { name: 'Westlands', properties: '1,200+', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=300' },
    { name: 'Kilimani', properties: '950+', image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=300' },
    { name: 'Karen', properties: '680+', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=300' },
    { name: 'Lavington', properties: '520+', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=300' },
    { name: 'Runda', properties: '340+', image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=300' },
    { name: 'CBD', properties: '890+', image: 'https://images.unsplash.com/photo-1567496898669-ee935f5317ac?w=300' }
  ]

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <motion.h2 
            className="text-3xl font-bold text-foreground mb-4 font-montserrat"
            variants={itemVariants}
          >
            Popular Locations in Nairobi
          </motion.h2>
          <motion.p 
            className="text-muted-foreground max-w-2xl mx-auto font-nunito"
            variants={itemVariants}
          >
            Explore the most sought-after neighborhoods with the best connectivity
            and amenities.
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {locations.map((loc, index) => (
            <motion.div
              key={loc.name}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="tyrent-card-hover cursor-pointer border-0 overflow-hidden">
                <div className="relative h-32">
                  <img 
                    src={loc.image} 
                    alt={`${loc.name} neighborhood`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-3">
                    <h3 className="text-white font-semibold text-sm font-montserrat">{loc.name}</h3>
                    <p className="text-white/80 text-xs font-nunito">
                      {loc.properties} properties
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}