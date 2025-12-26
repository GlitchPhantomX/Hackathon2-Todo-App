'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Keyboard, Command, Navigation, List } from 'lucide-react';

const KeyboardShortcuts = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const shortcutCategories = [
    {
      title: 'Global',
      icon: <Command className="h-4 w-4" />,
      shortcuts: [
        { keys: ['Ctrl', 'K'], description: 'Focus search' },
        { keys: ['Ctrl', 'N'], description: 'New task' },
        { keys: ['Ctrl', '/'], description: 'Shortcuts' },
        { keys: ['Ctrl', 'B'], description: 'Toggle sidebar' },
        { keys: ['Ctrl', 'D'], description: 'Toggle theme' },
        { keys: ['Esc'], description: 'Close modal' },
      ]
    },
    {
      title: 'Navigation',
      icon: <Navigation className="h-4 w-4" />,
      shortcuts: [
        { keys: ['G', 'D'], description: 'Dashboard' },
        { keys: ['G', 'T'], description: 'Tasks' },
        { keys: ['G', 'S'], description: 'Statistics' },
      ]
    },
    {
      title: 'Tasks',
      icon: <List className="h-4 w-4" />,
      shortcuts: [
        { keys: ['J', 'K'], description: 'Navigate' },
        { keys: ['Enter'], description: 'Open' },
        { keys: ['Space'], description: 'Toggle' },
        { keys: ['E'], description: 'Edit' },
        { keys: ['Del'], description: 'Delete' },
        { keys: ['N'], description: 'New' },
      ]
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Keyboard className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">Keyboard Shortcuts</DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Speed up your workflow with these handy keyboard shortcuts
          </p>
        </DialogHeader>

        {/* ✅ Horizontal Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
          {shortcutCategories.map((category, categoryIndex) => (
            <div 
              key={categoryIndex}
              className="space-y-3 p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              {/* Category Header */}
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="text-primary">
                  {category.icon}
                </div>
                <h3 className="font-semibold text-sm">
                  {category.title}
                </h3>
              </div>

              {/* Shortcuts List */}
              <div className="space-y-2">
                {category.shortcuts.map((shortcut, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between gap-2 py-1.5"
                  >
                    {/* Description */}
                    <span className="text-xs text-muted-foreground truncate flex-1">
                      {shortcut.description}
                    </span>

                    {/* Keys */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {shortcut.keys.map((key, keyIndex) => (
                        <React.Fragment key={keyIndex}>
                          <Badge 
                            variant="secondary" 
                            className="font-mono text-xs px-2 py-0.5 bg-background shadow-sm border"
                          >
                            {key}
                          </Badge>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="text-muted-foreground text-xs font-medium">
                              +
                            </span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Press <Badge variant="outline" className="mx-1 font-mono text-xs">Esc</Badge> to close
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcuts;