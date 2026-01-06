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
import { useEffect, useState } from 'react';

// Storage keys (same as widget)
const STORAGE_KEYS = {
  MESSAGES: 'chatbot_messages',
  EXPAND_FLAG: 'chatbot_expand_flag'
};

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
    sendMessage,
    setMessages // ✅ Make sure this exists in your ChatContext
  } = useChat();

  const [hasRestoredFromWidget, setHasRestoredFromWidget] = useState(false);
  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;

  // ✅ First Priority: Check if user expanded from widget
  useEffect(() => {
    const expandFlag = localStorage.getItem(STORAGE_KEYS.EXPAND_FLAG);
    
    if (expandFlag === 'true' && !hasRestoredFromWidget) {
      console.log('🔍 Detected expand from widget, restoring messages...');
      
      const savedMessages = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      
      if (savedMessages) {
        try {
          const parsed = JSON.parse(savedMessages);
          
          if (parsed.length > 0) {
            createConversation().then(() => {
              setTimeout(() => {
                setMessages(parsed); // Set messages in context
                console.log('✅ Restored', parsed.length, 'messages from widget');
              }, 300);
            });
            
            setHasRestoredFromWidget(true);
          }
        } catch (err) {
          console.error('❌ Failed to restore messages:', err);
        }
      }
      
      // ✅ Clear the expand flag
      localStorage.removeItem(STORAGE_KEYS.EXPAND_FLAG);
    }
  }, [hasRestoredFromWidget, createConversation, setMessages]);

  // Auto-load conversations on mount and restore last active chat
  useEffect(() => {
    // ✅ Skip if we're restoring from widget
    if (hasRestoredFromWidget || localStorage.getItem(STORAGE_KEYS.EXPAND_FLAG) === 'true') {
      return;
    }

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
    hasRestoredFromWidget
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