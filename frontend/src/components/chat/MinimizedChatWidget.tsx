'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Maximize2, Send, Loader2, Trash2, Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useChat } from '@/contexts/ChatContext';
import { useTaskSync } from '@/contexts/TaskSyncContext';
import { useRouter } from 'next/navigation';
import VoiceInput from '@/components/chat/VoiceInput';

interface MinimizedChatWidgetProps {
  onClose?: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' }
];

export default function MinimizedChatWidget({ onClose }: MinimizedChatWidgetProps) {
  const router = useRouter();
  const { websocketStatus } = useTaskSync();
  const { 
    messages: contextMessages, 
    sendMessage, 
    isSending,
    language,
    setLanguage,
    voiceEnabled,
    setVoiceEnabled
  } = useChat();
  
  const [input, setInput] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setShowLanguageMenu(false);
      }
    };

    if (showLanguageMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showLanguageMenu]);

  // Load messages from localStorage
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

  // Auto-scroll to bottom
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
    await sendMessage(input, false);
    setInput('');
  };

  const handleVoiceTranscript = async (transcript: string) => {
    console.log('🎤 Voice transcript received:', transcript);
    setInput(transcript);
    
    if (transcript.trim()) {
      await sendMessage(transcript, true);
      setInput('');
    }
  };

  const handleExpand = () => {
    router.push('/chat');
    onClose?.();
  };

  const handleClearConversation = () => {
    if (window.confirm('Are you sure you want to clear this conversation?')) {
      localStorage.removeItem('chatMessages');
      setLocalMessages([]);
      window.location.reload();
    }
  };

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode);
    setShowLanguageMenu(false);
  };

  if (!isVisible) {
    return null;
  }

  const displayMessages = localMessages.length > 0 ? localMessages : contextMessages;
  const isRTL = language === 'ur';
  const currentLanguage = LANGUAGES.find(lang => lang.code === language) || LANGUAGES[0];

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 flex flex-col w-[380px] h-[550px] rounded-2xl shadow-2xl border overflow-hidden"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)'
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3.5 border-b"
        style={{
          background: 'linear-gradient(to right, var(--purple-600), var(--violet-600))',
          borderColor: 'rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Left Section - Icon & Title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative flex-shrink-0">
            <div 
              className="w-9 h-9 backdrop-blur-sm rounded-lg flex items-center justify-center ring-2"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                ringColor: 'rgba(255, 255, 255, 0.3)'
              }}
            >
              <MessageSquare className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
            </div>
            <span 
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: '#10b981' }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-white text-sm leading-tight truncate">
              {language === 'ur' ? 'AI اسسٹنٹ' : 'AI Assistant'}
            </h3>
            <p className="text-xs leading-tight truncate" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
              {language === 'ur' ? 'مدد کے لیے ہمیشہ تیار' : 'Always here to help'}
            </p>
          </div>
        </div>

        {/* Right Section - Action Buttons */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {/* Language Selector */}
          <div className="relative" ref={languageMenuRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              title="Change language"
              className="h-8 w-8 text-white transition-colors rounded-lg"
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Globe className="h-4 w-4" strokeWidth={2} />
            </Button>

            {/* Language Dropdown */}
            {showLanguageMenu && (
              <div 
                className="absolute top-full right-0 mt-2 w-48 rounded-lg shadow-xl border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)'
                }}
              >
                <div className="py-1">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className="w-full px-4 py-2.5 text-left flex items-center justify-between transition-colors group"
                      style={{ color: 'var(--foreground)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--muted)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">
                          {lang.nativeName}
                        </span>
                        <span 
                          className="text-xs"
                          style={{ color: 'var(--muted-foreground)' }}
                        >
                          {lang.name}
                        </span>
                      </div>
                      {language === lang.code && (
                        <Check 
                          className="h-4 w-4 flex-shrink-0" 
                          strokeWidth={2.5}
                          style={{ color: 'var(--primary)' }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Clear Conversation */}
          {displayMessages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearConversation}
              title="Clear conversation"
              className="h-8 w-8 text-white transition-colors rounded-lg"
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Trash2 className="h-4 w-4" strokeWidth={2} />
            </Button>
          )}

          {/* Expand */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExpand}
            title="Expand"
            className="h-8 w-8 text-white transition-colors rounded-lg"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Maximize2 className="h-4 w-4" strokeWidth={2} />
          </Button>

          {/* Close */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            title="Close"
            className="h-8 w-8 text-white transition-colors rounded-lg"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto p-5 space-y-4"
        style={{ backgroundColor: 'var(--muted)' }}
      >
        {displayMessages.length === 0 ? (
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
                <MessageSquare className="h-10 w-10 text-white" />
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
              className="text-sm leading-relaxed" 
              dir={isRTL ? 'rtl' : 'ltr'}
              style={{ color: 'var(--muted-foreground)' }}
            >
              {language === 'ur' 
                ? 'میں آپ کے کاموں کو بنانے، اپ ڈیٹ کرنے اور منظم کرنے میں مدد کر سکتا ہوں'
                : 'I can help you create, update, and manage your tasks efficiently.'}
            </p>
            {voiceEnabled && (
              <div 
                className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border"
                style={{
                  backgroundColor: 'var(--muted)',
                  borderColor: 'var(--primary)'
                }}
              >
                <span 
                  className="text-xs font-medium" 
                  dir={isRTL ? 'rtl' : 'ltr'}
                  style={{ color: 'var(--primary)' }}
                >
                  {language === 'ur' ? 'آواز کمانڈز فعال ہیں' : 'Voice commands enabled'}
                </span>
              </div>
            )}
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
                      ? 'text-white'
                      : 'border'
                  }`}
                  style={
                    message.role === 'user'
                      ? { background: 'linear-gradient(to bottom right, var(--purple-600), var(--violet-600))' }
                      : {
                          backgroundColor: 'var(--card)',
                          color: 'var(--foreground)',
                          borderColor: 'var(--border)'
                        }
                  }
                >
                  <p 
                    className="text-sm leading-relaxed whitespace-pre-wrap break-words"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {message.content}
                  </p>
                  <span 
                    className={`text-xs mt-2 block ${
                      message.role === 'user' ? '' : ''
                    }`}
                    style={
                      message.role === 'user'
                        ? { color: 'rgba(255, 255, 255, 0.7)' }
                        : { color: 'var(--muted-foreground)' }
                    }
                  >
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
                <div 
                  className="border rounded-2xl px-4 py-3 shadow-md"
                  style={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <span 
                        className="w-2.5 h-2.5 rounded-full animate-bounce" 
                        style={{ 
                          animationDelay: '0ms', 
                          animationDuration: '1s',
                          background: 'linear-gradient(to bottom right, var(--purple-600), var(--violet-600))'
                        }} 
                      />
                      <span 
                        className="w-2.5 h-2.5 rounded-full animate-bounce" 
                        style={{ 
                          animationDelay: '200ms', 
                          animationDuration: '1s',
                          background: 'linear-gradient(to bottom right, var(--purple-600), var(--violet-600))'
                        }} 
                      />
                      <span 
                        className="w-2.5 h-2.5 rounded-full animate-bounce" 
                        style={{ 
                          animationDelay: '400ms', 
                          animationDuration: '1s',
                          background: 'linear-gradient(to bottom right, var(--purple-600), var(--violet-600))'
                        }} 
                      />
                    </div>
                    <span 
                      className="text-sm font-medium"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      {language === 'ur' ? 'سوچ رہا ہے...' : 'Thinking...'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div 
        className="px-5 py-4 border-t"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--card)'
        }}
      >
        <div className="flex items-end gap-2">
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
              placeholder={language === 'ur' ? 'اپنا پیغام ٹائپ کریں...' : 'Type your message...'}
              className="min-h-[48px] max-h-[120px] resize-none rounded-xl border-2 focus:ring-0 px-4 py-3 text-sm transition-colors"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--muted)',
                color: 'var(--foreground)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
              dir={isRTL ? 'rtl' : 'ltr'}
              rows={1}
              disabled={isSending}
            />
          </div>
          
          {/* Voice Input Button */}
          {voiceEnabled && (
            <VoiceInput
              onTranscript={handleVoiceTranscript}
              language={language === 'ur' ? 'ur' : 'en'}
              disabled={isSending}
              className="h-12 w-12 rounded-xl"
            />
          )}
          
          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            size="icon"
            className="h-12 w-12 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl disabled:shadow-none"
            style={{
              background: !input.trim() || isSending 
                ? 'var(--muted)' 
                : 'linear-gradient(to bottom right, var(--purple-600), var(--violet-600))',
              opacity: !input.trim() || isSending ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (input.trim() && !isSending) {
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            ) : (
              <Send className="h-5 w-5 text-white" />
            )}
          </Button>
        </div>
        <p 
          className="text-xs mt-2 text-center" 
          dir={isRTL ? 'rtl' : 'ltr'}
          style={{ color: 'var(--muted-foreground)' }}
        >
          {language === 'ur' 
            ? 'بھیجنے کے لیے Enter دبائیں، نئی لائن کے لیے Shift+Enter'
            : 'Press Enter to send, Shift+Enter for new line'}
        </p>
      </div>
    </div>
  );
}