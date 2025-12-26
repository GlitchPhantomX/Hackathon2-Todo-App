'use client';

import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/contexts/DashboardContext';
import { Task } from '@/types/types';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Set up the localizer for moment
const localizer = momentLocalizer(moment);

// Define the event type for the calendar
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: Task;
  priority: string;
}

const Calendar: React.FC = () => {
  const { tasks } = useDashboard();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentView, setCurrentView] = useState<View>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Convert tasks to calendar events
  useEffect(() => {
    const calendarEvents: CalendarEvent[] = tasks
      .filter(task => task.dueDate) // Only tasks with due dates
      .map(task => {
        const dueDate = new Date(task.dueDate!);
        // Set start time to beginning of day and end time to end of day
        const start = new Date(dueDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(dueDate);
        end.setHours(23, 59, 59, 999);

        return {
          id: task.id,
          title: task.title,
          start,
          end,
          resource: task,
          priority: task.priority || 'medium',
        };
      });

    setEvents(calendarEvents);
  }, [tasks]);

  // Handle date selection - click to create task
  const handleSelectSlot = (slotInfo: { start: Date; end: Date; slots: Date[] }) => {
    // In a real app, this would open the AddTaskModal with the selected date
    console.log('Selected date range:', slotInfo.start, 'to', slotInfo.end);
    // For now, we'll just log the selection
  };

  // Handle event click - click task to view details
  const handleEventClick = (event: CalendarEvent) => {
    console.log('Clicked event:', event);
    // In a real app, this would open the TaskDetail modal
  };

  // Custom event style based on priority
  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '';
    let borderColor = '';

    switch (event.priority) {
      case 'high':
        backgroundColor = 'rgba(239, 68, 68, 0.7)'; // Red for high priority
        borderColor = 'rgb(239, 68, 68)';
        break;
      case 'medium':
        backgroundColor = 'rgba(245, 158, 11, 0.7)'; // Yellow for medium priority
        borderColor = 'rgb(245, 158, 11)';
        break;
      case 'low':
        backgroundColor = 'rgba(59, 130, 246, 0.7)'; // Blue for low priority
        borderColor = 'rgb(59, 130, 246)';
        break;
      default:
        backgroundColor = 'rgba(59, 130, 246, 0.7)';
        borderColor = 'rgb(59, 130, 246)';
    }

    const style = {
      backgroundColor,
      borderRadius: '4px',
      border: `1px solid ${borderColor}`,
      color: 'white',
      opacity: 0.8,
      display: 'block',
      fontSize: '0.8em',
    };

    return {
      style,
    };
  };

  // View options for the calendar
  const viewOptions: Array<{ id: View; label: string }> = [
    { id: 'month', label: 'Month' },
    { id: 'week', label: 'Week' },
    { id: 'day', label: 'Day' },
    { id: 'agenda', label: 'Agenda' },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Task Calendar</CardTitle>
        <div className="flex space-x-2">
          {viewOptions.map((view) => (
            <Button
              key={view.id}
              variant={currentView === view.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentView(view.id)}
            >
              {view.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[600px]">
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            view={currentView}
            date={selectedDate}
            onNavigate={(date) => setSelectedDate(date)}
            onView={(view) => setCurrentView(view)}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleEventClick}
            selectable
            eventPropGetter={eventStyleGetter}
            messages={{
              today: 'Today',
              previous: 'Prev',
              next: 'Next',
              month: 'Month',
              week: 'Week',
              day: 'Day',
              agenda: 'Agenda',
              date: 'Date',
              time: 'Time',
              event: 'Task',
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default Calendar;