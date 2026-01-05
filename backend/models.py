from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from models import Task, Tag


class UserBase(SQLModel):
    email: str = Field(unique=True, nullable=False, max_length=255)
    name: str = Field(min_length=2, max_length=100, nullable=False)
    avatar: Optional[str] = Field(default=None, max_length=255, nullable=True)
    bio: Optional[str] = Field(default=None, max_length=500, nullable=True)
    phone: Optional[str] = Field(default=None, max_length=20, nullable=True)
    timezone: Optional[str] = Field(default="UTC", max_length=50, nullable=True)
    locale: Optional[str] = Field(default="en-US", max_length=10, nullable=True)


class User(SQLModel, table=True):
    __tablename__ = "users"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    name: str
    hashed_password: str
    avatar: Optional[str] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    timezone: str = Field(default="UTC")
    locale: str = Field(default="en-US")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    tasks: list["Task"] = Relationship(back_populates="user")
    notifications: list["Notification"] = Relationship(back_populates="user")
    preferences: Optional["UserPreference"] = Relationship(back_populates="user")
    settings: Optional["UserSettings"] = Relationship(back_populates="user")
    refresh_tokens: list["RefreshToken"] = Relationship(back_populates="user")
    projects: list["Project"] = Relationship(back_populates="user")
    tags: list["Tag"] = Relationship(back_populates="user")
    conversations: list["Conversation"] = Relationship(back_populates="user")


class TaskBase(SQLModel):
    title: str = Field(min_length=1, max_length=200, nullable=False)
    description: str = Field(default="", max_length=1000)
    completed: bool = Field(default=False)


class TaskTagLink(SQLModel, table=True):
    __tablename__ = "task_tag_links"

    task_id: int = Field(foreign_key="tasks.id", primary_key=True)
    tag_id: int = Field(foreign_key="tags.id", primary_key=True)


