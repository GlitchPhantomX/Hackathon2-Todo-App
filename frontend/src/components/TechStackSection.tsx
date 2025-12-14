'use client'

import Image from 'next/image'

const technologies = {
  frontend: [
    { name: 'Next.js 16+', icon: '⚡', color: 'from-gray-900 to-gray-700' },
    { name: 'TypeScript', icon: '📘', color: 'from-blue-600 to-blue-700' },
    { name: 'Tailwind CSS', icon: '🎨', color: 'from-cyan-500 to-blue-500' },
    { name: 'Shadcn/UI', icon: '🎭', color: 'from-gray-800 to-gray-900' },
  ],
  backend: [
    { name: 'FastAPI', icon: '⚙️', color: 'from-teal-600 to-teal-700' },
    { name: 'SQLModel', icon: '🗄️', color: 'from-red-600 to-red-700' },
    { name: 'Neon DB', icon: '💾', color: 'from-green-500 to-green-600' },
    { name: 'Better Auth', icon: '🔐', color: 'from-purple-600 to-purple-700' },
  ],
  deployment: [
    { name: 'Docker', icon: '🐳', color: 'from-blue-500 to-blue-600' },
    { name: 'Vercel', icon: '▲', color: 'from-gray-900 to-black' },
    { name: 'GitHub', icon: '🐙', color: 'from-gray-700 to-gray-800' },
  ],
}

export function TechStackSection() {
  return (
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading text-h1 text-gray-900 dark:text-gray-50 mb-4">
            Built With Modern Technology
          </h2>
          <p className="text-body-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Powered by industry-leading frameworks and tools for maximum performance and reliability
          </p>
        </div>

        {/* Tech Categories */}
        <div className="space-y-12">
          {/* Frontend */}
          <div>
            <h3 className="font-heading text-h3 text-gray-900 dark:text-gray-50 mb-6 text-center">
              Frontend
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {technologies.frontend.map((tech, index) => (
                <div
                  key={tech.name}
                  className="group relative p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300 hover:scale-105 animate-slideUp"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3">{tech.icon}</div>
                    <div className="font-medium text-gray-900 dark:text-gray-50">
                      {tech.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Backend */}
          <div>
            <h3 className="font-heading text-h3 text-gray-900 dark:text-gray-50 mb-6 text-center">
              Backend
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {technologies.backend.map((tech, index) => (
                <div
                  key={tech.name}
                  className="group relative p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300 hover:scale-105 animate-slideUp"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3">{tech.icon}</div>
                    <div className="font-medium text-gray-900 dark:text-gray-50">
                      {tech.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deployment */}
          <div>
            <h3 className="font-heading text-h3 text-gray-900 dark:text-gray-50 mb-6 text-center">
              Deployment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {technologies.deployment.map((tech, index) => (
                <div
                  key={tech.name}
                  className="group relative p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300 hover:scale-105 animate-slideUp"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3">{tech.icon}</div>
                    <div className="font-medium text-gray-900 dark:text-gray-50">
                      {tech.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}