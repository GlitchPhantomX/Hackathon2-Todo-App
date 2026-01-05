'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ListTodo, Calendar, Star } from 'lucide-react';

interface ChatWelcomeProps {
  onNewChat: () => void;
  onSuggestedPromptClick: (prompt: string) => void;
}

export default function ChatWelcome({
  onNewChat,
  onSuggestedPromptClick
}: ChatWelcomeProps) {
  const suggestedPrompts = [
    "Create a new task to buy groceries",
    "Show me my pending tasks",
    "What's on my schedule for today?",
    "Help me organize my work tasks"
  ];

  const quickStats = [
    { label: "Total Tasks", value: "0", icon: ListTodo },
    { label: "Completed Today", value: "0", icon: CheckCircle },
    { label: "Pending", value: "0", icon: Calendar },
    { label: "High Priority", value: "0", icon: Star }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-2xl w-full space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-3xl font-bold">AI</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome to AI Task Assistant
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Your intelligent assistant for managing tasks and staying organized
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <Card key={index} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-4 flex flex-col items-center">
                <stat.icon className="h-6 w-6 text-blue-500 mb-2" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 text-center">{stat.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Suggested Prompts */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center">
            Try these examples
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestedPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto py-3 px-4 text-left justify-start border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => onSuggestedPromptClick(prompt)}
              >
                <span className="text-gray-700 dark:text-gray-300">{prompt}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* New Chat Button */}
        <div className="text-center">
          <Button
            onClick={onNewChat}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 text-lg font-medium"
          >
            Start New Conversation
          </Button>
        </div>
      </div>
    </div>
  );
}