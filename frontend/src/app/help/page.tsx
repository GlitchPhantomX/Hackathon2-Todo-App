'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, MessageCircle, LifeBuoy, Mail, BookOpen, ExternalLink } from 'lucide-react';

const HelpPage = () => {
  const helpTopics = [
    {
      title: "Getting Started",
      description: "Learn how to set up your account and start using TodoMaster",
      icon: <BookOpen className="h-6 w-6" />,
      link: "#getting-started"
    },
    {
      title: "Managing Tasks",
      description: "Create, edit, and organize your tasks efficiently",
      icon: <MessageCircle className="h-6 w-6" />,
      link: "#managing-tasks"
    },
    {
      title: "Setting Priorities",
      description: "Learn how to prioritize your tasks effectively",
      icon: <LifeBuoy className="h-6 w-6" />,
      link: "#setting-priorities"
    },
    {
      title: "Notifications",
      description: "Configure and manage your notification settings",
      icon: <HelpCircle className="h-6 w-6" />,
      link: "#notifications"
    }
  ];

  const contactOptions = [
    {
      title: "Email Support",
      description: "Get help via email within 24 hours",
      icon: <Mail className="h-5 w-5" />,
      contact: "support@todomaster.com"
    },
    {
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      icon: <MessageCircle className="h-5 w-5" />,
      contact: "Start Chat"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Card>
          <CardHeader className="p-6">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <HelpCircle className="h-8 w-8 text-blue-500" />
              Help & Support
            </CardTitle>
            <p className="text-muted-foreground">
              Find answers to common questions or contact our support team
            </p>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              Help Topics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {helpTopics.map((topic, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  {topic.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{topic.title}</h3>
                  <p className="text-sm text-muted-foreground">{topic.description}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-green-500" />
              Contact Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {contactOptions.map((option, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-lg border"
              >
                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                  {option.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{option.title}</h3>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    {option.contact}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span>Use keyboard shortcuts: Press Ctrl+K to open search, G+D to go to dashboard</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span>Drag and drop tasks to reorder them in your list</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span>Set due dates to track your task deadlines</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span>Use tags to categorize and filter your tasks</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpPage;