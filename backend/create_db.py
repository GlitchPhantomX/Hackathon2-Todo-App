from sqlmodel import SQLModel
from db import engine
from models import *  # Import all models

# Create all tables
SQLModel.metadata.create_all(engine)
print("✅ Database tables created successfully!")