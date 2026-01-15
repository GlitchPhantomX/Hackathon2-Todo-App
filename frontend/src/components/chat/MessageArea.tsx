'use client';

import { ChatMessage } from '@/types/chat.types';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useEffect, useRef } from 'react';
import { useChat } from '@/contexts/ChatContext';

interface MessageAreaProps {
  messages: ChatMessage[];
  isLoading?: boolean;
}

export default function MessageArea({ messages, isLoading }: MessageAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { language } = useChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const isRTL = language === 'ur';

  return (
    <div 
      className="flex-1 overflow-y-auto p-4 space-y-4"
      style={{ backgroundColor: 'var(--muted)' }}
    >
      {messages.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center h-full text-center px-6">
          <div className="relative mb-6">
            <div 
              className="absolute inset-0 rounded-full blur-2xl"
              style={{
                background: 'linear-gradient(to right, var(--purple-500), var(--violet-500))',
                opacity: 0.1
              }}
            />
            <div 
              className="relative w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl"
              style={{
                background: 'linear-gradient(to bottom right, var(--purple-600), var(--violet-600))'
              }}
            >
              <Bot className="h-10 w-10 text-white" />
            </div>
          </div>
          <h3 
            className="text-lg font-semibold mb-2" 
            dir={isRTL ? 'rtl' : 'ltr'}
            style={{ color: 'var(--foreground)' }}
          >
            {language === 'ur' ? 'AI اسسٹنٹ میں خوش آمدید' : 'Welcome to AI Assistant'}
          </h3>
          <p 
            className="text-sm leading-relaxed max-w-md" 
            dir={isRTL ? 'rtl' : 'ltr'}
            style={{ color: 'var(--muted-foreground)' }}
          >
            {language === 'ur'
              ? 'میں آپ کے کاموں کو بنانے، اپ ڈیٹ کرنے اور منظم کرنے میں مدد کر سکتا ہوں۔'
              : 'I can help you create, update, and manage your tasks efficiently.'}
          </p>
        </div>
      )}

      {messages.map((message, index) => (
        <div
          key={`${message.id}-${index}`}
          className={`flex gap-3 ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          } animate-in fade-in slide-in-from-bottom-2 duration-300`}
        >
          {message.role === 'assistant' && (
            <div className="flex-shrink-0">
              <div 
                className="h-8 w-8 rounded-full flex items-center justify-center shadow-md"
                style={{
                  background: 'linear-gradient(to right, var(--purple-600), var(--violet-600))'
                }}
              >
                <Bot className="h-5 w-5 text-white" />
              </div>
            </div>
          )}

          <div
            className={`max-w-3xl rounded-2xl px-4 py-3 shadow-sm border ${
              message.role === 'user'
                ? 'text-white'
                : ''
            }`}
            style={{
              backgroundColor: message.role === 'user' 
                ? 'var(--primary)' 
                : 'var(--card)',
              borderColor: message.role === 'user'
                ? 'var(--primary)'
                : 'var(--border)',
              ...(message.role === 'user' 
                ? { background: 'linear-gradient(to right, var(--purple-600), var(--violet-600))' }
                : {})
            }}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {message.role === 'assistant' ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p 
                        className="mb-2 last:mb-0" 
                        dir={isRTL ? 'rtl' : 'ltr'}
                        style={{ color: 'var(--foreground)' }}
                      >
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul 
                        className="list-disc pl-4 mb-2" 
                        dir={isRTL ? 'rtl' : 'ltr'}
                        style={{ color: 'var(--foreground)' }}
                      >
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol 
                        className="list-decimal pl-4 mb-2" 
                        dir={isRTL ? 'rtl' : 'ltr'}
                        style={{ color: 'var(--foreground)' }}
                      >
                        {children}
                      </ol>
                    ),
                    strong: ({ children }) => (
                      <strong 
                        className="font-semibold"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em 
                        className="italic"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        {children}
                      </em>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="whitespace-pre-wrap">{message.content}</p>
            )}
            
            {/* Timestamp */}
            <span className={`text-xs mt-2 block ${
              message.role === 'user' ? 'text-white/70' : ''
            }`}
            style={message.role === 'assistant' ? { color: 'var(--muted-foreground)' } : {}}
            >
              {message.created_at
                ? new Date(message.created_at).toLocaleTimeString(
                    language === 'ur' ? 'ur-PK' : 'en-US',
                    { hour: '2-digit', minute: '2-digit' }
                  )
                : language === 'ur' ? 'ابھی' : 'Just now'}
            </span>
          </div>

          {message.role === 'user' && (
            <div className="flex-shrink-0">
              <div 
                className="h-8 w-8 rounded-full flex items-center justify-center shadow-md"
                style={{ backgroundColor: 'var(--muted)' }}
              >
                <User 
                  className="h-5 w-5"
                  style={{ color: 'var(--muted-foreground)' }}
                />
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Loading Animation */}
      {isLoading && (
        <div className="flex gap-3 justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex-shrink-0">
            <div 
              className="h-8 w-8 rounded-full flex items-center justify-center animate-pulse shadow-md"
              style={{
                background: 'linear-gradient(to right, var(--purple-600), var(--violet-600))'
              }}
            >
              <Bot className="h-5 w-5 text-white" />
            </div>
          </div>
          <div 
            className="max-w-3xl rounded-2xl px-4 py-3 border shadow-sm"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)'
            }}
          >
            <div className="flex gap-1.5">
              <div 
                className="h-2.5 w-2.5 rounded-full animate-bounce" 
                style={{ 
                  animationDelay: '0s', 
                  animationDuration: '1s',
                  background: 'linear-gradient(to right, var(--purple-600), var(--violet-600))'
                }}
              />
              <div 
                className="h-2.5 w-2.5 rounded-full animate-bounce" 
                style={{ 
                  animationDelay: '0.2s', 
                  animationDuration: '1s',
                  background: 'linear-gradient(to right, var(--purple-600), var(--violet-600))'
                }}
              />
              <div 
                className="h-2.5 w-2.5 rounded-full animate-bounce" 
                style={{ 
                  animationDelay: '0.4s', 
                  animationDuration: '1s',
                  background: 'linear-gradient(to right, var(--purple-600), var(--violet-600))'
                }}
              />
            </div>
            <p 
              className="text-xs mt-2" 
              dir={isRTL ? 'rtl' : 'ltr'}
              style={{ color: 'var(--muted-foreground)' }}
            >
              {language === 'ur' ? 'سوچ رہا ہے...' : 'Thinking...'}
            </p>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}