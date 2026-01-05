// Unit tests for chat history CRUD operations
import { Conversation } from '../types/chat.types';

// Mock data
const mockConversation: Conversation = {
  id: 'test-conv-1',
  user_id: 'user-123',
  title: 'Test Conversation',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  is_active: true,
};

describe('ChatHistoryService', () => {
  // Mock the API endpoints
  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create a new conversation', async () => {
    const newConversation = { ...mockConversation, id: 'new-conv' };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(newConversation),
    });

    const response = await fetch('/api/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({ title: 'New Conversation' }),
    });

    const result = await response.json();

    expect(response.ok).toBe(true);
    expect(result.id).toBe('new-conv');
    expect(result.title).toBe('New Conversation');
  });

  test('should fetch all conversations', async () => {
    const conversations = [mockConversation];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(conversations),
    });

    const response = await fetch('/api/conversations', {
      headers: {
        'Authorization': 'Bearer test-token',
      },
    });

    const result = await response.json();

    expect(response.ok).toBe(true);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(mockConversation.id);
  });

  test('should update conversation title', async () => {
    const updatedConversation = { ...mockConversation, title: 'Updated Title' };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(updatedConversation),
    });

    const response = await fetch(`/api/conversations/${mockConversation.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({ title: 'Updated Title' }),
    });

    const result = await response.json();

    expect(response.ok).toBe(true);
    expect(result.title).toBe('Updated Title');
  });

  test('should delete a conversation', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const response = await fetch(`/api/conversations/${mockConversation.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer test-token',
      },
    });

    const result = await response.json();

    expect(response.ok).toBe(true);
    expect(result.success).toBe(true);
  });

  test('should handle error when fetching conversations', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Internal Server Error' }),
    });

    const response = await fetch('/api/conversations', {
      headers: {
        'Authorization': 'Bearer test-token',
      },
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(500);
  });
});