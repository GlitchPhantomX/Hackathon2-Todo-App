"""
Enhanced TodoAgent with Multi-language Support (English + Urdu)
"""

import os
import json
import asyncio
from typing import Dict, List, Any, Optional
from sqlmodel import Session, select, col
from models import Task
from datetime import datetime, timedelta

# ✅ Import translation service
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
try:
    from utils.translation_service import TranslationService
except ImportError:
    # Fallback if in different directory structure
    class TranslationService:
        @staticmethod
        def detect_language(text):
            return 'en'
        @staticmethod
        def translate_to_english(text):
            return text
        @staticmethod
        def translate_to_urdu(text):
            return text
        @staticmethod
        def get_system_prompt_for_language(lang):
            return "You are a helpful assistant."


class TodoAgent:
    """
    AI Agent for managing todo tasks through natural conversation
    
    ✅ NEW FEATURES:
    - Multi-language support (English + Urdu)
    - Voice command support
    - Language auto-detection
    - Translated responses
    """
    
    def __init__(self, user_id: int, session: Session, language: str = "auto"):
        self.user_id = user_id
        self.session = session
        self.language = language  # 'en', 'ur', or 'auto'
        
        # OpenRouter Configuration
        self.api_key = os.getenv("OPENROUTER_API_KEY", "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")
        self.base_url = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
        self.model = os.getenv("OPENROUTER_MODEL", "mistralai/devstral-2512:free")
        
        # Initialize OpenAI client (OpenRouter is OpenAI-compatible)
        self.use_llm = bool(self.api_key)
        if self.use_llm:
            try:
                from openai import OpenAI
                self.client = OpenAI(
                    api_key=self.api_key,
                    base_url=self.base_url
                )
                print(f"✅ LLM initialized: {self.model}")
            except ImportError:
                print("⚠️ OpenAI package not installed. Using fallback responses.")
                self.use_llm = False
            except Exception as e:
                print(f"⚠️ LLM initialization error: {e}")
                self.use_llm = False

        # Initialize WebSocket manager for broadcasting
        try:
            from routers.websocket import manager, WebSocketEventType
            self.websocket_manager = manager
            self.WebSocketEventType = WebSocketEventType
        except ImportError:
            print("⚠️ WebSocket manager not available")
            self.websocket_manager = None
            self.WebSocketEventType = None
    
    def _detect_and_translate_message(self, message: str) -> tuple[str, str]:
        """
        Detect message language and translate to English if needed
        
        Returns:
            (translated_message, detected_language)
        """
        # Auto-detect language if not specified
        if self.language == "auto":
            detected_lang = TranslationService.detect_language(message)
            print(f"🌍 Detected language: {detected_lang}")
        else:
            detected_lang = self.language
        
        # Translate to English for processing
        if detected_lang == 'ur':
            translated = TranslationService.translate_to_english(message)
            print(f"🔄 Translated from Urdu: '{message}' -> '{translated}'")
            return translated, 'ur'
        
        return message, 'en'
    
    def _translate_response(self, response: str, target_language: str) -> str:
        """
        Translate response to target language if needed
        
        Args:
            response: Response text in English
            target_language: Target language ('en' or 'ur')
            
        Returns:
            Translated response
        """
        if target_language == 'ur':
            translated = TranslationService.translate_to_urdu(response)
            print(f"🔄 Translated to Urdu: '{response}' -> '{translated}'")
            return translated
        
        return response
    
    async def process_message(
        self,
        message: str,
        conversation_history: List[Dict[str, str]],
        voice_input: bool = False  # ✅ NEW: Flag for voice commands
    ) -> Dict[str, Any]:
        """
        Process user message with multi-language support
        
        Args:
            message: User message (in any supported language)
            conversation_history: Previous messages
            voice_input: Whether message came from voice input
            
        Returns:
            Response dict with translated content
        """
        
        # ✅ STEP 1: Detect language and translate to English
        english_message, detected_lang = self._detect_and_translate_message(message)
        
        print(f"🗣️ Original message: {message}")
        print(f"🌍 Detected language: {detected_lang}")
        print(f"📝 Processing in English: {english_message}")
        
        # ✅ STEP 2: Process message in English
        message_lower = english_message.lower()

        # ✅ DETECT DELETE INTENT
        delete_keywords = ['remove', 'delete', 'get rid of', 'erase', 'حذف کریں']
        if any(keyword in message_lower for keyword in delete_keywords):
            task_title = self._extract_task_name_from_delete_message(english_message)
            
            if not task_title or len(task_title) < 2:
                response = "Please specify which task you want to delete."
                return {
                    "response": self._translate_response(response, detected_lang),
                    "language": detected_lang,
                    "metadata": {
                        "action": "delete_task",
                        "success": False,
                        "voice_input": voice_input
                    }
                }
            
            result = await self.delete_task_by_title(task_title)
            
            return {
                "response": self._translate_response(result["message"], detected_lang),
                "language": detected_lang,
                "metadata": {
                    "action": "delete_task",
                    "success": result["success"],
                    "task_title": task_title,
                    "voice_input": voice_input
                }
            }

        # ✅ DETECT LIST INTENT
        list_keywords = ['show', 'list', 'what are', "what's", 'display', 'view', 'my tasks', 'see tasks', 'دکھائیں']
        if any(keyword in message_lower for keyword in list_keywords):
            tasks = self.session.exec(
                select(Task).where(Task.user_id == self.user_id).order_by(Task.created_at.desc())
            ).all()

            response = self.format_tasks_response(tasks)

            return {
                "response": self._translate_response(response, detected_lang),
                "language": detected_lang,
                "metadata": {
                    "action": "list_tasks",
                    "count": len(tasks),
                    "voice_input": voice_input
                }
            }

        # ✅ DETECT CREATE INTENT
        create_keywords = ['add', 'create', 'new task', 'make a task', 'todo', 'remind me', 'شامل کریں', 'بنائیں']
        if any(keyword in message_lower for keyword in create_keywords):
            result = await self._create_task(english_message, await self._get_task_context("create_task", english_message))
            result["response"] = self._translate_response(result["response"], detected_lang)
            result["language"] = detected_lang
            result["metadata"]["voice_input"] = voice_input
            return result

        # ✅ DETECT COMPLETE INTENT
        complete_keywords = ['complete', 'finish', 'done', 'mark as done', 'finished', 'completed', 'مکمل کریں']
        if any(keyword in message_lower for keyword in complete_keywords):
            result = await self._complete_task(english_message, await self._get_task_context("complete_task", english_message))
            result["response"] = self._translate_response(result["response"], detected_lang)
            result["language"] = detected_lang
            result["metadata"]["voice_input"] = voice_input
            return result

        # ✅ Default: General response with language support
        result = await self._general_response(english_message, conversation_history, {}, detected_lang)
        result["metadata"]["voice_input"] = voice_input
        return result
    
    def _extract_task_name_from_delete_message(self, message: str) -> str:
        """Extract clean task name from delete message"""
        message_lower = message.lower()
        
        for keyword in ['remove', 'delete', 'get rid of', 'erase']:
            message_lower = message_lower.replace(keyword, '')
        
        phrases_to_remove = [
            'tasks from my list', 'from my list', 'the task called',
            'the task', 'task called', 'task named', 'task', 'from', 'my', 'list'
        ]
        
        for phrase in phrases_to_remove:
            message_lower = message_lower.replace(phrase, '')
        
        task_name = message_lower.strip().strip('"').strip("'").strip()
        print(f"🔍 Extracted task name: '{task_name}'")
        return task_name
    
    async def _get_task_context(self, intent: str, message: str) -> Dict[str, Any]:
        """Get relevant task data for context"""
        context = {"user_id": self.user_id}
        
        if intent in ["list_tasks", "search_tasks", "get_statistics"]:
            tasks = list(self.session.exec(
                select(Task).where(Task.user_id == self.user_id).order_by(Task.created_at.desc())
            ))
            context["tasks"] = [self._task_to_dict(t) for t in tasks]
            context["task_count"] = len(tasks)
        
        return context
    
    def _task_to_dict(self, task: Task) -> Dict[str, Any]:
        """Convert task to dictionary"""
        return {
            "id": task.id,
            "title": task.title,
            "description": task.description or "",
            "status": "completed" if task.completed else "pending",
            "priority": task.priority,
            "completed": task.completed,
            "due_date": task.due_date.isoformat() if task.due_date else None,
            "created_at": task.created_at.isoformat() if task.created_at else None
        }

    def format_tasks_response(self, tasks: list) -> str:
        """Format tasks in a concise, readable way"""
        if not tasks:
            return "You don't have any tasks yet. Want to add one? 😊"

        high_priority = [t for t in tasks if t.priority == 'high' and not t.completed]
        medium_priority = [t for t in tasks if t.priority == 'medium' and not t.completed]
        low_priority = [t for t in tasks if t.priority == 'low' and not t.completed]
        completed = [t for t in tasks if t.completed]

        response = f"You have {len(tasks)} task{'s' if len(tasks) != 1 else ''}:\n\n"

        if high_priority:
            response += "**High Priority** 🔴\n"
            for i, task in enumerate(high_priority, 1):
                due = f" (Due: {task.due_date.strftime('%b %d')})" if task.due_date else ""
                response += f"{i}. {task.title}{due}\n"
            response += "\n"

        if medium_priority:
            response += "**Medium Priority** 🟡\n"
            for i, task in enumerate(medium_priority, 1):
                due = f" (Due: {task.due_date.strftime('%b %d')})" if task.due_date else ""
                response += f"{i}. {task.title}{due}\n"
            response += "\n"

        if low_priority:
            response += "**Low Priority** 🟢\n"
            for i, task in enumerate(low_priority, 1):
                due = f" (Due: {task.due_date.strftime('%b %d')})" if task.due_date else ""
                response += f"{i}. {task.title}{due}\n"
            response += "\n"

        if completed:
            response += f"**Completed** ✓ ({len(completed)} tasks)\n\n"

        return response.strip()
    
    async def _generate_llm_response(
        self,
        system_prompt: str,
        user_message: str,
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """Generate response using LLM"""
        
        if not self.use_llm:
            return "I'm your task assistant! (OpenRouter API not configured)"
        
        try:
            messages = [
                {"role": "system", "content": system_prompt}
            ]
            
            if context:
                context_str = f"\n\nContext:\n{json.dumps(context, indent=2)}"
                messages.append({"role": "system", "content": context_str})
            
            messages.append({"role": "user", "content": user_message})
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.5,
                max_tokens=300
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"LLM Error: {e}")
            return "I encountered an error processing your request. Please try again."
    
    async def _create_task(self, message: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new task from user message"""
        
        system_prompt = """You are a task extraction assistant.
Extract the task title, priority (low/medium/high), and description from the user's message.

IMPORTANT RULES:
1. Extract ONLY the actual task, remove words like "add", "create", "task", "tasks"
2. If user mentions "high priority", "urgent", "important" → priority = "high"
3. If user mentions "low priority", "later" → priority = "low"
4. Otherwise → priority = "medium"

Respond ONLY with valid JSON (no markdown, no backticks):
{"title": "clean task title", "priority": "high/medium/low", "description": ""}"""
        
        extraction_response = await self._generate_llm_response(
            system_prompt,
            f"Extract task from: {message}",
            {}
        )
        
        try:
            clean_response = extraction_response.strip()
            if clean_response.startswith("```"):
                clean_response = clean_response.split("```")[1]
                if clean_response.startswith("json"):
                    clean_response = clean_response[4:].strip()
            
            task_data = json.loads(clean_response)
            title = task_data.get("title", "").strip()
            priority = task_data.get("priority", "medium").lower()
            description = task_data.get("description", "")
            
            if priority not in ["low", "medium", "high"]:
                priority = "medium"
            
        except (json.JSONDecodeError, Exception) as e:
            print(f"⚠️ LLM extraction failed: {e}")
            
            title = message
            for trigger in ['create', 'add', 'new task', 'make a task', 'todo', 'remind me', 'tasks', 'task']:
                if trigger in message.lower():
                    parts = message.lower().split(trigger, 1)
                    if len(parts) > 1:
                        title = parts[1].strip()
                    break
            
            title = title.strip('.,!?\'"')
            
            priority = "medium"
            if any(word in message.lower() for word in ['urgent', 'important', 'high priority', 'asap', 'critical']):
                priority = "high"
            elif any(word in message.lower() for word in ['low priority', 'later', 'sometime', 'eventually']):
                priority = "low"
            
            description = ""
        
        if not title or len(title) < 2:
            return {
                "response": "Please tell me what task you want to add.",
                "metadata": {"action": "create_task", "success": False}
            }
        
        new_task = Task(
            user_id=self.user_id,
            title=title.capitalize(),
            description=description,
            priority=priority,
            completed=False
        )
        
        self.session.add(new_task)
        self.session.commit()
        self.session.refresh(new_task)

        await self._broadcast_task_created(new_task)

        return {
            "response": f"✅ Task '{new_task.title}' added successfully!",
            "metadata": {
                "action": "create_task",
                "success": True,
                "task_id": new_task.id,
                "task_title": new_task.title
            }
        }
    
    async def _complete_task(self, message: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Mark task as complete"""
        
        task_name = message.lower()
        for keyword in ['complete', 'finish', 'done', 'mark as done', 'mark', 'finished', 'completed']:
            task_name = task_name.replace(keyword, '')
        task_name = task_name.replace('the task', '').replace('task', '').strip().strip('"').strip("'")
        
        if not task_name or len(task_name) < 2:
            return {
                "response": "Please specify which task you want to mark as complete.",
                "metadata": {"action": "complete_task", "success": False}
            }
        
        tasks = self.session.exec(
            select(Task).where(
                Task.user_id == self.user_id,
                Task.completed == False
            )
        ).all()
        
        matched_task = None
        for task in tasks:
            if task.title.lower() == task_name:
                matched_task = task
                break
        
        if not matched_task:
            for task in tasks:
                if task_name in task.title.lower() or task.title.lower() in task_name:
                    matched_task = task
                    break
        
        if not matched_task:
            return {
                "response": f"I couldn't find a task matching '{task_name}'.",
                "metadata": {"action": "complete_task", "success": False}
            }
        
        matched_task.completed = True
        self.session.add(matched_task)
        self.session.commit()

        await self._broadcast_task_updated(matched_task)

        return {
            "response": f"🎉 Great job! '{matched_task.title}' is now complete!",
            "metadata": {
                "action": "complete_task",
                "success": True,
                "task_id": matched_task.id,
                "task_title": matched_task.title
            }
        }
    
    async def _general_response(
        self,
        message: str,
        conversation_history: List[Dict[str, str]],
        context: Dict[str, Any],
        language: str = 'en'
    ) -> Dict[str, Any]:
        """General conversational response with language support"""

        # ✅ Get language-appropriate system prompt
        system_prompt = TranslationService.get_system_prompt_for_language(language)
        
        response_text = await self._generate_llm_response(
            system_prompt,
            message,
            context
        )
        
        # ✅ Translate response if needed
        translated_response = self._translate_response(response_text, language)
        
        return {
            "response": translated_response,
            "language": language,
            "metadata": {"action": "general"}
        }

    async def _broadcast_task_event(self, event_type: str, task_data: Dict[str, Any]):
        """Broadcast task event to WebSocket connections"""
        if not self.websocket_manager or not self.WebSocketEventType:
            return

        try:
            sync_event = {
                "type": event_type,
                "data": {
                    "task": task_data,
                    "userId": str(self.user_id),
                    "timestamp": datetime.utcnow().isoformat()
                }
            }
            await self.websocket_manager.broadcast_to_user(json.dumps(sync_event), self.user_id)
        except Exception as e:
            print(f"⚠️ Error broadcasting task event: {e}")

    async def _broadcast_task_created(self, task: Task):
        """Broadcast task creation event"""
        task_dict = self._task_to_dict(task)
        await self._broadcast_task_event(self.WebSocketEventType.TASK_CREATED, task_dict)

    async def _broadcast_task_updated(self, task: Task):
        """Broadcast task update event"""
        task_dict = self._task_to_dict(task)
        await self._broadcast_task_event(self.WebSocketEventType.TASK_UPDATED, task_dict)

    async def delete_task_by_title(self, title: str) -> Dict[str, Any]:
        """Delete a task by matching its title"""
        try:
            if not title or len(title) < 2:
                return {
                    "success": False,
                    "message": "Please specify which task you want to delete."
                }
            
            all_tasks = self.session.exec(
                select(Task).where(Task.user_id == self.user_id)
            ).all()
            
            if not all_tasks:
                return {
                    "success": False,
                    "message": "You don't have any tasks to delete."
                }
            
            matched_task = None
            title_lower = title.lower().strip()
            
            # Exact match
            for task in all_tasks:
                if task.title.lower() == title_lower:
                    matched_task = task
                    break
            
            # Partial match
            if not matched_task:
                for task in all_tasks:
                    task_title_lower = task.title.lower()
                    if title_lower in task_title_lower or task_title_lower in title_lower:
                        matched_task = task
                        break
            
            if not matched_task:
                task_list = "\n".join([f"- {t.title}" for t in all_tasks[:5]])
                return {
                    "success": False,
                    "message": f"Task '{title}' not found. Your tasks:\n{task_list}"
                }
            
            task_title = matched_task.title
            task_id = matched_task.id
            
            self.session.delete(matched_task)
            self.session.commit()
            
            await self._broadcast_task_deleted(task_id)
            
            return {
                "success": True,
                "message": f"✅ Task '{task_title}' has been deleted."
            }
            
        except Exception as e:
            print(f"❌ Error deleting task: {e}")
            return {
                "success": False,
                "message": f"Failed to delete task: {str(e)}"
            }

    async def _broadcast_task_deleted(self, task_id: int):
        """Broadcast task deletion event"""
        if not self.websocket_manager or not self.WebSocketEventType:
            return

        try:
            event_data = {
                "taskId": str(task_id),
                "userId": str(self.user_id),
                "timestamp": datetime.utcnow().isoformat()
            }
            
            sync_event = {
                "type": self.WebSocketEventType.TASK_DELETED,
                "data": event_data
            }
            await self.websocket_manager.broadcast_to_user(json.dumps(sync_event), self.user_id)
        except Exception as e:
            print(f"⚠️ Error broadcasting task deletion: {e}")