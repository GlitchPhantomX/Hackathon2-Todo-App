from sqlmodel import create_engine, Session
from sqlalchemy import text
from sqlalchemy import event
from config import settings
# Import models for table creation (imported inside function to avoid circular import)


# Create SQLModel engine
engine = create_engine(settings.DATABASE_URL, echo=settings.DEBUG)


# Enable foreign key constraints for SQLite
if settings.DATABASE_URL.startswith("sqlite://"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        import sqlite3
        if isinstance(dbapi_connection, sqlite3.Connection):
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()


def get_session() -> Session:
    """Create and yield database session"""
    with Session(engine) as session:
        yield session


def create_tables():
    """Create all tables defined in SQLModel metadata"""
    from models import User, Task  # Import here to avoid circular imports
    from sqlmodel import SQLModel

    try:
        SQLModel.metadata.create_all(engine)
        print("Tables created successfully")
    except Exception as e:
        print(f"Error creating tables: {e}")
        raise


def test_connection():
    """Test database connection"""
    try:
        with Session(engine) as session:
            session.exec(text("SELECT 1"))
            print("Database connection successful")
            return True
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False