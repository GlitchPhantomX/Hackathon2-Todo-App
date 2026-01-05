'use client';
export const runtime = 'edge';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import DashboardStats from '@/components/DashboardStats';
import { useDashboard } from '@/contexts/DashboardContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon, MoreHorizontalIcon } from 'lucide-react';
import { Tag } from '@/types/types';
import TaskList from '@/components/TaskList';
import TagModal from '@/components/TagModal';

const TagsPage = () => {
  const { stats, tags, createTag, updateTag, deleteTag } = useDashboard();
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const handleCreateTag = () => {
    setEditingTag(null);
    setIsTagModalOpen(true);
  };

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setIsTagModalOpen(true);
  };

  const handleTagSubmit = async (tagData: Omit<Tag, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (editingTag) {
      // For updates, only pass the updatable fields
      await updateTag(editingTag.id, {
        name: tagData.name,
        color: tagData.color,
      });
    } else {
      // For creation, construct a complete tag object
      const fullTagData: Omit<Tag, 'id'> = {
        name: tagData.name,
        color: tagData.color,
        userId: '', // Will be set by backend
        createdAt: new Date().toISOString(), // Will be set by backend
        updatedAt: new Date().toISOString(), // Will be set by backend
      };
      await createTag(fullTagData);
    }
    setIsTagModalOpen(false);
  };

  // Calculate task counts for each tag
  const tagWithTaskCounts = tags.map(tag => {
    const taskCount = stats.total; // In a real app, this would be calculated based on tasks with this tag
    return { ...tag, taskCount };
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader
          title="Tags"
          description="Manage your tags and organize your tasks"
        />
        <Button
          onClick={handleCreateTag}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Tag
        </Button>
      </div>

      <DashboardStats />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tags sidebar */}
        <div className="lg:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle>Your Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tagWithTaskCounts.map((tag) => (
                  <div
                    key={tag.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedTag === tag.id
                        ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setSelectedTag(tag.id === selectedTag ? null : tag.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: tag.color }}
                          />
                          <h3 className="font-semibold text-lg">#{tag.name}</h3>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTag(tag);
                        }}
                      >
                        <MoreHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {tag.taskCount || 0} tasks
                    </div>
                  </div>
                ))}

                {tagWithTaskCounts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No tags found. Create your first tag to get started.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content - Tasks for selected tag */}
        <div className="lg:w-3/4 space-y-6">
          {selectedTag ? (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  Tasks with #{tags.find(t => t.id === selectedTag)?.name} tag
                </h2>
              </div>

              <Card>
                <CardContent className="p-6">
                  <TaskList filter={{ tag: selectedTag }} />
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                <p>Select a tag to view its tasks</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <TagModal
        open={isTagModalOpen}
        onOpenChange={(open) => setIsTagModalOpen(open)}
        onSubmit={handleTagSubmit}
        tag={editingTag}
      />
    </div>
  );
};

export default TagsPage;