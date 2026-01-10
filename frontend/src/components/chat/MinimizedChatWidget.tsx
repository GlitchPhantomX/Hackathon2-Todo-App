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

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export default function MinimizedChatWidget({ onClose }: MinimizedChatWidgetProps) {
  const router = useRouter();
  const { websocketStatus } = useTaskSync();
  const { messages: contextMessages, sendMessage, isSending } = useChat();
  const [input, setInput] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load messages from localStorage on mount (permanent storage)
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setLocalMessages(parsed);
      } catch (err) {
        console.error('Failed to load saved messages:', err);
      }
    }
  }, []);

  // Sync context messages with local storage
  useEffect(() => {
    if (contextMessages.length > 0) {
      setLocalMessages(contextMessages);
      localStorage.setItem('chatMessages', JSON.stringify(contextMessages));
    }
  }, [contextMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    await sendMessage(input);
    setInput('');
  };

  const handleExpand = () => {
    router.push('/chat');
    onClose?.();
  };

  const handleClearConversation = () => {
    if (window.confirm('Are you sure you want to clear this conversation? This action cannot be undone.')) {
      localStorage.removeItem('chatMessages');
      setLocalMessages([]);
      window.location.reload();
    }
  };

  if (!isVisible) {
    return null;
  }

  const displayMessages = localMessages.length > 0 ? localMessages : contextMessages;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col w-[380px] h-[550px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-indigo-500 to-purple-600">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-base">AI Assistant</h3>
            <p className="text-xs text-white/80">Always here to help</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {displayMessages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearConversation}
              title="Clear conversation"
              className="h-8 w-8 hover:bg-white/20 text-white"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExpand}
            title="Expand"
            className="h-8 w-8 hover:bg-white/20 text-white"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            title="Close"
            className="h-8 w-8 hover:bg-white/20 text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50 dark:bg-gray-950">
        {displayMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-2xl" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <MessageSquare className="h-10 w-10 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Welcome to AI Assistant
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              I can help you create, update, and manage your tasks efficiently.
            </p>
          </div>
        ) : (
          <>
            {displayMessages.map((message, index) => (
              <div
                key={message.id || index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                } animate-in fade-in slide-in-from-bottom-3 duration-500`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                  <span className={`text-xs mt-2 block ${
                    message.role === 'user' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {message.created_at
                      ? new Date(message.created_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Just now'}
                  </span>
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start animate-in fade-in slide-in-from-bottom-3 duration-500">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1s' }} />
                      <span className="w-2.5 h-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1s' }} />
                      <span className="w-2.5 h-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1s' }} />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your message..."
              className="min-h-[48px] max-h-[120px] resize-none rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-0 px-4 py-3 text-sm bg-gray-50 dark:bg-gray-950 transition-colors"
              rows={1}
              disabled={isSending}
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            size="icon"
            className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-700 dark:disabled:to-gray-800 shadow-lg transition-all duration-200 hover:shadow-xl disabled:shadow-none"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            ) : (
              <Send className="h-5 w-5 text-white" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}