# HRMS Lite - Backend API

A robust, high-performance Human Resource Management System API built with FastAPI and MongoDB.

## 🚀 Teck Stack
- **FastAPI**: Modern, fast (high-performance) web framework for building APIs.
- **MongoDB Atlas**: Cloud-native NoSQL database for flexible data persistence.
- **Pydantic V2**: Data validation and settings management using Python type annotations.
- **Motor**: Asynchronous MongoDB driver for Python.

## ✨ Key Features
- **Full Employee CRUD**: Complete management of employee records.
- **Attendance system**: Mark, view, and summarize employee attendance.
- **Real-time Statistics**: Dashboard endpoints for instant organizational insights.
- **Python 3.13 Compatible**: Modern architecture supporting the latest Python versions.

## 🛠️ Setup & Installation

1. **Virtual Environment**:
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   ```

2. **Dependencies**:
   ```powershell
   pip install -r requirements.txt
   ```

3. **Configuration**:
   Create a `.env` file from `.env.example` and set your `MONGODB_URI`.

4. **Run Server**:
   ```powershell
   uvicorn main:app --reload
   ```

## 📖 API Documentation
Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **Redoc**: http://localhost:8000/redoc

---
*Project documentation for HRMS Lite.*
