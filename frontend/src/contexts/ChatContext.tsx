import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Conversation, ChatMessage, ChatContextType } from '../types/chat.types';
import chatService from '../services/chatService';

// Define action types
type ChatAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SENDING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONVERSATIONS'; payload: Conversation[] }
  | { type: 'SET_ACTIVE_CONVERSATION'; payload: string | null }
  | { type: 'SET_MESSAGES'; payload: ChatMessage[] }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
} = {
  conversations: [],
  activeConversationId: null,
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,
};

// Reducer function
const chatReducer = (state: typeof initialState, action: ChatAction): typeof initialState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_SENDING':
      return { ...state, isSending: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload };
    case 'SET_ACTIVE_CONVERSATION':
      return { ...state, activeConversationId: action.payload };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

// Create context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Provider component
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Initialize conversations on mount and restore last active chat
  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('🔵 Initializing chat conversations...');
        dispatch({ type: 'SET_LOADING', payload: true });
        const conversations = await chatService.getConversations();
        console.log('✅ Conversations loaded:', conversations);
        dispatch({ type: 'SET_CONVERSATIONS', payload: conversations });

        // Restore last conversation from localStorage
        const lastConversationId = localStorage.getItem('lastConversationId');
        if (lastConversationId) {
          const conversation = conversations.find(c => c.id === lastConversationId);
          if (conversation) {
            dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conversation.id });
            // Load messages for the restored conversation
            const messages = await chatService.getConversationMessages(conversation.id);
            dispatch({ type: 'SET_MESSAGES', payload: messages });
          }
        }
      } catch (error) {
        console.error('❌ Error initializing chat:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize chat';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initialize();
  }, []);

  // Save current conversation ID to localStorage when it changes
  useEffect(() => {
    if (state.activeConversationId) {
      localStorage.setItem('lastConversationId', state.activeConversationId);
    }
  }, [state.activeConversationId]);

  const createConversation = async () => {
    try {
      console.log('🔵 Creating new conversation...');
      dispatch({ type: 'SET_LOADING', payload: true });
      const newConversation = await chatService.createConversation();
      console.log('✅ Conversation created:', newConversation);
      dispatch({ type: 'SET_CONVERSATIONS', payload: [newConversation, ...state.conversations] });
      dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: newConversation.id });
      dispatch({ type: 'SET_MESSAGES', payload: [] });
    } catch (error) {
      console.error('❌ Error creating conversation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create conversation';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadConversation = async (id: string) => {
    try {
      console.log('🔵 Loading conversation:', id);
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: id });
      const messages = await chatService.getConversationMessages(id);
      console.log('✅ Messages loaded:', messages);
      dispatch({ type: 'SET_MESSAGES', payload: messages });
    } catch (error) {
      console.error('❌ Error loading conversation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load conversation';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      console.log('🔵 Deleting conversation:', id);
      dispatch({ type: 'SET_LOADING', payload: true });
      await chatService.deleteConversation(id);
      console.log('✅ Conversation deleted:', id);
      dispatch({
        type: 'SET_CONVERSATIONS',
        payload: state.conversations.filter(conv => conv.id !== id)
      });

      if (state.activeConversationId === id) {
        dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: null });
        dispatch({ type: 'CLEAR_MESSAGES' });
      }
    } catch (error) {
      console.error('❌ Error deleting conversation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete conversation';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateConversationTitle = async (id: string, title: string) => {
    try {
      console.log('🔵 Updating conversation title:', { id, title });
      const updatedConversation = await chatService.updateConversationTitle(id, title);
      console.log('✅ Conversation updated:', updatedConversation);
      dispatch({
        type: 'SET_CONVERSATIONS',
        payload: state.conversations.map(conv =>
          conv.id === id ? updatedConversation : conv
        )
      });
    } catch (error) {
      console.error('❌ Error updating conversation title:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update conversation title';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  const sendMessage = async (content: string) => {
    try {
      if (!content.trim()) return;

      console.log('🔵 Sending message:', { content });
      dispatch({ type: 'SET_SENDING', payload: true });

      // Create conversation if none exists
      let conversationId = state.activeConversationId;
      if (!conversationId) {
        console.log('🔵 No active conversation, creating new one...');
        const newConversation = await chatService.createConversation();
        console.log('✅ New conversation created:', newConversation);

        dispatch({ type: 'SET_CONVERSATIONS', payload: [newConversation, ...state.conversations] });
        dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: newConversation.id });
        conversationId = newConversation.id;

        // Update localStorage with new conversation ID
        localStorage.setItem('lastConversationId', newConversation.id);
      }

      // Add user message optimistically
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        session_id: conversationId,
        role: 'user',
        content,
        created_at: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_MESSAGE', payload: userMessage });

      console.log('🔵 Sending message to API...', { conversationId, content });

      // Send to backend
      const aiResponse = await chatService.sendMessage(conversationId, content);
      console.log('✅ AI response received:', aiResponse);

      // Add AI response
      dispatch({ type: 'ADD_MESSAGE', payload: aiResponse });

      // Update conversation timestamp
      dispatch({
        type: 'SET_CONVERSATIONS',
        payload: state.conversations.map(conv =>
          conv.id === conversationId
            ? { ...conv, updated_at: new Date().toISOString() }
            : conv
        )
      });
    } catch (error) {
      console.error('❌ Error sending message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_SENDING', payload: false });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    conversations: state.conversations,
    activeConversationId: state.activeConversationId,
    messages: state.messages,
    isLoading: state.isLoading,
    isSending: state.isSending,
    error: state.error,
    createConversation,
    loadConversation,
    deleteConversation,
    updateConversationTitle,
    sendMessage,
    clearError,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// Custom hook to use the chat context
export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};