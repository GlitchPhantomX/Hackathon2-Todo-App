'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Target,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';

const DashboardStats = () => {
  const { stats, loading } = useDashboard();
  
  // ✅ Check stats loading specifically
  const isLoading = loading.stats;
  
  const [animatedValues, setAnimatedValues] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0
  });

  console.log('📊 DashboardStats Debug:', { stats, isLoading, loading }); // Debug

  // Animate the stats when they change
  useEffect(() => {
    if (isLoading) {
      setAnimatedValues({
        total: 0,
        completed: 0,
        pending: 0,
        overdue: 0
      });
      return; // ✅ explicit void return
    }
  
    const duration = 1000;
    const steps = 30;
    const interval = duration / steps;
  
    const totalStep = stats.total / steps;
    const completedStep = stats.completed / steps;
    const pendingStep = stats.pending / steps;
    const overdueStep = stats.overdue / steps;
  
    let step = 0;
    const timer = setInterval(() => {
      step++;
  
      if (step > steps) {
        clearInterval(timer);
        setAnimatedValues({
          total: stats.total,
          completed: stats.completed,
          pending: stats.pending,
          overdue: stats.overdue
        });
      } else {
        setAnimatedValues({
          total: Math.floor(totalStep * step),
          completed: Math.floor(completedStep * step),
          pending: Math.floor(pendingStep * step),
          overdue: Math.floor(overdueStep * step)
        });
      }
    }, interval);
  
    return () => clearInterval(timer); // ✅ always returned in this branch
  }, [stats, isLoading]);
  

  // Calculate completion percentage
  const completionPercentage = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  const statItems = [
    {
      id: 'total',
      title: 'Total Tasks',
      value: animatedValues.total,
      icon: Target,
      iconColor: 'text-blue-500',
      gradient: 'from-blue-500 to-blue-600',
      description: 'All tasks in your list'
    },
    {
      id: 'completed',
      title: 'Completed',
      value: animatedValues.completed,
      icon: CheckCircle2,
      iconColor: 'text-green-500',
      gradient: 'from-green-500 to-green-600',
      description: `${completionPercentage}% of total`
    },
    {
      id: 'pending',
      title: 'Pending',
      value: animatedValues.pending,
      icon: Clock,
      iconColor: 'text-amber-500',
      gradient: 'from-amber-500 to-amber-600',
      description: 'Tasks waiting to be done'
    },
    {
      id: 'overdue',
      title: 'Overdue',
      value: animatedValues.overdue,
      icon: AlertCircle,
      iconColor: 'text-red-500',
      gradient: 'from-red-500 to-red-600',
      description: 'Tasks past their due date',
      pulsing: animatedValues.overdue > 0
    }
  ];

  // ✅ Show skeleton loading if stats are loading
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="p-3 rounded-full bg-gray-100">
                  <div className="h-6 w-6 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statItems.map((stat) => (
        <Card
          key={stat.id}
          className={`transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lg ${
            stat.pulsing ? 'animate-pulse' : ''
          }`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {stat.value}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </div>
              <div className={`p-3 rounded-full bg-gradient-to-r ${stat.gradient}`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;