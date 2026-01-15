"use client";

import React, { useState } from "react";
import NewDashboardNavbar from "@/components/NewDashboardNavbar";
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

      {/* Main Content Area - No margin, full width */}
      <main className="flex-1 min-h-[calc(100vh-4rem)]">
        {children}
      </main>

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