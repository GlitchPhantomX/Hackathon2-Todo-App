'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Maximize2, Send, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useChat } from '@/contexts/ChatContext';
import { useTaskSync } from '@/contexts/TaskSyncContext';
import { useRouter } from 'next/navigation';

interface MinimizedChatWidgetProps {
  onClose?: () => void;
}

export default function MinimizedChatWidget({ onClose }: MinimizedChatWidgetProps) {
  const router = useRouter();
  const { websocketStatus } = useTaskSync();
  const { messages, sendMessage, isSending } = useChat();
  const [input, setInput] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasLoadedMessages = useRef(false);

  // Load messages from sessionStorage on mount (session = jab tak browser tab open hai)
  useEffect(() => {
    if (!hasLoadedMessages.current) {
      const savedMessages = sessionStorage.getItem('chatMessages');
      if (savedMessages) {
        try {
          const parsed = JSON.parse(savedMessages);
          // We can't restore messages to context since ChatContext doesn't have setMessages
          // So we'll skip this restoration and rely on the context to manage messages
        } catch (err) {
          console.error('Failed to load saved messages:', err);
        }
      }
      hasLoadedMessages.current = true;
    }
  }, []);

  // Save messages to sessionStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check for widget visibility state from sessionStorage
  useEffect(() => {
    const savedState = sessionStorage.getItem('chatWidgetState');
    if (savedState) {
      const state = JSON.parse(savedState);
      setIsVisible(state.isVisible ?? true);
    }
  }, []);

  // Save widget state to sessionStorage
  useEffect(() => {
    const state = {
      isVisible,
      lastUpdated: new Date().toISOString()
    };
    sessionStorage.setItem('chatWidgetState', JSON.stringify(state));
  }, [isVisible]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    await sendMessage(input);
    setInput('');
  };

  const handleExpand = () => {
    // Navigate to full chat page with context preserved
    router.push('/chat');
    onClose?.();
  };

  const handleClearConversation = () => {
    if (window.confirm('Are you sure you want to clear this conversation? This action cannot be undone.')) {
      // Clear from sessionStorage
      sessionStorage.removeItem('chatMessages');
      // We can't clear messages from context since ChatContext doesn't have setMessages
      // The conversation clearing should be handled by the ChatContext itself
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col w-96 h-[500px] bg-background border rounded-lg shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <div className="flex items-center gap-2">
          <div className="relative">
            <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">AI Assistant</h3>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearConversation}
              title="Clear conversation"
              className="hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExpand}
            title="Expand to full chat"
            className="hover:bg-blue-100 dark:hover:bg-blue-900/30"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            title="Close"
            className="hover:bg-red-100 dark:hover:bg-red-900/30"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-blue-50/30 dark:to-blue-950/10">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-400/20 rounded-full blur-xl animate-pulse" />
              <MessageSquare className="relative h-16 w-16 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Hi! I'm your AI task assistant.
            </p>
            <p className="text-xs text-muted-foreground">
              Ask me to create, update, or show your tasks.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                } animate-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <span className={`text-xs mt-1 block ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {message.created_at ?
                      new Date(message.created_at).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                      : 'Just now'}
                  </span>
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-sm p-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-white dark:bg-gray-900">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 min-h-[44px] max-h-[100px] resize-none rounded-xl border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
            rows={1}
            disabled={isSending}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            size="icon"
            className="h-11 w-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 transition-all"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}