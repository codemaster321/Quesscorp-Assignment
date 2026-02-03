"""
Attendance Pydantic Models
Defines request/response schemas with validation
"""
from datetime import datetime
from datetime import date as DateType
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class AttendanceStatus(str, Enum):
    """Attendance status enumeration"""
    PRESENT = "Present"
    ABSENT = "Absent"


class AttendanceBase(BaseModel):
    """Base attendance fields"""
    employee_id: str = Field(
        ..., 
        min_length=1,
        description="Employee ID reference",
        json_schema_extra={"examples": ["EMP001"]}
    )
    date: DateType = Field(
        ...,
        description="Attendance date",
        json_schema_extra={"examples": ["2026-02-03"]}
    )
    status: AttendanceStatus = Field(
        ...,
        description="Attendance status",
        json_schema_extra={"examples": ["Present"]}
    )


class AttendanceCreate(AttendanceBase):
    """Schema for marking attendance"""
    pass


class AttendanceResponse(AttendanceBase):
    """Schema for attendance response"""
    id: str = Field(..., description="MongoDB document ID")
    marked_at: datetime = Field(..., description="When attendance was marked")
    employee_name: Optional[str] = Field(None, description="Employee's full name")

    model_config = {"from_attributes": True}


class AttendanceListResponse(BaseModel):
    """Schema for list of attendance records"""
    records: list = Field(default_factory=list)
    total: int = 0


class AttendanceSummary(BaseModel):
    """Summary of attendance for an employee"""
    employee_id: str
    employee_name: str
    total_days: int
    present_days: int
    absent_days: int
    attendance_percentage: float
