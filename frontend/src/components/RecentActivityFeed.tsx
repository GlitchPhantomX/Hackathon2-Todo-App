import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDashboard } from '@/contexts/DashboardContext';
import { useAuth } from '@/contexts/AuthContext';
import { format, isToday, isYesterday } from 'date-fns';
import {
  CheckCircle2,
  Circle,
  PlusCircle,
  Edit3,
  Trash2,
  Flag,
  Calendar,
  Activity as ActivityIcon
} from 'lucide-react';

interface Activity {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  action: 'created' | 'completed' | 'updated' | 'deleted' | 'priority_changed';
  taskTitle: string;
  field?: string;
  newValue?: string;
  timestamp: string;
}

const RecentActivityFeed: React.FC = () => {
  const { tasks, loading } = useDashboard();
  const { user } = useAuth();

  const isLoading = loading.tasks;

  const getUserName = (): string => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0] || 'You';
    return 'You';
  };

  const getUserAvatar = (): string => {
    return user?.avatar ||
           '';
  };

  const userName: string = getUserName();
  const userAvatar: string = getUserAvatar();

  const generateActivities = (): Activity[] => {
    const activities: Activity[] = [];

    tasks.forEach(task => {
      if (task.createdAt) {
        activities.push({
          id: `${task.id}-created`,
          userId: task.userId,
          userName,
          userAvatar,
          action: 'created',
          taskTitle: task.title,
          timestamp: task.createdAt,
        });
      }

      if (task.status === 'completed' && task.updatedAt) {
        activities.push({
          id: `${task.id}-completed`,
          userId: task.userId,
          userName,
          userAvatar,
          action: 'completed',
          taskTitle: task.title,
          timestamp: task.updatedAt,
        });
      }

      if (task.updatedAt && task.createdAt && task.updatedAt !== task.createdAt) {
        const activityData: Activity = {
          id: `${task.id}-updated`,
          userId: task.userId,
          userName,
          userAvatar,
          action: 'updated',
          taskTitle: task.title,
          timestamp: task.updatedAt,
        };
        
        if (task.status) {
          activityData.field = 'details';
          activityData.newValue = task.status;
        }
        
        activities.push(activityData);
      }
    });

    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  };

  const activities = generateActivities();

  const getActionIcon = (action: Activity['action']) => {
    const iconClasses = "h-4 w-4";
    
    switch (action) {
      case 'created':
        return (
          <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
            <PlusCircle className={`${iconClasses} text-blue-600 dark:text-blue-400`} />
          </div>
        );
      case 'completed':
        return (
          <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className={`${iconClasses} text-green-600 dark:text-green-400`} />
          </div>
        );
      case 'updated':
        return (
          <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
            <Edit3 className={`${iconClasses} text-yellow-600 dark:text-yellow-400`} />
          </div>
        );
      case 'deleted':
        return (
          <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
            <Trash2 className={`${iconClasses} text-red-600 dark:text-red-400`} />
          </div>
        );
      case 'priority_changed':
        return (
          <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
            <Flag className={`${iconClasses} text-orange-600 dark:text-orange-400`} />
          </div>
        );
      default:
        return (
          <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
            <Circle className={`${iconClasses} text-gray-600 dark:text-gray-400`} />
          </div>
        );
    }
  };

  const getActionText = (activity: Activity) => {
    switch (activity.action) {
      case 'created':
        return 'created task';
      case 'completed':
        return 'completed';
      case 'updated':
        return 'updated';
      case 'deleted':
        return 'deleted';
      case 'priority_changed':
        return `changed priority to ${activity.newValue}`;
      default:
        return activity.action;
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) {
        return 'Just now';
      }
      
      if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
      }
      
      if (isToday(date)) {
        return `Today at ${format(date, 'HH:mm')}`;
      }
      
      if (isYesterday(date)) {
        return `Yesterday at ${format(date, 'HH:mm')}`;
      }
      
      const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diffInDays < 7) {
        return format(date, 'EEEE') + ' at ' + format(date, 'HH:mm');
      }
      
      return format(date, 'MMM dd, yyyy HH:mm');
      
    } catch (error) {
      console.error('Error formatting timestamp:', error, timestamp);
      return 'Unknown time';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ActivityIcon className="h-5 w-5" />
            Recent Activity
          </CardTitle>
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
        <CardTitle className="flex items-center gap-2">
          <ActivityIcon className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
              >
                <Avatar className="h-9 w-9 mt-0.5 border-2 border-background shadow-sm">
                  <AvatarImage src={activity.userAvatar} alt={activity.userName} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-sm">
                    {activity.userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm leading-relaxed">
                    <span className="font-semibold text-foreground">
                      {activity.userName}
                    </span>
                    {' '}
                    <span className="text-muted-foreground">
                      {getActionText(activity)}
                    </span>
                    {' '}
                    <span className="font-medium text-foreground">
                      &quot;{activity.taskTitle}&quot;
                    </span>
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground font-medium">
                      {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {getActionIcon(activity.action)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
              <ActivityIcon className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground font-medium">No recent activity</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Your task actions will appear here
            </p>
          </div>
        )}
        
        {activities.length > 0 && (
          <div className="mt-4 pt-4 border-t text-center">
            <button 
              type="button"
              className="text-sm text-primary hover:text-primary/80 hover:underline font-medium transition-colors"
              onClick={() => console.log('View all activity')}
            >
              View all activity →
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivityFeed;