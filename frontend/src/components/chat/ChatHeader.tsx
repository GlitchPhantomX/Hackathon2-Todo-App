import React, { useState } from 'react';
import { MoreVertical, Archive, Trash2 } from 'lucide-react';
import { Conversation } from '../../types/chat.types';
import { useChat } from '@/contexts/ChatContext';

interface ChatHeaderProps {
  conversation: Conversation | null;
  onUpdateTitle: (title: string) => void;
  onDelete: () => void;
  onArchive: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  onUpdateTitle,
  onDelete,
  onArchive,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(conversation?.title || '');
  
  // ✅ Get language from context
  const { language } = useChat();
  const isRTL = language === 'ur';

  const handleSave = () => {
    if (title.trim() && conversation) {
      onUpdateTitle(title.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(conversation?.title || '');
    setIsEditing(false);
  };

  if (!conversation) return null;

  return (
    <div 
      className="border-b p-4 flex items-center justify-between"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--card)'
      }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {isEditing ? (
        <div className="flex items-center gap-2 flex-1">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 bg-transparent border-b focus:outline-none px-2 py-1 transition-colors"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--foreground)'
            }}
            dir={isRTL ? 'rtl' : 'ltr'}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
          />
          <button
            onClick={handleSave}
            className="px-3 py-1 rounded-lg transition-colors"
            style={{ color: '#10b981' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#10b98120';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {language === 'ur' ? 'محفوظ کریں' : 'Save'}
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-1 rounded-lg transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--muted)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {language === 'ur' ? 'منسوخ' : 'Cancel'}
          </button>
        </div>
      ) : (
        <h2
          className="font-semibold text-lg truncate cursor-pointer"
          onClick={() => setIsEditing(true)}
          style={{ color: 'var(--foreground)' }}
        >
          {conversation.title}
        </h2>
      )}
      <div className="flex items-center gap-2">
        <button
          onClick={onArchive}
          className="p-2 rounded-full transition-colors"
          title={language === 'ur' ? 'محفوظ شدہ میں منتقل کریں' : 'Archive conversation'}
          style={{ color: 'var(--foreground)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--muted)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Archive className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-full transition-colors"
          title={language === 'ur' ? 'بات چیت حذف کریں' : 'Delete conversation'}
          style={{ color: 'var(--foreground)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#ef444420';
            e.currentTarget.style.color = '#ef4444';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--foreground)';
          }}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;