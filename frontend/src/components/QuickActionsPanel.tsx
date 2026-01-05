import React, { useState } from 'react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
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
      <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {actions.map((action) => (
            <TooltipProvider key={action.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-16 flex flex-col items-center justify-center gap-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                    onClick={action.action}
                  >
                    {action.icon}
                    <span className="text-xs">{action.label}</span>
                  </Button>
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