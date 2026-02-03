"""
Employee Pydantic Models
Defines request/response schemas with validation
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class EmployeeBase(BaseModel):
    """Base employee fields"""
    employee_id: str = Field(
        ..., 
        min_length=1, 
        max_length=20,
        description="Unique employee identifier",
        json_schema_extra={"examples": ["EMP001"]}
    )
    full_name: str = Field(
        ..., 
        min_length=2, 
        max_length=100,
        description="Employee's full name",
        json_schema_extra={"examples": ["John Doe"]}
    )
    email: EmailStr = Field(
        ...,
        description="Employee's email address",
        json_schema_extra={"examples": ["john.doe@company.com"]}
    )
    department: str = Field(
        ..., 
        min_length=1, 
        max_length=50,
        description="Department name",
        json_schema_extra={"examples": ["Engineering"]}
    )


class EmployeeCreate(EmployeeBase):
    """Schema for creating a new employee"""
    pass


class EmployeeResponse(EmployeeBase):
    """Schema for employee response"""
    id: str = Field(..., description="MongoDB document ID")
    created_at: datetime = Field(..., description="Record creation timestamp")

    model_config = {"from_attributes": True}


class EmployeeListResponse(BaseModel):
    """Schema for list of employees"""
    employees: list = Field(default_factory=list)
    total: int = 0


class ErrorResponse(BaseModel):
    """Standard error response"""
    detail: str
    error_code: Optional[str] = None
