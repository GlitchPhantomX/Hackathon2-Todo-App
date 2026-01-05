import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTags } from '@/contexts/TagsContext';
import { Tag } from '@/types/types';
import { Plus, MoreHorizontal } from 'lucide-react';
import TagModal from './TagModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
    if (editingTag) {
      // Update existing tag
      await updateTag(editingTag.id, {
        name: tagData.name,
        color: tagData.color,
      });
      setIsModalOpen(false);
    } else {
      // Create new tag
      await createTag(tagData);
      setIsModalOpen(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading tags...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tags</CardTitle>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          New Tag
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50"
            >
              <div className="flex items-center">
                <Badge
                  style={{ backgroundColor: `${tag.color}20`, color: tag.color }} // Lighter background with text color
                  className="mr-2"
                >
                  <div
                    className="w-3 h-3 rounded-full mr-1 inline-block"
                    style={{ backgroundColor: tag.color }}
                  ></div>
                  {tag.name}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleEdit(tag)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(tag.id)}
                      className="text-red-600"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
          {tags.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No tags yet. Create your first tag!
            </div>
          )}
        </div>
      </CardContent>
      <TagModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleSubmit}
        tag={editingTag}
      />
    </Card>
  );
};

export default TagsList;