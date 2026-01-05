"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useDashboard } from "@/contexts/DashboardContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  // DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HomeIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  // LogOutIcon,
  // UserIcon,
  // SettingsIcon,
  // HelpCircleIcon,
  XIcon,
  SearchIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import NotificationDropdown from "./NotificationDropdown";
import KeyboardShortcuts from "./KeyboardShortcuts";

// Debounced callback hook
const useDebouncedCallback = (
  callback: (...args: any[]) => void,
  delay: number
) => {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update callback if it changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(
        () => callbackRef.current(...args),
        delay
      );
    },
    [delay]
  );
};

const DashboardNavbar = () => {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { tasks } = useDashboard();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  const debouncedSearch = useDebouncedCallback((query: string) => {
    if (query.trim()) {
      console.log("Searching for:", query);
      // In a real app, this would trigger a search action
    }
  }, 300);


  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Submitting search for:", searchQuery);
      // In a real app, this would trigger a search action
    }
  };

  // Handle clearing search
  const handleClearSearch = () => {
    setSearchQuery("");
  };

  // Handle click outside to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Keyboard shortcuts state
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ✅ Prevent shortcuts when typing in input fields
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return; // Don't process shortcuts when typing
      }
  
      // Global shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "k":
            e.preventDefault();
            setIsSearchOpen(true);
            break;
          case "n":
            e.preventDefault();
            console.log("New task shortcut");
            break;
          case "/":
            e.preventDefault();
            setShowShortcutsModal(true);
            break;
          case "b":
            e.preventDefault();
            console.log("Toggle sidebar shortcut");
            break;
          case "d":
            e.preventDefault();
            setTheme(theme === "dark" ? "light" : "dark");
            break;
        }
      } else if (e.key === "Escape") {
        setIsSearchOpen(false);
        setShowShortcutsModal(false);
      }
      // ✅ Disable G + C calendar shortcut (or remove completely)
      // else if (e.key === "g") {
      //   const handleGPress = (gEvent: KeyboardEvent) => {
      //     if (gEvent.key === "d") {
      //       window.location.href = "/dashboard";
      //     } else if (gEvent.key === "t") {
      //       window.location.href = "/tasks";
      //     } 
      //     // REMOVED: Calendar navigation
      //     // else if (gEvent.key === "c") {
      //     //   window.location.href = "/calendar";
      //     // }
      //     else if (gEvent.key === "s") {
      //       window.location.href = "/statistics";
      //     }
      //   };
      //   window.addEventListener("keyup", (gEvent) => {
      //     handleGPress(gEvent);
      //     window.removeEventListener("keyup", handleGPress);
      //   });
      // }
    };
  
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [theme, setTheme]);

  // Get user initials
  const getUserInitials = () => {
    if (!user) return "U";
    if (user.name) return user.name.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  // Get user avatar (handle both avatar and profilePicture fields)
  const getUserAvatar = () => {
    if (!user) return "";
    // Check for different possible avatar field names
    return user.avatar || "";
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex items-center h-16 px-4 w-full max-w-full">
          {/* Left section */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                <HomeIcon className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
                TodoMaster
              </span>
            </Link>
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link href="/dashboard">
                <HomeIcon className="h-4 w-4" />
                <span className="sr-only">Home</span>
              </Link>
            </Button>
          </div>

          {/* Center - search bar */}
          <div className="flex-1 mx-4" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative w-full">
              <Input
                type="text"
                placeholder="Search tasks, projects, tags..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setIsSearchOpen(true)}
                className="w-full h-11 pl-10 pr-10 py-2 rounded-lg border bg-background"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <SearchIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              )}
            </form>
          </div>

          {/* Right section - fully right */}
          <div className="flex items-center gap-2 ml-auto">
            <NotificationDropdown />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8 transition-transform duration-300"
            >
              {theme === "dark" ? (
                <SunIcon className="h-4 w-4 rotate-0 scale-100 transition-all" />
              ) : (
                <MoonIcon className="h-4 w-4 rotate-180 scale-100 transition-all" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-auto px-3 gap-2">
                  <Avatar className="h-8 w-8 border border-primary">
                    <AvatarImage
                      src={getUserAvatar()}
                      alt={user?.name || user?.email || "User"}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                {/* dropdown content unchanged */}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <KeyboardShortcuts
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />
    </>
  );
};

export default DashboardNavbar;
