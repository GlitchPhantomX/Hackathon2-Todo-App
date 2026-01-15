import { Conversation, ChatMessage } from '../types/chat.types';

class ChatService {
  private baseUrl: string;
  private token: string | null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:8000';
    this.token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('auth_token') : null;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // ✅ ENHANCED: Send message with language and voice support
  async sendMessage(
    conversationId: string, 
    content: string,
    language: 'en' | 'ur' | 'auto' = 'auto',
    voiceInput: boolean = false
  ): Promise<ChatMessage> {
    try {
      console.log('📤 Sending message with params:', {
        conversationId,
        content: content.substring(0, 50) + '...',
        language,
        voiceInput
      });

      const response = await fetch(`${this.baseUrl}/api/chat/message?language=${language}&voice_input=${voiceInput}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          conversation_id: parseInt(conversationId),
          content: content,
          role: 'user',
          metadata_json: JSON.stringify({ language, voiceInput })  // ✅ Include metadata
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.detail || 'Failed to send message');
      }

      const result = await response.json();
      console.log('✅ Message sent successfully:', result);
      
      return result;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async getConversations(): Promise<Conversation[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/conversations`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get conversations');
      }

      const data = await response.json();
      return data.conversations || [];
    } catch (error) {
      console.error('Error getting conversations:', error);
      throw error;
    }
  }

  async createConversation(): Promise<Conversation> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/conversations/new`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create conversation');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  async getConversationMessages(conversationId: string): Promise<ChatMessage[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/conversations/${conversationId}/messages`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get conversation messages');
      }

      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      console.error('Error getting conversation messages:', error);
      throw error;
    }
  }

  async deleteConversation(conversationId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete conversation');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }

  async updateConversationTitle(conversationId: string, title: string): Promise<Conversation> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/conversations/${conversationId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({
          title,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update conversation title');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating conversation title:', error);
      throw error;
    }
  }

  // ✅ NEW: Detect language of text
  async detectLanguage(text: string): Promise<{ language: 'en' | 'ur'; supported: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/detect-language?text=${encodeURIComponent(text)}`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        console.warn('Language detection failed, defaulting to English');
        return { language: 'en', supported: true };
      }

      return await response.json();
    } catch (error) {
      console.error('Error detecting language:', error);
      return { language: 'en', supported: true };
    }
  }
}

export default new ChatService();