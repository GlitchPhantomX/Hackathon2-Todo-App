'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/contexts/DashboardContext';

const DashboardHeader = () => {
  const { user } = useAuth();
  const { stats } = useDashboard();

  // Function to get motivational message based on task stats
  const getMotivationalMessage = () => {
    if (stats.overdue > 0) {
      return `You have ${stats.overdue} overdue task${stats.overdue > 1 ? 's' : ''}. Let's get those sorted!`;
    } else if (stats.pending > 0 && stats.completed > 0) {
      const completionRate = Math.round((stats.completed / (stats.completed + stats.pending)) * 100);
      if (completionRate > 75) {
        return 'Great job! You\'re on track with your tasks.';
      } else if (completionRate > 50) {
        return 'You\'re making progress! Keep going.';
      } else {
        return 'There\'s still work to do, but you\'ve got this!';
      }
    } else if (stats.pending === 0 && stats.completed > 0) {
      return 'Congratulations! You\'re all caught up.';
    } else if (stats.total === 0) {
      return 'Welcome! Ready to start your productivity journey?';
    } else {
      return 'Welcome back! Ready to tackle your tasks?';
    }
  };

  return (
    <div className="mb-8 ">
      <h1 className="text-3xl font-bold tracking-tight">
        Welcome back, {user?.name || 'there'}!
      </h1>
      <p className="text-muted-foreground mt-2">
        {getMotivationalMessage()}
      </p>
    </div>
  );
};

export default DashboardHeader;