# TaskHIVE — Team Task Manager

**🔗 Important Links:**
- 🌐 **Live Demo (Railway):** https://taskhive-production-50d3.up.railway.app/**
- 💻 **GitHub Repository:** [https://github.com/KALKIOP/TaskHive](https://github.com/KALKIOP/TaskHive)
- 🎥 **Demo Video:** [Insert Video Link Here]

A full-stack web application for team project management with role-based access control. Create projects, assign tasks to team members, and track progress with an intuitive dashboard.

## 🚀 Features

- **Authentication** — Signup & Login with JWT-based session management
- **Role-Based Access Control** — Admin and Member roles with enforced backend permissions
- **Project Management** — Create projects, add/remove team members
- **Task Management** — Create tasks, assign to users, set due dates, update status (pending → in-progress → completed)
- **Dashboard** — Real-time stats, overdue task tracking, recent activity overview
- **Responsive UI** — Modern dark-theme design that works on desktop and mobile

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Axios |
| Backend | Node.js, Express 5 |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT + bcrypt |
| Deployment | Railway |

## 📁 Project Structure

```
team-task-manager/
├── backend/
│   ├── middleware/      # Auth & role middleware
│   ├── models/          # Mongoose schemas (User, Project, Task)
│   ├── routes/          # REST API routes
│   ├── server.js        # Express app entry point
│   └── .env             # Environment variables (not committed)
├── frontend/
│   ├── src/
│   │   ├── pages/       # Login, Signup, Dashboard
│   │   ├── api.js       # Axios instance with auth interceptor
│   │   └── App.jsx      # Routes & auth guard
│   └── index.html
└── README.md
```

## 🔑 API Endpoints

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/signup` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login & get JWT token |
| GET | `/api/auth/me` | Auth | Get current user profile |

### Projects
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/projects` | Auth | List projects (admin: all, member: assigned) |
| POST | `/api/projects` | Admin | Create new project |
| PUT | `/api/projects/:id/members` | Admin | Update project members |
| DELETE | `/api/projects/:id` | Admin | Delete project |

### Tasks
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/tasks` | Auth | List tasks (admin: all, member: assigned) |
| GET | `/api/tasks?project=ID` | Auth | Filter tasks by project |
| POST | `/api/tasks` | Admin | Create new task |
| PUT | `/api/tasks/:id` | Auth | Update task (status, assignment, etc.) |
| DELETE | `/api/tasks/:id` | Admin | Delete task |

### Users
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/users` | Auth | List all users (for assignment dropdowns) |

## ⚙️ Local Development

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd team-task-manager
   ```

2. **Backend setup**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file:
   ```
   PORT=8000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   FRONTEND_URL=http://localhost:5173
   ```
   ```bash
   npm start
   ```

3. **Frontend setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser

## 🚢 Deployment (Railway)

### Backend
1. Create a new Railway service from the `backend` directory
2. Set environment variables: `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`
3. Start command: `npm start`

### Frontend
1. Create a new Railway service from the `frontend` directory
2. Set environment variable: `VITE_API_URL` to your backend Railway URL
3. Build command: `npm run build`
4. Start command: `npx serve dist -s`

## 📝 License

MIT
