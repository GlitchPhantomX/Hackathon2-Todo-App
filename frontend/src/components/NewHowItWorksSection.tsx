'use client'

import { motion } from 'framer-motion'
import { Calendar, CheckSquare, Flag, Target } from 'lucide-react'

const steps = [
  {
    icon: Target,
    title: 'Set Your Goals',
    description:
      'Define your objectives and priorities with our intuitive goal-setting interface.'
  },
  {
    icon: Calendar,
    title: 'Plan Your Tasks',
    description:
      'Break down your goals into actionable tasks with due dates and priorities.'
  },
  {
    icon: CheckSquare,
    title: 'Track Progress',
    description:
      'Monitor your progress with real-time updates and visual progress indicators.'
  },
  {
    icon: Flag,
    title: 'Achieve Success',
    description:
      'Celebrate your accomplishments and reflect on your productivity improvements.'
  }
]

export function NewHowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-h1 font-heading text-gray-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-body-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Getting started with TaskMaster is simple and intuitive
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Center Line */}
          <div className="hidden md:block absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-indigo-500 to-purple-500" />

          <div className="space-y-12">
            {steps.map((step, index) => {
              const isLeft = index % 2 === 0

              return (
                <motion.div
                  key={index}
                  className={`relative flex flex-col md:flex-row items-center ${
                    isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  {/* Content Card */}
                  <div className="md:w-5/12 w-full">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-sm hover:shadow-lg transition">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4">
                        <step.icon className="w-7 h-7 text-white" />
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {step.title}
                      </h3>

                      <p className="text-gray-600 dark:text-gray-400">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Step Indicator */}
                  <div className="relative z-10 my-6 md:my-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                  </div>

                  {/* Spacer */}
                  <div className="md:w-5/12 w-full" />
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
