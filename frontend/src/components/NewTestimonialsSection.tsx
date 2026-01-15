'use client'
import { motion } from 'framer-motion'
import { Star, Quote, Award, TrendingUp, Users, CheckCircle, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

const testimonials = [
  {
    quote: "TaskMaster revolutionized our workflow. Our team's productivity jumped 40% in just two months. The AI suggestions are eerily accurate—it's like the app reads our minds.",
    author: "Sarah Johnson",
    role: "Product Manager",
    company: "TechCorp",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    metric: "40% productivity increase"
  },
  {
    quote: "I've tested over 20 task managers. TaskMaster is the only one that actually understands how developers work. The integrations are seamless, and the UI is chef's kiss.",
    author: "Michael Chen",
    role: "Senior Software Engineer",
    company: "Innovate Inc",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    metric: "20+ tools replaced"
  },
  {
    quote: "Game changer for our marketing team. We went from chaotic spreadsheets to smooth campaign execution. The visual boards make collaboration effortless.",
    author: "Emily Rodriguez",
    role: "Marketing Director",
    company: "Growth Labs",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    metric: "5x faster execution"
  },
  {
    quote: "The best investment we made this year. TaskMaster pays for itself in saved time and improved team coordination. Absolutely game-changing.",
    author: "David Kim",
    role: "CEO",
    company: "StartupXYZ",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    metric: "10hrs saved per week"
  }
]

const stats = [
  { icon: Users, value: "10K+", label: "Active Users" },
  { icon: Star, value: "4.9/5", label: "Average Rating" },
  { icon: TrendingUp, value: "98%", label: "Satisfaction Rate" }
]

function AnimatedCounter({ value }: { value: string }) {
  const [displayValue, setDisplayValue] = useState("0")
  
  useEffect(() => {
    const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''))
    const suffix = value.replace(/[0-9.]/g, '')

    if (isNaN(numericValue)) {
      const timeout = setTimeout(() => {
        setDisplayValue(value)
      }, 0)
      return () => clearTimeout(timeout)
    }

    let current = 0
    const increment = numericValue / 50
    const interval = setInterval(() => {
      current += increment
      if (current >= numericValue) {
        setDisplayValue(value)
        clearInterval(interval)
      } else {
        setDisplayValue(Math.floor(current) + suffix)
      }
    }, 30)

    return () => clearInterval(interval)
  }, [value])
  
  return <span>{displayValue}</span>
}

