'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Search, 
  SlidersHorizontal, 
  MapPin, 
  Home, 
  DollarSign,
  X,
  Calendar,
  Users,
  Wifi,
  Car,
  Dumbbell,
  Shield
} from 'lucide-react'

export default function SearchFilters() {
  const [showFilters, setShowFilters] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [selectedBedrooms, setSelectedBedrooms] = useState('Any')
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [selectedDistance, setSelectedDistance] = useState('')
  const [priceRange, setPriceRange] = useState(100000)

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    )
  }

  return (
    <section className="bg-gray-50 dark:bg-gray-900 -mt-6 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Modern Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="shadow-2xl border-0 bg-white dark:bg-gray-800 backdrop-blur-lg">
            <CardContent className="p-2">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center rounded-2xl lg:rounded-full bg-gray-100 dark:bg-gray-900">
                {/* Location */}
                <motion.div 
                  className="flex-1 px-6 py-4 cursor-pointer rounded-t-2xl lg:rounded-l-full lg:rounded-tr-none hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors relative"
                  whileHover={{ scale: 1.02 }}
                  onFocus={() => setFocusedField('location')}
                  onBlur={() => setFocusedField(null)}
                >
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 font-montserrat">
                    Where
                  </label>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                    <input 
                      type="text"
                      placeholder="Search locations"
                      className="w-full bg-transparent border-none outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 font-nunito"
                    />
                  </div>
                  {focusedField === 'location' && (
                    <motion.div 
                      className="absolute inset-0 border-2 border-blue-500 rounded-2xl lg:rounded-l-full lg:rounded-r-none pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </motion.div>

                <div className="hidden lg:block w-px h-12 bg-gray-300 dark:bg-gray-700 self-center" />

                {/* Property Type */}
                <motion.div 
                  className="flex-1 px-6 py-4 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors relative"
                  whileHover={{ scale: 1.02 }}
                  onFocus={() => setFocusedField('type')}
                  onBlur={() => setFocusedField(null)}
                >
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 font-montserrat">
                    Property Type
                  </label>
                  <div className="flex items-center">
                    <Home className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                    <select className="w-full bg-transparent border-none outline-none text-sm text-gray-900 dark:text-gray-100 font-nunito cursor-pointer">
                      <option value="">Any type</option>
                      <option value="bedsitter">Bedsitter</option>
                      <option value="1bed">1 Bedroom</option>
                      <option value="2bed">2 Bedrooms</option>
                      <option value="3bed">3+ Bedrooms</option>
                    </select>
                  </div>
                  {focusedField === 'type' && (
                    <motion.div 
                      className="absolute inset-0 border-2 border-blue-500 rounded-2xl pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </motion.div>

                <div className="hidden lg:block w-px h-12 bg-gray-300 dark:bg-gray-700 self-center" />

                {/* Price Range */}
                <motion.div 
                  className="flex-1 px-6 py-4 cursor-pointer rounded-b-2xl lg:rounded-r-full lg:rounded-bl-none hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors relative"
                  whileHover={{ scale: 1.02 }}
                  onFocus={() => setFocusedField('price')}
                  onBlur={() => setFocusedField(null)}
                >
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 font-montserrat">
                    Budget
                  </label>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                    <select className="w-full bg-transparent border-none outline-none text-sm text-gray-900 dark:text-gray-100 font-nunito cursor-pointer">
                      <option value="">Any price</option>
                      <option value="20">Under KES 20K</option>
                      <option value="50">KES 20K - 50K</option>
                      <option value="100">KES 50K - 100K</option>
                      <option value="100+">KES 100K+</option>
                    </select>
                  </div>
                  {focusedField === 'price' && (
                    <motion.div 
                      className="absolute inset-0 border-2 border-blue-500 rounded-2xl lg:rounded-r-full lg:rounded-l-none pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </motion.div>

                {/* Search Button */}
                <div className="lg:pr-2 p-2 lg:p-0">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      size="lg" 
                      className="w-full lg:w-auto bg-primary hover:tyrent-gradient-dark text-white rounded-full px-8 py-6 shadow-lg font-montserrat transition-all duration-300"
                    >
                      <Search className="h-5 w-5 lg:mr-2" />
                      <span className="hidden lg:inline">Search</span>
                    </Button>
                  </motion.div>
                </div>
              </div>

              {/* Filters Toggle */}
              <div className="flex items-center justify-between mt-4 px-4">
                <motion.button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors font-nunito"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>{showFilters ? 'Hide' : 'Show'} filters</span>
                </motion.button>

                <div className="flex gap-2">
                  {['Near CBD', 'Parking', 'New'].map((tag) => (
                    <motion.button
                      key={tag}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors font-nunito"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {tag}
                    </motion.button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="mt-4 shadow-xl border-0 bg-white dark:bg-gray-800 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 font-montserrat">Filters</h3>
                    <motion.button
                      onClick={() => setShowFilters(false)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </motion.button>
                  </div>

                  <div className="space-y-8">
                    {/* Bedrooms */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 font-montserrat">
                        Bedrooms
                      </label>
                      <div className="grid grid-cols-5 gap-3">
                        {['Any', '1', '2', '3', '4+'].map((bed) => (
                          <motion.button
                            key={bed}
                            onClick={() => setSelectedBedrooms(bed)}
                            className={`px-4 py-3 rounded-xl border-2 transition-all text-center font-medium font-nunito ${
                              selectedBedrooms === bed 
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {bed}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Amenities */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 font-montserrat">
                        Amenities
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {[
                          { icon: Wifi, label: 'WiFi' },
                          { icon: Car, label: 'Parking' },
                          { icon: Dumbbell, label: 'Gym' },
                          { icon: Shield, label: 'Security' },
                          { icon: Home, label: 'Furnished' }
                        ].map((amenity) => (
                          <motion.button
                            key={amenity.label}
                            onClick={() => toggleAmenity(amenity.label)}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all space-y-2 ${
                              selectedAmenities.includes(amenity.label)
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <amenity.icon className={`h-6 w-6 ${
                              selectedAmenities.includes(amenity.label)
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-500 dark:text-gray-400'
                            }`} />
                            <span className={`text-xs font-medium font-nunito ${
                              selectedAmenities.includes(amenity.label)
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-700 dark:text-gray-300'
                            }`}>{amenity.label}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Price Range Slider */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 font-montserrat">
                        Price Range
                      </label>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm font-nunito">
                          <span className="text-gray-600 dark:text-gray-400">KES 10,000</span>
                          <span className="text-gray-900 dark:text-gray-100 font-semibold text-lg">KES {priceRange.toLocaleString()}</span>
                          <span className="text-gray-600 dark:text-gray-400">KES 200,000</span>
                        </div>
                        <input 
                          type="range" 
                          min="10000" 
                          max="200000"
                          value={priceRange}
                          onChange={(e) => setPriceRange(Number(e.target.value))}
                          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                      </div>
                    </div>

                    {/* Distance */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 font-montserrat">
                        Distance from CBD
                      </label>
                      <div className="grid grid-cols-4 gap-3">
                        {['1km', '2km', '5km', '10km+'].map((distance) => (
                          <motion.button
                            key={distance}
                            onClick={() => setSelectedDistance(distance)}
                            className={`px-4 py-3 rounded-xl border-2 transition-all text-center font-medium font-nunito ${
                              selectedDistance === distance
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {distance}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <motion.button
                      className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 underline font-nunito"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedBedrooms('Any')
                        setSelectedAmenities([])
                        setSelectedDistance('')
                        setPriceRange(100000)
                      }}
                    >
                      Clear all
                    </motion.button>
                    <div className="flex gap-3">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-montserrat">
                          Save Search
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 font-montserrat">
                          Show 245 properties
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}