import React from 'react';
import ChatWelcome from './ChatWelcome';

interface ChatEmptyStateProps {
  onSuggestedPromptClick: (prompt: string) => void;
  onCreateNewChat?: () => void;
}

const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({
  onSuggestedPromptClick,
  onCreateNewChat
}) => {
  return (
    <ChatWelcome
      onSuggestedPromptClick={onSuggestedPromptClick}
      onNewChat={onCreateNewChat || (() => {})}
    />
  );
};

export default ChatEmptyState;