'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Play,
  CheckCircle,
  Zap,
  Users,
  Calendar,
  Tag,
  Bell,
  TrendingUp,
  BarChart,
  ArrowRight,
  Star,
  MessageSquare,
  Settings,
  Shield,
  Sparkles,
  ChevronRight,
  Clock,
  ListChecks
} from 'lucide-react';
import NewNavbar from '@/components/layout/NewNavbar';

const DemoPage = () => {
  const [activeVideo, setActiveVideo] = useState(0);

  const demoVideos = [
    {
      id: 1,
      title: 'Quick Start Guide',
      description: 'Get started with AITodoMaster in just 2 minutes',
      duration: '2:30',
      thumbnail: '🚀',
      category: 'Getting Started'
    },
    {
      id: 2,
      title: 'AI-Powered Task Management',
      description: 'See how AI helps you organize tasks intelligently',
      duration: '3:45',
      thumbnail: '🤖',
      category: 'AI Features'
    },
    {
      id: 3,
      title: 'Team Collaboration',
      description: 'Work together seamlessly with your team',
      duration: '4:20',
      thumbnail: '👥',
      category: 'Collaboration'
    },
    {
      id: 4,
      title: 'Advanced Analytics',
      description: 'Track your productivity with powerful insights',
      duration: '3:15',
      thumbnail: '📊',
      category: 'Analytics'
    }
  ];

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Instant sync across all your devices with real-time updates',
      color: '#f59e0b'
    },
    {
      icon: CheckCircle,
      title: 'Smart Task Creation',
      description: 'AI automatically categorizes and prioritizes your tasks',
      color: '#10b981'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Share tasks, assign responsibilities, and track progress together',
      color: '#3b82f6'
    },
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'Intelligent calendar integration with conflict detection',
      color: '#8b5cf6'
    },
    {
      icon: Tag,
      title: 'Custom Tags & Labels',
      description: 'Organize your way with unlimited custom tags and labels',
      color: '#ec4899'
    },
    {
      icon: Bell,
      title: 'Smart Reminders',
      description: 'Never miss a deadline with intelligent reminder system',
      color: '#ef4444'
    }
  ];

  const stats = [
    { label: 'Active Users', value: '50K+', icon: Users },
    { label: 'Tasks Completed', value: '2M+', icon: CheckCircle },
    { label: 'Teams', value: '5K+', icon: Users },
    { label: 'Satisfaction', value: '98%', icon: Star }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Product Manager',
      avatar: '👩‍💼',
      text: 'AITodoMaster transformed how our team manages projects. The AI features are game-changing!',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Entrepreneur',
      avatar: '👨‍💻',
      text: 'Best task management app I\'ve used. The interface is beautiful and super intuitive.',
      rating: 5
    },
    {
      name: 'Emily Davis',
      role: 'Designer',
      avatar: '👩‍🎨',
      text: 'Love the clean design and powerful features. It helps me stay organized effortlessly.',
      rating: 5
    }
  ];

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: 'var(--background)' }}
    >
        <NewNavbar/>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
            style={{ 
              backgroundColor: 'var(--purple-200)',
              opacity: 0.15
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
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
              opacity: 0.15
            }}
            animate={{
              y: [20, -20, 20],
              x: [10, -10, 10],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
              style={{
                backgroundColor: 'var(--muted)',
                borderColor: 'var(--border)'
              }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Sparkles className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>
                Product Demo & Features
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-6"
              style={{ color: 'var(--foreground)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              See{' '}
              <span 
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, var(--purple-600), var(--violet-600))'
                }}
              >
                AITodoMaster
              </span>
              {' '}in Action
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl max-w-3xl mx-auto"
              style={{ color: 'var(--muted-foreground)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Watch how AITodoMaster helps thousands of teams and individuals
              stay organized and achieve their goals.
            </motion.p>
          </div>

          {/* Main Demo Video */}
          <motion.div
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div 
              className="relative rounded-2xl overflow-hidden border-2 shadow-2xl"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--card)'
              }}
            >
              <div className="aspect-video flex items-center justify-center relative"
                style={{
                  background: 'linear-gradient(135deg, var(--purple-600), var(--violet-600))'
                }}
              >
                <span className="text-9xl">🎬</span>
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <motion.button
                    className="w-24 h-24 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-2xl"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className="w-10 h-10 ml-2" style={{ color: 'var(--primary)' }} />
                  </motion.button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 
                      className="text-xl font-bold mb-2"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {demoVideos[activeVideo].title}
                    </h3>
                    <p style={{ color: 'var(--muted-foreground)' }}>
                      {demoVideos[activeVideo].description}
                    </p>
                  </div>
                  <div 
                    className="px-4 py-2 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--muted)',
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)'
                    }}
                  >
                    <Clock className="w-4 h-4 inline mr-2" />
                    {demoVideos[activeVideo].duration}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Video Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {demoVideos.map((video, index) => (
              <motion.div
                key={video.id}
                className="cursor-pointer rounded-xl border overflow-hidden transition-all"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: activeVideo === index ? 'var(--primary)' : 'var(--border)'
                }}
                onClick={() => setActiveVideo(index)}
                whileHover={{ scale: 1.05 }}
              >
                <div 
                  className="aspect-video flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, var(--purple-500), var(--violet-500))'
                  }}
                >
                  <span className="text-5xl">{video.thumbnail}</span>
                </div>
                <div className="p-4">
                  <div 
                    className="text-xs font-semibold mb-2"
                    style={{ color: 'var(--primary)' }}
                  >
                    {video.category}
                  </div>
                  <h4 
                    className="font-semibold mb-1"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {video.title}
                  </h4>
                  <div 
                    className="text-sm flex items-center gap-2"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    <Clock className="w-3 h-3" />
                    {video.duration}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center p-6 rounded-xl border"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)'
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div 
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
                  style={{
                    background: 'linear-gradient(135deg, var(--purple-600), var(--violet-600))'
                  }}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div 
                  className="text-3xl font-bold mb-2"
                  style={{ color: 'var(--foreground)' }}
                >
                  {stat.value}
                </div>
                <div style={{ color: 'var(--muted-foreground)' }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: 'var(--foreground)' }}
            >
              Powerful Features
            </h2>
            <p 
              className="text-lg max-w-2xl mx-auto"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Everything you need to manage tasks, projects, and teams efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="p-6 rounded-2xl border hover:shadow-xl transition-all"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)'
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${feature.color}20` }}
                >
                  <feature.icon 
                    className="w-6 h-6"
                    style={{ color: feature.color }}
                  />
                </div>
                <h3 
                  className="text-xl font-bold mb-2"
                  style={{ color: 'var(--foreground)' }}
                >
                  {feature.title}
                </h3>
                <p style={{ color: 'var(--muted-foreground)' }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: 'var(--foreground)' }}
            >
              Loved by Thousands
            </h2>
            <p 
              className="text-lg max-w-2xl mx-auto"
              style={{ color: 'var(--muted-foreground)' }}
            >
              See what our users have to say about AITodoMaster
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="p-6 rounded-2xl border"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)'
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="w-5 h-5 fill-current"
                      style={{ color: '#f59e0b' }}
                    />
                  ))}
                </div>
                <p 
                  className="mb-6 leading-relaxed"
                  style={{ color: 'var(--foreground)' }}
                >
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{
                      background: 'linear-gradient(135deg, var(--purple-600), var(--violet-600))'
                    }}
                  >
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div 
                      className="font-semibold"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {testimonial.name}
                    </div>
                    <div 
                      className="text-sm"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="rounded-3xl p-12 text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, var(--purple-600), var(--violet-600))'
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of users and start organizing your life today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <motion.button
                  className="px-8 py-4 bg-white rounded-xl font-semibold shadow-lg"
                  style={{ color: 'var(--primary)' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 inline ml-2" />
                </motion.button>
              </Link>
              <Link href="/login">
                <motion.button
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white rounded-xl font-semibold"
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.2)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign In
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default DemoPage;