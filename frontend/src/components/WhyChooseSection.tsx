'use client'

import { Brain, Zap, Shield, Users, Smartphone, TrendingUp } from 'lucide-react'
import { Card } from './ui/card'
type ColorVariant = 'primary' | 'success' | 'warning' | 'error';

const colorVariants: Record<ColorVariant, string> = {
  primary: 'from-primary-500 to-primary-600',
  success: 'from-success-500 to-success-600',
  warning: 'from-warning-500 to-warning-600',
  error: 'from-error-500 to-error-600',
}

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  color: ColorVariant;
}

const features: Feature[] = [
  {
    icon: Brain,
    title: 'AI-Powered Intelligence',
    description: 'Smart task suggestions, automatic prioritization, and intelligent scheduling based on your habits.',
    color: 'primary',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Built with Next.js 16+ and optimized for speed. Experience instant task updates and seamless navigation.',
    color: 'warning',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Enterprise-grade security with Better Auth. Your data is encrypted and protected at all times.',
    color: 'error',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Share tasks, assign responsibilities, and track team progress in real-time.',
    color: 'success',
  },
  {
    icon: Smartphone,
    title: 'Works Everywhere',
    description: 'Fully responsive design works perfectly on desktop, tablet, and mobile devices.',
    color: 'primary',
  },
  {
    icon: TrendingUp,
    title: 'Productivity Insights',
    description: 'Beautiful charts and analytics help you understand your productivity patterns.',
    color: 'success',
  },
]

export function WhyChooseSection() {
  return (
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading text-h1 text-gray-900 dark:text-gray-50 mb-4">
            Why Choose{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-success-600 dark:from-primary-400 dark:to-success-400">
              TaskFlow
            </span>
            ?
          </h2>
          <p className="text-body-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover the features that make TaskFlow the #1 choice for productive teams and individuals
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="animate-slideUp"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Card
                className="group relative overflow-hidden p-8 hover:shadow-xl transition-all duration-300"
              >
                {/* Background Gradient */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorVariants[feature.color]} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />

                {/* Icon */}
                <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${colorVariants[feature.color]} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="font-heading text-h4 text-gray-900 dark:text-gray-50 mb-3">
                  {feature.title}
                </h3>
                <p className="text-body-md text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}