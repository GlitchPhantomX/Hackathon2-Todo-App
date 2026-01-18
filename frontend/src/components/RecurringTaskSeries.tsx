import React, { useState, useEffect } from 'react';
import { Task, RecurringTaskSeries } from '../types/task.types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useApi } from '@/hooks/useApi';

interface RecurringTaskSeriesProps {
  taskId: string;
  onClose?: () => void;
}

const RecurringTaskSeries: React.FC<RecurringTaskSeriesProps> = ({ taskId, onClose }) => {
  const [seriesData, setSeriesData] = useState<RecurringTaskSeries | null>(null);
  const [instances, setInstances] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { apiCall } = useApi();

  useEffect(() => {
    const fetchSeriesData = async () => {
      try {
        setLoading(true);
        // Fetch series information
        const seriesResponse = await apiCall(`/api/users/me/tasks/${taskId}/series`);
        setSeriesData(seriesResponse);

        // Fetch all instances of the recurring task
        const instancesResponse = await apiCall(`/api/users/me/tasks/${taskId}/instances`);
        setInstances(instancesResponse.instances || []);
      } catch (err) {
        setError('Failed to load recurring task series');
        console.error('Error fetching recurring task series:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSeriesData();
  }, [taskId, apiCall]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-2">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!seriesData) {
    return (
      <div className="p-4">
        <div className="text-gray-600">No series data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Series Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{seriesData.title}</h2>
          <p className="text-gray-600">Recurring {seriesData.frequency} task</p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {/* Series Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-gray-500">Total Instances</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{seriesData.totalInstances}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-gray-500">Active</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{seriesData.active_instances}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-gray-500">Completed</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">{seriesData.completed_instances}</div>
          </CardContent>
        </Card>
      </div>

      {/* Series Details */}
      <Card>
        <CardHeader>
          <CardTitle>Series Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Frequency</h4>
              <p className="capitalize">{seriesData.frequency}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Timezone</h4>
              <p>{seriesData.timezone || 'UTC'}</p>
            </div>
            {seriesData.recurrence_end_date && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">End Date</h4>
                <p>{new Date(seriesData.recurrence_end_date).toLocaleDateString()}</p>
              </div>
            )}
            {seriesData.next_occurrence && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Next Occurrence</h4>
                <p>{new Date(seriesData.next_occurrence).toLocaleString()}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Task Instances */}
      <Card>
        <CardHeader>
          <CardTitle>Task Instances ({instances.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {instances.length === 0 ? (
              <p className="text-gray-500">No instances found</p>
            ) : (
              instances.map((instance) => (
                <div
                  key={instance.id}
                  className={`p-3 rounded-lg border ${
                    instance.completed
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">{instance.title}</span>
                      {instance.completed && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Completed
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {instance.dueDate ? new Date(instance.dueDate).toLocaleString() : 'No due date'}
                    </div>
                  </div>
                  {instance.description && (
                    <p className="mt-1 text-sm text-gray-600">{instance.description}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecurringTaskSeries;