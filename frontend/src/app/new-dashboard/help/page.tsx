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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <HelpCircle className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                Help Center
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Find answers to common questions and get support
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search help articles, tutorials, and more..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
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
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Getting Started
                </h2>
                <button className="text-blue-500 hover:text-blue-600 font-medium text-sm flex items-center gap-1">
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
                      className="group p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer hover:shadow-lg"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                              {article.title}
                            </h3>
                            {article.popular && (
                              <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs rounded-full">
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {article.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
                        <Clock className="h-3 w-3" />
                        {article.time}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Popular Topics */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Popular Topics
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {popularTopics.map((topic, index) => {
                  const Icon = topic.icon;
                  return (
                    <div
                      key={index}
                      className="group p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer hover:shadow-lg"
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                            {topic.title}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                            {topic.description}
                          </p>
                          <span className="text-xs text-slate-500 dark:text-slate-500">
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
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-6">
                <Video className="h-6 w-6 text-blue-500" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Video Tutorials
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {videoTutorials.map((video, index) => (
                  <div
                    key={index}
                    className="group relative bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer hover:shadow-lg"
                  >
                    <div className="aspect-video bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <span className="text-6xl">{video.thumbnail}</span>
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                        <PlayCircle className="h-12 w-12 text-white group-hover:scale-110 transition-transform" />
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-slate-900 dark:text-white mb-1">
                        {video.title}
                      </h3>
                      <span className="text-xs text-slate-500 dark:text-slate-500">
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
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
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
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      <Icon className="h-5 w-5 text-blue-500" />
                      <span className="font-medium text-slate-900 dark:text-white group-hover:text-blue-500">
                        {link.label}
                      </span>
                      <ChevronRight className="h-4 w-4 ml-auto text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 shadow-xl text-white">
              <div className="flex items-center gap-2 mb-3">
                <LifeBuoy className="h-6 w-6" />
                <h3 className="text-lg font-bold">Need More Help?</h3>
              </div>
              <p className="text-blue-100 text-sm mb-4">
                Our support team is here to help you 24/7
              </p>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-colors">
                  <MessageCircle className="h-4 w-4" />
                  Live Chat
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl font-medium hover:bg-white/20 transition-colors">
                  <Mail className="h-4 w-4" />
                  Email Support
                </button>
              </div>
            </div>

            {/* Status */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                System Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    All Systems
                  </span>
                  <span className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    Operational
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                  <a href="#" className="text-sm text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1">
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