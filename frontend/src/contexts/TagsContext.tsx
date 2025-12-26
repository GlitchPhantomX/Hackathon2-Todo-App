'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { tagService } from '@/services/apiService';
import { Tag } from '@/types/types';
import { useAuth } from './AuthContext';

interface TagsState {
  tags: Tag[];
  loading: boolean;
  error: string | null;
}

interface TagsContextType {
  tags: Tag[];
  loading: boolean;
  error: string | null;
  createTag: (tag: Omit<Tag, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<void>;
  updateTag: (id: string, updates: Partial<Tag>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  fetchTags: () => Promise<void>;
}

// Action types
type TagsAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Tag[] }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'ADD_TAG'; payload: Tag }
  | { type: 'UPDATE_TAG'; payload: { id: string; updates: Partial<Tag> } }
  | { type: 'DELETE_TAG'; payload: string };

const TagsContext = createContext<TagsContextType | undefined>(undefined);

const tagsReducer = (state: TagsState, action: TagsAction): TagsState => {
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
        tags: action.payload,
        error: null,
      };
    case 'FETCH_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'ADD_TAG':
      return {
        ...state,
        tags: [...state.tags, action.payload],
      };
    case 'UPDATE_TAG':
      return {
        ...state,
        tags: state.tags.map(tag =>
          tag.id === action.payload.id ? { ...tag, ...action.payload.updates } : tag
        ),
      };
    case 'DELETE_TAG':
      return {
        ...state,
        tags: state.tags.filter(tag => tag.id !== action.payload),
      };
    default:
      return state;
  }
};

interface TagsProviderProps {
  children: ReactNode;
}

export const TagsProvider: React.FC<TagsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(tagsReducer, {
    tags: [],
    loading: false,
    error: null,
  });

  // Fetch tags
  const fetchTags = async () => {
    if (!user?.id) return;

    try {
      dispatch({ type: 'FETCH_START' });
      const tags = await tagService.getTags(user.id);
      dispatch({ type: 'FETCH_SUCCESS', payload: tags });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tags';
      dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
    }
  };

  // Create tag
  const createTag = async (tagData: Omit<Tag, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user?.id) return;

    try {
      const newTag = await tagService.createTag(user.id, {
        ...tagData,
        userId: user.id,
      });
      dispatch({ type: 'ADD_TAG', payload: newTag });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create tag';
      dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
    }
  };

  // Update tag
  const updateTag = async (id: string, updates: Partial<Tag>) => {
    if (!user?.id) return;

    try {
      const updatedTag = await tagService.updateTag(user.id, id, updates);
      dispatch({ type: 'UPDATE_TAG', payload: { id, updates } });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update tag';
      dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
    }
  };

  // Delete tag
  const deleteTag = async (id: string) => {
    if (!user?.id) return;

    try {
      await tagService.deleteTag(user.id, id);
      dispatch({ type: 'DELETE_TAG', payload: id });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete tag';
      dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
    }
  };

  // Load tags when user changes
  useEffect(() => {
    if (user?.id) {
      fetchTags();
    }
  }, [user?.id]);

  const value = {
    tags: state.tags,
    loading: state.loading,
    error: state.error,
    createTag,
    updateTag,
    deleteTag,
    fetchTags,
  };

  return (
    <TagsContext.Provider value={value}>
      {children}
    </TagsContext.Provider>
  );
};

export const useTags = () => {
  const context = useContext(TagsContext);
  if (context === undefined) {
    throw new Error('useTags must be used within a TagsProvider');
  }
  return context;
};