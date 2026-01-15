from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from contextlib import contextmanager
import os
import sys
import inspect

# Get the parent directory (backend) and add it to sys.path
currentdir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parentdir = os.path.dirname(currentdir)
backenddir = os.path.dirname(parentdir)  # Go up to backend directory

# Insert the backend directory at the beginning of sys.path to ensure correct imports
if backenddir not in sys.path:
    sys.path.insert(0, backenddir)

# Now import from the main backend using importlib to avoid conflicts
import importlib.util
import inspect
import os

# Get the parent directory (backend) to import from
currentdir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parentdir = os.path.dirname(currentdir)  # This is the microservices directory
backenddir = parentdir  # This is the backend directory (one level up from microservices)

# Import the db module from the main backend directory
db_spec = importlib.util.spec_from_file_location("db", os.path.join(backenddir, "db.py"))
db_module = importlib.util.module_from_spec(db_spec)
db_spec.loader.exec_module(db_module)

# Get the DATABASE_URL from the imported module
DATABASE_URL = db_module.DATABASE_URL

# If using SQLite, ensure we use absolute path to avoid path issues
if DATABASE_URL.startswith("sqlite:///") and not DATABASE_URL.startswith("sqlite:////"):
    # Extract relative path and convert to absolute
    relative_path = DATABASE_URL[10:]  # Remove "sqlite:///"
    if not os.path.isabs(relative_path):
        abs_path = os.path.abspath(os.path.join(backenddir, relative_path))
        DATABASE_URL = f"sqlite:///{abs_path}"

# Create database engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=300
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@contextmanager
def get_db_session():
    """
    Context manager for database sessions to ensure proper cleanup
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


def test_connection():
    """
    Test database connection
    """
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        return True
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False