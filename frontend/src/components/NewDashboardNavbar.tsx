"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useDashboard } from "@/contexts/DashboardContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  HomeIcon,
  SunIcon,
  MoonIcon,
  LogOutIcon,
  UserIcon,
  SettingsIcon,
  XIcon,
  SearchIcon,
  CheckCircle2,
  Circle,
  Clock,
  FolderIcon,
  ArrowRight,
  MessageCircle,
  Home
} from "lucide-react";
import { Input } from "@/components/ui/input";
import NotificationDropdown from "./NotificationDropdown";
import KeyboardShortcuts from "./KeyboardShortcuts";
import { format } from "date-fns";

// Debounced callback hook
const useDebouncedCallback = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number
) => {
  const callbackRef = useRef<T>(callback);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
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

const NewDashboardNavbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const { tasks, projects, createTaskNotification, notifications } =
    useDashboard(); // ✅ Added createTaskNotification and notifications
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<(
    | { type: 'task'; id: string; title: string; description?: string; status: string; priority?: string; dueDate?: string }
    | { type: 'project'; id: string; title: string; description?: string; color?: string }
    | { type: 'action'; id: string; title: string; icon?: string; action: () => void }
  )[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // ✅ Debug notifications on mount and changes
  useEffect(() => {
    console.log("🎯 NAVBAR: Notifications updated:", notifications);
    console.log("🎯 NAVBAR: Notifications count:", notifications?.length || 0);
  }, [notifications]);

  const basePath = pathname.startsWith("/new-dashboard")
    ? "/new-dashboard"
    : "";

  const constructRoute = useCallback((path: string) => {
    if (path.startsWith("/")) {
      if (basePath && !path.startsWith(basePath) && path !== "/") {
        return `${basePath}${path}`;
      }
      return path;
    }
    return path;
  }, [basePath]);

  // ✅ Test notification function
  const handleTestNotification = () => {
    console.log("🧪 TEST BUTTON CLICKED - Creating test notification");
    const notificationTypes = [
      "created",
      "updated",
      "completed",
      "deleted",
    ] as const;
    const randomIndex = Math.floor(Math.random() * notificationTypes.length);
    // Use a type assertion since we know the array is non-empty and index is valid
    const randomType = notificationTypes[randomIndex] as "created" | "updated" | "completed" | "deleted";
    const testTaskTitle = `Test Task ${Date.now()}`;

    console.log(
      "🧪 Calling createTaskNotification with:",
      randomType,
      testTaskTitle
    );
    createTaskNotification(randomType, testTaskTitle, `test_${Date.now()}`);
    console.log("🧪 createTaskNotification called successfully");
  };

  // ✅ Enhanced search function with multiple result types
  const performSearch = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setSelectedIndex(-1);
        return;
      }

      const lowerQuery = query.toLowerCase();
      const results: (
    | { type: 'task'; id: string; title: string; description?: string; status: string; priority?: string; dueDate?: string }
    | { type: 'project'; id: string; title: string; description?: string; color?: string }
    | { type: 'action'; id: string; title: string; icon?: string; action: () => void }
  )[] = [] as (
    | { type: 'task'; id: string; title: string; description?: string; status: string; priority?: string; dueDate?: string }
    | { type: 'project'; id: string; title: string; description?: string; color?: string }
    | { type: 'action'; id: string; title: string; icon?: string; action: () => void }
  )[];

      // Search tasks
      const matchedTasks: (
    | { type: 'task'; id: string; title: string; description?: string; status: string; priority?: string; dueDate?: string }
    | { type: 'project'; id: string; title: string; description?: string; color?: string }
    | { type: 'action'; id: string; title: string; icon?: string; action: () => void }
  )[] = tasks
        .filter((task) => {
          const matchesTitle = task.title.toLowerCase().includes(lowerQuery);
          const matchesDescription =
            task.description?.toLowerCase().includes(lowerQuery) || false;
          const matchesTags =
            task.tags?.some((tag: string | { name: string }) =>
              typeof tag === "string"
                ? tag.toLowerCase().includes(lowerQuery)
                : typeof tag === "object" && tag.name
                  ? tag.name.toLowerCase().includes(lowerQuery)
                  : false
            ) || false;
          const matchesPriority =
            task.priority?.toLowerCase().includes(lowerQuery) || false;

          return (
            matchesTitle || matchesDescription || matchesTags || matchesPriority
          );
        })
        .slice(0, 5)
        .map((task) => ({
          type: "task" as const,
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status as string,
          priority: task.priority as string | undefined,
          dueDate: task.dueDate,
        })) as any; // Cast to avoid exactOptionalPropertyTypes issues

      results.push(...matchedTasks);

      // Search projects
      const matchedProjects: (
    | { type: 'task'; id: string; title: string; description?: string; status: string; priority?: string; dueDate?: string }
    | { type: 'project'; id: string; title: string; description?: string; color?: string }
    | { type: 'action'; id: string; title: string; icon?: string; action: () => void }
  )[] = projects
        .filter(
          (project) =>
            project.name.toLowerCase().includes(lowerQuery) ||
            project.description?.toLowerCase().includes(lowerQuery)
        )
        .slice(0, 3)
        .map((project) => ({
          type: "project" as const,
          id: project.id,
          title: project.name,
          description: project.description as string | undefined,
          color: project.color,
        })) as any; // Cast to avoid exactOptionalPropertyTypes issues

      results.push(...matchedProjects);

      // Quick actions
      const quickActions = [
        {
          type: "action" as const,
          id: "new-task",
          title: "Create New Task",
          icon: "plus",
          action: () => console.log("Create task"),
        },
        {
          type: "action" as const,
          id: "view-all",
          title: "View All Tasks",
          icon: "list",
          action: () => router.push(constructRoute("/new-dashboard")),
        },
      ].filter((action) => action.title.toLowerCase().includes(lowerQuery));

      if (quickActions.length > 0) {
        results.push(...quickActions);
      }

      setSearchResults(results);
      setSelectedIndex(-1);
    },
    [tasks, projects, router, basePath]
  );

  // Debounced search
  const debouncedSearch = useDebouncedCallback(performSearch, 300);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Handle keyboard navigation in search results
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (searchResults.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && searchResults[selectedIndex]) {
          handleResultClick(searchResults[selectedIndex]);
        }
        break;
      case "Escape":
        setIsSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
        break;
    }
  };

  // Handle result click
  const handleResultClick = (result: { type: 'task'; id: string; title: string; description?: string; status: string; priority?: string; dueDate?: string } | { type: 'project'; id: string; title: string; description?: string; color?: string } | { type: 'action'; id: string; title: string; icon?: string; action: () => void }) => {
    if (result.type === "task") {
      console.log("Open task:", result.id);
      setIsSearchOpen(false);
      setSearchQuery("");
      setSearchResults([]);
    } else if (result.type === "project") {
      router.push(constructRoute(`/new-dashboard/projects/${result.id}`));
      setIsSearchOpen(false);
      setSearchQuery("");
      setSearchResults([]);
    } else if (result.type === "action") {
      result.action();
      setIsSearchOpen(false);
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && searchResults.length > 0) {
      const firstResult = searchResults[0];
      if (firstResult) {
        handleResultClick(firstResult);
      }
    }
  };

  // Handle clearing search
  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedIndex(-1);
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
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "k":
            e.preventDefault();
            setIsSearchOpen(true);
            setTimeout(() => {
              const searchInput = document.querySelector(
                'input[type="text"]'
              ) as HTMLInputElement;
              if (searchInput) searchInput.focus();
            }, 100);
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
        handleClearSearch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [theme, setTheme, setIsSearchOpen, setShowShortcutsModal, handleClearSearch]);

  // Get user initials
  const getUserInitials = () => {
    if (!user) return "U";
    if (user.name) return user.name.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  // Get user avatar
  const getUserAvatar = () => {
    if (!user) return "";
    return (
      user.avatar ||
      ""
    );
  };

  // Handle logout
  const handleLogout = () => {
    if (logout) {
      logout();
    }
    window.location.href = "/login";
  };

  // ✅ Get icon for search result
  const getResultIcon = (result: { type: 'task'; id: string; title: string; description?: string; status: string; priority?: string; dueDate?: string } | { type: 'project'; id: string; title: string; description?: string; color?: string } | { type: 'action'; id: string; title: string; icon?: string; action: () => void }) => {
    if (result.type === "task") {
      return result.status === "completed" ? (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      ) : (
        <Circle className="h-4 w-4 text-muted-foreground" />
      );
    } else if (result.type === "project") {
      return <FolderIcon className="h-4 w-4 text-blue-500" />;
    } else if (result.type === "action") {
      return <ArrowRight className="h-4 w-4 text-purple-500" />;
    }
    return <SearchIcon className="h-4 w-4" />;
  };

  // ✅ Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "low":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <>
      {!mounted ? null : (
        <>
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="container flex flex-col md:flex-row items-center h-auto md:h-16 px-4 w-full max-w-full gap-2 py-2 md:py-0">
              {/* Left section */}
              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                <Link href="/new-dashboard" className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                    <HomeIcon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
                    TodoMaster
                  </span>
                </Link>

                {/* Mobile search toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="h-8 w-8 md:hidden"
                >
                  <SearchIcon className="h-4 w-4" />
                </Button>
              </div>

              {/* ✅ Enhanced search bar with dropdown */}
              <div
                className={`${
                  isSearchOpen ? "flex" : "hidden md:flex"
                } flex-1 mx-0 md:mx-4 w-full md:w-auto relative`}
                ref={searchRef}
              >
                <form onSubmit={handleSearch} className="relative w-full">
                  <Input
                    type="text"
                    placeholder="Search tasks, projects... (Ctrl+K)"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={handleSearchKeyDown}
                    onFocus={() => setIsSearchOpen(true)}
                    className="w-full h-11 pl-10 pr-10 py-2 rounded-lg border bg-background"
                    autoComplete="off"
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

                {/* ✅ Search Results Dropdown */}
                {isSearchOpen && searchQuery && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                    {searchResults.map((result, index) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        type="button"
                        onClick={() => handleResultClick(result)}
                        className={`w-full flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors border-b last:border-b-0 text-left ${
                          index === selectedIndex ? "bg-muted/50" : ""
                        }`}
                      >
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-1">
                          {getResultIcon(result)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm truncate">
                              {result.title}
                            </p>
                            {result.type === 'task' && result.priority && (
                              <Badge
                                variant="secondary"
                                className={`text-xs px-2 py-0 ${getPriorityColor(
                                  result.priority
                                )}`}
                              >
                                {result.priority}
                              </Badge>
                            )}
                          </div>
                          {(result.type !== 'action' && result.description) && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {result.description}
                            </p>
                          )}
                          {result.type === 'task' && result.dueDate && (
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {format(
                                  new Date(result.dueDate),
                                  "MMM dd, yyyy"
                                )}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Type badge */}
                        <Badge
                          variant="outline"
                          className="text-xs flex-shrink-0"
                        >
                          {result.type}
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}

                {/* No results message */}
                {isSearchOpen && searchQuery && searchResults.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg p-8 text-center z-50">
                    <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No results found for "
                      <span className="font-medium">{searchQuery}</span>"
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Try different keywords
                    </p>
                  </div>
                )}
              </div>

              {/* Right section */}
              <div className="flex items-center gap-2 ml-auto">
              
                <button
                  onClick={() => router.push("/chat")} 
                  className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                  aria-label="AI Assistant"
                  title="AI Assistant"
                >
                  <MessageCircle className="h-6 w-6" />
                </button>
                <button
                  onClick={() => router.push("/")} 
                  className="h-7 text-xs hover:bg-primary/10 cursor-pointer"
                  aria-label="AI Assistant"
                  title="AI Assistant"
                  
                >
                  <Home className="h-4 w-4" />
                </button>

                <NotificationDropdown />

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="h-8 w-8"
                >
                  {mounted &&
                    (theme === "dark" ? (
                      <SunIcon className="h-4 w-4 transition-all" />
                    ) : (
                      <MoonIcon className="h-4 w-4 transition-all" />
                    ))}
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
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.name || "User"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email || "user@example.com"}
                        </p>
                      </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                      <Link
                        href={constructRoute("/new-dashboard/profile")}
                        className="cursor-pointer"
                      >
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        href={constructRoute("/new-dashboard/settings")}
                        className="cursor-pointer"
                      >
                        <SettingsIcon className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => setShowShortcutsModal(true)}
                      className="cursor-pointer"
                    >
                      <span className="mr-2">⌨️</span>
                      <span>Keyboard Shortcuts</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        Ctrl+/
                      </span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                    >
                      <LogOutIcon className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
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
      )}
    </>
  );
};

export default NewDashboardNavbar;
