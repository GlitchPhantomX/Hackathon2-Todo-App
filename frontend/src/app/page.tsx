import React from 'react'
import NewNavbar from '@/components/layout/NewNavbar'
import { NewHeroSection } from '@/components/NewHeroSection'
import NewFeaturesSection from '@/components/NewFeaturesSection'
import CTASection from '@/components/NewCTASection'
import { NewFooter } from '@/components/layout/NewFooter'
import TimeLineDemo from '@/components/TimelineDemo'
import TestimonialsSection from '@/components/NewTestimonialsSection'

const HomePage = () => {
  return (
    <main className="min-h-screen">
      <NewNavbar />
      <NewHeroSection />
      <NewFeaturesSection />
      {/* <NewHowItWorksSection /> */}
      <TimeLineDemo/>
      <TestimonialsSection/>
      <CTASection />
      <NewFooter />
    </main>
  )
}

export default HomePage