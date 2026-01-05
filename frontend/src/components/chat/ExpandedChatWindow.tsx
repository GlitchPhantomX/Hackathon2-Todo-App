'use client';

import { useState, useEffect } from 'react';
import { X, Minimize, ExternalLink, Wifi, WifiOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ChatProvider, useChat } from '@/contexts/ChatContext';
import { TaskSyncProvider, useTaskSync } from '@/contexts/TaskSyncContext';
// import ChatHeader from '@/components/chat/ChatHeader';
import MessageArea from '@/components/chat/MessageArea';
import ChatInput from '@/components/chat/ChatInput';
import ChatEmptyState from '@/components/chat/ChatEmptyState';

interface ExpandedChatWindowProps {
  onClose: () => void;
  onMinimize: () => void;
}

function ExpandedChatContent({ onClose, onMinimize }: ExpandedChatWindowProps) {
  const router = useRouter();
  const { websocketStatus } = useTaskSync();
  const {
    conversations,
    activeConversationId,
    messages,
    isLoading,
    isSending,
    createConversation,
    loadConversation,
    deleteConversation,
    updateConversationTitle,
    sendMessage,
    error
  } = useChat();

  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;

  const handleSuggestedPromptClick = (prompt: string) => {
    if (!activeConversationId) {
      createConversation().then(() => {
        setTimeout(() => {
          sendMessage(prompt);
        }, 300);
      });
    } else {
      sendMessage(prompt);
    }
  };

  const handleExpandToFullPage = () => {
    // Close the expanded widget and redirect to full chat page
    onClose();
    router.push('/chat');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl bg-white dark:bg-gray-800 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-1 rounded">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">AI Assistant</span>
          {/* WebSocket status indicator */}
          <div className="ml-2 flex items-center">
            {websocketStatus === 'connected' ? (
              <div className="flex items-center gap-1 text-green-600 text-xs">
                <Wifi className="h-3 w-3" />
                <span>Synced</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-yellow-600 text-xs">
                <WifiOff className="h-3 w-3" />
                <span>Offline</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleExpandToFullPage}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
            title="Open in full page"
          >
            <ExternalLink className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={onMinimize}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
            title="Minimize"
          >
            <Minimize className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
            title="Close"
          >
            <X className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeConversationId ? (
          <>
            <div className="flex-1 overflow-y-auto">
              <MessageArea messages={messages} isLoading={isSending} />
            </div>
            <ChatInput
              onSendMessage={sendMessage}
              disabled={isSending || isLoading}
            />
          </>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <ChatEmptyState
              onSuggestedPromptClick={handleSuggestedPromptClick}
              onCreateNewChat={createConversation}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExpandedChatWindow({ onClose, onMinimize }: ExpandedChatWindowProps) {
  return (
    <TaskSyncProvider>
      <ChatProvider>
        <ExpandedChatContent onClose={onClose} onMinimize={onMinimize} />
      </ChatProvider>
    </TaskSyncProvider>
  );
}