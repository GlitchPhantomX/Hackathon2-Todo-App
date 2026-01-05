'use client';
export const runtime = 'edge';

export const dynamic = 'force-dynamic';

import { ChatProvider, useChat } from '@/contexts/ChatContext';
import { TaskSyncProvider } from '@/contexts/TaskSyncContext';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatHeader from '@/components/chat/ChatHeader';
import MessageArea from '@/components/chat/MessageArea';
import ChatInput from '@/components/chat/ChatInput';
import ChatEmptyState from '@/components/chat/ChatEmptyState';
import ChatNavbar from '@/components/chat/ChatNavbar';
import { useEffect } from 'react';

function ChatContent() {
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
    sendMessage
  } = useChat();

  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;

  // Auto-load conversations on mount and restore last active chat
  useEffect(() => {
    // If conversations finished loading and none exist, create one
    if (!isLoading && conversations.length === 0 && !activeConversationId) {
      createConversation();
      return;
    }
  
    // If no active conversation but conversations exist, load the most recent one
    if (!activeConversationId && conversations.length > 0) {
      const mostRecentConversation = conversations.reduce((mostRecent, current) => {
        return new Date(current.updated_at) > new Date(mostRecent.updated_at)
          ? current
          : mostRecent;
      });
  
      loadConversation(mostRecentConversation.id);
    }
  }, [
    isLoading,
    conversations,
    activeConversationId,
    createConversation,
    loadConversation,
  ]);
  


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

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Chat Navbar */}
      <ChatNavbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Chat Sidebar - Collapsible */}
        <ChatSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onCreateConversation={createConversation}
          onLoadConversation={loadConversation}
          onDeleteConversation={deleteConversation}
          onRenameConversation={updateConversationTitle}
        />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeConversationId ? (
            <>
              <ChatHeader
                conversation={activeConversation}
                onUpdateTitle={(title) => updateConversationTitle(activeConversationId, title)}
                onDelete={() => deleteConversation(activeConversationId)}
                onArchive={() => updateConversationTitle(activeConversationId, activeConversation?.title || '')}
              />
              <MessageArea messages={messages} isLoading={isSending} />
              <ChatInput
                onSendMessage={sendMessage}
                disabled={isSending || isLoading}
              />
            </>
          ) : (
            <ChatEmptyState
              onSuggestedPromptClick={handleSuggestedPromptClick}
              onCreateNewChat={createConversation}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <TaskSyncProvider>
      <ChatProvider>
        <ChatContent />
      </ChatProvider>
    </TaskSyncProvider>
  );
}