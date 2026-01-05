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

  async sendMessage(conversationId: string, content: string): Promise<ChatMessage> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/message`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          conversation_id: parseInt(conversationId), // ✅ Convert to int
          content: content,
          role: 'user', // ✅ Required by backend schema
          metadata_json: null // ✅ Required by backend schema
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.detail || 'Failed to send message');
      }

      return await response.json();
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
}

export default new ChatService();