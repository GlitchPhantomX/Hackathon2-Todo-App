'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'


export function DemoPreviewSection() {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <section id="demo" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-heading text-h1 text-gray-900 dark:text-gray-50 mb-4">
            See It In Action
          </h2>
          <p className="text-body-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Watch how TaskFlow helps you organize tasks, track progress, and boost productivity
          </p>
        </div>

        {/* Video Preview */}
        <div className="relative max-w-5xl mx-auto">
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800">
            {/* Placeholder - Replace with actual demo video */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-success-600/20 flex items-center justify-center">
              {/* Play Button */}
              <Button
                size="lg"
                className="w-20 h-20 rounded-full p-0 group hover:scale-110 transition-transform duration-300"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8 ml-1" />
                )}
              </Button>
            </div>

            {/* Demo Screenshot Overlay */}
            <div className="absolute inset-0 opacity-30">
              {/* Add your app screenshot here */}
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <span className="text-white text-lg font-medium">App Dashboard Preview</span>
              </div>
            </div>
          </div>

          {/* Features Below Video */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              { label: 'Drag & Drop Tasks', time: '0:15' },
              { label: 'Smart Filters', time: '0:45' },
              { label: 'Team Collaboration', time: '1:20' },
            ].map((feature) => (
              <div
                key={feature.label}
                className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors cursor-pointer"
              >
                <span className="text-body-md font-medium text-gray-900 dark:text-gray-50">
                  {feature.label}
                </span>
                <span className="text-body-sm text-gray-500 dark:text-gray-500 font-mono">
                  {feature.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}