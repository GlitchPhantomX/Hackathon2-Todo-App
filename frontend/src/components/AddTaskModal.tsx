"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarIcon,
  PlusIcon,
  TagIcon,
  // CalendarDaysIcon,
} from "lucide-react";
import { useTaskSync } from "@/contexts/TaskSyncContext";
import { useTags } from "@/contexts/TagsContext";
import { format, addDays } from "date-fns";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}
interface Project {
  id: string;
  name: string;
}

interface Notification {
  id: string;
  message: string;
}

const AddTaskModal = ({ isOpen, onClose }: AddTaskModalProps) => {
  const { addTask, isLoading, websocketStatus } = useTaskSync();
  const { tags: allTags, createTag, loading: tagsLoading } = useTags();
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<string>("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [newTag, setNewTag] = useState("");
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
  }>({});

  // ✅ Debug: Log when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log("📋 MODAL: Opened");
      console.log(
        "📋 MODAL: Current notifications count:",
        notifications?.length || 0
      );
      resetForm();
    }
  }, [isOpen]);

  // ✅ Debug: Log notifications changes
  useEffect(() => {
    console.log("📋 MODAL: Notifications updated:", notifications?.length || 0);
  }, [notifications]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setPriority("medium");
    setSelectedTags([]);
    setSelectedProject("");
    setNewTag("");
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: { title?: string; description?: string } = {};

    // Title validation: 3-100 characters
    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    } else if (title.trim().length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

    // Description validation: max 1000 characters
    if (description.length > 1000) {
      newErrors.description = "Description must be less than 1000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // First, create any new tags that don't already exist
      const allTagNames = allTags.map((tag) => tag.name.toLowerCase());
      const newTagPromises = selectedTags
        .filter((tag) => !allTagNames.includes(tag.toLowerCase()))
        .map((tagName) =>
          createTag({
            name: tagName,
            color: "#3B82F6", // Default blue color
          })
        );

      // Wait for all new tags to be created
      await Promise.all(newTagPromises);

      // Build the task object with all required and optional fields
      const newTask: any = {
        title: title.trim(),
        description: description || undefined,
        priority,
        status: "pending" as const,
        completed: false,
      };

      // Add optional fields only if they have values
      if (dueDate) {
        newTask.due_date = dueDate;  // Backend expects snake_case
      }      

      if (selectedTags.length > 0) {
        newTask.tags = selectedTags;
      }

      if (selectedProject) {
        newTask.projectId = selectedProject;
      }

      // Add the task using TaskSyncContext
      await addTask(newTask);

      resetForm();
      onClose();
    } catch (error) {
      console.error("❌ Error creating task:", error);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      setSelectedTags([...selectedTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  const setDueDateShortcut = (days: number) => {
    const date = addDays(new Date(), days);
    setDueDate(format(date, "yyyy-MM-dd"));
  };

  const clearDueDate = () => {
    setDueDate("");
  };

  const getPriorityColor = (priorityLevel: string) => {
    switch (priorityLevel) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              maxLength={200}
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              maxLength={1000}
              rows={3}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <div className="flex gap-2">
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="pr-2"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearDueDate}
                  disabled={!dueDate}
                >
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label>Quick Dates</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDueDateShortcut(0)}
                >
                  Today
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDueDateShortcut(1)}
                >
                  Tomorrow
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDueDateShortcut(7)}
                >
                  Next Week
                </Button>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="priority">Priority *</Label>

            <Select
              value={priority}
              onValueChange={(value: "high" | "medium" | "low") =>
                setPriority(value)
              }
            >
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                    High
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                    Medium
                  </div>
                </SelectItem>
                <SelectItem value="low">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                    Low
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tags">Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-xs hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add a tag and press Enter"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTag}
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="project">Project</Label>

            <Select
              value={selectedProject}
              onValueChange={setSelectedProject}
            >
              <SelectTrigger id="project">
                <SelectValue placeholder="Select a project (optional)" />
              </SelectTrigger>

              <SelectContent>
                {projects && projects.length > 0 ? (
                  projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-projects" disabled>
                    No projects available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskModal;
