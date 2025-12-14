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
    gradient: "from-emerald-500 to-green-600",
  },
  {
    icon: Clock,
    title: "Time Tracking",
    description:
      "Built-in time tracking with detailed reports to help you understand where your time goes.",
    gradient: "from-blue-500 to-sky-600",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Work seamlessly with your team with real-time updates and shared task boards.",
    gradient: "from-indigo-500 to-violet-600",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Optimized for speed and performance with smooth animations and instant responses.",
    gradient: "from-yellow-400 to-orange-500",
  },
  {
    icon: Brain,
    title: "AI Insights",
    description:
      "Get intelligent insights and recommendations to improve productivity and workflow.",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Reliable",
    description:
      "Your data is protected with enterprise-grade security and reliable cloud backups.",
    gradient: "from-teal-500 to-cyan-600",
  },
];

export default function NewFeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-h1 font-heading text-gray-900 dark:text-white mb-4">
            Powerful Features
          </h2>
          <p className="text-body-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Everything you need to boost your productivity and manage your tasks
            effectively
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="
                group
                bg-gray-50 dark:bg-gray-900
                p-8 rounded-2xl
                border border-gray-200 dark:border-gray-800
                cursor-pointer
              "
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{
                y: -8,
                scale: 1.03,
              }}
            >
              {/* Icon */}
              <div
                className={`
    w-12 h-12 rounded-lg
    bg-gradient-to-br ${feature.gradient}
    flex items-center justify-center mb-6
    transition-transform duration-300
    group-hover:rotate-6 group-hover:scale-110
  `}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>

              {/* Glow effect */}
              <div
                className="
                  absolute inset-0 rounded-2xl
                  opacity-0 group-hover:opacity-100
                  transition duration-300
                  pointer-events-none
                  bg-gradient-to-br from-indigo-500/10 to-purple-600/10
                "
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
