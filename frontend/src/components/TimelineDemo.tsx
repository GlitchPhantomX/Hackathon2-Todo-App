"use client";
import {
  useMotionValueEvent,
  useScroll,
  useTransform,
  motion,
} from "motion/react";
import React, { useEffect, useRef, useState } from "react";
import { Target, Layers, Zap, TrendingUp, CheckCircle2 } from "lucide-react";
import Timeline from "./ui/timeline";
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
          <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Define Your Goals
          </h4>
          <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
            Transform ambitious ideas into actionable objectives. Our intelligent planning system helps you break down complex goals into manageable milestones, ensuring every task aligns with your bigger vision.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Smart Goal Setting</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">AI-powered recommendations</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Visual Roadmaps</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">See your path to success</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Organize",
      icon: <Layers className="w-5 h-5" />,
      content: (
        <div>
          <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Structure Your Workflow
          </h4>
          <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-6">
            Experience effortless organization with smart categorization, priority matrices, and flexible project structures. Keep everything in perfect order without the mental overhead.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg border border-purple-100 dark:border-purple-900">
              <div className="w-10 h-10 rounded-full bg-purple-600 dark:bg-purple-500 flex items-center justify-center text-white font-bold">
                1
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">Priority-Based Sorting</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Focus on what matters most</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg border border-purple-100 dark:border-purple-900">
              <div className="w-10 h-10 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white font-bold">
                2
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">Custom Labels & Tags</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Organize your way</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg border border-purple-100 dark:border-purple-900">
              <div className="w-10 h-10 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white font-bold">
                3
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">Multi-Project Management</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Handle everything at once</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Execute",
      icon: <Zap className="w-5 h-5" />,
      content: (
        <div>
          <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Take Action With Confidence
          </h4>
          <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-6">
            Stay in the zone with real-time progress tracking, smart notifications, and distraction-free execution modes. Watch your productivity soar as you check off tasks effortlessly.
          </p>
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">95%</div>
                <div className="text-xs opacity-90">Completion Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">2.5x</div>
                <div className="text-xs opacity-90">Faster Execution</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">100%</div>
                <div className="text-xs opacity-90">Focus Mode</div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Real-time sync across all devices</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Smart reminders that actually help</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Distraction-blocking focus timer</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Improve",
      icon: <TrendingUp className="w-5 h-5" />,
      content: (
        <div>
          <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Optimize & Grow
          </h4>
          <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-6">
            Learn from every completed task with powerful analytics and insights. Identify patterns, optimize workflows, and build momentum as you continuously improve your productivity game.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-900">
              <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400 mb-3" />
              <h5 className="font-bold text-gray-900 dark:text-white mb-1">Performance Analytics</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">Track your productivity trends</p>
            </div>
            <div className="p-5 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900">
              <Target className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
              <h5 className="font-bold text-gray-900 dark:text-white mb-1">Goal Achievement</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">Celebrate your milestones</p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-lg border-l-4 border-yellow-500">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              💡 Pro Tip
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Review your weekly analytics every Sunday to plan an even more productive week ahead.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="relative w-full overflow-clip">
      <Timeline data={data} />
    </div>
  );
}