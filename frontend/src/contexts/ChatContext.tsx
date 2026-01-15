import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Conversation, ChatMessage, ChatContextType } from '../types/chat.types';
import chatService from '../services/chatService';

// ✅ NEW: Extended action types for language and voice
type ChatAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SENDING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONVERSATIONS'; payload: Conversation[] }
  | { type: 'SET_ACTIVE_CONVERSATION'; payload: string | null }
  | { type: 'SET_MESSAGES'; payload: ChatMessage[] }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LANGUAGE'; payload: 'en' | 'ur' | 'auto' }  // ✅ NEW
  | { type: 'SET_VOICE_ENABLED'; payload: boolean }  // ✅ NEW
  | { type: 'SET_VOICE_RECORDING'; payload: boolean };  // ✅ NEW

// ✅ NEW: Extended initial state
const initialState: {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  language: 'en' | 'ur' | 'auto';  // ✅ NEW
  voiceEnabled: boolean;  // ✅ NEW
  isVoiceRecording: boolean;  // ✅ NEW
} = {
  conversations: [],
  activeConversationId: null,
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,
  language: 'auto',  // ✅ NEW: Auto-detect by default
  voiceEnabled: true,  // ✅ NEW: Voice enabled by default
  isVoiceRecording: false,  // ✅ NEW
};

// ✅ Enhanced reducer
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
    case 'SET_LANGUAGE':  // ✅ NEW
      return { ...state, language: action.payload };
    case 'SET_VOICE_ENABLED':  // ✅ NEW
      return { ...state, voiceEnabled: action.payload };
    case 'SET_VOICE_RECORDING':  // ✅ NEW
      return { ...state, isVoiceRecording: action.payload };
    default:
      return state;
  }
};

// Create context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Provider component
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // ✅ Load language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('chatLanguage') as 'en' | 'ur' | 'auto' | null;
    if (savedLanguage) {
      dispatch({ type: 'SET_LANGUAGE', payload: savedLanguage });
    }

    const voiceEnabled = localStorage.getItem('voiceEnabled');
    if (voiceEnabled !== null) {
      dispatch({ type: 'SET_VOICE_ENABLED', payload: voiceEnabled === 'true' });
    }
  }, []);

  // Initialize conversations on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('🔵 Initializing chat conversations...');
        dispatch({ type: 'SET_LOADING', payload: true });
        const conversations = await chatService.getConversations();
        console.log('✅ Conversations loaded:', conversations);
        dispatch({ type: 'SET_CONVERSATIONS', payload: conversations });

        const lastConversationId = localStorage.getItem('lastConversationId');
        if (lastConversationId) {
          const conversation = conversations.find(c => c.id === lastConversationId);
          if (conversation) {
            dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conversation.id });
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

  // Save language preference when it changes
  useEffect(() => {
    localStorage.setItem('chatLanguage', state.language);
  }, [state.language]);

  // Save voice preference when it changes
  useEffect(() => {
    localStorage.setItem('voiceEnabled', state.voiceEnabled.toString());
  }, [state.voiceEnabled]);

  // Save current conversation ID
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

  // ✅ ENHANCED: Send message with language and voice support
  const sendMessage = async (content: string, voiceInput: boolean = false) => {
    try {
      if (!content.trim()) return;

      console.log('🔵 Sending message:', { content, language: state.language, voiceInput });
      dispatch({ type: 'SET_SENDING', payload: true });

      let conversationId = state.activeConversationId;
      if (!conversationId) {
        console.log('🔵 No active conversation, creating new one...');
        const newConversation = await chatService.createConversation();
        console.log('✅ New conversation created:', newConversation);

        dispatch({ type: 'SET_CONVERSATIONS', payload: [newConversation, ...state.conversations] });
        dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: newConversation.id });
        conversationId = newConversation.id;
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

      console.log('🔵 Sending message to API...', { conversationId, content, language: state.language, voiceInput });

      // ✅ Send with language and voice flags
      const aiResponse = await chatService.sendMessage(
        conversationId, 
        content,
        state.language,  // ✅ Pass language preference
        voiceInput  // ✅ Pass voice input flag
      );
      
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

  // ✅ NEW: Language management functions
  const setLanguage = (language: 'en' | 'ur' | 'auto') => {
    console.log('🌍 Setting language to:', language);
    dispatch({ type: 'SET_LANGUAGE', payload: language });
  };

  const toggleLanguage = () => {
    const newLang = state.language === 'en' ? 'ur' : 'en';
    console.log('🌍 Toggling language to:', newLang);
    dispatch({ type: 'SET_LANGUAGE', payload: newLang });
  };

  // ✅ NEW: Voice management functions
  const setVoiceEnabled = (enabled: boolean) => {
    console.log('🎤 Setting voice enabled:', enabled);
    dispatch({ type: 'SET_VOICE_ENABLED', payload: enabled });
  };

  const setVoiceRecording = (recording: boolean) => {
    dispatch({ type: 'SET_VOICE_RECORDING', payload: recording });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const setMessages = (messages: ChatMessage[]) => {
    dispatch({ type: 'SET_MESSAGES', payload: messages });
  };

  const value = {
    conversations: state.conversations,
    activeConversationId: state.activeConversationId,
    messages: state.messages,
    isLoading: state.isLoading,
    isSending: state.isSending,
    error: state.error,
    language: state.language,  // ✅ NEW
    voiceEnabled: state.voiceEnabled,  // ✅ NEW
    isVoiceRecording: state.isVoiceRecording,  // ✅ NEW
    createConversation,
    loadConversation,
    deleteConversation,
    updateConversationTitle,
    sendMessage,
    setLanguage,  // ✅ NEW
    toggleLanguage,  // ✅ NEW
    setVoiceEnabled,  // ✅ NEW
    setVoiceRecording,  // ✅ NEW
    clearError,
    setMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// Custom hook
export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};