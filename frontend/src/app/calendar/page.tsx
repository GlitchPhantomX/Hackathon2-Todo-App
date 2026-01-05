'use client';
export const runtime = 'edge';

export const dynamic = 'force-dynamic';

import React from 'react';

const CalendarPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Calendar</h1>
      <p>Task calendar view</p>
    </div>
  );
};

export default CalendarPage;