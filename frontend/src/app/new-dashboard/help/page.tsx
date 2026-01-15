'use client';
export const runtime = 'edge';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { 
  HelpCircle, 
  Search, 
  Book, 
  MessageCircle, 
  LifeBuoy,
  FileText,
  Video,
  Mail,
  Phone,
  ChevronRight,
  PlayCircle,
  Zap,
  Shield,
  Settings,
  Users,
  Star,
  Clock
} from 'lucide-react';

const HelpPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Topics', icon: Book },
    { id: 'getting-started', label: 'Getting Started', icon: Zap },
    { id: 'features', label: 'Features', icon: Star },
    { id: 'account', label: 'Account', icon: Users },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const gettingStartedArticles = [
    {
      title: 'Creating Your First Task',
      description: 'Learn how to create and manage your first task in minutes',
      icon: FileText,
      time: '3 min read',
      popular: true,
    },
    {
      title: 'Setting Up Projects',
      description: 'Organize your work efficiently using project workspaces',
      icon: Book,
      time: '5 min read',
      popular: true,
    },
    {
      title: 'Using Tags & Labels',
      description: 'Categorize and filter your tasks with custom tags',
      icon: Settings,
      time: '2 min read',
      popular: false,
    },
    {
      title: 'Setting Reminders',
      description: 'Never miss important deadlines with smart reminders',
      icon: Clock,
      time: '4 min read',
      popular: true,
    },
  ];

  const popularTopics = [
    {
      title: 'Managing Notifications',
      description: 'Control how and when you receive notifications',
      icon: MessageCircle,
      views: '2.4k views',
    },
    {
      title: 'Privacy & Security',
      description: 'Configure your privacy preferences and security settings',
      icon: Shield,
      views: '1.8k views',
    },
    {
      title: 'Exporting Your Data',
      description: 'Export and backup all your tasks and projects',
      icon: FileText,
      views: '1.2k views',
    },
    {
      title: 'Keyboard Shortcuts',
      description: 'Boost productivity with powerful keyboard shortcuts',
      icon: Zap,
      views: '3.1k views',
    },
  ];

  const videoTutorials = [
    { title: 'Quick Start Guide', duration: '5:30', thumbnail: '🎬' },
    { title: 'Advanced Features', duration: '8:45', thumbnail: '📚' },
    { title: 'Team Collaboration', duration: '6:20', thumbnail: '👥' },
  ];

  return (
    <div 
      className="min-h-screen p-6"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg"
              style={{
                background: 'linear-gradient(to bottom right, var(--purple-600), var(--violet-600))'
              }}
            >
              <HelpCircle className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 
                className="text-4xl font-bold"
                style={{ color: 'var(--foreground)' }}
              >
                Help Center
              </h1>
              <p style={{ color: 'var(--muted-foreground)' }}>
                Find answers to common questions and get support
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search 
              className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5"
              style={{ color: 'var(--muted-foreground)' }}
            />
            <input
              type="text"
              placeholder="Search help articles, tutorials, and more..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 backdrop-blur-xl border rounded-2xl shadow-lg focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
                '--tw-ring-color': 'var(--primary)'
              } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all border"
                style={{
                  backgroundColor: isActive ? 'var(--primary)' : 'var(--card)',
                  color: isActive ? 'white' : 'var(--foreground)',
                  borderColor: isActive ? 'var(--primary)' : 'var(--border)',
                  boxShadow: isActive ? '0 10px 25px -5px rgba(139, 92, 246, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--muted)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--card)';
                  }
                }}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{category.label}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Getting Started */}
            <div 
              className="backdrop-blur-xl rounded-2xl border p-6 shadow-xl"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)'
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 
                  className="text-2xl font-bold"
                  style={{ color: 'var(--foreground)' }}
                >
                  Getting Started
                </h2>
                <button 
                  className="font-medium text-sm flex items-center gap-1 transition-colors"
                  style={{ color: 'var(--primary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  View All
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gettingStartedArticles.map((article, index) => {
                  const Icon = article.icon;
                  return (
                    <div
                      key={index}
                      className="group p-4 rounded-xl border transition-all cursor-pointer hover:shadow-lg"
                      style={{
                        backgroundColor: 'var(--muted)',
                        borderColor: 'var(--border)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                      }}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div 
                          className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                          style={{
                            background: 'linear-gradient(to bottom right, var(--purple-600), var(--violet-600))'
                          }}
                        >
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 
                              className="font-semibold"
                              style={{ color: 'var(--foreground)' }}
                            >
                              {article.title}
                            </h3>
                            {article.popular && (
                              <span 
                                className="px-2 py-0.5 text-xs rounded-full"
                                style={{
                                  backgroundColor: '#fef3c7',
                                  color: '#b45309'
                                }}
                              >
                                Popular
                              </span>
                            )}
                          </div>
                          <p 
                            className="text-sm"
                            style={{ color: 'var(--muted-foreground)' }}
                          >
                            {article.description}
                          </p>
                        </div>
                      </div>
                      <div 
                        className="flex items-center gap-2 text-xs"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        <Clock className="h-3 w-3" />
                        {article.time}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Popular Topics */}
            <div 
              className="backdrop-blur-xl rounded-2xl border p-6 shadow-xl"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)'
              }}
            >
              <h2 
                className="text-2xl font-bold mb-6"
                style={{ color: 'var(--foreground)' }}
              >
                Popular Topics
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {popularTopics.map((topic, index) => {
                  const Icon = topic.icon;
                  return (
                    <div
                      key={index}
                      className="group p-4 rounded-xl border transition-all cursor-pointer hover:shadow-lg"
                      style={{
                        backgroundColor: 'var(--muted)',
                        borderColor: 'var(--border)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div 
                          className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                          style={{
                            background: 'linear-gradient(to bottom right, var(--purple-600), var(--violet-600))'
                          }}
                        >
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 
                            className="font-semibold mb-1"
                            style={{ color: 'var(--foreground)' }}
                          >
                            {topic.title}
                          </h3>
                          <p 
                            className="text-sm mb-2"
                            style={{ color: 'var(--muted-foreground)' }}
                          >
                            {topic.description}
                          </p>
                          <span 
                            className="text-xs"
                            style={{ color: 'var(--muted-foreground)' }}
                          >
                            {topic.views}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Video Tutorials */}
            <div 
              className="backdrop-blur-xl rounded-2xl border p-6 shadow-xl"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)'
              }}
            >
              <div className="flex items-center gap-2 mb-6">
                <Video 
                  className="h-6 w-6"
                  style={{ color: 'var(--primary)' }}
                />
                <h2 
                  className="text-2xl font-bold"
                  style={{ color: 'var(--foreground)' }}
                >
                  Video Tutorials
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {videoTutorials.map((video, index) => (
                  <div
                    key={index}
                    className="group relative rounded-xl border overflow-hidden transition-all cursor-pointer hover:shadow-lg"
                    style={{
                      backgroundColor: 'var(--muted)',
                      borderColor: 'var(--border)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                    }}
                  >
                    <div 
                      className="aspect-video flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(to bottom right, var(--purple-600), var(--violet-600))'
                      }}
                    >
                      <span className="text-6xl">{video.thumbnail}</span>
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                        <PlayCircle className="h-12 w-12 text-white group-hover:scale-110 transition-transform" />
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 
                        className="font-medium mb-1"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {video.title}
                      </h3>
                      <span 
                        className="text-xs"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        {video.duration}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Links */}
            <div 
              className="backdrop-blur-xl rounded-2xl border p-6 shadow-xl"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)'
              }}
            >
              <h3 
                className="text-lg font-bold mb-4"
                style={{ color: 'var(--foreground)' }}
              >
                Quick Links
              </h3>
              <div className="space-y-2">
                {[
                  { icon: Book, label: 'Documentation', href: '#' },
                  { icon: Video, label: 'Video Guides', href: '#' },
                  { icon: FileText, label: 'API Reference', href: '#' },
                  { icon: MessageCircle, label: 'Community Forum', href: '#' },
                ].map((link, index) => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={index}
                      href={link.href}
                      className="flex items-center gap-3 p-3 rounded-lg transition-colors group"
                      style={{ color: 'var(--foreground)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--muted)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <Icon 
                        className="h-5 w-5"
                        style={{ color: 'var(--primary)' }}
                      />
                      <span className="font-medium group-hover:text-[var(--primary)] transition-colors">
                        {link.label}
                      </span>
                      <ChevronRight 
                        className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-all"
                        style={{ color: 'var(--muted-foreground)' }}
                      />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Contact Support */}
            <div 
              className="rounded-2xl p-6 shadow-xl text-white"
              style={{
                background: 'linear-gradient(to bottom right, var(--purple-600), var(--violet-600))'
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <LifeBuoy className="h-6 w-6" />
                <h3 className="text-lg font-bold">Need More Help?</h3>
              </div>
              <p className="text-white/80 text-sm mb-4">
                Our support team is here to help you 24/7
              </p>
              <div className="space-y-2">
                <button 
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-xl font-medium transition-colors"
                  style={{ color: 'var(--primary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <MessageCircle className="h-4 w-4" />
                  Live Chat
                </button>
                <button 
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 backdrop-blur-sm border border-white/20 rounded-xl font-medium transition-colors"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  <Mail className="h-4 w-4" />
                  Email Support
                </button>
              </div>
            </div>

            {/* Status */}
            <div 
              className="backdrop-blur-xl rounded-2xl border p-6 shadow-xl"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)'
              }}
            >
              <h3 
                className="text-lg font-bold mb-4"
                style={{ color: 'var(--foreground)' }}
              >
                System Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span 
                    className="text-sm"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    All Systems
                  </span>
                  <span className="flex items-center gap-2 text-sm font-medium text-green-600">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    Operational
                  </span>
                </div>
                <div 
                  className="pt-3 border-t"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <a 
                    href="#" 
                    className="text-sm font-medium flex items-center gap-1 transition-colors"
                    style={{ color: 'var(--primary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  >
                    View Status Page
                    <ChevronRight className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;