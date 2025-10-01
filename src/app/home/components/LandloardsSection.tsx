'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Building2, Users, CreditCard, PlayCircle } from 'lucide-react'

export default function LandlordsSection() {
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

  const benefits = [
    { icon: Building2, text: "Free property listing and verification" },
    { icon: Users, text: "Access to pre-screened tenants" },
    { icon: CreditCard, text: "Secure and timely rent payments" }
  ]

  return (
    <section className="py-12 bg-primary text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-bold mb-6 font-montserrat">List Your Property on Tyrent</h2>
            <p className="text-primary-foreground/80 mb-8 text-lg font-nunito">
              Join thousands of landlords who trust Tyrent to manage rentals. Get
              verified tenants and secure payments.
            </p>

            <div className="space-y-4 mb-8">
              {benefits.map((item, index) => (
                <motion.div 
                  key={item.text}
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 5 }}
                >
                  <item.icon className="h-5 w-5 text-yellow-300" />
                  <span className="font-nunito">{item.text}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-montserrat">
                  List Your Property
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-primary font-montserrat"
                >
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </motion.div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <motion.div 
                    className="text-4xl font-bold font-montserrat"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    KES 2.5M+
                  </motion.div>
                  <div className="text-primary-foreground/70 font-nunito">Monthly transactions</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold font-montserrat">5,000+</div>
                    <div className="text-sm text-primary-foreground/70 font-nunito">Active Landlords</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold font-montserrat">15K+</div>
                    <div className="text-sm text-primary-foreground/70 font-nunito">Listed Properties</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}