import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  taskService,
  projectService,
  tagService,
  statsService,
  notificationService,
  userPreferencesService
} from '@/services/apiService';
import { useAuth } from '@/contexts/AuthContext';

// Custom hook to access query client
export const useApi = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Task queries and mutations
  const useTasks = () => {
    return useQuery({
      queryKey: ['tasks', user?.id],
      queryFn: () => taskService.getTasks(user?.id || ''),
      enabled: !!user?.id,
    });
  };

  const useTask = (taskId: string) => {
    return useQuery({
      queryKey: ['task', taskId, user?.id],
      queryFn: () => taskService.getTask(user?.id || '', taskId),
      enabled: !!user?.id && !!taskId,
    });
  };

  const useCreateTask = () => {
    return useMutation({
      mutationFn: (data: any) => taskService.createTask(user?.id || '', data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
      },
    });
  };

  const useUpdateTask = () => {
    return useMutation({
      mutationFn: ({ taskId, data }: { taskId: string; data: any }) =>
        taskService.updateTask(user?.id || '', taskId, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['stats', user?.id] });
      },
    });
  };

  const useDeleteTask = () => {
    return useMutation({
      mutationFn: (taskId: string) => taskService.deleteTask(user?.id || '', taskId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['stats', user?.id] });
      },
    });
  };

  const useToggleTaskCompletion = () => {
    return useMutation({
      mutationFn: (taskId: string) => taskService.toggleTaskCompletion(user?.id || '', taskId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['stats', user?.id] });
      },
    });
  };

  // Project queries and mutations
  const useProjects = () => {
    return useQuery({
      queryKey: ['projects', user?.id],
      queryFn: () => projectService.getProjects(user?.id || ''),
      enabled: !!user?.id,
    });
  };

  const useCreateProject = () => {
    return useMutation({
      mutationFn: (data: any) => projectService.createProject(user?.id || '', data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
      },
    });
  };

  const useUpdateProject = () => {
    return useMutation({
      mutationFn: ({ projectId, data }: { projectId: string; data: any }) =>
        projectService.updateProject(user?.id || '', projectId, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
      },
    });
  };

  const useDeleteProject = () => {
    return useMutation({
      mutationFn: (projectId: string) => projectService.deleteProject(user?.id || '', projectId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
      },
    });
  };

  // Tag queries and mutations
  const useTags = () => {
    return useQuery({
      queryKey: ['tags', user?.id],
      queryFn: () => tagService.getTags(user?.id || ''),
      enabled: !!user?.id,
    });
  };

  const useCreateTag = () => {
    return useMutation({
      mutationFn: (data: any) => tagService.createTag(user?.id || '', data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tags', user?.id] });
      },
    });
  };

  const useUpdateTag = () => {
    return useMutation({
      mutationFn: ({ tagId, data }: { tagId: string; data: any }) =>
        tagService.updateTag(user?.id || '', tagId, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tags', user?.id] });
      },
    });
  };

  const useDeleteTag = () => {
    return useMutation({
      mutationFn: (tagId: string) => tagService.deleteTag(user?.id || '', tagId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tags', user?.id] });
      },
    });
  };

  // Stats queries
  const useStats = () => {
    return useQuery({
      queryKey: ['stats', user?.id],
      queryFn: () => statsService.getStats(user?.id || ''),
      enabled: !!user?.id,
      refetchInterval: 30000, // Refetch every 30 seconds
    });
  };

  // Notification queries and mutations
  const useNotifications = (unreadOnly: boolean = false, limit: number = 10) => {
    return useQuery({
      queryKey: ['notifications', user?.id, unreadOnly, limit],
      queryFn: () => notificationService.getNotifications(user?.id || '', unreadOnly, limit),
      enabled: !!user?.id,
    });
  };

  const useCreateNotification = () => {
    return useMutation({
      mutationFn: (data: any) => notificationService.createNotification(user?.id || '', data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      },
    });
  };

  const useMarkNotificationAsRead = () => {
    return useMutation({
      mutationFn: (notificationId: string) =>
        notificationService.markNotificationAsRead(user?.id || '', notificationId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      },
    });
  };

  const useDeleteNotification = () => {
    return useMutation({
      mutationFn: (notificationId: string) =>
        notificationService.deleteNotification(user?.id || '', notificationId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      },
    });
  };

  // User preferences queries and mutations
  const useUserPreferences = () => {
    return useQuery({
      queryKey: ['userPreferences', user?.id],
      queryFn: () => userPreferencesService.getUserPreferences(user?.id || ''),
      enabled: !!user?.id,
    });
  };

  const useUpdateUserPreferences = () => {
    return useMutation({
      mutationFn: (data: any) => userPreferencesService.updateUserPreferences(user?.id || '', data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['userPreferences', user?.id] });
      },
    });
  };

  return {
    // Tasks
    useTasks,
    useTask,
    useCreateTask,
    useUpdateTask,
    useDeleteTask,
    useToggleTaskCompletion,

    // Projects
    useProjects,
    useCreateProject,
    useUpdateProject,
    useDeleteProject,

    // Tags
    useTags,
    useCreateTag,
    useUpdateTag,
    useDeleteTag,

    // Stats
    useStats,

    // Notifications
    useNotifications,
    useCreateNotification,
    useMarkNotificationAsRead,
    useDeleteNotification,

    // User preferences
    useUserPreferences,
    useUpdateUserPreferences,
  };
};