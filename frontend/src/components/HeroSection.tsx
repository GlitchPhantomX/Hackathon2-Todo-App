'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-200 dark:bg-primary-900 rounded-full blur-3xl opacity-20 animate-pulse-subtle" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-success-200 dark:bg-success-900 rounded-full blur-3xl opacity-20 animate-pulse-subtle animation-delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-warning-200 dark:bg-warning-900 rounded-full blur-3xl opacity-20 animate-pulse-subtle animation-delay-2000" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Badge */}
        {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-950 border border-primary-200 dark:border-primary-800 mb-8 animate-slideDown mt-4">
          <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
            Powered by AI • Built for Productivity
          </span>
        </div> */}

        {/* Headline */}
        <h1 className="font-heading text-display-lg md:text-display-xl mb-6 animate-slideUp">
          <span className="text-gray-900 dark:text-gray-50">
            Organize Your Life,
          </span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-success-600 to-primary-600 dark:from-primary-400 dark:via-success-400 dark:to-primary-400">
            Achieve Your Goals
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-body-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8 animate-slideUp animation-delay-200">
          The most intuitive task management app powered by AI.
          Stay organized, boost productivity, and never miss a deadline.
        </p>

        {/* Features List */}
        <div className="flex flex-wrap justify-center gap-4 mb-12 animate-slideUp animation-delay-400">
          {['Smart Priorities', 'AI Suggestions', 'Team Collaboration', 'Real-time Sync'].map((feature) => (
            <div key={feature} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <CheckCircle2 className="w-4 h-4 text-success-600 dark:text-success-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {feature}
              </span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slideUp animation-delay-600">
          <Link href="/signup">
            <Button size="lg" className="gap-2 group">
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="#demo">
            <Button size="lg" variant="outline">
              Watch Demo
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 animate-fadeIn animation-delay-800">
          {[
            { value: '10K+', label: 'Active Users' },
            { value: '500K+', label: 'Tasks Completed' },
            { value: '99.9%', label: 'Uptime' },
            { value: '4.9/5', label: 'User Rating' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-heading text-h1 text-primary-600 dark:text-primary-400 mb-2">
                {stat.value}
              </div>
              <div className="text-body-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-gray-300 dark:border-gray-700 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 rounded-full bg-gray-400 dark:bg-gray-600" />
        </div>
      </div>
    </section>
  )
}
