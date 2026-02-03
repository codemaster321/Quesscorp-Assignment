# HRMS Lite - Human Resource Management System

A lightweight, full-stack Human Resource Management System for employee and attendance management.

![HRMS Lite](https://img.shields.io/badge/HRMS-Lite-4f46e5?style=for-the-badge)

## 🚀 Live Demo

- **Frontend**: [https://hrms-lite.vercel.app](https://hrms-lite.vercel.app) *(Update after deployment)*
- **Backend API**: [https://hrms-lite-api.onrender.com](https://hrms-lite-api.onrender.com) *(Update after deployment)*
- **API Documentation**: [Backend URL]/docs

## 📋 Project Overview

HRMS Lite is a web-based application that allows administrators to:
- **Manage Employees**: Add, view, and delete employee records
- **Track Attendance**: Mark daily attendance and view records
- **View Dashboard**: Summary statistics and recent activity
- **Filter Data**: Filter attendance by date and employee

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Vanilla CSS** with custom design system

### Backend
- **Python FastAPI** for REST API
- **Motor** (Async MongoDB driver)
- **Pydantic** for data validation

### Database
- **MongoDB Atlas** (Cloud-hosted)

### Deployment
- **Frontend**: Vercel
- **Backend**: Render

## 📦 Project Structure

```
hrms-lite/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── database.py          # MongoDB connection
│   ├── models/              # Pydantic schemas
│   │   ├── employee.py
│   │   └── attendance.py
│   ├── routes/              # API endpoints
│   │   ├── employees.py
│   │   └── attendance.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API client
│   │   ├── App.jsx
│   │   └── index.css        # Design system
│   ├── index.html
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB Atlas account (free tier)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate virtual environment:
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create `.env` file with your MongoDB connection:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hrms_lite
   ```

5. Run the server:
   ```bash
   uvicorn main:app --reload
   ```

   The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file (optional, for production):
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## 📡 API Endpoints

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | List all employees |
| POST | `/api/employees` | Create new employee |
| GET | `/api/employees/{id}` | Get employee by ID |
| DELETE | `/api/employees/{id}` | Delete employee |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/attendance` | List all attendance records |
| POST | `/api/attendance` | Mark attendance |
| GET | `/api/attendance/employee/{id}` | Get employee's attendance |
| GET | `/api/attendance/summary/{id}` | Get employee's summary |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats` | Get dashboard statistics |

## ✨ Features

### Core Features
- ✅ Employee CRUD operations
- ✅ Attendance marking and tracking
- ✅ Dashboard with statistics
- ✅ Form validation (client & server)
- ✅ Error handling with toast notifications
- ✅ Loading and empty states

### Bonus Features
- ✅ Filter attendance by date
- ✅ Filter attendance by employee
- ✅ Employee attendance summary with percentage
- ✅ Dashboard with total counts

## 🎨 Design Principles

Modern Web Design Guidelines:
- **Typography**: Inter font, proper type scale
- **Colors**: Indigo primary with tints/shades
- **Whitespace**: 8px base spacing system
- **Shadows**: Light, purposeful shadows
- **UX**: Familiar patterns, immediate feedback

## ⚠️ Assumptions & Limitations

1. **Single Admin User**: No authentication required (as per requirements)
2. **Admin-only Access**: Only authorized users should perform administrative tasks.
3. **One Attendance Per Day**: Cannot mark multiple statuses for same day
4. **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)

## 🔧 Environment Variables

### Backend
| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |

### Frontend
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |



