'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { projectService } from '@/services/apiService';
import { Project } from '@/types/types';
import { useAuth } from './AuthContext';

interface ProjectsState {
  projects: Project[];
  loading: boolean;
  error: string | null;
}

interface ProjectsContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  fetchProjects: () => Promise<void>;
}

// Action types
type ProjectsAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Project[] }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: { id: string; updates: Partial<Project> } }
  | { type: 'DELETE_PROJECT'; payload: string };

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

const projectsReducer = (state: ProjectsState, action: ProjectsAction): ProjectsState => {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        projects: action.payload,
        error: null,
      };
    case 'FETCH_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'ADD_PROJECT':
      return {
        ...state,
        projects: [...state.projects, action.payload],
      };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.id ? { ...project, ...action.payload.updates } : project
        ),
      };
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(project => project.id !== action.payload),
      };
    default:
      return state;
  }
};

interface ProjectsProviderProps {
  children: ReactNode;
}

export const ProjectsProvider: React.FC<ProjectsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(projectsReducer, {
    projects: [],
    loading: false,
    error: null,
  });

  // Fetch projects
  const fetchProjects = async () => {
    if (!user?.id) return;

    try {
      dispatch({ type: 'FETCH_START' });
      const projects = await projectService.getProjects(user.id);
      dispatch({ type: 'FETCH_SUCCESS', payload: projects });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch projects';
      dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
    }
  };

  // Create project
  const createProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user?.id) return;

    try {
      const newProject = await projectService.createProject(user.id, {
        ...projectData,
        userId: user.id,
      });
      dispatch({ type: 'ADD_PROJECT', payload: newProject });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create project';
      dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
    }
  };

  // Update project
  const updateProject = async (id: string, updates: Partial<Project>) => {
    if (!user?.id) return;

    try {
      const updatedProject = await projectService.updateProject(user.id, id, updates);
      dispatch({ type: 'UPDATE_PROJECT', payload: { id, updates } });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update project';
      dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
    }
  };

  // Delete project
  const deleteProject = async (id: string) => {
    if (!user?.id) return;

    try {
      await projectService.deleteProject(user.id, id);
      dispatch({ type: 'DELETE_PROJECT', payload: id });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete project';
      dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
    }
  };

  // Load projects when user changes
  useEffect(() => {
    if (user?.id) {
      const loadProjects = async () => {
        try {
          dispatch({ type: 'FETCH_START' });
          const projects = await projectService.getProjects(user.id);
          dispatch({ type: 'FETCH_SUCCESS', payload: projects });

          // If no projects exist, create default projects
          if (projects.length === 0) {
            const defaultProjects = [
              { name: 'Work', description: 'Work-related tasks', color: '#3B82F6', icon: 'Briefcase' },
              { name: 'Personal', description: 'Personal tasks', color: '#10B981', icon: 'Home' },
              { name: 'Study', description: 'Study and learning tasks', color: '#8B5CF6', icon: 'BookOpen' }
            ];

            for (const projectData of defaultProjects) {
              try {
                const newProject = await projectService.createProject(user.id, {
                  ...projectData,
                  userId: user.id,
                });
                dispatch({ type: 'ADD_PROJECT', payload: newProject });
              } catch (error) {
                console.error('Error creating default project:', error);
              }
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch projects';
          dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
        }
      };

      loadProjects();
    }
  }, [user?.id]);

  const value = {
    projects: state.projects,
    loading: state.loading,
    error: state.error,
    createProject,
    updateProject,
    deleteProject,
    fetchProjects,
  };

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
};