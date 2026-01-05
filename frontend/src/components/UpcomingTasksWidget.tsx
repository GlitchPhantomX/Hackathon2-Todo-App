import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useDashboard } from '@/contexts/DashboardContext';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';

const UpcomingTasksWidget: React.FC = () => {
  const { tasks, toggleTaskCompletion, loading } = useDashboard();

  // ✅ Check tasks loading specifically
  const isLoading = loading.tasks;

  console.log('🔮 UpcomingTasksWidget Debug:', { 
    tasks, 
    isLoading, 
    loading,
    tasksCount: tasks.length 
  }); // Debug log

  // Get upcoming tasks (due in the next 7 days, sorted by due date)
  const upcomingTasks = tasks
    .filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      const now = new Date();
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(now.getDate() + 7);
      
      return dueDate > now && dueDate <= sevenDaysFromNow;
    })
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5); // Take only the next 5

  console.log('📅 Upcoming tasks:', upcomingTasks); // Debug log

  const getPriorityColor = (priority: string | undefined) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  // ✅ Use isLoading instead of loading
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upcoming Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingTasks.length > 0 ? (
          <div className="space-y-4">
            {upcomingTasks.map(task => (
              <div 
                key={task.id} 
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <Checkbox
                    checked={task.status === 'completed'}
                    onCheckedChange={() => toggleTaskCompletion(task.id)}
                    className="h-4 w-4"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${
                      task.status === 'completed' ? 'line-through text-muted-foreground' : ''
                    }`}>
                      {task.title}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {task.dueDate 
                          ? format(new Date(task.dueDate), 'MMM d, yyyy') 
                          : 'No due date'
                        }
                      </span>
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
                      <span className="capitalize">{task.priority || 'none'}</span>
                    </div>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={`capitalize ml-2 ${
                    task.status === 'completed' 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                  }`}
                >
                  {task.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground font-medium">No upcoming tasks</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Tasks due in the next 7 days will appear here
            </p>
          </div>
        )}
        
        <div className="mt-4 text-center">
          <button 
            type="button"
            className="text-sm text-primary hover:underline"
            onClick={() => {
              // Navigate to tasks tab or page
              console.log('View all tasks clicked');
            }}
          >
            View all tasks →
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingTasksWidget;