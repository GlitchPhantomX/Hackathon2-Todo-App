# Backend - Todo App with SQLModel & Neon PostgreSQL

This backend provides a complete database foundation for the Todo application using SQLModel ORM and Neon Serverless PostgreSQL.

## Overview

The backend implements a multi-user todo application with:
- User authentication and management
- Task creation, retrieval, updating, and deletion (CRUD)
- User-task relationships with proper foreign key constraints
- Database connection management using SQLModel
- Environment-based configuration

## Prerequisites

- Python 3.13+
- UV package manager
- PostgreSQL database (Neon recommended for production)

## Installation

1. Install dependencies:
```bash
cd backend
uv sync
```

Or using pip:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Update the `.env` file with your database configuration:
```env
DATABASE_URL=postgresql://username:password@host.neon.tech/dbname?sslmode=require
APP_ENV=development
DEBUG=True
```

## Configuration

The application uses environment variables for configuration:

- `DATABASE_URL`: PostgreSQL connection string with SSL mode
- `APP_ENV`: Application environment (development/production)
- `DEBUG`: Debug mode flag

## How to Run Tests

To run the database tests:
```bash
python test_db.py
```

This will execute all tests including:
- Database connectivity
- Table creation
- User CRUD operations
- Task CRUD operations
- Relationship validation
- Foreign key constraint enforcement

## Database Schema

### User Table
- `id`: Primary key (auto-incrementing integer)
- `email`: Unique email address (max 255 chars, indexed)
- `name`: User's name (max 100 chars)
- `hashed_password`: Password hash (max 255 chars)
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

### Task Table
- `id`: Primary key (auto-incrementing integer)
- `user_id`: Foreign key referencing user (indexed)
- `title`: Task title (max 200 chars)
- `description`: Task description (max 1000 chars, optional)
- `completed`: Boolean indicating completion status
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

### Relationships
- One user can have many tasks (one-to-many relationship)
- Tasks are automatically deleted when their associated user is deleted (cascade delete)
- Foreign key constraints ensure referential integrity

## Troubleshooting

### Common Issues

1. **Database Connection Issues**:
   - Verify that your `DATABASE_URL` is correct
   - Ensure your Neon database is accessible
   - Check that SSL mode is properly configured

2. **Dependency Installation Issues**:
   - Make sure you're using Python 3.13+
   - Use virtual environment if needed: `python -m venv .venv && source .venv/bin/activate`

3. **Foreign Key Constraint Issues**:
   - Ensure tasks are created with valid user IDs
   - Check that referenced users exist before creating tasks

### Testing Issues
- If tests fail, check the database connection string
- Ensure the database has proper permissions
- Verify that table creation is successful

## Security Considerations

- Passwords are stored as hashes (not plain text)
- SSL mode is enforced for all database connections
- .env file is git-ignored to protect credentials
- User data is isolated by user_id