'use client';
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import DashboardStats from '@/components/DashboardStats';
import { useDashboard } from '@/contexts/DashboardContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusIcon, Edit2, Trash2, TagIcon } from 'lucide-react';
import { Tag } from '@/types/types';
import { Task } from '@/types/task.types';
import TaskList from '@/components/TaskList';
import TagModal from '@/components/TagModal';
import EditTaskModal from '@/components/EditTaskModal';
import TaskDetail from '@/components/TaskDetail';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const TagsPage = () => {
  const { stats, tags, createTag, updateTag, deleteTag } = useDashboard();
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [selectedTagName, setSelectedTagName] = useState<string | null>(null);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [viewingTaskDetail, setViewingTaskDetail] = useState<Task | null>(null);

  const handleCreateTag = () => {
    setEditingTag(null);
    setIsTagModalOpen(true);
  };

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setIsTagModalOpen(true);
  };

  const handleDeleteTag = async (tagId: string) => {
    if (window.confirm('Are you sure you want to delete this tag? Tasks with this tag will not be deleted.')) {
      await deleteTag(tagId);
      const deletedTag = tags.find(t => t.id === tagId);
      if (deletedTag && selectedTagName === deletedTag.name) {
        setSelectedTagName(null);
      }
    }
  };

  const handleTagSubmit = async (tagData: Omit<Tag, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (editingTag) {
      await updateTag(editingTag.id, {
        name: tagData.name,
        color: tagData.color,
      });
    } else {
      const fullTagData: Omit<Tag, 'id'> = {
        name: tagData.name,
        color: tagData.color,
        userId: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await createTag(fullTagData);
    }
    setIsTagModalOpen(false);
  };

  const handleTaskClick = (task: Task) => {
    setViewingTaskDetail(task);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditTaskModalOpen(true);
    setViewingTaskDetail(null);
  };

  // Calculate task counts for each tag
  const tagWithTaskCounts = tags.map(tag => {
    const taskCount = stats.total;
    return { ...tag, taskCount };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50/30 dark:from-gray-950 dark:via-gray-950 dark:to-blue-950/20">
      <div className="mx-auto max-w-[1800px] px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <PageHeader
            title="Tags"
            description="Manage your tags and organize your tasks"
          />
          <Button
            onClick={handleCreateTag}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-200"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Tag
          </Button>
        </div>

        {/* Dashboard Stats */}
        <DashboardStats />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Sidebar - Tags (4 cols) */}
          <aside className="lg:col-span-4 space-y-4">
            <Card className="border-gray-200/60 dark:border-gray-700/60 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Your Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 max-h-[600px] overflow-y-auto">
                <div className="space-y-3">
                  {tagWithTaskCounts.map((tag) => (
                    <div
                      key={tag.id}
                      className={`group border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                        selectedTagName === tag.name
                          ? 'bg-blue-50 border-blue-300 dark:bg-blue-950/30 dark:border-blue-700 shadow-md'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => setSelectedTagName(tag.name === selectedTagName ? null : tag.name)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3 flex-1">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${tag.color}20` }}
                          >
                            <TagIcon
                              className="h-5 w-5"
                              style={{ color: tag.color }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base text-gray-900 dark:text-gray-100 truncate">
                              #{tag.name}
                            </h3>
                            <Badge
                              style={{ 
                                backgroundColor: `${tag.color}15`, 
                                color: tag.color,
                                borderColor: `${tag.color}30`
                              }}
                              className="mt-2 text-xs border"
                            >
                              <div
                                className="w-2 h-2 rounded-full mr-1.5 inline-block"
                                style={{ backgroundColor: tag.color }}
                              />
                              {tag.taskCount || 0} tasks
                            </Badge>
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleEditTag(tag);
                            }}>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTag(tag.id);
                              }}
                              className="text-red-600 dark:text-red-400 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}

                  {tagWithTaskCounts.length === 0 && (
                    <div className="text-center py-12">
                      <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <TagIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                        No tags found
                      </p>
                      <Button
                        onClick={handleCreateTag}
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-950/30"
                      >
                        <PlusIcon className="h-4 w-4 mr-1.5" />
                        Create your first tag
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content - Tasks (8 cols) */}
          <main className="lg:col-span-8 space-y-6">
            {selectedTagName ? (
              <Card className="border-gray-200/60 dark:border-gray-700/60 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <Badge
                      style={{ 
                        backgroundColor: `${tags.find(t => t.name === selectedTagName)?.color}20`, 
                        color: tags.find(t => t.name === selectedTagName)?.color,
                        borderColor: `${tags.find(t => t.name === selectedTagName)?.color}30`
                      }}
                      className="text-base px-3 py-1 border"
                    >
                      <TagIcon className="h-4 w-4 mr-1.5" />
                      #{selectedTagName}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Tasks tagged with #{selectedTagName}
                  </p>
                </CardHeader>
                <CardContent className="p-6">
                  <TaskList 
                    filter={{ tags: [selectedTagName] }}
                    onEditTask={handleEditTask}
                    onTaskClick={handleTaskClick}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="border-gray-200/60 dark:border-gray-700/60 shadow-sm">
                <CardContent className="p-12 text-center">
                  <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <TagIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No Tag Selected
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Select a tag from the sidebar to view its tasks
                  </p>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>

      {/* Tag Modal */}
      <TagModal
        open={isTagModalOpen}
        onOpenChange={(open) => {
          setIsTagModalOpen(open);
          if (!open) setEditingTag(null);
        }}
        onSubmit={handleTagSubmit}
        tag={editingTag}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={isEditTaskModalOpen}
        onClose={() => {
          setIsEditTaskModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
      />

      {/* Task Detail Modal */}
      {viewingTaskDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <TaskDetail
              task={viewingTaskDetail}
              onClose={() => setViewingTaskDetail(null)}
              onEdit={() => handleEditTask(viewingTaskDetail)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TagsPage;