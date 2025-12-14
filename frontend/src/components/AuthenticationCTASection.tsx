'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function AuthenticationCTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-900 dark:to-primary-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Headline */}
          <h2 className="font-heading text-h1 text-white mb-6">
            Ready to Get Organized?
          </h2>
          <p className="text-body-xl text-primary-100 max-w-2xl mx-auto mb-8">
            Join thousands of productive users who trust TaskFlow to manage their daily tasks
          </p>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {['No credit card required', 'Free forever plan', 'Setup in 2 minutes'].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-primary-100">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-body-md font-medium">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="gap-2 group">
                Create Free Account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Social Proof */}
          <p className="text-body-sm text-primary-200 mt-8">
            Trusted by 10,000+ users • 500K+ tasks completed
          </p>
        </div>
      </div>
    </section>
  )
}