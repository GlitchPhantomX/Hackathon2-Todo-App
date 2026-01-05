'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '../../../../components/ui/Alert';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/contexts/AuthContext';
import { getTask } from '@/services/taskService';
import { Task } from '@/types/task.types';
import { useRouter, useParams } from 'next/navigation';

// Dynamically import heavy components
const TaskForm = React.lazy(() => import('@/components/tasks/TaskForm'));

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const taskId = params.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (taskId) {
      fetchTask();
    }
  }, [taskId]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      setError(null);
      const taskData = await getTask(taskId);
      setTask(taskData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load task';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setSuccess(true);
    // Redirect to tasks page after a short delay
    setTimeout(() => {
      router.push('/tasks');
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-1">Task not found</h3>
        <p className="text-gray-500">The task you&#39;re looking for doesn&#39;t exist or has been deleted.</p>
        <Link href="/tasks">
          <Button variant="default" className="mt-4">
            Back to Tasks
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Task</h1>
        <p className="text-gray-600 mt-1">Update the details for your task</p>
      </div>

      {error && <Alert variant="error" onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success">Task updated successfully!</Alert>}

      <Card className="p-6">
        <Suspense fallback={<div className="flex justify-center py-8"><Spinner size="lg" /></div>}>
          <TaskForm task={task} onSuccess={handleSuccess} />
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