"use client";

import React, { useState } from "react";
import NewDashboardNavbar from "@/components/NewDashboardNavbar";
import NewDashboardSidebar from "@/components/NewDashboardSidebar";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import MinimizedChatWidget from "@/components/chat/MinimizedChatWidget";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navbar - Full Width */}
      <NewDashboardNavbar />

      {/* Main Layout Container - Sidebar + Content */}
      <div className="flex">
        {/* Left Sidebar - Fixed Position */}
        <aside className=" fixed left-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-30">
          <NewDashboardSidebar />
        </aside>

        {/* Main Content Area - With Left Margin for Sidebar */}
        <main className="flex-1 ml-64 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>

      {/* Floating Chat Button (when minimized chat is closed) */}
      {!isChatOpen && (
        <Button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-4 right-4 z-40 h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-transform"
          size="icon"
        >
          <MessageSquare className="h-6 w-6" />
          {/* Pulse animation */}
          <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        </Button>
      )}

      {/* Minimized Chat Widget */}
      {isChatOpen && (
        <MinimizedChatWidget onClose={() => setIsChatOpen(false)} />
      )}
    </div>
  );
};

export default DashboardLayout;