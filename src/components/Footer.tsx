'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube
} from 'lucide-react'

export default function Footer() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  }

  return (
    <footer className="bg-secondary dark:bg-muted">
      {/* Main Footer Content with Background */}
      <div className="relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/60 dark:bg-black/70" style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2053&q=80')`
          }}></div>
          {/* Black Overlay */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>
        </div>

        {/* Content */}
        <motion.div 
          className="relative z-10 container mx-auto px-4 py-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Organization Info */}
            <motion.div 
              className="lg:col-span-1"
              variants={itemVariants}
            >
              <div className="mb-6">
                <motion.div 
                  className="flex items-center space-x-2 mb-4"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="tyrent-gradient w-10 h-10 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-primary font-montserrat">Tyrent</span>
                </motion.div>
                <p className="text-sm leading-relaxed text-gray-300 mb-4 font-nunito">
                  Your digital house hunting partner. Building a community-driven platform for stress-free 
                  apartment booking through verified listings, virtual tours, and secure payments.
                </p>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 text-gray-100">
                <motion.div 
                  className="flex items-center space-x-3"
                  whileHover={{ x: 5, color: "hsl(var(--primary))" }}
                  transition={{ duration: 0.2 }}
                >
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm">Nairobi Central Business District, Kenya</span>
                </motion.div>
                <motion.div 
                  className="flex items-center space-x-3"
                  whileHover={{ x: 5, color: "hsl(var(--primary))" }}
                  transition={{ duration: 0.2 }}
                >
                  <Phone className="h-4 w-4 text-primary" />
                  <div className="flex flex-col">
                    <a href="tel:+254700000000" className="text-sm hover:text-primary transition-colors duration-200">+254 700 000 000</a>
                    <a href="tel:+254711000000" className="text-sm hover:text-primary transition-colors duration-200">+254 711 000 000</a>
                  </div>
                </motion.div>
                <motion.div 
                  className="flex items-center space-x-3"
                  whileHover={{ x: 5, color: "hsl(var(--primary))" }}
                  transition={{ duration: 0.2 }}
                >
                  <Mail className="h-4 w-4 text-primary" />
                  <a href="mailto:hello@tyrent.co.ke" className="text-sm hover:text-primary transition-colors duration-200">hello@tyrent.co.ke</a>
                </motion.div>
                <motion.div 
                  className="flex items-center space-x-3"
                  whileHover={{ x: 5, color: "hsl(var(--primary))" }}
                  transition={{ duration: 0.2 }}
                >
                  <Globe className="h-4 w-4 text-primary" />
                  <span className="text-sm">www.tyrent.co.ke</span>
                </motion.div>
              </div>
            </motion.div>

            {/* For Tenants Section */}
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold mb-4 text-primary font-montserrat">For Tenants</h3>
              <ul className="space-y-2">
                {[
                  { title: "Browse Properties", href: "/properties" },
                  { title: "Virtual Tours", href: "/tours" },
                  { title: "Book Apartments", href: "/booking" },
                  { title: "Payment Options", href: "/payments" },
                  { title: "Help Center", href: "/help" }
                ].map((item, index) => (
                  <motion.li 
                    key={index}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      href={item.href}
                      className="text-sm text-gray-300 hover:text-primary transition-colors duration-200"
                    >
                      {item.title}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* For Landlords Section */}
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold mb-4 text-primary font-montserrat">For Landlords</h3>
              <ul className="space-y-2">
                {[
                  { title: "List Property", href: "/list-property" },
                  { title: "Property Management", href: "/manage" },
                  { title: "Tenant Screening", href: "/screening" },
                  { title: "Analytics Dashboard", href: "/analytics" },
                  { title: "Support", href: "/landlord-support" }
                ].map((item, index) => (
                  <motion.li 
                    key={index}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      href={item.href}
                      className="text-sm text-gray-300 hover:text-primary transition-colors duration-200"
                    >
                      {item.title}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Company & Connect */}
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold mb-4 text-primary font-montserrat">Company</h3>
              <ul className="space-y-2 mb-6">
                {[
                  { title: "About Us", href: "/about" },
                  { title: "Careers", href: "/careers" },
                  { title: "Press Kit", href: "/press" },
                  { title: "Blog", href: "/blog" }
                ].map((item, index) => (
                  <motion.li 
                    key={index}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      href={item.href}
                      className="text-sm text-gray-300 hover:text-primary transition-colors duration-200"
                    >
                      {item.title}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <h4 className="text-md font-semibold mb-3 text-primary font-montserrat">Connect With Us</h4>
              <div className="flex space-x-3">
                {[
                  { icon: Facebook, href: "#", label: "Facebook" },
                  { icon: Twitter, href: "#", label: "Twitter" },
                  { icon: Instagram, href: "#", label: "Instagram" },
                  { icon: Linkedin, href: "#", label: "LinkedIn" },
                  { icon: Youtube, href: "#", label: "YouTube" }
                ].map((social, index) => (
                  <motion.div
                    key={social.label}
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors duration-200 block"
                    >
                      <social.icon className="w-5 h-5 text-primary" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Newsletter Section */}
        <motion.div 
          className="relative z-10 border-t border-border/20"
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h3 className="text-lg font-semibold mb-2 text-accent font-montserrat">Stay Updated</h3>
                <p className="text-sm text-gray-200 font-nunito">
                  Subscribe to our newsletter for the latest updates on new properties and platform features.
                </p>
              </div>
              <motion.div 
                className="flex w-full md:w-auto"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 md:w-64 px-4 py-2 rounded-l-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent font-nunito"
                />
                <motion.button 
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-r-lg hover:bg-primary/90 transition-colors duration-200 font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Subscribe
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar - Outside background area */}
      <motion.div 
        className="border-t border-border bg-muted/80 backdrop-blur-sm"
        variants={itemVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-sm text-muted-foreground mb-4 md:mb-0 font-nunito">
              © {new Date().getFullYear()} Tyrent. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                Terms of Service
              </Link>
              <Link href="/safety" className="text-accent dark:text-primary hover:text-primary/80 transition-colors duration-200 font-medium">
                Safety Guidelines
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </footer>
  )
}