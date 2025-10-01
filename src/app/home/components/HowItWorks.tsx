'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Search, 
  Video, 
  CreditCard
} from 'lucide-react'

export default function HowItWorks() {
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

  const steps = [
    {
      icon: Search,
      title: 'Search & Filter',
      desc: 'Browse thousands of verified listings with advanced filters.',
      step: '01'
    },
    {
      icon: Video,
      title: 'Virtual Tour',
      desc: 'Take immersive 360° tours and view properties from anywhere.',
      step: '02'
    },
    {
      icon: CreditCard,
      title: 'Book & Pay',
      desc: 'Secure your apartment with our safe payment system.',
      step: '03'
    },
  ]

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <motion.h2 
            className="text-4xl font-bold text-foreground mb-4 font-montserrat"
            variants={itemVariants}
          >
            How Tyrent Works
          </motion.h2>
          <motion.p 
            className="text-muted-foreground max-w-2xl mx-auto font-nunito text-lg"
            variants={itemVariants}
          >
            Your stress-free journey to finding the perfect home in just three
            simple steps.
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {steps.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={item.title}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="text-center border-0 shadow-lg hover:shadow-2xl transition-all duration-300 tyrent-card-hover overflow-hidden relative">
                  <CardContent className="pt-12 pb-10 px-6">
                    {/* Step Number */}
                    <div className="absolute top-4 right-4 text-6xl font-bold text-muted-foreground/10 font-montserrat">
                      {item.step}
                    </div>
                    
                    {/* Icon Container */}
                    <motion.div 
                      className="tyrent-gradient w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                    >
                      <IconComponent className="h-10 w-10 text-white" strokeWidth={2} />
                    </motion.div>
                    
                    {/* Content */}
                    <h3 className="text-2xl font-bold mb-3 font-montserrat text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground font-nunito text-base leading-relaxed">
                      {item.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Connection Lines - Desktop Only */}
        <div className="hidden md:block relative max-w-6xl mx-auto -mt-56 pointer-events-none">
          <svg className="w-full h-32" viewBox="0 0 800 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="currentColor" className="text-blue-500" stopOpacity="0.3" />
                <stop offset="50%" stopColor="currentColor" className="text-purple-500" stopOpacity="0.5" />
                <stop offset="100%" stopColor="currentColor" className="text-blue-500" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <motion.path
              d="M 150 50 Q 400 20 650 50"
              stroke="url(#lineGradient)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="10,5"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </svg>
        </div>
      </div>
    </section>
  )
}