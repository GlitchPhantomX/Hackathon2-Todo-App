'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

// Dynamically import heavy components
const TaskForm = React.lazy(() => import('@/components/tasks/TaskForm'));

export default function CreateTaskPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [success, setSuccess] = useState(false);

  const handleSuccess = () => {
    setSuccess(true);
    // Redirect to tasks page after a short delay
    setTimeout(() => {
      router.push('/tasks');
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Task</h1>
        <p className="text-gray-600 mt-1">Fill in the details for your new task</p>
      </div>

      {success && <Alert variant="success">Task created successfully!</Alert>}

      <Card className="p-6">
        <Suspense fallback={<div className="flex justify-center py-8"><Spinner size="lg" /></div>}>
          <TaskForm onSuccess={handleSuccess} />
        </Suspense>
        <div className="flex justify-start pt-4">
          <Link href="/tasks">
            <Button variant="secondary" type="button">
              Cancel
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}