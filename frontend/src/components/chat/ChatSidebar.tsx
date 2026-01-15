'use client';

import { useState, useRef, useEffect } from 'react';
import { Conversation } from '@/types/chat.types';
import {
  PlusCircle,
  MessageSquare,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Edit3,
  Share2
} from 'lucide-react';

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
      <div 
        className="w-16 border-r flex flex-col items-center py-4 space-y-4"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)'
        }}
      >
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 rounded-lg transition-colors"
          style={{ color: 'var(--foreground)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--muted)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          title="Expand sidebar"
        >
          <ChevronRight 
            className="h-5 w-5"
            style={{ color: 'var(--muted-foreground)' }}
          />
        </button>
        <button
          onClick={onCreateConversation}
          className="p-2 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
          style={{
            background: 'linear-gradient(to right, var(--purple-600), var(--violet-600))'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="New chat"
        >
          <PlusCircle className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div 
      className="w-80 border-r flex flex-col h-full"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)'
      }}
    >
      {/* Header */}
      <div 
        className="p-4 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 
            className="text-lg font-semibold flex items-center gap-2"
            style={{ color: 'var(--foreground)' }}
          >
            <MessageSquare 
              className="h-5 w-5"
              style={{ color: 'var(--primary)' }}
            />
            Conversations
          </h2>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--muted)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title="Collapse sidebar"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <button
          onClick={onCreateConversation}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-lg font-medium transition-all transform shadow-md hover:shadow-lg"
          style={{
            background: 'linear-gradient(to right, var(--purple-600), var(--violet-600))'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
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
            className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--muted)',
              color: 'var(--foreground)',
              '--tw-ring-color': 'var(--primary)'
            } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare 
              className="h-12 w-12 mx-auto mb-3 opacity-50"
              style={{ color: 'var(--muted-foreground)' }}
            />
            <p 
              className="text-sm"
              style={{ color: 'var(--muted-foreground)' }}
            >
              No conversations yet
            </p>
            <p 
              className="text-xs mt-1"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Start a new chat!
            </p>
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
      <div 
        className="p-4 border-t"
        style={{ borderColor: 'var(--border)' }}
      >
        <p 
          className="text-xs text-center"
          style={{ color: 'var(--muted-foreground)' }}
        >
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Rename Dialog */}
      {renameDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="rounded-lg p-6 w-full max-w-md mx-4"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)'
            }}
          >
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--foreground)' }}
            >
              Rename Conversation
            </h3>
            <div className="mb-4">
              <input
                type="text"
                value={renameDialog.title}
                onChange={(e) => setRenameDialog(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--muted)',
                  color: 'var(--foreground)',
                  '--tw-ring-color': 'var(--primary)'
                } as React.CSSProperties}
                placeholder="Conversation title"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeRenameDialog}
                className="px-4 py-2 rounded-lg transition-colors"
                style={{
                  color: 'var(--foreground)',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--muted)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmRename}
                className="px-4 py-2 text-white rounded-lg transition-all"
                style={{
                  background: 'linear-gradient(to right, var(--purple-600), var(--violet-600))'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
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
          <div 
            className="rounded-lg p-6 w-full max-w-md mx-4"
            style={{
              backgroundColor: 'var(--card)'
            }}
          >
            <h3 
              className="text-lg font-semibold mb-2"
              style={{ color: 'var(--foreground)' }}
            >
              Delete Conversation
            </h3>
            <p 
              className="mb-6"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Are you sure you want to delete this conversation? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteDialog}
                className="px-4 py-2 rounded-lg transition-colors"
                style={{ color: 'var(--foreground)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--muted)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-white rounded-lg transition-colors"
                style={{ backgroundColor: '#ef4444' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ef4444';
                }}
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
      <h3 
        className="text-xs font-semibold px-3 mb-2 uppercase tracking-wide"
        style={{ color: 'var(--muted-foreground)' }}
      >
        {title}
      </h3>
      <div className="space-y-1">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className="group relative flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all"
            style={{
              backgroundColor: activeConversationId === conv.id ? 'var(--muted)' : 'transparent',
              color: activeConversationId === conv.id ? 'var(--primary)' : 'var(--foreground)'
            }}
            onClick={() => onLoadConversation(conv.id)}
            onMouseEnter={(e) => {
              if (activeConversationId !== conv.id) {
                e.currentTarget.style.backgroundColor = 'var(--muted)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeConversationId !== conv.id) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
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
                className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: 'var(--muted-foreground)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--muted)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="More options"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {/* Dropdown menu */}
              {menuOpenId === conv.id && (
                <div 
                  className="absolute right-0 top-8 border rounded-lg shadow-lg py-1 w-48 z-20"
                  style={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)'
                  }}
                >
                  <button
                    className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm transition-colors"
                    style={{ color: 'var(--foreground)' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openRenameDialog(conv.id, conv.title);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--muted)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Edit3 className="h-4 w-4" />
                    Rename
                  </button>
                  <button
                    className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm transition-colors"
                    style={{ color: 'var(--foreground)' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Share conversation:', conv.id);
                      setMenuOpenId(null);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--muted)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                  <button
                    className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm"
                    style={{ color: '#ef4444' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteDialog(conv.id);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#ef444420';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
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