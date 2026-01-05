'use client';

import { useRouter } from 'next/navigation';
import { Menu, Home, Settings, User, Minimize2, Maximize2 } from 'lucide-react';
import { useState } from 'react';

interface ChatNavbarProps {
  minimized?: boolean;
  onMinimize?: () => void;
  onExpand?: () => void;
}

export default function ChatNavbar({
  minimized = false,
  onMinimize,
  onExpand
}: ChatNavbarProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMinimize = () => {
    if (onMinimize) {
      onMinimize();
    } else {
      // Default behavior: redirect to dashboard
      router.push('/new-dashboard');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
      {/* Left section - Logo and title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
            <span className="text-white font-bold text-lg">AI</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">AI Task Assistant</span>
        </div>
      </div>

      {/* Center section - Chat title (when applicable) */}
      <div className="flex-1 flex justify-center">
        <h1 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          Chat Assistant
        </h1>
      </div>

      {/* Right section - User profile and actions */}
      <div className="flex items-center gap-3">
        {/* Minimize button */}
        <button
          onClick={handleMinimize}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Minimize chat"
        >
          <Minimize2 className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Settings button */}
        <button
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Settings"
        >
          <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>

        {/* User profile */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden md:block">
            User
          </span>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={toggleMenu}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors md:hidden"
          title="Menu"
        >
          <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {isMenuOpen && (
        <div className="absolute top-16 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 w-48 z-10 md:hidden">
          <button
            onClick={() => router.push('/new-dashboard')}
            className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </button>
          <button
            className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
        </div>
      )}
    </nav>
  );
}