"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  Menu,
  Home,
  Settings,
  User,
  Minimize2,
  Maximize2,
  HomeIcon,
  LayoutDashboardIcon,
  Globe,
  Check
} from "lucide-react";
import { useChat } from "@/contexts/ChatContext";

interface ChatNavbarProps {
  minimized?: boolean;
  onMinimize?: () => void;
  onExpand?: () => void;
}

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' }
];

export default function ChatNavbar({
  minimized = false,
  onMinimize,
  onExpand,
}: ChatNavbarProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement>(null);
  
  const { language, setLanguage } = useChat();

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

  const handleToggleChat = () => {
    if (minimized && onExpand) {
      onExpand();
    } else if (!minimized && onMinimize) {
      onMinimize();
    } else {
      router.push("/new-dashboard");
    }
  };

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode);
    setShowLanguageMenu(false);
  };

  const currentLanguage = LANGUAGES.find(lang => lang.code === language) || LANGUAGES[0];

  return (
    <nav 
      className="relative z-40 flex items-center justify-between px-4 py-3 border-b"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)'
      }}
    >
      {/* Left: Brand */}
      <Link
        href="/chat"
        className="flex items-center gap-3 focus:outline-none"
      >
        <div 
          className="h-9 w-9 rounded-xl flex items-center justify-center shadow-sm"
          style={{
            background: 'linear-gradient(to bottom right, var(--purple-600), var(--violet-600))'
          }}
        >
          <HomeIcon className="h-4 w-4 text-white" />
        </div>
        <span 
          className="text-lg font-bold tracking-tight bg-clip-text text-transparent"
          style={{
            background: 'linear-gradient(to right, var(--purple-600), var(--violet-600))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {language === 'ur' ? 'AI ٹوڈو ماسٹر' : 'AITodoMaster'}
        </span>
      </Link>

      {/* Center: Title */}
      <div className="hidden sm:flex flex-1 justify-center">
        <h1 
          className="text-sm sm:text-base font-semibold"
          style={{ color: 'var(--foreground)' }}
        >
          {language === 'ur' ? 'چیٹ اسسٹنٹ' : 'Chat Assistant'}
        </h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Language Selector */}
        <div className="relative" ref={languageMenuRef}>
          <button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            aria-label="Change language"
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--foreground)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--muted)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Globe className="h-5 w-5" />
          </button>

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

        {/* Minimize / Expand */}
        <button
          onClick={handleToggleChat}
          aria-label={minimized ? "Expand chat" : "Minimize chat"}
          className="p-2 rounded-lg transition-colors"
          style={{ color: 'var(--foreground)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--muted)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {minimized ? (
            <Maximize2 className="h-5 w-5" />
          ) : (
            <Minimize2 className="h-5 w-5" />
          )}
        </button>

        {/* Settings */}
        <button
          aria-label="Settings"
          className="p-2 rounded-lg transition-colors"
          style={{ color: 'var(--foreground)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--muted)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Settings className="h-5 w-5" />
        </button>

        <Link
          href={"/"}
          aria-label="Home"
          className="p-2 rounded-lg transition-colors"
          style={{ color: 'var(--foreground)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--muted)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <HomeIcon className="h-5 w-5" />
        </Link>

        <Link
          href={"/new-dashboard"}
          aria-label="Dashboard"
          className="p-2 rounded-lg transition-colors"
          style={{ color: 'var(--foreground)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--muted)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <LayoutDashboardIcon className="h-5 w-5" />
        </Link>

        {/* User */}
        <div 
          className="hidden md:flex items-center gap-2 pl-2 border-l"
          style={{ borderColor: 'var(--border)' }}
        >
          <div 
            className="h-8 w-8 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(to bottom right, var(--purple-600), var(--violet-600))'
            }}
          >
            <User className="h-4 w-4 text-white" />
          </div>
          <span 
            className="text-sm font-medium"
            style={{ color: 'var(--foreground)' }}
          >
            {language === 'ur' ? 'صارف' : 'User'}
          </span>
        </div>

        {/* Mobile Menu */}
        <button
          onClick={() => setIsMenuOpen((p) => !p)}
          aria-label="Open menu"
          className="md:hidden p-2 rounded-lg transition-colors"
          style={{ color: 'var(--foreground)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--muted)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isMenuOpen && (
        <div 
          className="absolute right-4 top-14 w-52 rounded-xl border shadow-xl md:hidden overflow-hidden"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)'
          }}
        >
          <button
            onClick={() => router.push("/new-dashboard")}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors"
            style={{ color: 'var(--foreground)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--muted)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Home className="h-4 w-4" />
            {language === 'ur' ? 'ڈیش بورڈ' : 'Dashboard'}
          </button>

          <button
            className="flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors"
            style={{ color: 'var(--foreground)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--muted)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Settings className="h-4 w-4" />
            {language === 'ur' ? 'ترتیبات' : 'Settings'}
          </button>
        </div>
      )}
    </nav>
  );
}