class Task(TaskBase, table=True):
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(min_length=1, max_length=200, nullable=False)
    description: str = Field(default="", max_length=1000)
    completed: bool = Field(default=False)
    due_date: Optional[datetime] = Field(default=None)
    priority: str = Field(default="medium", max_length=10, nullable=False)
    status: str = Field(default="pending", max_length=20, nullable=False)  # pending, in_progress, completed
    project_id: Optional[int] = Field(foreign_key="projects.id", nullable=True, index=True)
    user_id: int = Field(foreign_key="users.id", nullable=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: Optional[User] = Relationship(back_populates="tasks")
    project: Optional["Project"] = Relationship(back_populates="tasks")
    notifications: list["Notification"] = Relationship(back_populates="task")
    tags: list["Tag"] = Relationship(back_populates="tasks", link_model=TaskTagLink)


class Notification(SQLModel, table=True):
    __tablename__ = "notifications"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", nullable=False, index=True)
    type: str = Field(max_length=50, nullable=False)
    title: str = Field(max_length=200, nullable=False)
    message: str = Field(max_length=1000, nullable=False)
    task_id: Optional[int] = Field(foreign_key="tasks.id", nullable=True)
    task_title: Optional[str] = Field(max_length=200, nullable=True)
    read: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    icon: Optional[str] = Field(max_length=50, nullable=True)
    color: Optional[str] = Field(max_length=20, nullable=True)

    # Relationships
    user: Optional[User] = Relationship(back_populates="notifications")
    task: Optional[Task] = Relationship(back_populates="notifications")


class UserPreference(SQLModel, table=True):
    __tablename__ = "user_preferences"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", nullable=False, unique=True)
    theme: str = Field(default="system", max_length=20, nullable=False)
    accent_color: str = Field(default="#3b82f6", max_length=7, nullable=False)
    font_size: str = Field(default="M", max_length=1, nullable=False)
    notifications_enabled: bool = Field(default=True)
    email_notifications: bool = Field(default=True)
    default_priority: str = Field(default="medium", max_length=10, nullable=False)
    default_project_id: Optional[int] = Field(foreign_key="projects.id", nullable=True)
    default_view: str = Field(default="list", max_length=10, nullable=False)
    items_per_page: int = Field(default=10)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship
    user: Optional[User] = Relationship(back_populates="preferences")


class Project(SQLModel, table=True):
    __tablename__ = "projects"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", nullable=False, index=True)
    name: str = Field(max_length=100, nullable=False)
    description: str = Field(default="", max_length=500)
    color: str = Field(default="#3b82f6", max_length=7, nullable=False)
    icon: Optional[str] = Field(max_length=50, nullable=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: Optional[User] = Relationship(back_populates="projects")
    tasks: list[Task] = Relationship(back_populates="project")


class Tag(SQLModel, table=True):
    __tablename__ = "tags"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", nullable=False, index=True)
    name: str = Field(min_length=3, max_length=100, nullable=False)
    color: str = Field(default="#3B82F6", max_length=7, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: Optional[User] = Relationship(back_populates="tags")
    tasks: list["Task"] = Relationship(back_populates="tags", link_model=TaskTagLink)


class UserSettings(SQLModel, table=True):
    __tablename__ = "user_settings"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", nullable=False, unique=True)

    # Appearance
    appearance_theme: str = Field(default="system", max_length=20, nullable=False)
    appearance_accent_color: str = Field(default="#a855f7", max_length=7, nullable=False)
    appearance_font_size: str = Field(default="M", max_length=10, nullable=False)
    appearance_language: str = Field(default="en", max_length=10, nullable=False)
    appearance_date_format: str = Field(default="MM/DD/YYYY", max_length=20, nullable=False)
    appearance_time_format: str = Field(default="12h", max_length=2, nullable=False)

    # Notifications
    notifications_enabled: bool = Field(default=True)
    notifications_sound_enabled: bool = Field(default=True)
    notifications_email_notifications: bool = Field(default=True)
    notifications_push_notifications: bool = Field(default=False)
    notifications_task_reminders: bool = Field(default=True)
    notifications_daily_digest: bool = Field(default=False)

    # Task defaults
    task_defaults_default_priority: str = Field(default="medium", max_length=10, nullable=False)
    task_defaults_default_project_id: Optional[int] = Field(foreign_key="projects.id", nullable=True)
    task_defaults_default_view: str = Field(default="list", max_length=10, nullable=False)
    task_defaults_items_per_page: int = Field(default=20)
    task_defaults_auto_assign_today: bool = Field(default=True)

    # Privacy
    privacy_data_retention_days: int = Field(default=90)
    privacy_export_data_enabled: bool = Field(default=True)
    privacy_analytics_enabled: bool = Field(default=True)
    privacy_profile_visible: bool = Field(default=True)

    # Integrations
    integrations_calendar_connected: bool = Field(default=False)
    integrations_email_connected: bool = Field(default=False)
    integrations_webhooks_enabled: bool = Field(default=False)
    integrations_connected_services: str = Field(default="[]", max_length=1000, nullable=False)

    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship
    user: Optional[User] = Relationship(back_populates="settings")


class RefreshToken(SQLModel, table=True):
    __tablename__ = "refresh_tokens"

    id: Optional[int] = Field(default=None, primary_key=True)
    token: str = Field(unique=True, nullable=False, max_length=255)
    user_id: int = Field(foreign_key="users.id", nullable=False, index=True)
    expires_at: datetime = Field(nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)

    user: Optional[User] = Relationship(back_populates="refresh_tokens")


class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", nullable=False, index=True)
    title: str = Field(max_length=200, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_archived: bool = Field(default=False)

    # Relationships
    user: Optional[User] = Relationship(back_populates="conversations")
    messages: list["ChatMessage"] = Relationship(
        back_populates="conversation",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}  # ✅ CASCADE DELETE
    )


class ChatMessage(SQLModel, table=True):
    __tablename__ = "chat_messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversations.id", nullable=False, index=True)
    role: str = Field(max_length=20, nullable=False)
    content: str = Field(nullable=False)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata_json: Optional[str] = Field(default=None)

    # Relationship
    conversation: Optional[Conversation] = Relationship(back_populates="messages")