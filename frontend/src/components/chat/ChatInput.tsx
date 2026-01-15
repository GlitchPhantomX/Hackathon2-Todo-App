'use client';

import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import VoiceInput from '@/components/chat/VoiceInput';
import { useChat } from '@/contexts/ChatContext';

interface ChatInputProps {
  onSendMessage: (content: string, voiceInput?: boolean) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { language, voiceEnabled } = useChat();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent, isVoiceInput: boolean = false) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim(), isVoiceInput);
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e, false);
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    console.log('🎤 Voice transcript received:', transcript);
    setMessage(transcript);
    
    // Auto-send after voice input (optional)
    setTimeout(() => {
      if (transcript.trim()) {
        const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
        onSendMessage(transcript.trim(), true);
        setMessage('');
      }
    }, 500);
  };

  const isRTL = language === 'ur';

  return (
    <div 
      className="border-t p-4"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--card)'
      }}
    >
      <form onSubmit={(e) => handleSubmit(e, false)} className="max-w-4xl mx-auto">
        <div className="flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              language === 'ur' 
                ? 'اپنے کاموں کو منظم کرنے کے لیے مجھ سے پوچھیں...'
                : 'Ask me to manage your tasks...'
            }
            disabled={disabled}
            rows={1}
            dir={isRTL ? 'rtl' : 'ltr'}
            className="flex-1 resize-none border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 disabled:opacity-50 min-h-[48px] max-h-[120px] overflow-hidden transition-all"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)',
              height: 'auto',
              minHeight: '48px',
              '--tw-ring-color': 'var(--primary)'
            } as React.CSSProperties}
          />

          {/* Voice Input Button */}
          {voiceEnabled && (
            <VoiceInput
              onTranscript={handleVoiceTranscript}
              language={language === 'ur' ? 'ur' : 'en'}
              disabled={disabled}
              className="h-12 w-12 rounded-lg transition-colors"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--foreground)'
              }}
            />
          )}

          {/* Send Button */}
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className="h-12 w-12 rounded-lg text-white flex items-center justify-center transition-all disabled:cursor-not-allowed flex-shrink-0 shadow-md hover:shadow-lg"
            style={{
              background: !message.trim() || disabled 
                ? 'var(--muted)' 
                : 'linear-gradient(to right, var(--purple-600), var(--violet-600))',
              opacity: !message.trim() || disabled ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (message.trim() && !disabled) {
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>

        <p 
          className="text-xs mt-2 text-center" 
          dir={isRTL ? 'rtl' : 'ltr'}
          style={{ color: 'var(--muted-foreground)' }}
        >
          {language === 'ur'
            ? 'بھیجنے کے لیے Enter دبائیں • نئی لائن کے لیے Shift + Enter'
            : 'Press Enter to send • Shift + Enter for new line'}
          {voiceEnabled && (
            <span className="ml-2">
              {language === 'ur' ? '• آواز کے لیے مائیک کلک کریں 🎤' : '• Click mic for voice 🎤'}
            </span>
          )}
        </p>
      </form>
    </div>
  );
}