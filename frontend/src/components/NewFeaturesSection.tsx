"use client";

import { motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  Users,
  Zap,
  Brain,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: CheckCircle,
    title: "Smart Task Management",
    description:
      "AI-powered task organization that learns your preferences and suggests priorities automatically.",
    gradient: "linear-gradient(135deg, var(--purple-500), var(--purple-600))",
  },
  {
    icon: Clock,
    title: "Time Tracking",
    description:
      "Built-in time tracking with detailed reports to help you understand where your time goes.",
    gradient: "linear-gradient(135deg, var(--violet-500), var(--violet-600))",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Work seamlessly with your team with real-time updates and shared task boards.",
    gradient: "linear-gradient(135deg, var(--purple-600), var(--violet-600))",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Optimized for speed and performance with smooth animations and instant responses.",
    gradient: "linear-gradient(135deg, var(--violet-400), var(--purple-500))",
  },
  {
    icon: Brain,
    title: "AI Insights",
    description:
      "Get intelligent insights and recommendations to improve productivity and workflow.",
    gradient: "linear-gradient(135deg, var(--purple-500), var(--violet-500))",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Reliable",
    description:
      "Your data is protected with enterprise-grade security and reliable cloud backups.",
    gradient: "linear-gradient(135deg, var(--violet-600), var(--purple-600))",
  },
];

export default function NewFeaturesSection() {
  return (
    <section 
      id="features" 
      className="relative py-16 overflow-hidden"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--primary) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Floating Background Blobs */}
      <motion.div
        className="absolute top-20 right-20 w-64 h-64 rounded-full blur-3xl opacity-10"
        style={{ backgroundColor: 'var(--purple-300)' }}
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 left-20 w-64 h-64 rounded-full blur-3xl opacity-10"
        style={{ backgroundColor: 'var(--violet-300)' }}
        animate={{
          y: [0, 30, 0],
          x: [0, -20, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading with animated underline */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-block"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 tracking-tight"
              style={{ 
                color: 'var(--foreground)',
                fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                fontWeight: 800,
                letterSpacing: '-0.02em'
              }}
            >
              Powerful Features
            </h2>
            {/* Animated gradient underline */}
            <motion.div
              className="h-1 rounded-full mx-auto"
              style={{ 
                background: 'linear-gradient(90deg, var(--purple-600), var(--violet-600))',
                width: '80px'
              }}
              initial={{ width: 0 }}
              whileInView={{ width: '80px' }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />
          </motion.div>
          
          <motion.p 
            className="text-base md:text-lg max-w-2xl mx-auto mt-4"
            style={{ color: 'var(--muted-foreground)' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Everything you need to boost your productivity and manage your tasks
            effectively
          </motion.p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group relative p-6 rounded-2xl border backdrop-blur-sm overflow-hidden"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{
                y: -8,
                scale: 1.02,
              }}
            >
              {/* Gradient glow effect on hover */}
              <motion.div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                style={{
                  background: feature.gradient,
                  filter: 'blur(20px)',
                  zIndex: -1,
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                whileHover={{ opacity: 0.15, scale: 1 }}
              />

              {/* Animated border gradient */}
              <div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, var(--purple-500), var(--violet-500))`,
                  padding: '1px',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                }}
              />

              {/* Icon with gradient background */}
              <motion.div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 relative overflow-hidden shadow-lg"
                style={{ background: feature.gradient }}
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <feature.icon className="w-6 h-6 text-white relative z-10" strokeWidth={2.5} />
                
                {/* Icon shine effect */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  }}
                  animate={{
                    x: [-100, 100],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                />
              </motion.div>

              {/* Title */}
              <h3 
                className="text-xl font-bold mb-2.5 tracking-tight"
                style={{ color: 'var(--foreground)' }}
              >
                {feature.title}
              </h3>

              {/* Description */}
              <p 
                className="text-sm leading-relaxed"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {feature.description}
              </p>

              {/* Hover arrow indicator */}
              <motion.div
                className="mt-4 flex items-center gap-2 text-sm font-medium"
                style={{ color: 'var(--primary)' }}
                initial={{ opacity: 0, x: -10 }}
                whileHover={{ opacity: 1, x: 0 }}
              >
                <span>Learn more</span>
                <motion.svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <path
                    d="M6 12L10 8L6 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              </motion.div>

              {/* Particle effects on hover */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full"
                  style={{ 
                    backgroundColor: 'var(--primary)',
                    top: `${20 + i * 30}%`,
                    right: '10%',
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  whileHover={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: [0, 20, 40],
                    y: [0, -20, -40],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.p
            className="text-sm font-medium mb-4"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Ready to boost your productivity?
          </motion.p>
          <motion.button
            className="px-6 py-3 rounded-xl font-semibold text-white shadow-lg relative overflow-hidden group"
            style={{
              background: 'linear-gradient(135deg, var(--purple-600), var(--violet-600))',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">Get Started Now</span>
            
            {/* Button shine effect */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              }}
              animate={{
                x: [-200, 200],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            />
            
            {/* Hover gradient overlay */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ 
                background: 'linear-gradient(135deg, var(--violet-600), var(--purple-600))'
              }}
            />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}