"use client";
import {
  useMotionValueEvent,
  useScroll,
  useTransform,
  motion,
} from "motion/react";
import React, { useEffect, useRef, useState } from "react";
import { Target, Layers, Zap, TrendingUp, CheckCircle2, Sparkles, Workflow } from "lucide-react";
import Timeline from "@/components/ui/timeline";

interface TimelineEntry {
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export default function TimelineDemo() {
  const data = [
    {
      title: "Plan",
      icon: <Target className="w-5 h-5" />,
      content: (
        <div>
          <h4 
            className="text-2xl font-bold mb-3"
            style={{ color: 'var(--foreground)' }}
          >
            Define Your Goals
          </h4>
          <p 
            className="text-base leading-relaxed mb-4"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Transform ambitious ideas into actionable objectives. Our intelligent planning system helps you break down complex goals into manageable milestones, ensuring every task aligns with your bigger vision.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <motion.div 
              className="flex items-start gap-3 p-3 rounded-lg border"
              style={{ 
                backgroundColor: 'var(--secondary)',
                borderColor: 'var(--border)'
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <CheckCircle2 
                className="w-5 h-5 flex-shrink-0 mt-0.5" 
                style={{ color: 'var(--primary)' }}
              />
              <div>
                <p 
                  className="text-sm font-semibold"
                  style={{ color: 'var(--foreground)' }}
                >
                  Smart Goal Setting
                </p>
                <p 
                  className="text-xs"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  AI-powered recommendations
                </p>
              </div>
            </motion.div>
            <motion.div 
              className="flex items-start gap-3 p-3 rounded-lg border"
              style={{ 
                backgroundColor: 'var(--secondary)',
                borderColor: 'var(--border)'
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <CheckCircle2 
                className="w-5 h-5 flex-shrink-0 mt-0.5" 
                style={{ color: 'var(--primary)' }}
              />
              <div>
                <p 
                  className="text-sm font-semibold"
                  style={{ color: 'var(--foreground)' }}
                >
                  Visual Roadmaps
                </p>
                <p 
                  className="text-xs"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  See your path to success
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      ),
    },
    {
      title: "Organize",
      icon: <Layers className="w-5 h-5" />,
      content: (
        <div>
          <h4 
            className="text-2xl font-bold mb-3"
            style={{ color: 'var(--foreground)' }}
          >
            Structure Your Workflow
          </h4>
          <p 
            className="text-base leading-relaxed mb-6"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Experience effortless organization with smart categorization, priority matrices, and flexible project structures. Keep everything in perfect order without the mental overhead.
          </p>
          <div className="space-y-3">
            {[
              { 
                num: "1", 
                title: "Priority-Based Sorting", 
                desc: "Focus on what matters most",
                color: "var(--purple-600)"
              },
              { 
                num: "2", 
                title: "Custom Labels & Tags", 
                desc: "Organize your way",
                color: "var(--violet-600)"
              },
              { 
                num: "3", 
                title: "Multi-Project Management", 
                desc: "Handle everything at once",
                color: "var(--purple-500)"
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                className="flex items-center gap-3 p-4 rounded-lg border backdrop-blur-sm"
                style={{ 
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)'
                }}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ scale: 1.02, x: 4 }}
              >
                <motion.div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                  style={{ backgroundColor: item.color }}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {item.num}
                </motion.div>
                <div className="flex-1">
                  <p 
                    className="font-semibold"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {item.title}
                  </p>
                  <p 
                    className="text-sm"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Execute",
      icon: <Zap className="w-5 h-5" />,
      content: (
        <div>
          <h4 
            className="text-2xl font-bold mb-3"
            style={{ color: 'var(--foreground)' }}
          >
            Take Action With Confidence
          </h4>
          <p 
            className="text-base leading-relaxed mb-6"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Stay in the zone with real-time progress tracking, smart notifications, and distraction-free execution modes. Watch your productivity soar as you check off tasks effortlessly.
          </p>
          <motion.div 
            className="rounded-xl p-6 text-white relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, var(--purple-600), var(--violet-600))',
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            {/* Animated background pattern */}
            <motion.div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: '30px 30px'
              }}
              animate={{
                backgroundPosition: ['0px 0px', '30px 30px'],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            
            <div className="relative z-10">
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                  { value: "95%", label: "Completion Rate" },
                  { value: "2.5x", label: "Faster Execution" },
                  { value: "100%", label: "Focus Mode" },
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                  >
                    <motion.div 
                      className="text-3xl font-bold mb-1"
                      whileHover={{ scale: 1.1 }}
                    >
                      {stat.value}
                    </motion.div>
                    <div className="text-xs opacity-90">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
              <div className="space-y-2 text-sm">
                {[
                  "Real-time sync across all devices",
                  "Smart reminders that actually help",
                  "Distraction-blocking focus timer",
                ].map((text, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      ),
    },
    {
      title: "Improve",
      icon: <TrendingUp className="w-5 h-5" />,
      content: (
        <div>
          <h4 
            className="text-2xl font-bold mb-3"
            style={{ color: 'var(--foreground)' }}
          >
            Optimize & Grow
          </h4>
          <p 
            className="text-base leading-relaxed mb-6"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Learn from every completed task with powerful analytics and insights. Identify patterns, optimize workflows, and build momentum as you continuously improve your productivity game.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              {
                icon: TrendingUp,
                title: "Performance Analytics",
                desc: "Track your productivity trends",
              },
              {
                icon: Target,
                title: "Goal Achievement",
                desc: "Celebrate your milestones",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                className="p-5 rounded-xl border backdrop-blur-sm"
                style={{ 
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)'
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ scale: 1.05, y: -4 }}
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <item.icon 
                    className="w-8 h-8 mb-3" 
                    style={{ color: 'var(--primary)' }}
                  />
                </motion.div>
                <h5 
                  className="font-bold mb-1"
                  style={{ color: 'var(--foreground)' }}
                >
                  {item.title}
                </h5>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
          <motion.div 
            className="p-4 rounded-lg border-l-4"
            style={{ 
              backgroundColor: 'var(--secondary)',
              borderColor: 'var(--primary)'
            }}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ x: 4 }}
          >
            <p 
              className="text-sm font-semibold mb-1"
              style={{ color: 'var(--foreground)' }}
            >
              💡 Pro Tip
            </p>
            <p 
              className="text-sm"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Review your weekly analytics every Sunday to plan an even more productive week ahead.
            </p>
          </motion.div>
        </div>
      ),
    },
  ];

  return (
    <section 
      id="how-it-works"
      className="relative py-16 overflow-hidden"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Subtle dot pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--primary) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Floating gradient blobs */}
        <motion.div
          className="absolute top-40 right-20 w-72 h-72 rounded-full blur-3xl opacity-10"
          style={{ backgroundColor: 'var(--purple-300)' }}
          animate={{
            y: [0, -40, 0],
            x: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-40 left-20 w-72 h-72 rounded-full blur-3xl opacity-10"
          style={{ backgroundColor: 'var(--violet-300)' }}
          animate={{
            y: [0, 40, 0],
            x: [0, -30, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border backdrop-blur-sm relative overflow-hidden group mb-6"
            style={{ 
              backgroundColor: 'var(--secondary)',
              borderColor: 'var(--border)'
            }}
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Gradient overlay on hover */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
              style={{ 
                background: 'linear-gradient(to right, var(--purple-400), var(--violet-400))'
              }}
            />
            <Workflow className="w-4 h-4 relative z-10" style={{ color: 'var(--primary)' }} />
            <span 
              className="text-sm font-semibold relative z-10" 
              style={{ color: 'var(--primary)' }}
            >
              Your Path to Success
            </span>
            <Sparkles className="w-4 h-4 relative z-10" style={{ color: 'var(--primary)' }} />
          </motion.div>

          {/* Heading */}
          <motion.h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 tracking-tight"
            style={{ 
              color: 'var(--foreground)',
              fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
              fontWeight: 800,
              letterSpacing: '-0.02em'
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            How It Works
          </motion.h2>

          {/* Animated gradient underline */}
          <motion.div
            className="h-1 rounded-full mx-auto mb-4"
            style={{ 
              background: 'linear-gradient(90deg, var(--purple-600), var(--violet-600))',
              width: '80px'
            }}
            initial={{ width: 0 }}
            whileInView={{ width: '80px' }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />

          {/* Description */}
          <motion.p
            className="text-base md:text-lg max-w-2xl mx-auto"
            style={{ color: 'var(--muted-foreground)' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Follow our proven 4-step process to transform your productivity
          </motion.p>
        </motion.div>

        {/* Timeline */}
        <div className="relative w-full overflow-clip">
          <Timeline data={data} />
        </div>
      </div>
    </section>
  );
}