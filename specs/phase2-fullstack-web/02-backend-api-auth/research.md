# Research: Backend API & Authentication

## FastAPI Security Best Practices

### JWT Authentication
- **Standard**: OAuth2 with Password Flow & JWT tokens
- **Implementation**: Use `OAuth2PasswordBearer` for automatic token extraction
- **Security**: Always validate tokens on protected endpoints
- **Best Practice**: Include expiration time and user ID in token payload

### Password Security
- **Hashing Algorithm**: bcrypt with 12 rounds (balance of security and performance)
- **Library**: passlib with bcrypt context
- **Validation**: Minimum 8 characters, include complexity requirements

### Token Security
- **Secret Key**: Minimum 32 characters, randomly generated
- **Algorithm**: HS256 (sufficient for most applications)
- **Expiration**: 24 hours (1440 minutes) - balance between UX and security
- **Storage**: Client-side (localStorage/cookies), transmitted via Authorization header

## Authentication Flow Analysis

### Registration Flow
1. Validate email format and uniqueness
2. Hash password using bcrypt
3. Store user in database
4. Return user information (excluding sensitive data)

### Login Flow
1. Verify credentials against database
2. Generate JWT token with user ID
3. Return token for client-side storage
4. Token used for subsequent authenticated requests

### Protected Route Flow
1. Extract token from Authorization header
2. Validate JWT signature and expiration
3. Extract user ID from token
4. Query user from database
5. Attach user to request context

## CORS Configuration

### Development CORS Settings
- Allow origins: `http://localhost:3000`, `http://localhost:5173`
- Allow credentials: True
- Allow methods: All
- Allow headers: All

### Production CORS Settings
- Specific domain origins only
- Avoid wildcard origins
- Review regularly for security

## Database Security

### User Isolation
- Filter all queries by `user_id`
- Never allow cross-user access
- Validate ownership on every request

### SQL Injection Prevention
- Use parameterized queries (SQLModel handles this)
- Never concatenate user input directly into queries
- Use ORM methods for all database operations

## Testing Strategy

### Authentication Tests
- User registration with valid/invalid data
- Login with correct/incorrect credentials
- Token validation on protected endpoints
- Expired token handling

### Authorization Tests
- Access to owned resources
- Rejection of non-owned resources
- Unauthenticated access to protected endpoints
- Invalid token handling

## Error Handling

### Standard HTTP Status Codes
- 200: Success for GET, PUT, POST (with content)
- 201: Created for POST operations
- 204: No Content for DELETE operations
- 400: Bad Request for validation errors
- 401: Unauthorized for authentication failures
- 403: Forbidden for authorization failures
- 404: Not Found for missing resources
- 409: Conflict for duplicate resources
- 500: Internal Server Error for unexpected errors

### Error Response Format
```json
{
  "detail": "Error message or array of validation errors"
}
```

## Dependency Management

### Required Dependencies
- FastAPI: Modern Python web framework
- python-jose: JWT token handling
- passlib: Password hashing utilities
- bcrypt: Secure password hashing algorithm
- SQLModel: Database ORM with Pydantic integration
- Pydantic: Request/response validation
- pytest: Testing framework
- httpx: Testing client

## Performance Considerations

### JWT Performance
- Token validation is fast with symmetric keys (HS256)
- No database lookup required for token validation
- Consider token revocation mechanisms if needed

### Database Performance
- Proper indexing on user_id for task queries
- Connection pooling for database operations
- Consider caching for frequently accessed data

## Security Checklist

### Must Implement
- ✅ Password hashing with bcrypt
- ✅ JWT token expiration
- ✅ User ID validation from token
- ✅ User isolation in database queries
- ✅ CORS configuration
- ✅ Input validation with Pydantic
- ✅ Proper error messages without information leakage

### Future Enhancements
- Refresh token mechanism
- Rate limiting
- Advanced logging and monitoring
- Two-factor authentication

## Implementation Decision: Better Auth vs Custom JWT

### Decision: Custom JWT Implementation
- **Rationale**: Full control over authentication flow, better integration with existing SQLModel setup
- **Alternative Considered**: Better Auth library
- **Trade-offs**: More code to maintain vs. standardized solution
- **Chosen**: Custom JWT with python-jose and passlib for maximum control and integration

## API Documentation

### OpenAPI/Swagger Integration
- FastAPI automatically generates API documentation
- Use proper response_model for type safety
- Include example requests and responses
- Add comprehensive endpoint descriptions

## Validation Requirements

### User Registration
- Email format validation
- Password strength requirements (min 8 chars)
- Email uniqueness check
- Name length validation (2-100 chars)

### Task Operations
- Title length validation (1-200 chars)
- Description length validation (max 1000 chars)
- User ownership validation
- Task existence validation

## Deployment Considerations

### Environment Variables
- SECRET_KEY: Production-grade secret key
- DATABASE_URL: Production database connection
- ALLOWED_ORIGINS: Production domain origins
- DEBUG: False in production
- ACCESS_TOKEN_EXPIRE_MINUTES: Consider longer duration for production

### Security Headers
- HTTPS enforcement
- Content Security Policy
- X-Frame-Options for clickjacking protection
- X-Content-Type-Options for MIME type sniffing