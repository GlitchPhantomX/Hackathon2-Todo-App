'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Calendar,
  Tag,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
  Zap,
  Target,
  Clock,
  Filter,
  Search
} from 'lucide-react';

const ChatbotCommandsSection = () => {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const handleCopy = (command: string) => {
    navigator.clipboard.writeText(command);
    setCopiedCommand(command);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const commandCategories = [
    {
      title: 'Create Tasks',
      icon: Plus,
      color: '#10b981',
      commands: [
        {
          command: 'Add "Buy groceries" with high priority',
          description: 'Creates a task with high priority',
          example: 'Add "Buy groceries" with high priority'
        },
        {
          command: 'Create task "Meeting with team" for tomorrow',
          description: 'Creates a task with specific date',
          example: 'Create task "Meeting with team" for tomorrow'
        },
        {
          command: 'Add "Review code" with medium priority and tag development',
          description: 'Creates a task with priority and tag',
          example: 'Add "Review code" with medium priority and tag development'
        },
        {
          command: 'Create "Finish report" due next Monday',
          description: 'Creates a task with specific due date',
          example: 'Create "Finish report" due next Monday'
        }
      ]
    },
    {
      title: 'Update Tasks',
      icon: Edit,
      color: '#3b82f6',
      commands: [
        {
          command: 'Update "Buy groceries" to completed',
          description: 'Marks a task as complete',
          example: 'Update "Buy groceries" to completed'
        },
        {
          command: 'Change priority of "Meeting" to high',
          description: 'Updates task priority',
          example: 'Change priority of "Meeting" to high'
        },
        {
          command: 'Update "Review code" due date to Friday',
          description: 'Changes task due date',
          example: 'Update "Review code" due date to Friday'
        },
        {
          command: 'Mark "Finish report" as in progress',
          description: 'Updates task status',
          example: 'Mark "Finish report" as in progress'
        }
      ]
    },
    {
      title: 'Delete Tasks',
      icon: Trash2,
      color: '#ef4444',
      commands: [
        {
          command: 'Delete "Buy groceries"',
          description: 'Removes a specific task',
          example: 'Delete "Buy groceries"'
        },
        {
          command: 'Remove task "Old meeting"',
          description: 'Deletes a task by name',
          example: 'Remove task "Old meeting"'
        },
        {
          command: 'Delete all completed tasks',
          description: 'Removes all completed tasks',
          example: 'Delete all completed tasks'
        }
      ]
    },
    {
      title: 'View & Filter Tasks',
      icon: Search,
      color: '#8b5cf6',
      commands: [
        {
          command: 'Show all my tasks',
          description: 'Displays all tasks',
          example: 'Show all my tasks'
        },
        {
          command: 'Show high priority tasks',
          description: 'Filters tasks by priority',
          example: 'Show high priority tasks'
        },
        {
          command: 'Show tasks due today',
          description: 'Shows tasks due today',
          example: 'Show tasks due today'
        },
        {
          command: 'Show pending tasks',
          description: 'Displays incomplete tasks',
          example: 'Show pending tasks'
        },
        {
          command: 'Show tasks with tag "work"',
          description: 'Filters tasks by tag',
          example: 'Show tasks with tag "work"'
        }
      ]
    }
  ];

  const quickExamples = [
    {
      icon: Target,
      title: 'Quick Add',
      command: 'Add "Call client" with high priority for tomorrow',
      color: '#10b981'
    },
    {
      icon: Clock,
      title: 'Set Reminder',
      command: 'Create "Team standup" at 10 AM tomorrow',
      color: '#f59e0b'
    },
    {
      icon: Tag,
      title: 'With Tags',
      command: 'Add "Design review" with tag urgent and high priority',
      color: '#ec4899'
    },
    {
      icon: CheckCircle,
      title: 'Mark Complete',
      command: 'Mark "Buy groceries" as completed',
      color: '#8b5cf6'
    }
  ];

  const tips = [
    {
      icon: Sparkles,
      title: 'Natural Language',
      description: 'Use natural language - the AI understands context and variations'
    },
    {
      icon: Calendar,
      title: 'Smart Dates',
      description: 'Use "tomorrow", "next week", "Monday", or specific dates'
    },
    {
      icon: AlertCircle,
      title: 'Priority Levels',
      description: 'Specify "high", "medium", or "low" priority for tasks'
    },
    {
      icon: Tag,
      title: 'Tags & Labels',
      description: 'Add tags like "work", "personal", "urgent" to organize tasks'
    }
  ];

  return (
    <section 
      className="py-20"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
            style={{
              backgroundColor: 'var(--muted)',
              borderColor: 'var(--border)'
            }}
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <MessageSquare className="w-4 h-4" style={{ color: 'var(--primary)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>
              AI Chatbot Commands
            </span>
          </motion.div>

          <motion.h2
            className="text-3xl md:text-5xl font-bold mb-4"
            style={{ color: 'var(--foreground)' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Talk to Your{' '}
            <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, var(--purple-600), var(--violet-600))'
              }}
            >
              AI Assistant
            </span>
          </motion.h2>

          <motion.p
            className="text-lg max-w-3xl mx-auto"
            style={{ color: 'var(--muted-foreground)' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Use natural language commands to manage your tasks effortlessly.
            Our AI understands what you mean and helps you stay organized.
          </motion.p>
        </div>

        {/* Quick Examples */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          {quickExamples.map((example, index) => (
            <motion.div
              key={index}
              className="p-4 rounded-xl border cursor-pointer group"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)'
              }}
              whileHover={{ y: -5, scale: 1.02 }}
              onClick={() => handleCopy(example.command)}
            >
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: `${example.color}20` }}
              >
                <example.icon className="w-5 h-5" style={{ color: example.color }} />
              </div>
              <h4 
                className="font-semibold mb-2 text-sm"
                style={{ color: 'var(--foreground)' }}
              >
                {example.title}
              </h4>
              <p 
                className="text-xs font-mono p-2 rounded border"
                style={{
                  backgroundColor: 'var(--muted)',
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)'
                }}
              >
                {example.command}
              </p>
              <div 
                className="mt-2 text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: 'var(--primary)' }}
              >
                <Copy className="w-3 h-3" />
                Click to copy
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Command Categories */}
        <div className="space-y-8">
          {commandCategories.map((category, categoryIndex) => (
            <motion.div
              key={categoryIndex}
              className="p-6 md:p-8 rounded-2xl border"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)'
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: categoryIndex * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <category.icon className="w-6 h-6" style={{ color: category.color }} />
                </div>
                <h3 
                  className="text-2xl font-bold"
                  style={{ color: 'var(--foreground)' }}
                >
                  {category.title}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.commands.map((cmd, cmdIndex) => (
                  <motion.div
                    key={cmdIndex}
                    className="p-4 rounded-xl border group cursor-pointer"
                    style={{
                      backgroundColor: 'var(--muted)',
                      borderColor: 'var(--border)'
                    }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleCopy(cmd.example)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p 
                        className="font-mono text-sm flex-1"
                        style={{ color: 'var(--primary)' }}
                      >
                        "{cmd.command}"
                      </p>
                      <button
                        className="ml-2 p-1.5 rounded-lg transition-all"
                        style={{
                          backgroundColor: copiedCommand === cmd.example ? '#10b98120' : 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--muted)';
                        }}
                        onMouseLeave={(e) => {
                          if (copiedCommand !== cmd.example) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        {copiedCommand === cmd.example ? (
                          <Check className="w-4 h-4" style={{ color: '#10b981' }} />
                        ) : (
                          <Copy className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                        )}
                      </button>
                    </div>
                    <p 
                      className="text-sm"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      {cmd.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tips Section */}
        <motion.div
          className="mt-16 p-8 rounded-2xl border"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)'
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 
            className="text-2xl font-bold mb-6 text-center"
            style={{ color: 'var(--foreground)' }}
          >
            💡 Pro Tips
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tips.map((tip, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div 
                  className="inline-flex w-12 h-12 rounded-xl items-center justify-center mb-3"
                  style={{
                    background: 'linear-gradient(135deg, var(--purple-600), var(--violet-600))'
                  }}
                >
                  <tip.icon className="w-6 h-6 text-white" />
                </div>
                <h4 
                  className="font-semibold mb-2"
                  style={{ color: 'var(--foreground)' }}
                >
                  {tip.title}
                </h4>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {tip.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p 
            className="text-lg mb-6"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Ready to experience the power of AI task management?
          </p>
          <motion.button
            className="px-8 py-4 text-white rounded-xl font-semibold shadow-lg inline-flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, var(--purple-600), var(--violet-600))'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageSquare className="w-5 h-5" />
            Try AI Assistant Now
            <Zap className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default ChatbotCommandsSection;