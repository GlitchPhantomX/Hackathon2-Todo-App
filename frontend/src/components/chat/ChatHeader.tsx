import React, { useState } from 'react';
import { MoreVertical, Archive, Trash2 } from 'lucide-react';
import { Conversation } from '../../types/chat.types';

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
    <div className="border-b border-border p-4 flex items-center justify-between">
      {isEditing ? (
        <div className="flex items-center gap-2 flex-1">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 bg-transparent border-b border-gray-400 focus:outline-none focus:border-blue-500 px-2 py-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
          />
          <button
            onClick={handleSave}
            className="text-green-600 hover:text-green-800"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      ) : (
        <h2
          className="font-semibold text-lg truncate cursor-pointer"
          onClick={() => setIsEditing(true)}
        >
          {conversation.title}
        </h2>
      )}
      <div className="flex items-center gap-2">
        <button
          onClick={onArchive}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          title="Archive conversation"
        >
          <Archive className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600 rounded-full"
          title="Delete conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;