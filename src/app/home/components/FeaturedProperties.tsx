'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import PropertyCard from '@/components/PropertyCard'
import { sampleProperties } from '@/data/SampleProperties'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export default function FeaturedProperties() {
  const router = useRouter()
  
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

  // Display only first 6 properties
  const featuredProperties = sampleProperties.slice(0, 6)

  const handleViewAll = () => {
    router.push('/properties')
  }

  return (
    <section className="py-12 bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <motion.h2 
            className="text-3xl font-bold text-foreground mb-4 font-montserrat"
            variants={itemVariants}
          >
            Featured Properties
          </motion.h2>
          <motion.p 
            className="text-muted-foreground max-w-2xl mx-auto font-nunito"
            variants={itemVariants}
          >
            Discover handpicked apartments from verified landlords, complete with
            virtual tours and transparent pricing.
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {featuredProperties.map((property, index) => (
            <motion.div
              key={property.id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <PropertyCard property={property} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              variant="outline"
              className="hover:bg-primary hover:text-primary-foreground font-montserrat"
              onClick={handleViewAll}
            >
              View All Properties
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}