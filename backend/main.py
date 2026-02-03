"""
HRMS Lite - FastAPI Backend
Main application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import connect_to_mongo, close_mongo_connection, get_database
from routes import employees, attendance


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()


app = FastAPI(
    title="HRMS Lite API",
    description="Lightweight Human Resource Management System API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration - Allow frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alternative dev server
        "https://quesscorpassignment.vercel.app",  # Production frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(employees.router, prefix="/api/employees", tags=["Employees"])
app.include_router(attendance.router, prefix="/api/attendance", tags=["Attendance"])


@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "HRMS Lite API",
        "version": "1.0.0"
    }


@app.get("/api/stats", tags=["Dashboard"])
async def get_stats():
    """Get dashboard statistics"""
    db = get_database()
    
    total_employees = await db.employees.count_documents({})
    total_attendance = await db.attendance.count_documents({})
    present_count = await db.attendance.count_documents({"status": "Present"})
    absent_count = await db.attendance.count_documents({"status": "Absent"})
    
    return {
        "total_employees": total_employees,
        "total_attendance_records": total_attendance,
        "present_count": present_count,
        "absent_count": absent_count
    }
