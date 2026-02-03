"""
Employee API Routes
CRUD operations for employee management
"""
from datetime import datetime
from fastapi import APIRouter, HTTPException, status
from database import get_database
from models.employee import (
    EmployeeCreate,
    EmployeeResponse,
    EmployeeListResponse
)

router = APIRouter()


def employee_helper(employee: dict) -> dict:
    """Convert MongoDB document to response format"""
    return {
        "id": str(employee["_id"]),
        "employee_id": employee["employee_id"],
        "full_name": employee["full_name"],
        "email": employee["email"],
        "department": employee["department"],
        "created_at": employee["created_at"]
    }


@router.post(
    "",
    response_model=EmployeeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new employee",
    responses={
        409: {"description": "Employee ID or email already exists"},
        422: {"description": "Validation error"}
    }
)
async def create_employee(employee: EmployeeCreate):
    """
    Create a new employee with the following information:
    - **employee_id**: Unique identifier (e.g., EMP001)
    - **full_name**: Employee's full name
    - **email**: Valid email address (must be unique)
    - **department**: Department name
    """
    db = get_database()
    
    # Check for duplicate employee_id
    existing_by_id = await db.employees.find_one({"employee_id": employee.employee_id})
    if existing_by_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Employee with ID '{employee.employee_id}' already exists"
        )
    
    # Check for duplicate email
    existing_by_email = await db.employees.find_one({"email": employee.email})
    if existing_by_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Employee with email '{employee.email}' already exists"
        )
    
    # Create employee document
    employee_doc = {
        **employee.model_dump(),
        "created_at": datetime.utcnow()
    }
    
    result = await db.employees.insert_one(employee_doc)
    
    # Fetch and return created employee
    created_employee = await db.employees.find_one({"_id": result.inserted_id})
    return employee_helper(created_employee)


@router.get(
    "",
    response_model=EmployeeListResponse,
    summary="Get all employees"
)
async def get_all_employees():
    """
    Retrieve a list of all employees in the system.
    Returns employees sorted by creation date (newest first).
    """
    db = get_database()
    
    employees = []
    cursor = db.employees.find().sort("created_at", -1)
    
    async for employee in cursor:
        employees.append(employee_helper(employee))
    
    return {
        "employees": employees,
        "total": len(employees)
    }


@router.get(
    "/{employee_id}",
    response_model=EmployeeResponse,
    summary="Get employee by ID",
    responses={
        404: {"description": "Employee not found"}
    }
)
async def get_employee(employee_id: str):
    """
    Retrieve a specific employee by their employee ID.
    """
    db = get_database()
    
    employee = await db.employees.find_one({"employee_id": employee_id})
    
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found"
        )
    
    return employee_helper(employee)


@router.delete(
    "/{employee_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an employee",
    responses={
        404: {"description": "Employee not found"}
    }
)
async def delete_employee(employee_id: str):
    """
    Delete an employee by their employee ID.
    Also removes all associated attendance records.
    """
    db = get_database()
    
    # Check if employee exists
    employee = await db.employees.find_one({"employee_id": employee_id})
    
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found"
        )
    
    # Delete employee
    await db.employees.delete_one({"employee_id": employee_id})
    
    # Delete associated attendance records
    await db.attendance.delete_many({"employee_id": employee_id})
    
    return None
@router.put(
    "/{employee_id}",
    response_model=EmployeeResponse,
    summary="Update an employee",
    responses={
        404: {"description": "Employee not found"},
        409: {"description": "Email already exists"},
        422: {"description": "Validation error"}
    }
)
async def update_employee(employee_id: str, employee_update: EmployeeCreate):
    """
    Update an existing employee's information.
    The employee_id in the URL must match an existing employee.
    """
    db = get_database()
    
    # Check if employee exists
    existing = await db.employees.find_one({"employee_id": employee_id})
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found"
        )
    
    # Check if the new info causes a conflict with ANOTHER employee
    # Check employee_id conflict (only if changing it, though here we use it as URL param)
    if employee_update.employee_id != employee_id:
        conflict_id = await db.employees.find_one({"employee_id": employee_update.employee_id})
        if conflict_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Employee ID '{employee_update.employee_id}' is already taken"
            )

    # Check email conflict
    conflict_email = await db.employees.find_one({
        "email": employee_update.email,
        "employee_id": {"$ne": employee_id}
    })
    if conflict_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Email '{employee_update.email}' is already taken by another employee"
        )
    
    # Update employee
    update_data = employee_update.model_dump()
    await db.employees.update_one(
        {"employee_id": employee_id},
        {"$set": update_data}
    )
    
    # Also update attendance records if employee_id or name changed
    # (In this simple schema, attendance stores employee_id. If employee_id changed, update records)
    if employee_update.employee_id != employee_id:
        await db.attendance.update_many(
            {"employee_id": employee_id},
            {"$set": {"employee_id": employee_update.employee_id}}
        )
    
    # Fetch updated employee
    updated = await db.employees.find_one({"employee_id": employee_update.employee_id})
    return employee_helper(updated)
