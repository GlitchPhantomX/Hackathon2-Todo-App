'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle, Star, Users, Zap, Sparkles, TrendingUp } from 'lucide-react'

export function NewHeroSection() {
  const features = [
    { icon: Zap, text: 'Lightning Fast' },
    { icon: CheckCircle, text: 'Easy to Use' },
    { icon: Users, text: 'Team Collaboration' },
    { icon: Star, text: 'Top Rated' },
  ]

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'var(--background)' }}
    >
      {/* Animated Background Elements with CSS Variables */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ 
            backgroundColor: 'var(--purple-200)',
            opacity: 0.2
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ 
            backgroundColor: 'var(--violet-300)',
            opacity: 0.2
          }}
          animate={{
            y: [20, -20, 20],
            x: [10, -10, 10],
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-3xl"
          style={{ 
            backgroundColor: 'var(--purple-300)',
            opacity: 0.15
          }}
          animate={{
            y: [-10, 10, -10],
            x: [20, -20, 20],
            scale: [1, 1.15, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        
        {/* Extra floating particles for more aesthetic look */}
        <motion.div
          className="absolute top-20 right-20 w-32 h-32 rounded-full blur-2xl"
          style={{ 
            backgroundColor: 'var(--violet-400)',
            opacity: 0.15
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-40 h-40 rounded-full blur-2xl"
          style={{ 
            backgroundColor: 'var(--purple-400)',
            opacity: 0.15
          }}
          animate={{
            y: [0, 30, 0],
            x: [0, -20, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 text-center">
        {/* Enhanced Badge with gradient border */}
        <motion.div
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full border backdrop-blur-sm relative overflow-hidden group"
          style={{ 
            backgroundColor: 'var(--secondary)',
            borderColor: 'var(--border)'
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Gradient overlay on hover */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
            style={{ 
              background: 'linear-gradient(to right, var(--purple-400), var(--violet-400))'
            }}
          />
          <Sparkles className="w-4 h-4 relative z-10" style={{ color: 'var(--primary)' }} />
          <span className="text-sm font-semibold relative z-10" style={{ color: 'var(--primary)' }}>
            Powered by AI • Built for Productivity
          </span>
          <TrendingUp className="w-4 h-4 relative z-10" style={{ color: 'var(--primary)' }} />
        </motion.div>

        {/* Enhanced Headline with better gradient and aesthetic font */}
        <motion.h1
          className="text-4xl sm:text-5xl md:text-5xl mb-2 lg:text-7xl leading-tight tracking-tight"
          style={{ 
            fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
            fontWeight: 800,
            letterSpacing: '-0.02em'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span style={{ color: 'var(--foreground)' }}>
            Organize Your Life,
          </span>
          <br />
          <span 
            className="bg-clip-text text-transparent inline-block"
            style={{ 
              backgroundImage: 'linear-gradient(135deg, var(--purple-600), var(--violet-600), var(--purple-500))',
              backgroundSize: '200% 200%',
              animation: 'gradient-shift 3s ease infinite'
            }}
          >
            Achieve Your Goals
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed"
          style={{ color: 'var(--muted-foreground)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          The most intuitive task management app powered by AI.
          Stay organized, boost productivity, and never miss a deadline.
        </motion.p>

        {/* Enhanced Features List with glass effect */}
        <motion.div
          className="flex flex-wrap justify-center gap-2.5 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.text}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 cursor-default group"
              style={{ 
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)'
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <feature.icon 
                className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" 
                style={{ color: 'var(--primary)' }}
              />
              <span 
                className="text-sm font-medium"
                style={{ color: 'var(--foreground)' }}
              >
                {feature.text}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced CTAs with better styling */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <Link href="/register">
            <motion.button
              className="group relative px-7 py-3.5 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg overflow-hidden"
              style={{ 
                background: 'linear-gradient(135deg, var(--purple-600), var(--violet-600))',
                boxShadow: '0 10px 30px -5px rgba(139, 92, 246, 0.3)'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Animated gradient overlay */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ 
                  background: 'linear-gradient(135deg, var(--violet-600), var(--purple-600))'
                }}
              />
              <span className="relative z-10 flex items-center gap-2">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              
              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 w-full h-full"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                }}
                animate={{
                  x: [-200, 200],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              />
            </motion.button>
          </Link>
          
          <Link href="/demo">
            <motion.button
              className="px-7 py-3.5 rounded-xl font-semibold transition-all duration-300 border-2 backdrop-blur-sm hover:shadow-lg"
              style={{ 
                backgroundColor: 'var(--card)',
                color: 'var(--foreground)',
                borderColor: 'var(--border)'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
            >
              Watch Demo
            </motion.button>
          </Link>
        </motion.div>

        {/* Mouse Scroll Indicator */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <div className="relative w-7 h-11 rounded-full border-2 flex items-start justify-center p-2"
            style={{ borderColor: 'var(--border)' }}
          >
            <motion.div
              className="w-1.5 h-2.5 rounded-full"
              style={{ backgroundColor: 'var(--primary)' }}
              animate={{
                y: [0, 12, 0],
                opacity: [1, 0.5, 1]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}