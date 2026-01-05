'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import { Calendar } from '../components/ui/calender';

const CalendarWidget: React.FC = () => {
  const { tasks } = useDashboard();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Get dates that have tasks
  const getTaskDates = () => {
    return tasks
      .filter(task => task.dueDate)
      .map(task => new Date(task.dueDate!));
  };

  const taskDates = getTaskDates();

  // Custom day content to show task indicators
  const customDayContent = (day: Date) => {
    const hasTask = taskDates.some(
      taskDate =>
        taskDate.getDate() === day.getDate() &&
        taskDate.getMonth() === day.getMonth() &&
        taskDate.getFullYear() === day.getFullYear()
    );

    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <span>{day.getDate()}</span>
        {hasTask && (
          <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400"></span>
        )}
      </div>
    );
  };

  // Highlight days with tasks
  const modifiers = {
    hasTask: taskDates,
  };

  const modifiersStyles = {
    hasTask: {
      fontWeight: 'bold' as const,
    },
  };

  return (
    <Card className="h-full shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          className="rounded-md border-0"
          showOutsideDays={false}
        />
      </CardContent>
    </Card>
  );
};

export default CalendarWidget;