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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, PlusIcon, Repeat, Bell, Clock, XIcon } from "lucide-react";
import { useTaskSync } from "@/contexts/TaskSyncContext";
import { useTags } from "@/contexts/TagsContext";
import { useDashboard } from "@/contexts/DashboardContext";
import { format, addDays } from "date-fns";
import { toast } from "sonner";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddTaskModal = ({ isOpen, onClose }: AddTaskModalProps) => {
  const { addTask, isLoading, syncTasks } = useTaskSync();
  const { tags: allTags, createTag } = useTags();
  const { projects } = useDashboard();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<string>("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [newTag, setNewTag] = useState("");
  const [dueTime, setDueTime] = useState<string>("");
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
  }>({});

  // State for advanced features
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<string>('');
  const [recurrencePattern, setRecurrencePattern] = useState<Record<string, any>>({});
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(false);
  const [reminderTiming, setReminderTiming] = useState<'15min' | '1hr' | '1day'>('1hr');
  const [timezone, setTimezone] = useState<string>('UTC');

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
    setDueTime("");
    setErrors({});
    setIsRecurring(false);
    setFrequency('daily');
    setRecurrenceEndDate('');
    setRecurrencePattern({});
    setReminderEnabled(false);
    setReminderTiming('1hr');
    setTimezone('UTC');
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
      toast.error("Validation Error", {
        description: "Please fix the errors in the form",
      });
      return;
    }

    try {
      const allTagNames = allTags.map((tag) => tag.name.toLowerCase());
      const newTagPromises = selectedTags
        .filter((tag) => !allTagNames.includes(tag.toLowerCase()))
        .map((tagName) =>
          createTag({
            name: tagName,
            color: "#8b5cf6",
          })
        );

      await Promise.all(newTagPromises);

      const isPastDueDate = dueDate ? new Date(dueDate) < new Date() : false;

      const newTask: any = {
        title: title.trim(),
        priority: priority,
        completed: false,
      };

      if (description.trim()) {
        newTask.description = description.trim();
      }

      if (dueDate) {
        const dateStr = dueTime ? `${dueDate}T${dueTime}:00Z` : `${dueDate}T00:00:00Z`;
        newTask.due_date = dateStr;
      }
      
      if (selectedProject && selectedProject !== "none") {
        newTask.project_id = parseInt(selectedProject);
      }
      
      newTask.tag_ids = [];

      if (isRecurring === true) {
        newTask.is_recurring = true;
        
        if (frequency) {
          newTask.frequency = frequency;
        }
        
        if (recurrenceEndDate) {
          newTask.recurrence_end_date = `${recurrenceEndDate}T00:00:00Z`;
        }
        
        if (frequency === 'custom' && recurrencePattern && Object.keys(recurrencePattern).length > 0) {
          newTask.recurrence_pattern = recurrencePattern;
        }
      }
      
      if (reminderEnabled === true && !isPastDueDate && dueDate) {
        newTask.reminder_enabled = true;
        
        if (reminderTiming) {
          newTask.reminder_timing = reminderTiming;
        }
        
        if (timezone) {
          newTask.timezone = timezone;
        }
      }

      console.log('📤 Creating task:', newTask.title);

      const loadingToast = toast.loading("Creating task...", {
        description: `Creating "${title.trim()}"`,
      });

      await addTask(newTask).catch((err) => {
        console.warn('⚠️ Task creation error (but task might be created):', err.message);
      });
      
      toast.dismiss(loadingToast);
      toast.success("Task created successfully!", {
        description: dueDate 
          ? `"${title.trim()}" - Due ${format(new Date(dueDate), "EEEE, MMMM dd, yyyy")}`
          : `"${title.trim()}" has been added to your tasks`,
      });
      
      resetForm();
      onClose();

      setTimeout(() => {
        syncTasks();
      }, 500);
      
    } catch (error) {
      console.error("❌ Unexpected error:", error);
      
      toast.error("Error creating task", {
        description: "Something went wrong, but the task might have been created. Please refresh.",
      });
      
      resetForm();
      onClose();
      
      setTimeout(() => {
        syncTasks();
      }, 500);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      setSelectedTags([...selectedTags, newTag.trim()]);
      setNewTag("");
      
      toast.success("Tag added", {
        description: `"${newTag.trim()}" will be added to this task`,
      });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
    
    toast.info("Tag removed", {
      description: `"${tagToRemove}" has been removed`,
    });
  };

  const setDueDateShortcut = (days: number) => {
    const date = addDays(new Date(), days);
    setDueDate(format(date, "yyyy-MM-dd"));
    
    const dateLabels = {
      0: "Today",
      1: "Tomorrow", 
      7: "Next Week"
    };
    toast.success("Due date set", {
      description: `Task due ${dateLabels[days as keyof typeof dateLabels] || format(date, "MMMM dd, yyyy")}`,
    });
  };

  const clearDueDate = () => {
    setDueDate("");
    toast.info("Due date cleared", {
      description: "Task has no due date",
    });
  };

  const isPastDueDate = dueDate ? new Date(dueDate) < new Date() : false;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-md max-h-[90vh] overflow-y-auto border"
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
              Title <span style={{ color: "var(--destructive)" }}>*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              maxLength={200}
              className={`border transition-colors ${
                errors.title ? "border-destructive" : ""
              }`}
              style={{
                borderColor: errors.title ? "var(--destructive)" : "var(--border)",
                backgroundColor: "var(--background)",
                color: "var(--foreground)",
              }}
            />
            {errors.title && (
              <p className="text-xs mt-1" style={{ color: "var(--destructive)" }}>
                {errors.title}
              </p>
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
                errors.description ? "border-destructive" : ""
              }`}
              style={{
                borderColor: errors.description ? "var(--destructive)" : "var(--border)",
                backgroundColor: "var(--background)",
                color: "var(--foreground)",
              }}
            />
            {errors.description && (
              <p className="text-xs mt-1" style={{ color: "var(--destructive)" }}>
                {errors.description}
              </p>
            )}
          </div>

          {/* Due Date and Time */}
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
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueTime" className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                Time
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
          </div>

          {/* Quick Dates */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              Quick Dates
            </Label>
            <div className="flex gap-2">
              {[
                { label: "Today", days: 0 },
                { label: "Tomorrow", days: 1 },
                { label: "Next Week", days: 7 }
              ].map(({ label, days }) => (
                <Button
                  key={label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDueDateShortcut(days)}
                  className="flex-1 text-xs border transition-all"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--muted)";
                    e.currentTarget.style.borderColor = "var(--primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.borderColor = "var(--border)";
                  }}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority" className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              Priority <span style={{ color: "var(--destructive)" }}>*</span>
            </Label>
            <Select
              value={priority}
              onValueChange={(value: "high" | "medium" | "low") => setPriority(value)}
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
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--destructive)" }}></div>
                    High Priority
                  </div>
                </SelectItem>
                <SelectItem value="medium" style={{ color: "var(--foreground)" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    Medium Priority
                  </div>
                </SelectItem>
                <SelectItem value="low" style={{ color: "var(--foreground)" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--primary)" }}></div>
                    Low Priority
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Project */}
          <div className="space-y-2">
            <Label htmlFor="project" className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
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
            <Label htmlFor="tags" className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
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
                      className="rounded p-0.5 transition-colors hover:bg-destructive/10"
                      style={{ color: "var(--foreground)" }}
                    >
                      <XIcon className="h-3 w-3" />
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
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* ============================
              RECURRING TASKS SECTION
          ============================ */}
          <div className="space-y-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
            {/* Recurring Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="h-4 w-4" style={{ color: "var(--purple-600)" }} />
                <Label
                  htmlFor="isRecurring"
                  className="text-sm font-semibold cursor-pointer"
                  style={{ color: "var(--foreground)" }}
                >
                  Recurring Task
                </Label>
              </div>
              <Switch
                id="isRecurring"
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
              />
            </div>

            {/* Recurring Options */}
            {isRecurring && (
              <div 
                className="space-y-3 p-3 rounded-lg border animate-in fade-in slide-in-from-top-2 duration-300"
                style={{
                  backgroundColor: "var(--muted)",
                  borderColor: "var(--border)",
                }}
              >
                {/* Frequency */}
                <div className="space-y-2">
                  <Label htmlFor="frequency" className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
                    Repeat Frequency
                  </Label>
                  <Select value={frequency} onValueChange={(value: any) => setFrequency(value)}>
                    <SelectTrigger
                      id="frequency"
                      className="h-9 border text-sm"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "var(--background)",
                        color: "var(--foreground)",
                      }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                      <SelectItem value="daily" style={{ color: "var(--foreground)" }}>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-3 w-3" />
                          Daily
                        </div>
                      </SelectItem>
                      <SelectItem value="weekly" style={{ color: "var(--foreground)" }}>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-3 w-3" />
                          Weekly
                        </div>
                      </SelectItem>
                      <SelectItem value="monthly" style={{ color: "var(--foreground)" }}>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-3 w-3" />
                          Monthly
                        </div>
                      </SelectItem>
                      <SelectItem value="custom" style={{ color: "var(--foreground)" }}>
                        <div className="flex items-center gap-2">
                          <Repeat className="h-3 w-3" />
                          Custom
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <Label htmlFor="recurrenceEndDate" className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
                    Repeat Until (Optional)
                  </Label>
                  <Input
                    id="recurrenceEndDate"
                    type="date"
                    value={recurrenceEndDate}
                    onChange={(e) => setRecurrenceEndDate(e.target.value)}
                    min={dueDate || undefined}
                    className="h-9 border text-sm"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: "var(--background)",
                      color: "var(--foreground)",
                    }}
                  />
                </div>

                {/* Summary Badge */}
                <Badge
                  variant="outline"
                  className="text-xs font-normal border w-fit"
                  style={{
                    backgroundColor: "var(--purple-100)",
                    color: "var(--purple-700)",
                    borderColor: "var(--purple-300)",
                  }}
                >
                  <Repeat className="h-3 w-3 mr-1" />
                  Repeats {frequency}
                  {recurrenceEndDate && ` until ${format(new Date(recurrenceEndDate), "MMM dd, yyyy")}`}
                </Badge>
              </div>
            )}
          </div>

          {/* ============================
              REMINDERS SECTION
          ============================ */}
          <div className="space-y-3">
            {/* Reminder Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" style={{ color: "var(--violet-600)" }} />
                <Label
                  htmlFor="reminderEnabled"
                  className="text-sm font-semibold cursor-pointer"
                  style={{ color: "var(--foreground)" }}
                >
                  Set Reminder
                </Label>
              </div>
              <Switch
                id="reminderEnabled"
                checked={reminderEnabled && !isPastDueDate && !!dueDate}
                onCheckedChange={setReminderEnabled}
                disabled={isPastDueDate || !dueDate}
              />
            </div>

            {/* Warnings */}
            {isPastDueDate && dueDate && (
              <div 
                className="p-2 rounded-md border text-xs animate-in fade-in"
                style={{
                  backgroundColor: "var(--muted)",
                  borderColor: "var(--border)",
                  color: "var(--muted-foreground)",
                }}
              >
                ⚠️ Cannot set reminder for past dates
              </div>
            )}

            {!dueDate && reminderEnabled && (
              <div 
                className="p-2 rounded-md border text-xs animate-in fade-in"
                style={{
                  backgroundColor: "var(--muted)",
                  borderColor: "var(--border)",
                  color: "var(--muted-foreground)",
                }}
              >
                ℹ️ Please set a due date first to enable reminders
              </div>
            )}

            {/* Reminder Options */}
            {reminderEnabled && !isPastDueDate && dueDate && (
              <div 
                className="space-y-3 p-3 rounded-lg border animate-in fade-in slide-in-from-top-2 duration-300"
                style={{
                  backgroundColor: "var(--muted)",
                  borderColor: "var(--border)",
                }}
              >
                {/* Timing */}
                <div className="space-y-2">
                  <Label htmlFor="reminderTiming" className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
                    Remind Me
                  </Label>
                  <Select value={reminderTiming} onValueChange={(value: any) => setReminderTiming(value)}>
                    <SelectTrigger
                      id="reminderTiming"
                      className="h-9 border text-sm"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "var(--background)",
                        color: "var(--foreground)",
                      }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                      <SelectItem value="15min" style={{ color: "var(--foreground)" }}>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          15 minutes before
                        </div>
                      </SelectItem>
                      <SelectItem value="1hr" style={{ color: "var(--foreground)" }}>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          1 hour before
                        </div>
                      </SelectItem>
                      <SelectItem value="1day" style={{ color: "var(--foreground)" }}>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          1 day before
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Timezone */}
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
                    Timezone
                  </Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger
                      id="timezone"
                      className="h-9 border text-sm"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "var(--background)",
                        color: "var(--foreground)",
                      }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                      <SelectItem value="UTC" style={{ color: "var(--foreground)" }}>UTC</SelectItem>
                      <SelectItem value="America/New_York" style={{ color: "var(--foreground)" }}>Eastern (ET)</SelectItem>
                      <SelectItem value="America/Chicago" style={{ color: "var(--foreground)" }}>Central (CT)</SelectItem>
                      <SelectItem value="America/Los_Angeles" style={{ color: "var(--foreground)" }}>Pacific (PT)</SelectItem>
                      <SelectItem value="Asia/Karachi" style={{ color: "var(--foreground)" }}>Pakistan (PKT)</SelectItem>
                      <SelectItem value="Asia/Dubai" style={{ color: "var(--foreground)" }}>Dubai (GST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Summary Badge */}
                <Badge
                  variant="outline"
                  className="text-xs font-normal border w-fit"
                  style={{
                    backgroundColor: "var(--violet-100)",
                    color: "var(--violet-700)",
                    borderColor: "var(--violet-300)",
                  }}
                >
                  <Bell className="h-3 w-3 mr-1" />
                  {reminderTiming === '15min' && '15 min'}
                  {reminderTiming === '1hr' && '1 hour'}
                  {reminderTiming === '1day' && '1 day'} before
                </Badge>
              </div>
            )}
          </div>

          {/* Footer */}
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