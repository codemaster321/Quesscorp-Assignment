"""
Attendance API Routes
Operations for attendance management
"""
from datetime import datetime, date
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Query
from bson import ObjectId

from database import get_database
from models.attendance import (
    AttendanceCreate,
    AttendanceResponse,
    AttendanceListResponse,
    AttendanceSummary
)

router = APIRouter()


def attendance_helper(record: dict, employee_name: str = None) -> dict:
    """Convert MongoDB document to response format"""
    return {
        "id": str(record["_id"]),
        "employee_id": record["employee_id"],
        "date": record["date"],
        "status": record["status"],
        "marked_at": record["marked_at"],
        "employee_name": employee_name
    }


@router.post(
    "",
    response_model=AttendanceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Mark attendance for an employee",
    responses={
        404: {"description": "Employee not found"},
        409: {"description": "Attendance already marked for this date"},
        422: {"description": "Validation error"}
    }
)
async def mark_attendance(attendance: AttendanceCreate):
    """
    Mark attendance for an employee on a specific date.
    - **employee_id**: Employee's ID
    - **date**: Date of attendance (YYYY-MM-DD)
    - **status**: Present or Absent
    """
    db = get_database()
    
    # Verify employee exists
    employee = await db.employees.find_one({"employee_id": attendance.employee_id})
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{attendance.employee_id}' not found"
        )
    
    # Check if attendance already marked for this date
    existing = await db.attendance.find_one({
        "employee_id": attendance.employee_id,
        "date": attendance.date.isoformat()
    })
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Attendance already marked for employee '{attendance.employee_id}' on {attendance.date}"
        )
    
    # Create attendance record
    attendance_doc = {
        "employee_id": attendance.employee_id,
        "date": attendance.date.isoformat(),
        "status": attendance.status.value,
        "marked_at": datetime.utcnow()
    }
    
    result = await db.attendance.insert_one(attendance_doc)
    
    # Fetch and return created record
    created_record = await db.attendance.find_one({"_id": result.inserted_id})
    return attendance_helper(created_record, employee["full_name"])


@router.get(
    "",
    response_model=AttendanceListResponse,
    summary="Get all attendance records"
)
async def get_all_attendance(
    date_filter: Optional[date] = Query(None, description="Filter by specific date"),
    employee_id: Optional[str] = Query(None, description="Filter by employee ID")
):
    """
    Retrieve attendance records with optional filters.
    - **date_filter**: Filter records by date
    - **employee_id**: Filter records by employee ID
    """
    db = get_database()
    
    # Build query
    query = {}
    if date_filter:
        query["date"] = date_filter.isoformat()
    if employee_id:
        query["employee_id"] = employee_id
    
    # Get employee names for display
    employees_map = {}
    async for emp in db.employees.find():
        employees_map[emp["employee_id"]] = emp["full_name"]
    
    records = []
    cursor = db.attendance.find(query).sort("date", -1)
    
    async for record in cursor:
        employee_name = employees_map.get(record["employee_id"], "Unknown")
        records.append(attendance_helper(record, employee_name))
    
    return {
        "records": records,
        "total": len(records)
    }


@router.get(
    "/employee/{employee_id}",
    response_model=AttendanceListResponse,
    summary="Get attendance for a specific employee",
    responses={
        404: {"description": "Employee not found"}
    }
)
async def get_employee_attendance(employee_id: str):
    """
    Retrieve all attendance records for a specific employee.
    """
    db = get_database()
    
    # Verify employee exists
    employee = await db.employees.find_one({"employee_id": employee_id})
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found"
        )
    
    records = []
    cursor = db.attendance.find({"employee_id": employee_id}).sort("date", -1)
    
    async for record in cursor:
        records.append(attendance_helper(record, employee["full_name"]))
    
    return {
        "records": records,
        "total": len(records)
    }


@router.get(
    "/summary/{employee_id}",
    response_model=AttendanceSummary,
    summary="Get attendance summary for an employee",
    responses={
        404: {"description": "Employee not found"}
    }
)
async def get_attendance_summary(employee_id: str):
    """
    Get attendance statistics for a specific employee.
    """
    db = get_database()
    
    # Verify employee exists
    employee = await db.employees.find_one({"employee_id": employee_id})
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found"
        )
    
    # Calculate statistics
    total_days = await db.attendance.count_documents({"employee_id": employee_id})
    present_days = await db.attendance.count_documents({
        "employee_id": employee_id,
        "status": "Present"
    })
    absent_days = total_days - present_days
    
    attendance_percentage = (present_days / total_days * 100) if total_days > 0 else 0
    
    return {
        "employee_id": employee_id,
        "employee_name": employee["full_name"],
        "total_days": total_days,
        "present_days": present_days,
        "absent_days": absent_days,
        "attendance_percentage": round(attendance_percentage, 2)
    }


@router.delete(
    "/{attendance_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an attendance record",
    responses={
        404: {"description": "Attendance record not found"}
    }
)
async def delete_attendance(attendance_id: str):
    """
    Delete a specific attendance record by its ID.
    """
    db = get_database()
    
    try:
        obj_id = ObjectId(attendance_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid attendance ID format"
        )
    
    result = await db.attendance.delete_one({"_id": obj_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance record not found"
        )
    
    return None
