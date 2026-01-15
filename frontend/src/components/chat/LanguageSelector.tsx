'use client';

import React from 'react';
import { Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LanguageSelectorProps {
  currentLanguage: 'en' | 'ur' | 'auto';
  onLanguageChange: (language: 'en' | 'ur' | 'auto') => void;
  className?: string;
}

const languages = [
  { code: 'auto', name: 'Auto Detect', flag: '🌐', nativeName: 'Auto' },
  { code: 'en', name: 'English', flag: '🇬🇧', nativeName: 'English' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰', nativeName: 'اردو' },
] as const;

export default function LanguageSelector({
  currentLanguage,
  onLanguageChange,
  className = ''
}: LanguageSelectorProps) {
  const currentLangConfig = languages.find(lang => lang.code === currentLanguage) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title={`Current language: ${currentLangConfig.name}`}
          className={className}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-base">{currentLangConfig.flag}</span>
            <Globe className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
          Select Language
        </div>
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className={`flex items-center justify-between cursor-pointer ${
              currentLanguage === lang.code ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{lang.flag}</span>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{lang.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400" dir={lang.code === 'ur' ? 'rtl' : 'ltr'}>
                  {lang.nativeName}
                </span>
              </div>
            </div>
            {currentLanguage === lang.code && (
              <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}