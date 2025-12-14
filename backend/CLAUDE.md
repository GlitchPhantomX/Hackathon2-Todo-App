# Backend Development Guidelines - Todo App

## Code Standards and Conventions

### Python Standards
- Follow PEP 8 style guide for Python code
- Use type hints for all function parameters and return values
- Use descriptive variable and function names
- Keep functions focused and single-purpose
- Document complex logic with comments

### SQLModel Best Practices
- Define all database models in the `models.py` file
- Use Field() for column definitions with appropriate constraints
- Use Relationship() for defining relationships between models
- Always include proper foreign key constraints
- Use datetime.utcnow() for default timestamps

### Database Design
- Use integer primary keys with auto-increment
- Index frequently queried columns (email, user_id)
- Use appropriate max_length for string fields
- Use Boolean fields for status flags
- Define proper foreign key relationships

## Testing Procedures and Best Practices

### Test Structure
- Place all database tests in `test_db.py`
- Test each CRUD operation separately
- Test relationships between models
- Test foreign key constraints
- Test edge cases and error conditions

### Test Coverage
- Database connectivity tests
- Table creation tests
- User CRUD operation tests
- Task CRUD operation tests
- Relationship validation tests
- Foreign key constraint tests

### Running Tests
- Use `python test_db.py` to run all database tests
- Ensure database is accessible before running tests
- Check test output for any failures
- Verify all tests pass before deployment

## Deployment Considerations

### Environment Configuration
- Use environment variables for all configuration
- Never hardcode credentials in source code
- Use .env files for local development
- Use environment variables in deployment

### Database Setup
- Ensure Neon database is properly configured
- Verify SSL mode is enabled for production
- Set up proper database permissions
- Consider database backup strategies

### Security
- Ensure passwords are properly hashed
- Validate all user inputs
- Use parameterized queries to prevent SQL injection
- Implement proper authentication and authorization

## Common Patterns

### Session Management
- Use context managers (with statements) for database sessions
- Always commit or rollback transactions appropriately
- Handle database errors gracefully

### Error Handling
- Catch and handle database-specific exceptions
- Provide meaningful error messages
- Log errors for debugging purposes
- Fail gracefully when possible

## Development Workflow

1. Define models in models.py with proper constraints
2. Test database connections and table creation
3. Implement CRUD operations with proper error handling
4. Test relationships between models
5. Run comprehensive tests before committing
6. Document any changes or additions