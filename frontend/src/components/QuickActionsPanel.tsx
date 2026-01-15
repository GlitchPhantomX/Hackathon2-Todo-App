import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Upload, BarChart3, Settings, HelpCircle } from 'lucide-react';
import ImportModal from './ImportModal';
import AddTaskModal from './AddTaskModal';
import { useRouter } from 'next/navigation';

const QuickActionsPanel: React.FC = () => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const router = useRouter();

  const handleNewTask = () => {
    setIsAddTaskModalOpen(true);
  };

  const handleViewReports = () => {
    router.push('/new-dashboard/statistics');
  };

  const handleSettings = () => {
    router.push('/new-dashboard/settings');
  };

  const handleHelp = () => {
    router.push('/new-dashboard/help');
  };

  const actions = [
    {
      id: 'new-task',
      label: 'New Task',
      icon: <Plus className="h-4 w-4" />,
      shortcut: 'Ctrl+N',
      action: handleNewTask,
      gradient: true,
    },
    {
      id: 'import-tasks',
      label: 'Import Tasks',
      icon: <Upload className="h-4 w-4" />,
      shortcut: '',
      action: () => setIsImportModalOpen(true),
    },
    {
      id: 'view-reports',
      label: 'View Reports',
      icon: <BarChart3 className="h-4 w-4" />,
      shortcut: '',
      action: handleViewReports,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="h-4 w-4" />,
      shortcut: 'Ctrl+,',
      action: handleSettings,
    },
    {
      id: 'help',
      label: 'Help',
      icon: <HelpCircle className="h-4 w-4" />,
      shortcut: 'Ctrl+/',
      action: handleHelp,
    },
  ];

  return (
    <>
      <div 
        className="p-6 border rounded-xl shadow-sm"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)'
        }}
      >
        <h3 
          className="text-lg font-semibold mb-4"
          style={{ color: 'var(--foreground)' }}
        >
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {actions.map((action) => (
            <TooltipProvider key={action.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  {action.gradient ? (
                    <button
                      className="h-20 flex flex-col items-center justify-center gap-2 rounded-lg text-white shadow-sm transition-all duration-200 hover:shadow-md relative overflow-hidden group"
                      style={{
                        background: 'linear-gradient(135deg, var(--purple-600), var(--violet-600))'
                      }}
                      onClick={action.action}
                    >
                      {/* Hover gradient */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        style={{
                          background: 'linear-gradient(135deg, var(--violet-600), var(--purple-600))'
                        }}
                      />
                      <span className="relative z-10">{action.icon}</span>
                      <span className="text-xs font-medium relative z-10">{action.label}</span>
                    </button>
                  ) : (
                    <Button
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center gap-2 transition-all duration-200 hover:scale-105"
                      style={{
                        borderColor: 'var(--border)',
                        backgroundColor: 'transparent'
                      }}
                      onClick={action.action}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)'
                        e.currentTarget.style.backgroundColor = 'var(--muted)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)'
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      <span style={{ color: 'var(--foreground)' }}>{action.icon}</span>
                      <span 
                        className="text-xs font-medium"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {action.label}
                      </span>
                    </Button>
                  )}
                </TooltipTrigger>
                {action.shortcut && (
                  <TooltipContent>
                    <p>{action.shortcut}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>

      {/* Import Modal */}
      <ImportModal
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
      />

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
      />
    </>
  );
};

export default QuickActionsPanel;