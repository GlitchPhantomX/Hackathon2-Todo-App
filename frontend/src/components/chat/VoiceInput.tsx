'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceInputProps {
  onTranscript: (transcript: string) => void;
  language?: string;
  disabled?: boolean;
  className?: string;
}

export default function VoiceInput({ 
  onTranscript, 
  language = 'en', 
  disabled = false,
  className = '' 
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = language === 'ur' ? 'ur-PK' : 'en-US';
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          console.log('🎤 Voice recognition started');
          setIsListening(true);
          setError(null);
          
          // Auto-stop after 10 seconds
          timeoutRef.current = setTimeout(() => {
            if (recognitionRef.current) {
              recognitionRef.current.stop();
            }
          }, 10000);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          console.log('🎤 Transcript:', transcript);
          
          if (transcript.trim()) {
            setIsProcessing(true);
            onTranscript(transcript);
          }
          
          setIsListening(false);
        };

        recognition.onerror = (event: any) => {
          console.error('🎤 Speech recognition error:', event.error);
          setIsListening(false);
          setIsProcessing(false);
          
          if (event.error === 'no-speech') {
            setError(language === 'ur' ? 'کوئی آواز نہیں سنی گئی' : 'No speech detected');
          } else if (event.error === 'not-allowed') {
            setError(language === 'ur' ? 'مائیکروفون کی اجازت نہیں' : 'Microphone access denied');
          } else {
            setError(language === 'ur' ? 'آواز کی خرابی' : 'Voice error');
          }
          
          // Clear error after 3 seconds
          setTimeout(() => setError(null), 3000);
        };

        recognition.onend = () => {
          console.log('🎤 Voice recognition ended');
          setIsListening(false);
          
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        };

        recognitionRef.current = recognition;
      } else {
        console.warn('Speech Recognition API not supported');
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [language, onTranscript]);

  // Update language when it changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language === 'ur' ? 'ur-PK' : 'en-US';
    }
  }, [language]);

  // Reset processing state when disabled changes
  useEffect(() => {
    if (disabled) {
      setIsProcessing(false);
    }
  }, [disabled]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError(language === 'ur' ? 'آواز کی حمایت نہیں' : 'Voice not supported');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start recognition:', err);
        setError(language === 'ur' ? 'مائیکروفون شروع نہیں ہو سکا' : 'Could not start microphone');
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  const isActive = isListening || isProcessing;

  return (
    <div className="relative">
      <Button
        onClick={toggleListening}
        disabled={disabled || isProcessing}
        size="icon"
        type="button"
        className={`${className} transition-all duration-200 relative overflow-hidden`}
        style={{
          background: isActive
            ? 'linear-gradient(to bottom right, var(--purple-600), var(--violet-600))'
            : 'var(--muted)',
          opacity: disabled ? 0.5 : 1,
          boxShadow: isActive ? '0 0 0 4px rgba(139, 92, 246, 0.2)' : 'none'
        }}
        onMouseEnter={(e) => {
          if (!disabled && !isProcessing && !isListening) {
            e.currentTarget.style.transform = 'scale(1.05)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title={
          isListening 
            ? (language === 'ur' ? 'سن رہا ہے...' : 'Listening...') 
            : (language === 'ur' ? 'آواز ان پٹ' : 'Voice input')
        }
      >
        {/* Pulse Animation */}
        {isListening && (
          <span 
            className="absolute inset-0 rounded-xl animate-ping"
            style={{
              background: 'linear-gradient(to bottom right, var(--purple-600), var(--violet-600))',
              opacity: 0.4
            }}
          />
        )}

        {/* Icon */}
        <span className="relative z-10">
          {isProcessing ? (
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          ) : isListening ? (
            <Mic className="h-5 w-5 text-white animate-pulse" strokeWidth={2.5} />
          ) : (
            <Mic 
              className="h-5 w-5" 
              strokeWidth={2} 
              style={{ color: 'var(--muted-foreground)' }}
            />
          )}
        </span>
      </Button>

      {/* Error Tooltip */}
      {error && (
        <div 
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200"
          style={{
            backgroundColor: 'var(--destructive)',
            color: 'white'
          }}
        >
          {error}
          <div 
            className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent"
            style={{
              borderTopColor: 'var(--destructive)'
            }}
          />
        </div>
      )}

      {/* Listening Indicator */}
      {isListening && (
        <div 
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white shadow-sm animate-pulse"
          style={{ backgroundColor: '#ef4444' }}
        />
      )}
    </div>
  );
}