"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { CalendarIcon, PlusIcon } from "lucide-react";
import { useTaskSync } from "@/contexts/TaskSyncContext";
import { useTags } from "@/contexts/TagsContext";
import { useDashboard } from "@/contexts/DashboardContext";
import { format, addDays } from "date-fns";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddTaskModal = ({ isOpen, onClose }: AddTaskModalProps) => {
  const { addTask, isLoading } = useTaskSync();
  const { tags: allTags, createTag } = useTags();
  const { projects } = useDashboard();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<string>("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [newTag, setNewTag] = useState("");
  const [recurrence, setRecurrence] = useState<string>("none");
  const [dueTime, setDueTime] = useState<string>("");
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
  }>({});

  useEffect(() => {
    if (isOpen) {
      console.log("📋 AddTaskModal: Projects available:", projects);
      resetForm();
    }
  }, [isOpen, projects]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setPriority("medium");
    setSelectedTags([]);
    setSelectedProject("");
    setNewTag("");
    setRecurrence("none");
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: { title?: string; description?: string } = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    } else if (title.trim().length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

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
      // First, create any new tags
      const allTagNames = allTags.map((tag) => tag.name.toLowerCase());
      const newTagPromises = selectedTags
        .filter((tag) => !allTagNames.includes(tag.toLowerCase()))
        .map((tagName) =>
          createTag({
            name: tagName,
            color: "#3B82F6",
          })
        );

      await Promise.all(newTagPromises);

      // Build the task object
      const newTask: any = {
        title: title.trim(),
        description: description || undefined,
        priority,
        status: "pending" as const,
        completed: false,
      };

      if (dueDate) {
        // Agar time bhi hai to date ke saath merge karein, warna sirf date
        newTask.due_date = dueTime ? `${dueDate}T${dueTime}:00` : dueDate;
      }

      if (selectedTags.length > 0) {
        newTask.tags = selectedTags;
      }

      if (selectedProject && selectedProject !== "none") {
        newTask.projectId = selectedProject;
      }

      if (recurrence && recurrence !== "none") {
        newTask.recurrencePattern = recurrence;
      }

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-md max-h-[85vh] overflow-y-auto border"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
        }}
      >
        <DialogHeader>
          <DialogTitle
            className="text-xl font-bold"
            style={{ color: "var(--foreground)" }}
          >
            Add New Task
          </DialogTitle>
          <DialogDescription
            className="text-sm"
            style={{ color: "var(--muted-foreground)" }}
          >
            Create a new task with details, priority, and due date
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="text-sm font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              maxLength={200}
              className={`border transition-colors ${
                errors.title ? "border-red-500" : ""
              }`}
              style={{
                borderColor: errors.title ? "#ef4444" : "var(--border)",
                backgroundColor: "var(--background)",
                color: "var(--foreground)",
              }}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-sm font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              maxLength={1000}
              rows={3}
              className={`border transition-colors ${
                errors.description ? "border-red-500" : ""
              }`}
              style={{
                borderColor: errors.description ? "#ef4444" : "var(--border)",
                backgroundColor: "var(--background)",
                color: "var(--foreground)",
              }}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          {/* Due Date and Quick Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="dueDate"
                className="text-sm font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                Due Date
              </Label>
              <div className="flex gap-2">
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="flex-1 border"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--background)",
                    color: "var(--foreground)",
                  }}
                />
                {dueDate && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={clearDueDate}
                    title="Clear date"
                    className="border"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                      backgroundColor: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--muted)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Reminder Time Field */}
            <div className="space-y-2">
              <Label htmlFor="dueTime" className="text-sm font-semibold">
                Reminder Time
              </Label>
              <Input
                id="dueTime"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="border"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--background)",
                  color: "var(--foreground)",
                }}
              />
            </div>

            <div className="space-y-2">
              <Label
                className="text-sm font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                Quick Dates
              </Label>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDueDateShortcut(0)}
                  className="flex-1 text-xs border"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--muted)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  Today
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDueDateShortcut(1)}
                  className="flex-1 text-xs border"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--muted)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  Tomorrow
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDueDateShortcut(7)}
                  className="flex-1 text-xs border"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--muted)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  Next Week
                </Button>
              </div>
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label
              htmlFor="priority"
              className="text-sm font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Priority <span className="text-red-500">*</span>
            </Label>
            <Select
              value={priority}
              onValueChange={(value: "high" | "medium" | "low") =>
                setPriority(value)
              }
            >
              <SelectTrigger
                id="priority"
                className="border"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--background)",
                  color: "var(--foreground)",
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <SelectItem value="high" style={{ color: "var(--foreground)" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    High Priority
                  </div>
                </SelectItem>
                <SelectItem
                  value="medium"
                  style={{ color: "var(--foreground)" }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    Medium Priority
                  </div>
                </SelectItem>
                <SelectItem value="low" style={{ color: "var(--foreground)" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Low Priority
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Project */}
          <div className="space-y-2">
            <Label
              htmlFor="project"
              className="text-sm font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Project
            </Label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger
                id="project"
                className="border"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--background)",
                  color: "var(--foreground)",
                }}
              >
                <SelectValue placeholder="Select a project (optional)" />
              </SelectTrigger>
              <SelectContent
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <SelectItem value="none" style={{ color: "var(--foreground)" }}>
                  No Project
                </SelectItem>
                {projects && projects.length > 0 ? (
                  projects.map((project) => (
                    <SelectItem
                      key={project.id}
                      value={project.id}
                      style={{ color: "var(--foreground)" }}
                    >
                      {project.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem
                    value="no-projects"
                    disabled
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    No projects available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label
              htmlFor="tags"
              className="text-sm font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Tags
            </Label>
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1 border"
                    style={{
                      backgroundColor: "var(--muted)",
                      color: "var(--foreground)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <span className="text-xs">{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="rounded p-0.5 transition-colors"
                      style={{ color: "var(--foreground)" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "var(--muted)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <span className="text-xs">×</span>
                    </button>
                  </Badge>
                ))}
              </div>
            )}
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
                className="flex-1 border"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--background)",
                  color: "var(--foreground)",
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddTag}
                disabled={!newTag.trim()}
                className="border"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                  backgroundColor: "transparent",
                  opacity: !newTag.trim() ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (newTag.trim()) {
                    e.currentTarget.style.backgroundColor = "var(--muted)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Recurrence */}
          <div className="space-y-2">
            <Label
              htmlFor="recurrence"
              className="text-sm font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Recurrence
            </Label>
            <Select value={recurrence} onValueChange={setRecurrence}>
              <SelectTrigger
                id="recurrence"
                className="border"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--background)",
                  color: "var(--foreground)",
                }}
              >
                <SelectValue placeholder="Select recurrence pattern" />
              </SelectTrigger>
              <SelectContent
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <SelectItem value="none" style={{ color: "var(--foreground)" }}>
                  No Recurrence
                </SelectItem>
                <SelectItem
                  value="daily"
                  style={{ color: "var(--foreground)" }}
                >
                  Daily
                </SelectItem>
                <SelectItem
                  value="weekly"
                  style={{ color: "var(--foreground)" }}
                >
                  Weekly
                </SelectItem>
                <SelectItem
                  value="monthly"
                  style={{ color: "var(--foreground)" }}
                >
                  Monthly
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border"
              style={{
                borderColor: "var(--border)",
                color: "var(--foreground)",
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--muted)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="text-white shadow-md hover:shadow-lg transition-all"
              style={{
                background: isLoading
                  ? "var(--muted)"
                  : "linear-gradient(to right, var(--purple-600), var(--violet-600))",
                opacity: isLoading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = "scale(1.02)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {isLoading ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskModal;
