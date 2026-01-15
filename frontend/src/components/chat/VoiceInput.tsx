'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  language?: 'en' | 'ur';
  disabled?: boolean;
  className?: string;
}

export default function VoiceInput({
  onTranscript,
  language = 'en',
  disabled = false,
  className = ''
}: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if browser supports speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.maxAlternatives = 1;
        
        // Set language based on prop
        recognitionRef.current.lang = language === 'ur' ? 'ur-PK' : 'en-US';
        
        console.log('🎤 Speech Recognition initialized with language:', recognitionRef.current.lang);
      } else {
        console.warn('⚠️ Speech Recognition not supported in this browser');
      }
    }
  }, [language]);

  // Update language when prop changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language === 'ur' ? 'ur-PK' : 'en-US';
      console.log('🌍 Language updated to:', recognitionRef.current.lang);
    }
  }, [language]);

  const startRecording = () => {
    if (!isSupported || !recognitionRef.current || disabled) return;

    setError(null);
    setIsRecording(true);

    try {
      recognitionRef.current.start();
      console.log('🎤 Recording started');

      // Auto-stop after 10 seconds
      timeoutRef.current = setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
      }, 10000);

      // Handle results
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('📝 Transcript:', transcript);
        
        onTranscript(transcript);
        setIsRecording(false);
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };

      // Handle errors
      recognitionRef.current.onerror = (event: any) => {
        console.error('❌ Speech recognition error:', event.error);
        
        let errorMessage = 'Voice input error';
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not available. Please check permissions.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please enable microphone permissions.';
            break;
          case 'network':
            errorMessage = 'Network error. Please check your connection.';
            break;
          default:
            errorMessage = `Error: ${event.error}`;
        }
        
        setError(errorMessage);
        setIsRecording(false);
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };

      // Handle end
      recognitionRef.current.onend = () => {
        console.log('🎤 Recording ended');
        setIsRecording(false);
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };

    } catch (err) {
      console.error('❌ Failed to start recording:', err);
      setError('Failed to start recording');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop();
        console.log('🛑 Recording stopped manually');
      } catch (err) {
        console.error('❌ Error stopping recording:', err);
      }
    }
    
    setIsRecording(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (recognitionRef.current && isRecording) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording]);

  if (!isSupported) {
    return (
      <Button
        variant="ghost"
        size="icon"
        disabled
        title="Voice input not supported in this browser"
        className={className}
      >
        <MicOff className="h-5 w-5 text-gray-400" />
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled}
        title={isRecording ? 'Stop recording' : 'Start voice input'}
        className={`${className} ${isRecording ? 'bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30' : ''}`}
      >
        {isRecording ? (
          <div className="relative">
            <Mic className="h-5 w-5 text-red-600 dark:text-red-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
          </div>
        ) : (
          <Mic className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        )}
      </Button>

      {/* Recording indicator */}
      {isRecording && (
        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <div className="bg-red-600 text-white text-xs px-3 py-1 rounded-full flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Listening...
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-xs px-3 py-1 rounded-full shadow-lg">
            {error}
          </div>
        </div>
      )}
    </div>
  );
}