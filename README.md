# Smart Leads Dashboard

A full-stack Lead Management Dashboard built with the MERN stack, TypeScript, TailwindCSS, and Docker.

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 18, TypeScript, TailwindCSS, Vite |
| Backend    | Node.js, Express.js, TypeScript         |
| Database   | MongoDB, Mongoose                       |
| Auth       | JWT, bcryptjs                           |
| DevOps     | Docker, Docker Compose, Nginx           |

---

## Features

- **JWT Authentication** — Register, Login, Protected Routes
- **Role-Based Access Control** — Admin (full access) / Sales (own leads only)
- **Leads CRUD** — Create, Read, Update, Delete leads
- **Advanced Filtering** — Filter by Status, Source; Search by Name/Email; Sort by Latest/Oldest
- **Combined Filters** — All filters work together simultaneously
- **Backend Pagination** — 10 records per page with full metadata
- **Debounced Search** — 400ms debounce to reduce API calls
- **CSV Export** — Download leads as a CSV file
- **Stats Dashboard** — Total, Qualified, Contacted, Lost counts
- **Dark Mode** — System preference + manual toggle
- **Responsive Design** — Mobile-first, works on all screen sizes
- **Loading & Empty States** — Proper UX feedback throughout
- **Form Validation** — Client-side and server-side validation

---

## Project Structure

```
smart-leads-dashboard/
├── backend/
│   ├── src/
│   │   ├── config/         # Database connection
│   │   ├── controllers/    # Auth & Leads business logic
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── models/         # Mongoose schemas (User, Lead)
│   │   ├── routes/         # Express route definitions
│   │   ├── types/          # TypeScript interfaces & types
│   │   └── index.ts        # App entry point
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios instance + API calls
│   │   ├── components/
│   │   │   ├── leads/      # LeadForm, LeadsTable, Filters, Pagination, Stats
│   │   │   └── ui/         # Button, Input, Modal, Badge, Spinner, Navbar
│   │   ├── context/        # AuthContext, ThemeContext
│   │   ├── hooks/          # useLeads, useDebounce
│   │   ├── pages/          # LoginPage, RegisterPage, DashboardPage
│   │   ├── types/          # TypeScript interfaces
│   │   └── main.tsx        # React entry point
│   ├── .env.example
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml
└── README.md
```

---

## Setup Instructions

### Option 1 — Docker (Recommended)

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd smart-leads-dashboard

# 2. Start all services
docker-compose up --build

# 3. Open in browser
# Frontend: http://localhost
# Backend API: http://localhost:5000/api/health
```

---

### Option 2 — Local Development

#### Backend

```bash
cd backend
npm install

# Copy and fill environment variables
cp .env.example .env

# Start dev server (with hot reload)
npm run dev
```

#### Frontend

```bash
cd frontend
npm install

# Copy and fill environment variables
cp .env.example .env

# Start dev server
npm run dev
# Open http://localhost:5173
```

#### Environment Variables

**backend/.env**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-leads
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000/api
```

---

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Auth Endpoints

| Method | Endpoint         | Description       | Auth Required |
|--------|-----------------|-------------------|---------------|
| POST   | /auth/register  | Register new user | No            |
| POST   | /auth/login     | Login             | No            |
| GET    | /auth/me        | Get current user  | Yes           |

**Register / Login Request Body:**
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "password123",
  "role": "sales"
}
```

**Auth Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGci...",
    "user": { "id": "...", "name": "Rahul Sharma", "email": "...", "role": "sales" }
  }
}
```

---

### Leads Endpoints

> All routes require `Authorization: Bearer <token>` header.

| Method | Endpoint         | Description         | Role         |
|--------|-----------------|---------------------|--------------|
| GET    | /leads          | List leads (filtered)| All         |
| GET    | /leads/:id      | Get single lead     | All          |
| POST   | /leads          | Create lead         | All          |
| PUT    | /leads/:id      | Update lead         | All (own)    |
| DELETE | /leads/:id      | Delete lead         | Admin only   |
| GET    | /leads/stats    | Get stats summary   | All          |
| GET    | /leads/export   | Export as CSV       | All          |

**Query Parameters for GET /leads:**

| Param    | Type    | Options                             | Default  |
|----------|---------|-------------------------------------|----------|
| status   | string  | New, Contacted, Qualified, Lost      | —        |
| source   | string  | Website, Instagram, Referral         | —        |
| search   | string  | Free text (name or email)            | —        |
| sort     | string  | latest, oldest                       | latest   |
| page     | number  | Page number                          | 1        |
| limit    | number  | Records per page (max 50)            | 10       |

**Example — combined filters:**
```
GET /api/leads?status=Qualified&source=Instagram&search=Rahul&sort=latest&page=1
```

**Leads Response:**
```json
{
  "success": true,
  "data": [ { "_id": "...", "name": "Rahul", "email": "...", "status": "Qualified", "source": "Instagram", "createdAt": "..." } ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Create / Update Lead Body:**
```json
{
  "name": "Priya Singh",
  "email": "priya@example.com",
  "status": "New",
  "source": "Instagram"
}
```

---

## Role-Based Access Control

| Feature              | Admin | Sales User      |
|---------------------|-------|-----------------|
| View all leads       | ✅    | Own leads only  |
| Create leads         | ✅    | ✅              |
| Edit leads           | ✅    | Own leads only  |
| Delete leads         | ✅    | ❌              |
| Export CSV           | ✅    | ✅ (own leads)  |
| View stats           | ✅    | ✅ (own data)   |

---

## Evaluation Checklist

| Requirement                     | Status |
|--------------------------------|--------|
| TypeScript (frontend + backend) | ✅     |
| JWT Authentication              | ✅     |
| Password hashing (bcrypt)       | ✅     |
| Protected routes                | ✅     |
| Leads CRUD                      | ✅     |
| Filter by Status                | ✅     |
| Filter by Source                | ✅     |
| Search by Name/Email            | ✅     |
| Sort Latest/Oldest              | ✅     |
| Combined filters                | ✅     |
| Backend pagination              | ✅     |
| Debounced search                | ✅     |
| CSV Export                      | ✅     |
| Role-Based Access Control       | ✅     |
| Docker setup                    | ✅     |
| Dark mode                       | ✅     |
| Responsive design               | ✅     |
| Loading & empty states          | ✅     |
| Form validation                 | ✅     |
| Centralized error handling      | ✅     |
| Clean folder structure          | ✅     |
| Reusable components             | ✅     |
| RESTful API                     | ✅     |
| Proper HTTP status codes        | ✅     |

---

## Submission

**Email:** ritik.yadav@servicehive.tech  
**Subject:** `MERN Internship Assignment Submission - Your Name`
