# Research: AI-Powered Todo Chatbot

## Overview
This document captures the research and decisions made during the planning phase for the AI-powered todo chatbot feature.

## Decision: MCP Server Architecture
**Rationale**: Using Model Context Protocol (MCP) server architecture provides a standardized way to expose tools to AI agents. This allows the OpenAI agent to call specific functions for todo operations while maintaining clean separation between the AI interface and business logic.

**Alternatives considered**:
- Direct API calls from agent: Would require more complex prompt engineering and less reliable function calling
- Custom tool format: Would not be compatible with standard AI agent frameworks

## Decision: OpenAI Agent with MCP Integration
**Rationale**: Using OpenAI's Assistants API with MCP tools provides the best balance of natural language understanding and structured operations. The agent can understand user intents and call appropriate MCP tools to perform todo operations.

**Alternatives considered**:
- Custom NLP processing: Would require significant development and maintenance effort
- Rule-based parsing: Would be less flexible and require constant updates for new commands

## Decision: PostgreSQL for Conversation Storage
**Rationale**: PostgreSQL provides robust ACID properties, good performance for the expected load, and supports JSON fields for metadata storage. It integrates well with the existing SQLModel-based architecture.

**Alternatives considered**:
- MongoDB: Would add complexity with a new database technology
- SQLite: Would not scale appropriately for concurrent users
- Redis: Not ideal for persistent conversation history

## Decision: AES-256 Encryption for Chat Messages
**Rationale**: Industry standard for data encryption at rest, providing strong security while meeting compliance requirements for user data.

**Alternatives considered**:
- No encryption: Would not meet security requirements
- Less secure encryption: Would not provide adequate protection
- Client-side encryption: Would add significant complexity without clear benefit

## Decision: Rate Limiting Strategy
**Rationale**: 10 messages per minute provides reasonable usage limits to prevent abuse while allowing normal usage patterns. Returning 429 status codes with clear retry information provides good UX.

**Alternatives considered**:
- No rate limiting: Would be vulnerable to abuse
- Sliding window: More complex to implement without significant benefit
- IP-based limits only: Would not account for authenticated user behavior