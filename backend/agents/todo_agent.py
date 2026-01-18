import os
import json
import asyncio
from typing import Dict, List, Any, Optional
from sqlmodel import Session, select, col
from models import Task
from datetime import datetime, timedelta

class TodoAgent:
    """AI Agent for managing todo tasks through natural conversation with LLM"""
    
    def __init__(self, user_id: int, session: Session):
        self.user_id = user_id
        self.session = session
        self.language = 'en'  # ✅ Default language
        
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
    
    def _extract_task_name_from_delete_message(self, message: str) -> str:
        """
        Extract clean task name from delete message
        
        Examples:
        "remove Add tasks" -> "add tasks"
        'remove "Remove"' -> "remove"
        "delete the task called Buy groceries" -> "buy groceries"
        """
        message_lower = message.lower()
        
        # Remove delete keywords
        for keyword in ['remove', 'delete', 'get rid of', 'erase']:
            message_lower = message_lower.replace(keyword, '')
        
        # Remove common phrases
        phrases_to_remove = [
            'tasks from my list',
            'from my list',
            'the task called',
            'the task',
            'task called',
            'task named',
            'task',
            'from',
            'my',
            'list'
        ]
        
        for phrase in phrases_to_remove:
            message_lower = message_lower.replace(phrase, '')
        
        # Remove all quotes and extra spaces
        task_name = message_lower.strip().strip('"').strip("'").strip()
        
        print(f"🔍 Extracted task name: '{task_name}'")
        return task_name
    
    async def process_message(
        self,
        message: str,
        conversation_history: List[Dict[str, str]],
        language: str = 'en'  # ✅ ADD LANGUAGE PARAMETER
    ) -> Dict[str, Any]:
        """Process user message and determine intent"""
        
        # ✅ STORE LANGUAGE PREFERENCE
        self.language = language
        print(f"🌍 Processing in language: {language}")
        
        message_lower = message.lower()

        # ✅ DETECT DELETE INTENT FIRST - HIGHEST PRIORITY
        delete_keywords = ['remove', 'delete', 'get rid of', 'erase']
        if any(keyword in message_lower for keyword in delete_keywords):
            # Extract task title using improved logic
            task_title = self._extract_task_name_from_delete_message(message)
            
            if not task_title or len(task_title) < 2:
                return {
                    "response": "Please specify which task you want to delete. For example: 'remove Add tasks'",
                    "metadata": {
                        "action": "delete_task",
                        "success": False
                    }
                }
            
            print(f"🗑️ DELETE INTENT DETECTED: '{task_title}'")

            # Call delete function
            result = await self.delete_task_by_title(task_title)

            return {
                "response": result["message"],
                "metadata": {
                    "action": "delete_task",
                    "success": result["success"],
                    "task_title": task_title
                }
            }

        # ✅ DETECT LIST INTENT
        list_keywords = ['show', 'list', 'what are', "what's", 'display', 'view', 'my tasks', 'see tasks']
        if any(keyword in message_lower for keyword in list_keywords):
            # Fetch and list tasks
            tasks = self.session.exec(
                select(Task).where(Task.user_id == self.user_id).order_by(Task.created_at.desc())
            ).all()

            # Format tasks concisely
            response = self.format_tasks_response(tasks)

            return {
                "response": response,
                "metadata": {
                    "action": "list_tasks",
                    "count": len(tasks)
                }
            }

        # ✅ DETECT CREATE INTENT
        create_keywords = ['add', 'create', 'new task', 'make a task', 'todo', 'remind me']
        if any(keyword in message_lower for keyword in create_keywords):
            # Extract task details and create
            return await self._create_task(message, await self._get_task_context("create_task", message))

        # ✅ DETECT COMPLETE INTENT
        complete_keywords = ['complete', 'finish', 'done', 'mark as done', 'finished', 'completed']
        if any(keyword in message_lower for keyword in complete_keywords):
            return await self._complete_task(message, await self._get_task_context("complete_task", message))

        # Default: General response
        return await self._general_response(message, conversation_history, {})
    
    async def _get_task_context(self, intent: str, message: str) -> Dict[str, Any]:
        """Get relevant task data for context"""
        
        context = {"user_id": self.user_id}
        
        # Get tasks based on intent
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
        """
        Format tasks in a concise, readable way with language support
        
        Args:
            tasks: List of Task objects
        
        Returns:
            str: Formatted task list in selected language
        """
        
        # ✅ LANGUAGE TRANSLATIONS
        translations = {
            'en': {
                'no_tasks': "You don't have any tasks yet. Want to add one? 😊",
                'you_have': "You have",
                'task': 'task',
                'tasks': 'tasks',
                'high_priority': '**High Priority** 🔴',
                'medium_priority': '**Medium Priority** 🟡',
                'low_priority': '**Low Priority** 🟢',
                'completed': '**Completed** ✓',
                'due': 'Due'
            },
            'ur': {
                'no_tasks': "آپ کے پاس ابھی کوئی کام نہیں ہے۔ کیا آپ شامل کرنا چاہتے ہیں؟ 😊",
                'you_have': "آپ کے پاس",
                'task': 'کام',
                'tasks': 'کام',
                'high_priority': '**اعلیٰ ترجیح** 🔴',
                'medium_priority': '**درمیانی ترجیح** 🟡',
                'low_priority': '**کم ترجیح** 🟢',
                'completed': '**مکمل** ✓',
                'due': 'آخری تاریخ'
            }
        }
        
        # Get current language translations (default to English)
        t = translations.get(self.language, translations['en'])
        
        if not tasks:
            return t['no_tasks']

        # Group by priority
        high_priority = [task for task in tasks if task.priority == 'high' and not task.completed]
        medium_priority = [task for task in tasks if task.priority == 'medium' and not task.completed]
        low_priority = [task for task in tasks if task.priority == 'low' and not task.completed]
        completed = [task for task in tasks if task.completed]

        task_word = t['task'] if len(tasks) == 1 else t['tasks']
        response = f"{t['you_have']} {len(tasks)} {task_word}:\n\n"

        # High priority
        if high_priority:
            response += f"{t['high_priority']}\n"
            for i, task in enumerate(high_priority, 1):
                due = f" ({t['due']}: {task.due_date.strftime('%b %d')})" if task.due_date else ""
                response += f"{i}. {task.title}{due}\n"
            response += "\n"

        # Medium priority
        if medium_priority:
            response += f"{t['medium_priority']}\n"
            for i, task in enumerate(medium_priority, 1):
                due = f" ({t['due']}: {task.due_date.strftime('%b %d')})" if task.due_date else ""
                response += f"{i}. {task.title}{due}\n"
            response += "\n"

        # Low priority
        if low_priority:
            response += f"{t['low_priority']}\n"
            for i, task in enumerate(low_priority, 1):
                due = f" ({t['due']}: {task.due_date.strftime('%b %d')})" if task.due_date else ""
                response += f"{i}. {task.title}{due}\n"
            response += "\n"

        # Completed
        if completed:
            response += f"{t['completed']} ({len(completed)} {t['tasks']})\n\n"

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
            # Build messages
            messages = [
                {"role": "system", "content": system_prompt}
            ]
            
            # Add context if available
            if context:
                context_str = f"\n\nContext:\n{json.dumps(context, indent=2)}"
                messages.append({"role": "system", "content": context_str})
            
            messages.append({"role": "user", "content": user_message})
            
            # Call OpenAI
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
        
        # Use LLM to extract task details
        system_prompt = """You are a task extraction assistant.
Extract the task title, priority (low/medium/high), and description from the user's message.

IMPORTANT RULES:
1. Extract ONLY the actual task, remove words like "add", "create", "task", "tasks"
2. If user mentions "high priority", "urgent", "important" → priority = "high"
3. If user mentions "low priority", "later" → priority = "low"
4. Otherwise → priority = "medium"

Respond ONLY with valid JSON (no markdown, no backticks):
{"title": "clean task title", "priority": "high/medium/low", "description": ""}

Examples:
Input: "add task buy groceries"
Output: {"title": "Buy groceries", "priority": "medium", "description": ""}

Input: "create urgent task call doctor"
Output: {"title": "Call doctor", "priority": "high", "description": ""}
"""
        
        extraction_response = await self._generate_llm_response(
            system_prompt,
            f"Extract task from: {message}",
            {}
        )
        
        try:
            # Clean response - remove markdown code blocks if present
            clean_response = extraction_response.strip()
            if clean_response.startswith("```"):
                clean_response = clean_response.split("```")[1]
                if clean_response.startswith("json"):
                    clean_response = clean_response[4:].strip()
            
            # Parse extracted data
            task_data = json.loads(clean_response)
            title = task_data.get("title", "").strip()
            priority = task_data.get("priority", "medium").lower()
            description = task_data.get("description", "")
            
            # Validate priority
            if priority not in ["low", "medium", "high"]:
                priority = "medium"
            
        except (json.JSONDecodeError, Exception) as e:
            print(f"⚠️ LLM extraction failed: {e}")
            
            # Fallback: simple extraction
            title = message
            for trigger in ['create', 'add', 'new task', 'make a task', 'todo', 'remind me', 'tasks', 'task']:
                if trigger in message.lower():
                    parts = message.lower().split(trigger, 1)
                    if len(parts) > 1:
                        title = parts[1].strip()
                    break
            
            # Remove quotes and punctuation
            title = title.strip('.,!?\'"')
            
            # Detect priority from message
            priority = "medium"
            if any(word in message.lower() for word in ['urgent', 'important', 'high priority', 'asap', 'critical']):
                priority = "high"
            elif any(word in message.lower() for word in ['low priority', 'later', 'sometime', 'eventually']):
                priority = "low"
            
            description = ""
        
        if not title or len(title) < 2:
            # ✅ Language-aware error message
            if self.language == 'ur':
                return {
                    "response": "براہ کرم مجھے بتائیں کہ آپ کون سا کام شامل کرنا چاہتے ہیں۔ مثال: 'دودھ خریدنے کا کام شامل کریں'",
                    "metadata": {"action": "create_task", "success": False}
                }
            else:
                return {
                    "response": "Please tell me what task you want to add. For example: 'add task buy milk'",
                    "metadata": {"action": "create_task", "success": False}
                }
        
        # Create task in database
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

        # Broadcast task creation event
        await self._broadcast_task_created(new_task)

        # ✅ Language-aware success message
        if self.language == 'ur':
            return {
                "response": f"✅ کام '{new_task.title}' کامیابی سے شامل ہو گیا!",
                "metadata": {
                    "action": "create_task",
                    "success": True,
                    "task_id": new_task.id,
                    "task_title": new_task.title
                }
            }
        else:
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
        
        # Extract task name
        task_name = message.lower()
        for keyword in ['complete', 'finish', 'done', 'mark as done', 'mark', 'finished', 'completed']:
            task_name = task_name.replace(keyword, '')
        task_name = task_name.replace('the task', '').replace('task', '').strip().strip('"').strip("'")
        
        if not task_name or len(task_name) < 2:
            # ✅ Language-aware error message
            if self.language == 'ur':
                return {
                    "response": "براہ کرم بتائیں کہ آپ کون سا کام مکمل کرنا چاہتے ہیں۔",
                    "metadata": {"action": "complete_task", "success": False}
                }
            else:
                return {
                    "response": "Please specify which task you want to mark as complete.",
                    "metadata": {"action": "complete_task", "success": False}
                }
        
        # Find matching task
        tasks = self.session.exec(
            select(Task).where(
                Task.user_id == self.user_id,
                Task.completed == False
            )
        ).all()
        
        # Try exact match first, then partial
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
            # ✅ Language-aware error message
            if self.language == 'ur':
                return {
                    "response": f"مجھے '{task_name}' سے مماثل کوئی کام نہیں ملا۔ براہ کرم کام کا نام چیک کریں۔",
                    "metadata": {"action": "complete_task", "success": False}
                }
            else:
                return {
                    "response": f"I couldn't find a task matching '{task_name}'. Please check the task name.",
                    "metadata": {"action": "complete_task", "success": False}
                }
        
        # Mark as complete
        matched_task.completed = True
        self.session.add(matched_task)
        self.session.commit()

        # Broadcast task update event
        await self._broadcast_task_updated(matched_task)

        # ✅ Language-aware success message
        if self.language == 'ur':
            return {
                "response": f"🎉 بہترین کام! '{matched_task.title}' اب مکمل ہو گیا ہے!",
                "metadata": {
                    "action": "complete_task",
                    "success": True,
                    "task_id": matched_task.id,
                    "task_title": matched_task.title
                }
            }
        else:
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
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """General conversational response"""

        # ✅ Language-aware system prompt
        if self.language == 'ur':
            system_prompt = """آپ ٹاسک بڈی ہیں، ایک دوستانہ اور پیشہ ورانہ AI ٹاسک اسسٹنٹ۔

جوابات مختصر (100 الفاظ سے کم)، مددگار اور قدرتی رکھیں۔

آپ کی صلاحیتیں:
- کام بنائیں: "کام شامل کریں [نام]"
- کام دکھائیں: "میرے کام دکھائیں"
- کام حذف کریں: "[کام کا نام] ہٹائیں"
- کام مکمل کریں: "[کام کا نام] مکمل کریں"

دوستانہ لیکن پیشہ ورانہ رہیں۔ زیادہ ایموجی یا حوصلہ افزائی نہیں۔"""
        else:
            system_prompt = """You are Task Buddy, a friendly and professional AI task assistant.

Keep responses SHORT (under 100 words), HELPFUL, and NATURAL.

Your capabilities:
- Create tasks: "add task [name]"
- Show tasks: "show my tasks"  
- Delete tasks: "remove [task name]"
- Complete tasks: "mark [task name] as done"

Be friendly but professional. No excessive emojis or encouragement."""
        
        response_text = await self._generate_llm_response(
            system_prompt,
            message,
            context
        )
        
        return {
            "response": response_text,
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
        """
        Delete a task by matching its title with improved matching logic
        
        Args:
            title: The title of the task to delete (case-insensitive)
        
        Returns:
            dict: Success/failure message
        """
        try:
            if not title or len(title) < 2:
                # ✅ Language-aware error message
                if self.language == 'ur':
                    return {
                        "success": False,
                        "message": "براہ کرم بتائیں کہ آپ کون سا کام حذف کرنا چاہتے ہیں۔"
                    }
                else:
                    return {
                        "success": False,
                        "message": "Please specify which task you want to delete."
                    }
            
            # Get all user tasks
            all_tasks = self.session.exec(
                select(Task).where(Task.user_id == self.user_id)
            ).all()
            
            if not all_tasks:
                # ✅ Language-aware error message
                if self.language == 'ur':
                    return {
                        "success": False,
                        "message": "آپ کے پاس حذف کرنے کے لیے کوئی کام نہیں ہے۔"
                    }
                else:
                    return {
                        "success": False,
                        "message": "You don't have any tasks to delete."
                    }
            
            # Try exact match first (case-insensitive)
            matched_task = None
            title_lower = title.lower().strip()
            
            print(f"🔍 Searching for task: '{title_lower}'")
            print(f"📋 Available tasks: {[t.title for t in all_tasks]}")
            
            # Strategy 1: Exact match
            for task in all_tasks:
                if task.title.lower() == title_lower:
                    matched_task = task
                    print(f"✅ Exact match found: '{task.title}'")
                    break
            
            # Strategy 2: Partial match (title in task or task in title)
            if not matched_task:
                for task in all_tasks:
                    task_title_lower = task.title.lower()
                    if title_lower in task_title_lower or task_title_lower in title_lower:
                        matched_task = task
                        print(f"✅ Partial match found: '{task.title}'")
                        break
            
            # Strategy 3: Word-based match
            if not matched_task:
                title_words = set(title_lower.split())
                best_match = None
                best_score = 0
                
                for task in all_tasks:
                    task_words = set(task.title.lower().split())
                    common_words = title_words & task_words
                    score = len(common_words)
                    
                    if score > best_score and score > 0:
                        best_score = score
                        best_match = task
                
                if best_match and best_score >= len(title_words) * 0.5:  # At least 50% match
                    matched_task = best_match
                    print(f"✅ Word-based match found: '{matched_task.title}' (score: {best_score})")
            
            if not matched_task:
                # List available tasks for user
                task_list = "\n".join([f"- {t.title}" for t in all_tasks[:5]])
                
                # ✅ Language-aware error message
                if self.language == 'ur':
                    return {
                        "success": False,
                        "message": f"کام '{title}' نہیں ملا۔ آپ کے کام:\n{task_list}"
                    }
                else:
                    return {
                        "success": False,
                        "message": f"Task '{title}' not found. Your tasks:\n{task_list}"
                    }
            
            # Delete the task
            task_title = matched_task.title
            task_id = matched_task.id
            
            self.session.delete(matched_task)
            self.session.commit()
            
            print(f"✅ Task deleted: {task_title} (ID: {task_id})")
            
            # Broadcast WebSocket event
            await self._broadcast_task_deleted(task_id)
            
            # ✅ Language-aware success message
            if self.language == 'ur':
                return {
                    "success": True,
                    "message": f"✅ کام '{task_title}' حذف کر دیا گیا ہے۔"
                }
            else:
                return {
                    "success": True,
                    "message": f"✅ Task '{task_title}' has been deleted."
                }
            
        except Exception as e:
            print(f"❌ Error deleting task: {e}")
            import traceback
            traceback.print_exc()
            
            # ✅ Language-aware error message
            if self.language == 'ur':
                return {
                    "success": False,
                    "message": f"کام حذف کرنے میں ناکامی: {str(e)}"
                }
            else:
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