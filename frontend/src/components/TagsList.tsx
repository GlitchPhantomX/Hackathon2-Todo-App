import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTags } from '@/contexts/TagsContext';
import { Tag } from '@/types/types';
import { Plus, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import TagModal from './TagModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const TagsList: React.FC = () => {
  const { tags, loading, error, deleteTag, createTag, updateTag } = useTags();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this tag?')) {
      await deleteTag(id);
    }
  };

  const handleCreateNew = () => {
    setEditingTag(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (tagData: Omit<Tag, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    try {
      if (editingTag) {
        await updateTag(editingTag.id, {
          name: tagData.name,
          color: tagData.color,
        });
      } else {
        await createTag(tagData);
      }
      setIsModalOpen(false);
      setEditingTag(null);
    } catch (error) {
      console.error('Error saving tag:', error);
    }
  };

  if (loading) {
    return (
      <Card 
        className="border shadow-sm"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--card)'
        }}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div 
              className="animate-spin rounded-full h-8 w-8 border-b-2"
              style={{ borderColor: 'var(--primary)' }}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card 
        className="border shadow-sm"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--card)'
        }}
      >
        <CardContent className="p-6">
          <div className="text-center py-8 text-red-500">
            Error: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card 
        className="border shadow-sm hover:shadow-md transition-shadow"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--card)'
        }}
      >
        <CardHeader 
          className="border-b pb-3"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between">
            <CardTitle 
              className="text-base font-semibold"
              style={{ color: 'var(--foreground)' }}
            >
              Tags
            </CardTitle>
            <Button
              onClick={handleCreateNew}
              size="icon"
              className="h-8 w-8 rounded-lg text-white shadow-md hover:shadow-lg transition-all duration-200"
              style={{
                background: 'linear-gradient(to right, var(--purple-600), var(--violet-600))'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(139, 92, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }}
              title="Add new tag"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          <div className="space-y-2">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="group flex items-center justify-between p-3 border rounded-lg transition-all duration-200"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--muted)';
                  e.currentTarget.style.borderColor = 'var(--primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                <div className="flex items-center flex-1 min-w-0">
                  <Badge
                    style={{ 
                      backgroundColor: `${tag.color}15`, 
                      color: tag.color,
                      borderColor: `${tag.color}30`
                    }}
                    className="border mr-2"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full mr-1.5 inline-block"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="truncate">{tag.name}</span>
                  </Badge>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: 'var(--foreground)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--muted)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-40 border"
                    style={{
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)'
                    }}
                  >
                    <DropdownMenuItem 
                      onClick={() => handleEdit(tag)}
                      className="cursor-pointer transition-colors"
                      style={{ color: 'var(--foreground)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--muted)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator style={{ backgroundColor: 'var(--border)' }} />
                    <DropdownMenuItem
                      onClick={() => handleDelete(tag.id)}
                      className="cursor-pointer transition-colors"
                      style={{ color: '#ef4444' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#ef444420';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
            
            {tags.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div 
                  className="rounded-full p-3 mb-3"
                  style={{ backgroundColor: 'var(--muted)' }}
                >
                  <Plus 
                    className="h-6 w-6"
                    style={{ color: 'var(--muted-foreground)' }}
                  />
                </div>
                <p 
                  className="text-sm mb-2"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  No tags yet
                </p>
                <Button
                  onClick={handleCreateNew}
                  variant="outline"
                  size="sm"
                  className="transition-all duration-200 border"
                  style={{
                    color: 'var(--primary)',
                    borderColor: 'var(--border)',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--muted)';
                    e.currentTarget.style.borderColor = 'var(--primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Create your first tag
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <TagModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setEditingTag(null);
        }}
        onSubmit={handleSubmit}
        tag={editingTag}
      />
    </>
  );
};

export default TagsList;