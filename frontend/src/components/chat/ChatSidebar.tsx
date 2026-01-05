'use client';

import { useState, useRef, useEffect } from 'react';
import { Conversation } from '@/types/chat.types';
import {
  PlusCircle,
  MessageSquare,
  Trash2,
  ChevronLeft,
  ChevronRight,
  // Menu,
  // X,
  MoreVertical,
  Edit3,
  Share2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onCreateConversation: () => void;
  onLoadConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, title: string) => void;
}

export default function ChatSidebar({
  conversations,
  activeConversationId,
  onCreateConversation,
  onLoadConversation,
  onDeleteConversation,
  onRenameConversation,
}: ChatSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [renameDialog, setRenameDialog] = useState<{ isOpen: boolean; conversationId: string | null; title: string }>({
    isOpen: false,
    conversationId: null,
    title: ''
  });
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; conversationId: string | null }>({
    isOpen: false,
    conversationId: null
  });
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupConversationsByDate = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setDate(lastMonth.getDate() - 30);

    return {
      today: filteredConversations.filter(c => new Date(c.updated_at) >= today),
      yesterday: filteredConversations.filter(c => {
        const date = new Date(c.updated_at);
        return date >= yesterday && date < today;
      }),
      lastWeek: filteredConversations.filter(c => {
        const date = new Date(c.updated_at);
        return date >= lastWeek && date < yesterday;
      }),
      lastMonth: filteredConversations.filter(c => {
        const date = new Date(c.updated_at);
        return date >= lastMonth && date < lastWeek;
      }),
      older: filteredConversations.filter(c => new Date(c.updated_at) < lastMonth),
    };
  };

  const grouped = groupConversationsByDate();

  const handleRename = (id: string, title: string) => {
    onRenameConversation(id, title);
    setMenuOpenId(null);
  };

  const handleDelete = (id: string) => {
    onDeleteConversation(id);
    setMenuOpenId(null);
  };

  const openRenameDialog = (id: string, currentTitle: string) => {
    setRenameDialog({
      isOpen: true,
      conversationId: id,
      title: currentTitle
    });
    setMenuOpenId(null);
  };

  const openDeleteDialog = (id: string) => {
    setDeleteDialog({
      isOpen: true,
      conversationId: id
    });
    setMenuOpenId(null);
  };

  const closeRenameDialog = () => {
    setRenameDialog({
      isOpen: false,
      conversationId: null,
      title: ''
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      conversationId: null
    });
  };

  const confirmRename = () => {
    if (renameDialog.conversationId) {
      handleRename(renameDialog.conversationId, renameDialog.title);
      closeRenameDialog();
    }
  };

  const confirmDelete = () => {
    if (deleteDialog.conversationId) {
      handleDelete(deleteDialog.conversationId);
      closeDeleteDialog();
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-16 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-4 space-y-4">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Expand sidebar"
        >
          <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
        <button
          onClick={onCreateConversation}
          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          title="New chat"
        >
          <PlusCircle className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            Conversations
          </h2>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Collapse sidebar"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* New Chat Button */}
        <button
          onClick={onCreateConversation}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all transform hover:scale-[1.02] shadow-sm"
        >
          <PlusCircle className="h-5 w-5" />
          New Chat
        </button>

        {/* Search */}
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs mt-1">Start a new chat!</p>
          </div>
        ) : (
          <>
            <ConversationGroup
              title="Today"
              conversations={grouped.today}
              activeConversationId={activeConversationId}
              onLoadConversation={onLoadConversation}
              setMenuOpenId={setMenuOpenId}
              menuOpenId={menuOpenId}
              openRenameDialog={openRenameDialog}
              openDeleteDialog={openDeleteDialog}
            />
            <ConversationGroup
              title="Yesterday"
              conversations={grouped.yesterday}
              activeConversationId={activeConversationId}
              onLoadConversation={onLoadConversation}
              setMenuOpenId={setMenuOpenId}
              menuOpenId={menuOpenId}
              openRenameDialog={openRenameDialog}
              openDeleteDialog={openDeleteDialog}
            />
            <ConversationGroup
              title="Last 7 Days"
              conversations={grouped.lastWeek}
              activeConversationId={activeConversationId}
              onLoadConversation={onLoadConversation}
              setMenuOpenId={setMenuOpenId}
              menuOpenId={menuOpenId}
              openRenameDialog={openRenameDialog}
              openDeleteDialog={openDeleteDialog}
            />
            <ConversationGroup
              title="Last 30 Days"
              conversations={grouped.lastMonth}
              activeConversationId={activeConversationId}
              onLoadConversation={onLoadConversation}
              setMenuOpenId={setMenuOpenId}
              menuOpenId={menuOpenId}
              openRenameDialog={openRenameDialog}
              openDeleteDialog={openDeleteDialog}
            />
            <ConversationGroup
              title="Older"
              conversations={grouped.older}
              activeConversationId={activeConversationId}
              onLoadConversation={onLoadConversation}
              setMenuOpenId={setMenuOpenId}
              menuOpenId={menuOpenId}
              openRenameDialog={openRenameDialog}
              openDeleteDialog={openDeleteDialog}
            />
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Rename Dialog */}
      {renameDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Rename Conversation</h3>
            <div className="mb-4">
              <input
                type="text"
                value={renameDialog.title}
                onChange={(e) => setRenameDialog(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Conversation title"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeRenameDialog}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRename}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Conversation</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Are you sure you want to delete this conversation? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteDialog}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Conversation Group Component
const ConversationGroup = ({
  title,
  conversations,
  activeConversationId,
  onLoadConversation,
  setMenuOpenId,
  menuOpenId,
  openRenameDialog,
  openDeleteDialog
}: {
  title: string;
  conversations: Conversation[];
  activeConversationId: string | null;
  onLoadConversation: (id: string) => void;
  setMenuOpenId: React.Dispatch<React.SetStateAction<string | null>>;
  menuOpenId: string | null;
  openRenameDialog: (id: string, currentTitle: string) => void;
  openDeleteDialog: (id: string) => void;
}) => {
  if (conversations.length === 0) return null;

  return (
    <div className="mb-4">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 mb-2 uppercase tracking-wide">
        {title}
      </h3>
      <div className="space-y-1">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${
              activeConversationId === conv.id
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => onLoadConversation(conv.id)}
          >
            <MessageSquare className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1 truncate text-sm font-medium">
              {conv.title}
            </span>

            {/* Three-dot menu */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpenId(menuOpenId === conv.id ? null : conv.id);
                }}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                title="More options"
              >
                <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>

              {/* Dropdown menu */}
              {menuOpenId === conv.id && (
                <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 w-48 z-20">
                  <button
                    className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      openRenameDialog(conv.id, conv.title);
                    }}
                  >
                    <Edit3 className="h-4 w-4" />
                    Rename
                  </button>
                  <button
                    className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Share functionality would go here
                      console.log('Share conversation:', conv.id);
                      setMenuOpenId(null);
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                  <button
                    className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-600 dark:text-red-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteDialog(conv.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Confirmation Dialog Component
interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  children?: React.ReactNode;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  children
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{message}</p>

        {children && <div className="mb-4">{children}</div>}

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg transition-colors ${
              variant === 'destructive'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};