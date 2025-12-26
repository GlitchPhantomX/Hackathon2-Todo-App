'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useDashboard } from '@/contexts/DashboardContext';
import { 
  BellIcon, 
  CheckIcon, 
  EyeIcon, 
  CheckCircle2, 
  Circle,
  PlusCircle,
  Edit3,
  Trash2,
  Sparkles,
  Clock,
  Bell,
  BellOff,
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';

// 🔹 Notification Type Interface
interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  icon?: string;
  read: boolean;
  createdAt: string;
}

const NotificationDropdown = () => {
  const { 
    notifications = [],
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    loading = { notifications: false }
  } = useDashboard();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);

  // ✅ CRITICAL FIX: Sync local state with context state
  useEffect(() => {
    console.log('🔄 Notifications changed in context:', notifications);
    console.log('🔄 Count:', notifications.length);
    setLocalNotifications([...notifications]); // Force new array reference
  }, [notifications]);

  // 🐛 Debug local notifications
  useEffect(() => {
    console.log('📊 LOCAL notifications state updated:', localNotifications);
    console.log('📊 LOCAL count:', localNotifications.length);
  }, [localNotifications]);

  // ✅ Calculate unread count from local state
  const unreadCount = localNotifications.filter(n => !n.read).length;

  console.log('🔢 Unread count:', unreadCount);

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      if (markAllNotificationsAsRead) {
        await markAllNotificationsAsRead();
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Mark single as read
  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    try {
      if (markNotificationAsRead) {
        await markNotificationAsRead(id);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // ✅ Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    const iconClasses = "h-4 w-4";
    
    switch (type) {
      case 'task_created':
        return (
          <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
            <PlusCircle className={`${iconClasses} text-blue-600 dark:text-blue-400`} />
          </div>
        );
      case 'task_completed':
        return (
          <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className={`${iconClasses} text-green-600 dark:text-green-400`} />
          </div>
        );
      case 'task_updated':
        return (
          <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
            <Edit3 className={`${iconClasses} text-yellow-600 dark:text-yellow-400`} />
          </div>
        );
      case 'task_deleted':
        return (
          <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
            <Trash2 className={`${iconClasses} text-red-600 dark:text-red-400`} />
          </div>
        );
      case 'overdue':
        return (
          <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
            <Clock className={`${iconClasses} text-orange-600 dark:text-orange-400`} />
          </div>
        );
      case 'reminder':
        return (
          <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
            <Bell className={`${iconClasses} text-purple-600 dark:text-purple-400`} />
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

  // ✅ Smart date formatting
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      
      if (isNaN(date.getTime())) {
        return 'recently';
      }
      
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) {
        return 'Just now';
      }
      
      if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
      }
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        return `${diffInHours}h ago`;
      }
      
      if (isToday(date)) {
        return `Today at ${format(date, 'HH:mm')}`;
      }
      
      if (isYesterday(date)) {
        return `Yesterday at ${format(date, 'HH:mm')}`;
      }
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return format(date, 'EEEE') + ' at ' + format(date, 'HH:mm');
      }
      
      return format(date, 'MMM dd, HH:mm');
      
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'recently';
    }
  };

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-8 w-8 transition-transform hover:scale-110"
        >
          <BellIcon className="h-4 w-4" />
          {/* ✅ Dynamic unread count badge */}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold animate-pulse"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-96 max-h-[500px] overflow-y-auto"
        sideOffset={8}
      >
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-background z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-base">Notifications</h3>
            {/* ✅ Dynamic unread badge in header */}
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          
          {localNotifications.length > 0 && unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-7 text-xs hover:bg-primary/10"
              disabled={loading.notifications}
            >
              <CheckIcon className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="p-2">
          {loading.notifications && localNotifications.length === 0 ? (
            // Loading skeleton
            <div className="space-y-3 p-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : localNotifications.length > 0 ? (
            <div className="space-y-2">
              {/* ✅ Show latest 10 notifications */}
              {localNotifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`group relative p-3 rounded-lg border transition-all cursor-pointer ${
                    notification.read 
                      ? 'bg-muted/30 hover:bg-muted/50' 
                      : 'bg-background hover:bg-muted/30 border-primary/20'
                  }`}
                  onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Title with emoji */}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className={`text-sm font-medium leading-snug ${
                          notification.read ? 'text-muted-foreground' : 'text-foreground'
                        }`}>
                          {notification.icon && (
                            <span className="mr-1">{notification.icon}</span>
                          )}
                          {notification.title}
                        </p>
                        
                        {/* ✅ Unread indicator dot */}
                        {!notification.read && (
                          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary animate-pulse" />
                        )}
                      </div>

                      {/* Message */}
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {notification.message}
                      </p>

                      {/* Timestamp */}
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground/50" />
                        <span className="text-xs text-muted-foreground/70">
                          {formatTimestamp(notification.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Mark as read button */}
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Mark as read"
                      >
                        <CheckIcon className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Empty state
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                <BellOff className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                No notifications yet
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                We'll notify you when something important happens
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {localNotifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button 
                variant="ghost" 
                className="w-full justify-center text-sm hover:bg-primary/10"
                onClick={() => {
                  console.log('View all notifications');
                  setDropdownOpen(false);
                }}
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;