const TestimonialCard = ({ testimonial }: { testimonial: typeof testimonials[0] }) => (
  <div className="flex-shrink-0 w-[450px] mx-4">
    <motion.div 
      className="relative backdrop-blur-sm p-6 rounded-2xl border h-full group overflow-hidden"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)'
      }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      {/* Gradient glow on hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
        style={{
          background: 'linear-gradient(135deg, var(--purple-500), var(--violet-500))',
          filter: 'blur(30px)',
          zIndex: -1,
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        whileHover={{ opacity: 0.15, scale: 1 }}
      />

      {/* Quote Icon */}
      <motion.div 
        className="absolute -top-3 -left-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
        style={{
          background: 'linear-gradient(135deg, var(--purple-600), var(--violet-600))'
        }}
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.6 }}
      >
        <Quote className="w-5 h-5 text-white" />
      </motion.div>

      {/* Rating */}
      <div className="flex items-center gap-1 mb-4 mt-2">
        {[...Array(testimonial.rating)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
          >
            <Star 
              className="w-4 h-4 fill-current" 
              style={{ color: 'var(--primary)' }}
            />
          </motion.div>
        ))}
      </div>

      {/* Quote Text */}
      <p 
        className="mb-6 leading-relaxed text-sm"
        style={{ color: 'var(--muted-foreground)' }}
      >
        &quot;{testimonial.quote}&quot;
      </p>

      {/* Metric Badge */}
      <div 
        className="mb-6 px-3 py-2 rounded-lg border inline-flex"
        style={{
          backgroundColor: 'var(--secondary)',
          borderColor: 'var(--border)'
        }}
      >
        <div className="flex items-center gap-2">
          <TrendingUp 
            className="w-4 h-4" 
            style={{ color: 'var(--primary)' }}
          />
          <span 
            className="text-xs font-semibold"
            style={{ color: 'var(--primary)' }}
          >
            {testimonial.metric}
          </span>
        </div>
      </div>

      {/* Author Info */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <motion.div 
            className="absolute inset-0 rounded-full blur-md opacity-40"
            style={{
              background: 'linear-gradient(135deg, var(--purple-600), var(--violet-600))'
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.4, 0.6, 0.4]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <img
            src={testimonial.avatar}
            alt={testimonial.author}
            className="relative w-12 h-12 rounded-full border-2 object-cover"
            style={{ borderColor: 'var(--border)' }}
          />
          <div 
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2"
            style={{
              backgroundColor: 'var(--primary)',
              borderColor: 'var(--background)'
            }}
          >
            <CheckCircle className="w-3 h-3 text-white" />
          </div>
        </div>
        <div>
          <div 
            className="font-bold text-sm"
            style={{ color: 'var(--foreground)' }}
          >
            {testimonial.author}
          </div>
          <div 
            className="text-xs"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {testimonial.role}
          </div>
          <div 
            className="text-xs font-medium"
            style={{ color: 'var(--primary)' }}
          >
            {testimonial.company}
          </div>
        </div>
      </div>
    </motion.div>
  </div>
)

export default function TestimonialsSection() {
  return (
    <>
      <style>{`
        @keyframes marqueeScroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }

        .marquee-inner {
          animation: marqueeScroll 40s linear infinite;
        }

        .marquee-reverse {
          animation-direction: reverse;
        }

        .marquee-inner:hover {
          animation-play-state: paused;
        }
      `}</style>

      <section 
        id="testimonials" 
        className="relative py-16 overflow-hidden"
        style={{ backgroundColor: 'var(--background)' }}
      >
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Subtle dot pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03]" 
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, var(--primary) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}
          />
          
          {/* Floating gradient blobs */}
          <motion.div
            className="absolute top-20 right-20 w-72 h-72 rounded-full blur-3xl opacity-10"
            style={{ backgroundColor: 'var(--purple-300)' }}
            animate={{
              y: [0, -40, 0],
              x: [0, 30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-20 left-20 w-72 h-72 rounded-full blur-3xl opacity-10"
            style={{ backgroundColor: 'var(--violet-300)' }}
            animate={{
              y: [0, 40, 0],
              x: [0, -30, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <motion.div
            className="text-center mb-12 max-w-4xl mx-auto px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full border backdrop-blur-sm relative overflow-hidden group mb-6"
              style={{ 
                backgroundColor: 'var(--secondary)',
                borderColor: 'var(--border)'
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                style={{ 
                  background: 'linear-gradient(to right, var(--purple-400), var(--violet-400))'
                }}
              />
              <Award 
                className="w-4 h-4 relative z-10" 
                style={{ color: 'var(--primary)' }}
              />
              <span 
                className="text-sm font-semibold relative z-10"
                style={{ color: 'var(--primary)' }}
              >
                Loved by Thousands
              </span>
              <Sparkles 
                className="w-4 h-4 relative z-10" 
                style={{ color: 'var(--primary)' }}
              />
            </motion.div>
            
            {/* Heading */}
            <motion.h2 
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 tracking-tight"
              style={{ 
                color: 'var(--foreground)',
                fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                fontWeight: 800,
                letterSpacing: '-0.02em'
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              What Our Users Say
            </motion.h2>

            {/* Animated underline */}
            <motion.div
              className="h-1 rounded-full mx-auto mb-4"
              style={{ 
                background: 'linear-gradient(90deg, var(--purple-600), var(--violet-600))',
                width: '80px'
              }}
              initial={{ width: 0 }}
              whileInView={{ width: '80px' }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />

            {/* Description */}
            <motion.p 
              className="text-base md:text-lg max-w-2xl mx-auto"
              style={{ color: 'var(--muted-foreground)' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Join thousands of professionals who have transformed the way they plan, track,
              and accomplish their daily goals with TaskMaster.
            </motion.p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            className="grid grid-cols-3 gap-4 md:gap-8 mb-12 max-w-4xl mx-auto px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center p-6 backdrop-blur-sm rounded-2xl border"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)'
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 + 0.3 }}
                whileHover={{ scale: 1.05, y: -4 }}
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <stat.icon 
                    className="w-8 h-8 mx-auto mb-3" 
                    style={{ color: 'var(--primary)' }}
                  />
                </motion.div>
                <div 
                  className="text-3xl md:text-4xl font-bold mb-2"
                  style={{ color: 'var(--foreground)' }}
                >
                  <AnimatedCounter value={stat.value} />
                </div>
                <div 
                  className="text-sm"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* First Row - Left to Right */}
          <div className="marquee-row relative mb-8">
            <div 
              className="absolute left-0 top-0 h-full w-32 z-10 pointer-events-none"
              style={{
                background: `linear-gradient(to right, var(--background), transparent)`
              }}
            />
            <div className="marquee-inner flex min-w-[200%]">
              {[...testimonials, ...testimonials].map((testimonial, index) => (
                <TestimonialCard key={`row1-${index}`} testimonial={testimonial} />
              ))}
            </div>
            <div 
              className="absolute right-0 top-0 h-full w-32 z-10 pointer-events-none"
              style={{
                background: `linear-gradient(to left, var(--background), transparent)`
              }}
            />
          </div>

          {/* Second Row - Right to Left */}
          <div className="marquee-row relative">
            <div 
              className="absolute left-0 top-0 h-full w-32 z-10 pointer-events-none"
              style={{
                background: `linear-gradient(to right, var(--background), transparent)`
              }}
            />
            <div className="marquee-inner marquee-reverse flex min-w-[200%]">
              {[...testimonials, ...testimonials].map((testimonial, index) => (
                <TestimonialCard key={`row2-${index}`} testimonial={testimonial} />
              ))}
            </div>
            <div 
              className="absolute right-0 top-0 h-full w-32 z-10 pointer-events-none"
              style={{
                background: `linear-gradient(to left, var(--background), transparent)`
              }}
            />
          </div>
        </div>
      </section>
    </>
  )
}