"""
Database connection and configuration
Uses Motor for async MongoDB operations
"""
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

# MongoDB client instance
_client: AsyncIOMotorClient = None
_database = None


async def connect_to_mongo():
    """Initialize MongoDB connection"""
    global _client, _database
    
    mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    
    _client = AsyncIOMotorClient(mongodb_uri)
    # Explicitly use 'hrms_lite' database instead of relying on URI
    _database = _client["hrms_lite"]
    
    # Create indexes for better query performance
    await _database.employees.create_index("employee_id", unique=True)
    await _database.employees.create_index("email", unique=True)
    await _database.attendance.create_index([("employee_id", 1), ("date", 1)], unique=True)
    
    print("✅ Connected to MongoDB")


async def close_mongo_connection():
    """Close MongoDB connection"""
    global _client
    if _client:
        _client.close()
        print("❌ Disconnected from MongoDB")


def get_database():
    """Get database instance"""
    return _database
