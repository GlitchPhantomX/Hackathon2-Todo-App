"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  Menu,
  Home,
  Settings,
  User,
  Minimize2,
  Maximize2,
  HomeIcon,
  LayoutDashboardIcon
} from "lucide-react";

interface ChatNavbarProps {
  minimized?: boolean;
  onMinimize?: () => void;
  onExpand?: () => void;
}

export default function ChatNavbar({
  minimized = false,
  onMinimize,
  onExpand,
}: ChatNavbarProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleToggleChat = () => {
    if (minimized && onExpand) {
      onExpand();
    } else if (!minimized && onMinimize) {
      onMinimize();
    } else {
      router.push("/new-dashboard");
    }
  };

  return (
    <nav className="relative z-40 flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      {/* Left: Brand */}
      <Link
        href="/chat"
        className="flex items-center gap-3 focus:outline-none"
      >
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-sm">
          <HomeIcon className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          AITodoMaster
        </span>
      </Link>

      {/* Center: Title */}
      <div className="hidden sm:flex flex-1 justify-center">
        <h1 className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-200">
          Chat Assistant
        </h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Minimize / Expand */}
        <button
          onClick={handleToggleChat}
          aria-label={minimized ? "Expand chat" : "Minimize chat"}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          {minimized ? (
            <Maximize2 className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <Minimize2 className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>

        {/* Settings */}
        <button
          aria-label="Settings"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
        <Link
        href={"/"}
          aria-label="Settings"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <HomeIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </Link>
        <Link
        href={"/new-dashboard"}
          aria-label="Settings"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <LayoutDashboardIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </Link>

        {/* User */}
        <div className="hidden md:flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            User
          </span>
        </div>

        {/* Mobile Menu */}
        <button
          onClick={() => setIsMenuOpen((p) => !p)}
          aria-label="Open menu"
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isMenuOpen && (
        <div className="absolute right-4 top-14 w-52 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl md:hidden overflow-hidden">
          <button
            onClick={() => router.push("/new-dashboard")}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </button>

          <button
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
        </div>
      )}
    </nav>
  );
}
