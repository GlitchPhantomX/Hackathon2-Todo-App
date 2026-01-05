'use client'
import { motion } from 'framer-motion'
import { Star, Quote, Award, TrendingUp, Users, CheckCircle } from 'lucide-react'
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
    <div className="relative bg-gray-900 backdrop-blur-sm p-6 rounded-2xl border border-white/10 h-full">
      {/* Quote Icon */}
      <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
        <Quote className="w-5 h-5 text-white" />
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1 mb-4 mt-2">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        ))}
      </div>

      {/* Quote Text */}
      <p className="text-gray-300 mb-6 leading-relaxed text-sm">
        &quot;{testimonial.quote}&quot;
      </p>

      {/* Metric Badge */}
      <div className="mb-6 px-3 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20 inline-flex">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold text-blue-300">
            {testimonial.metric}
          </span>
        </div>
      </div>

      {/* Author Info */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-md opacity-40" />
          <img
            src={testimonial.avatar}
            alt={testimonial.author}
            className="relative w-12 h-12 rounded-full border-2 border-white/20 object-cover"
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center border-2 border-black">
            <CheckCircle className="w-3 h-3 text-white" />
          </div>
        </div>
        <div>
          <div className="font-bold text-white text-sm">
            {testimonial.author}
          </div>
          <div className="text-xs text-gray-400">
            {testimonial.role}
          </div>
          <div className="text-xs text-blue-400 font-medium">
            {testimonial.company}
          </div>
        </div>
      </div>
    </div>
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

      <section id="testimonials" className="relative py-24 bg-black overflow-hidden">
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 via-transparent to-purple-600/5" />

        <div className="relative z-10">
          {/* Header */}
          <motion.div
            className="text-center mb-16 max-w-4xl mx-auto px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Award className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">
                Loved by Thousands
              </span>
            </motion.div>
            
            <h2 className="text-h1 font-heading text-gray-900 dark:text-white mb-4">
              What Our Users Say
            </h2>
<p className="text-body-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
  Join thousands of professionals who have transformed the way they plan, track,
  and accomplish their daily goals with TaskMaster.
</p>

          </motion.div>

          {/* Stats Bar */}
          <motion.div
            className="grid grid-cols-3 gap-4 md:gap-8 mb-20 max-w-4xl mx-auto px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center p-6 bg-gray-800 backdrop-blur-sm rounded-2xl border border-white/10"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 + 0.3 }}
              >
                <stat.icon className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  <AnimatedCounter value={stat.value} />
                </div>
                <div className="text-sm text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* First Row - Left to Right */}
          <div className="marquee-row relative mb-8">
            <div className="absolute left-0 top-0 h-full w-32 z-10 pointer-events-none bg-gradient-to-r from-bg-gray-800 via-black/80 to-transparent" />
            <div className="marquee-inner flex min-w-[200%]">
              {[...testimonials, ...testimonials].map((testimonial, index) => (
                <TestimonialCard key={`row1-${index}`} testimonial={testimonial} />
              ))}
            </div>
            <div className="absolute right-0 top-0 h-full w-32 z-10 pointer-events-none bg-gradient-to-l from-black via-black/80 to-transparent" />
          </div>

          {/* Second Row - Right to Left */}
          <div className="marquee-row relative">
            <div className="absolute left-0 top-0 h-full w-32 z-10 pointer-events-none bg-gradient-to-r from-black via-black/80 to-transparent" />
            <div className="marquee-inner marquee-reverse flex min-w-[200%]">
              {[...testimonials, ...testimonials].map((testimonial, index) => (
                <TestimonialCard key={`row2-${index}`} testimonial={testimonial} />
              ))}
            </div>
            <div className="absolute right-0 top-0 h-full w-32 z-10 pointer-events-none bg-gradient-to-l from-black via-black/80 to-transparent" />
          </div>

          {/* Bottom CTA */}
     
        </div>
      </section>
    </>
  )
}