'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Shield, Star, CheckCircle } from 'lucide-react'

export default function TrustSafety() {
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

  const features = [
    {
      title: 'Verified Listings',
      desc: 'All properties are inspected and verified before going live.',
    },
    {
      title: 'Secure Payments',
      desc: 'Your payments are protected with bank-level security.',
    },
    {
      title: '24/7 Support',
      desc: 'Our customer care team is always ready to help.',
    },
  ]

  const testimonialImages = [
    'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1494790108755-2616b612b647?w=100&h=100&fit=crop&crop=faces'
  ]

  return (
    <section className="py-12 bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-bold text-foreground mb-6 font-montserrat">
              Your Safety is Our Priority
            </h2>
            <p className="text-muted-foreground mb-8 font-nunito">
              Every listing on Tyrent is verified by our team. We ensure all landlords
              are legitimate and all properties meet our quality standards.
            </p>

            <div className="space-y-4">
              {features.map((item, index) => (
                <motion.div 
                  key={item.title}
                  className="flex items-start space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 5 }}
                >
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold font-montserrat">{item.title}</h4>
                    <p className="text-muted-foreground text-sm font-nunito">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button size="lg" className="mt-8 tyrent-gradient text-white font-montserrat">
                Learn More About Safety
              </Button>
            </motion.div>
          </motion.div>

          <motion.div 
            className="bg-primary rounded-2xl p-8 text-white"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <Shield className="h-12 w-12" />
              <div className="text-right">
                <motion.div 
                  className="text-2xl font-bold font-montserrat"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  100%
                </motion.div>
                <div className="text-sm opacity-90">Verified</div>
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2 font-montserrat">Trusted by Thousands</h3>
            <p className="opacity-90 mb-4 font-nunito">
              Join over 25,000 happy tenants who found their perfect home through Tyrent.
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex -space-x-2">
                {testimonialImages.map((imgSrc, i) => (
                  <motion.img
                    key={i}
                    src={imgSrc}
                    alt={`Happy tenant ${i + 1}`}
                    className="w-10 h-10 rounded-full border-2 border-white object-cover"
                    whileHover={{ scale: 1.2, zIndex: 10 }}
                    transition={{ duration: 0.2 }}
                  />
                ))}
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="ml-1 font-semibold">4.9/5</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}