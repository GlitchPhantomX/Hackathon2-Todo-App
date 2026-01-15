"""
Enhanced Chat Router with Multi-language and Voice Support
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import List, Optional
from datetime import datetime
import re

from models import Conversation, ChatMessage, User
from schemas import ConversationCreate, ConversationUpdate, MessageResponse, MessageCreate, ConversationResponse
from config import settings
from utils.auth_utils import get_current_user
from db import get_session
from sqlmodel import Session, select
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
from pydantic import BaseModel

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# Check if in dev mode
DEV_MODE = os.getenv("DEV_MODE", "true").lower() == "true"

router = APIRouter(
    prefix="/chat",
    tags=["chat"],
    responses={404: {"description": "Not found"}},
)


# ✅ NEW: Enhanced Message Schema with language and voice support
class EnhancedMessageCreate(BaseModel):
    """Enhanced message creation with language and voice support"""
    conversation_id: int
    content: str
    metadata_json: Optional[str] = None
    language: Optional[str] = "auto"  # 'en', 'ur', or 'auto'
    voice_input: Optional[bool] = False  # Flag for voice commands


async def get_current_user_dev_optional(request: Request, session: Session = Depends(get_session)):
    """Get user ID from request state (for dev mode) or from auth (for prod)"""
    print("=" * 60)
    print("🔐 AUTH DEBUG: get_current_user_dev_optional called")
    print(f"📍 DEV_MODE: {DEV_MODE}")
    
    if hasattr(request.state, 'user') and DEV_MODE:
        print(f"✅ Found user in request.state: {request.state.user}")
        return request.state.user

    auth_header = request.headers.get("Authorization", "")
    print(f"🔑 Authorization header: {auth_header[:20]}..." if auth_header else "❌ No Authorization header")
    
    if auth_header.startswith("Bearer "):
        token = auth_header.replace("Bearer ", "")
        
        try:
            from jose import jwt
            from config import settings

            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM]
            )
            
            print(f"🔓 Token decoded successfully!")
            print(f"📦 Payload: {payload}")
            
            user_id = payload.get("sub") or payload.get("user_id")
            
            if user_id:
                user = session.get(User, int(user_id))
                
                if user:
                    print(f"✅ USER FOUND IN DATABASE!")
                    print(f"   👤 User ID: {user.id}")
                    print(f"   📧 Email: {user.email}")
                    print(f"   📛 Name: {user.name}")
                    print("=" * 60)
                    return {"user_id": user.id, "email": user.email, "name": user.name}
                else:
                    print(f"❌ User ID {user_id} not found in database!")
            else:
                print(f"❌ No 'sub' or 'user_id' in token payload!")
                
        except Exception as e:
            print(f"⚠️ Token decode error: {e}")
            import traceback
            traceback.print_exc()

    print("⚠️ Authentication failed, using fallback...")
    
    if DEV_MODE:
        print("🔍 Checking for known users in database...")
        
        areesha_user = session.exec(
            select(User).where(User.email == "areesha99@gmail.com")
        ).first()
        
        if areesha_user:
            print(f"✅ FALLBACK: Using Areesha's account")
            print(f"   👤 User ID: {areesha_user.id}")
            print(f"   📧 Email: {areesha_user.email}")
            print("=" * 60)
            return {"user_id": areesha_user.id, "email": areesha_user.email, "name": areesha_user.name}
        
        demo_user = session.exec(
            select(User).where(User.email == "demo@example.com")
        ).first()
        
        if demo_user:
            print(f"⚠️ FALLBACK: Using demo user")
            print(f"   👤 User ID: {demo_user.id}")
            print(f"   📧 Email: {demo_user.email}")
            print("=" * 60)
            return {"user_id": demo_user.id, "email": demo_user.email, "name": demo_user.name}
        
        print("❌ CRITICAL: No users found! Using user_id=1")
        print("=" * 60)
        return {"user_id": 1, "email": "unknown@example.com", "name": "Unknown"}
    else:
        print("❌ PRODUCTION: Authentication required!")
        print("=" * 60)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )


@router.post("/message")
@limiter.limit("10/minute")
async def send_message(
    request: Request,
    message_create: MessageCreate,
    session: Session = Depends(get_session),
    current_user: dict = Depends(get_current_user_dev_optional),
    language: Optional[str] = "auto",  # ✅ NEW: Language parameter
    voice_input: Optional[bool] = False  # ✅ NEW: Voice input flag
):
    """
    Send message to AI with multi-language and voice support
    
    ✅ NEW FEATURES:
    - Language detection and translation
    - Voice command support
    - Urdu language support
    """
    print("\n" + "=" * 60)
    print("💬 SEND MESSAGE ENDPOINT CALLED")
    print(f"👤 Current User: {current_user}")
    print(f"📝 Message: {message_create.content[:50]}...")
    print(f"🔢 Conversation ID: {message_create.conversation_id}")
    print(f"🌍 Language: {language}")
    print(f"🎤 Voice Input: {voice_input}")
    print("=" * 60)
    
    # Verify user owns the conversation
    conversation = session.get(Conversation, message_create.conversation_id)
    if not conversation:
        print(f"❌ Conversation {message_create.conversation_id} not found!")
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    if conversation.user_id != current_user["user_id"]:
        print(f"❌ User {current_user['user_id']} doesn't own conversation {message_create.conversation_id}")
        raise HTTPException(status_code=403, detail="Access denied")
    
    print(f"✅ Conversation verified for user {current_user['user_id']}")

    # Validate content length
    if len(message_create.content) > 4000:
        raise HTTPException(
            status_code=400, 
            detail="Message content exceeds maximum length of 4000 characters"
        )

    # Sanitize input
    content = message_create.content
    sanitized_content = re.sub(
        r'<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>', 
        '', 
        content, 
        flags=re.IGNORECASE
    )
    sanitized_content = re.sub(
        r'<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>', 
        '', 
        sanitized_content, 
        flags=re.IGNORECASE
    )

    # Save user message
    user_message = ChatMessage(
        conversation_id=message_create.conversation_id,
        role="user",
        content=sanitized_content,
        metadata_json=message_create.metadata_json
    )
    session.add(user_message)
    session.commit()
    session.refresh(user_message)
    print(f"💾 User message saved (ID: {user_message.id})")

    # ✅ PROCESS WITH ENHANCED AI AGENT
    try:
        from agents.todo_agent import TodoAgent
        
        # Get conversation history
        history_messages = session.exec(
            select(ChatMessage)
            .where(ChatMessage.conversation_id == message_create.conversation_id)
            .order_by(ChatMessage.timestamp.asc())
            .limit(20)
        ).all()
        
        conversation_history = [
            {"role": msg.role, "content": msg.content}
            for msg in history_messages[:-1]
        ]
        
        # ✅ Initialize AI agent with language support
        print("\n" + "🤖" * 30)
        print(f"🔍 INITIALIZING ENHANCED TODO AGENT")
        print(f"   👤 User ID: {current_user['user_id']}")
        print(f"   🌍 Language: {language}")
        print(f"   🎤 Voice Input: {voice_input}")
        print("🤖" * 30 + "\n")
        
        agent = TodoAgent(
            user_id=current_user["user_id"], 
            session=session,
            language=language  # ✅ Pass language preference
        )
        
        # ✅ Process message with language and voice support
        ai_result = await agent.process_message(
            message=sanitized_content,
            conversation_history=conversation_history,
            voice_input=voice_input  # ✅ Pass voice input flag
        )
        
        ai_content = ai_result.get("response", "I'm sorry, I couldn't process that request.")
        ai_metadata = ai_result.get("metadata", {})
        detected_language = ai_result.get("language", "en")
        
        print(f"✅ AI response generated ({len(ai_content)} chars)")
        print(f"🌍 Response language: {detected_language}")
        
    except Exception as e:
        print(f"\n❌ AI AGENT ERROR!")
        print(f"   Error: {str(e)}")
        import traceback
        traceback.print_exc()
        print("\n")
        
        ai_content = "I encountered an error processing your request. Please try again."
        ai_metadata = {"error": str(e)}
        detected_language = "en"

    # Save AI response
    ai_message = ChatMessage(
        conversation_id=message_create.conversation_id,
        role="assistant",
        content=ai_content,
        metadata_json=str(ai_metadata) if ai_metadata else None
    )
    session.add(ai_message)
    
    conversation.updated_at = datetime.utcnow()
    session.add(conversation)
    
    session.commit()
    session.refresh(ai_message)
    
    print(f"💾 AI message saved (ID: {ai_message.id})")
    print("=" * 60 + "\n")

    # ✅ Return response with language metadata
    return {
        "id": ai_message.id,
        "conversation_id": ai_message.conversation_id,
        "role": ai_message.role,
        "content": ai_message.content,
        "timestamp": ai_message.timestamp.isoformat(),
        "metadata_json": ai_message.metadata_json,
        "language": detected_language,  # ✅ Include detected language
        "voice_input": voice_input  # ✅ Include voice input flag
    }


@router.get("/conversations")
async def get_conversations(
    request: Request,
    session: Session = Depends(get_session),
    current_user: dict = Depends(get_current_user_dev_optional)
):
    """List user conversations"""
    print(f"📋 Fetching conversations for user {current_user['user_id']}")
    
    conversations = session.exec(
        select(Conversation)
        .where(Conversation.user_id == current_user["user_id"])
        .order_by(Conversation.updated_at.desc())
    ).all()
    
    print(f"✅ Found {len(conversations)} conversations")

    return {
        "conversations": conversations,
        "total": len(conversations)
    }


@router.post("/conversations/new")
async def create_conversation(
    request: Request,
    conversation_create: ConversationCreate,
    session: Session = Depends(get_session),
    current_user: dict = Depends(get_current_user_dev_optional)
):
    """Create new conversation"""
    print(f"➕ Creating new conversation for user {current_user['user_id']}")
    
    conversation = Conversation(
        user_id=current_user["user_id"],
        title=conversation_create.title or "New Chat",
        is_archived=conversation_create.is_archived or False
    )

    session.add(conversation)
    session.commit()
    session.refresh(conversation)
    
    print(f"✅ Conversation created (ID: {conversation.id})")

    return conversation


@router.get("/conversations/{conversation_id}/messages")
async def get_conversation_messages(
    request: Request,
    conversation_id: int,
    session: Session = Depends(get_session),
    current_user: dict = Depends(get_current_user_dev_optional)
):
    """Get messages for a specific conversation"""
    print(f"📨 Fetching messages for conversation {conversation_id}")
    
    conversation = session.get(Conversation, conversation_id)
    if not conversation or conversation.user_id != current_user["user_id"]:
        print(f"❌ Conversation {conversation_id} not found or access denied")
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = session.exec(
        select(ChatMessage)
        .where(ChatMessage.conversation_id == conversation_id)
        .order_by(ChatMessage.timestamp.asc())
    ).all()
    
    print(f"✅ Found {len(messages)} messages")

    return {"messages": messages}


@router.put("/conversations/{conversation_id}")
async def update_conversation(
    request: Request,
    conversation_id: int,
    conversation_update: ConversationUpdate,
    session: Session = Depends(get_session),
    current_user: dict = Depends(get_current_user_dev_optional)
):
    """Update conversation"""
    print(f"✏️ Updating conversation {conversation_id}")
    
    conversation = session.get(Conversation, conversation_id)
    if not conversation or conversation.user_id != current_user["user_id"]:
        print(f"❌ Conversation {conversation_id} not found or access denied")
        raise HTTPException(status_code=404, detail="Conversation not found")

    if conversation_update.title is not None:
        conversation.title = conversation_update.title
        print(f"   Updated title: {conversation_update.title}")
    if conversation_update.is_archived is not None:
        conversation.is_archived = conversation_update.is_archived
        print(f"   Updated archived: {conversation_update.is_archived}")

    session.add(conversation)
    session.commit()
    session.refresh(conversation)
    
    print(f"✅ Conversation {conversation_id} updated")

    return conversation


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    request: Request,
    conversation_id: int,
    session: Session = Depends(get_session),
    current_user: dict = Depends(get_current_user_dev_optional)
):
    """Delete conversation"""
    print(f"🗑️ Deleting conversation {conversation_id}")
    
    conversation = session.get(Conversation, conversation_id)
    if not conversation or conversation.user_id != current_user["user_id"]:
        print(f"❌ Conversation {conversation_id} not found or access denied")
        raise HTTPException(status_code=404, detail="Conversation not found")

    session.delete(conversation)
    session.commit()
    
    print(f"✅ Conversation {conversation_id} deleted")

    return {"message": "Conversation deleted successfully"}


# ✅ NEW: Language detection endpoint
@router.post("/detect-language")
async def detect_language_endpoint(
    request: Request,
    text: str,
    session: Session = Depends(get_session),
    current_user: dict = Depends(get_current_user_dev_optional)
):
    """
    Detect language of input text
    
    Returns: {'language': 'en' or 'ur'}
    """
    try:
        from utils.translation_service import TranslationService
        
        detected_lang = TranslationService.detect_language(text)
        
        return {
            "text": text,
            "language": detected_lang,
            "supported": detected_lang in ["en", "ur"]
        }
    except Exception as e:
        print(f"❌ Language detection error: {e}")
        return {
            "text": text,
            "language": "en",
            "supported": True,
            "error": str(e)
        }