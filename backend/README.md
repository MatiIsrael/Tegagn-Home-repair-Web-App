# Tegagn Backend — Django REST Framework API

Production-ready backend API service for **Tegagn**, the home-repair marketplace connecting customers with verified tradespeople.

---

## 1. Prerequisites
- **Python 3.10+** (Python 3.14 recommended)
- **PostgreSQL 14+** (optional for quick local testing; SQLite fallback is supported via `USE_SQLITE_FALLBACK=True`)

---

## 2. Quick-Start Guide (Step-by-Step)

### Step 1: Open Terminal in the `backend/` Directory
```bash
cd "c:\Users\hp\Desktop\All project\Home-repair marketplace\backend"
```

### Step 2: Create a Virtual Environment
```bash
# Windows
python -m venv venv

# Linux / macOS
python3 -m venv venv
```

### Step 3: Activate the Virtual Environment
```bash
# Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# Windows (Command Prompt)
.\venv\Scripts\activate.bat

# Linux / macOS
source venv/bin/activate
```

### Step 4: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 5: Configure Environment Variables
Copy the template `.env.example` to `.env`:
```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Linux / macOS
cp .env.example .env
```
Open `.env` in any text editor and adjust your PostgreSQL credentials:
```ini
SECRET_KEY=generate-a-strong-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# PostgreSQL connection (if PostgreSQL is installed)
DB_NAME=tegagn_db
DB_USER=tegagn_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
USE_SQLITE_FALLBACK=False

# If PostgreSQL is not yet configured on your machine, set:
# USE_SQLITE_FALLBACK=True
```

### Step 6: Apply Database Migrations
```bash
python manage.py migrate
```

### Step 7: Seed Core Service Categories
Populate the database with the 6 standard trade categories:
```bash
python manage.py seed_categories
```

### Step 8: Create an Administrator Account
```bash
python manage.py createsuperuser
```

### Step 9: Run Automated Tests
```bash
python manage.py test
```
All 12 automated unit tests will execute and verify authentication, bookings, permissions, and reviews.

### Step 10: Start the Development Server
```bash
python manage.py runserver 8000
```
The API is now running at:
- **API Health Check**: http://127.0.0.1:8000/api/v1/health/
- **Django Admin Panel**: http://127.0.0.1:8000/admin/

---

## 3. API Endpoints Overview

| Method | Endpoint | Description | Permissions |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health/` | Service health status | Public |
| `POST` | `/api/v1/auth/register/customer/` | Register new customer account | Public |
| `POST` | `/api/v1/auth/register/worker/` | Register worker + initialize trade profile | Public |
| `POST` | `/api/v1/auth/login/` | Obtain JWT access + refresh tokens | Public |
| `POST` | `/api/v1/auth/token/refresh/` | Refresh expired access token | Public |
| `GET/PATCH` | `/api/v1/auth/me/` | Current user profile | Authenticated |
| `GET` | `/api/v1/services/` | List all active trade categories | Public |
| `GET` | `/api/v1/services/<slug>/` | Get single category details | Public |
| `GET` | `/api/v1/workers/` | Search and filter workers directory | Public |
| `GET` | `/api/v1/workers/<uuid>/` | Worker detailed profile + services | Public |
| `GET/PATCH` | `/api/v1/workers/me/` | Worker updates own trade profile | Worker |
| `GET/POST` | `/api/v1/workers/services/` | Manage worker priced service menu | Worker |
| `GET/POST` | `/api/v1/bookings/` | List my bookings / request new booking | Authenticated / Customer |
| `GET` | `/api/v1/bookings/<uuid>/` | Booking details with status history | Booking Participants |
| `POST` | `/api/v1/bookings/<uuid>/status/` | Transition booking state | Assigned Worker / Customer |
| `GET/POST` | `/api/v1/reviews/` | List reviews / post review on completed job | Public / Customer |
| `PATCH` | `/api/v1/reviews/<uuid>/reply/` | Tradesperson posts reply to review | Reviewed Worker |
