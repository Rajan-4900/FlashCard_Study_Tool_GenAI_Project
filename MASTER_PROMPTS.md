# 📚 Study Management System (Master Prompt File)

## 🎯 Goal
Build a full-stack web app using:
- Frontend: React
- Backend: Flask
- DB: SQLite
- Auth: JWT

---

## 🧩 Step 1: Backend (Use in Antigravity)

PROMPT:

Build a Flask backend with:
- JWT authentication
- User roles (admin, student)
- Flashcard CRUD
- SQLite + SQLAlchemy
- Blueprints structure

Include:
- /api/register
- /api/login
- /api/cards
- /api/users (admin)

Return complete backend structure.

---

## 🧩 Step 2: Frontend (Use in Cursor)

PROMPT:

Build React frontend with:
- Login/Register pages
- Dashboard
- Flashcard Manager
- Study Mode (flip cards)

Use:
- Tailwind CSS
- Axios
- React Router

Include:
- Auth context
- Protected routes

---

## 🧩 Step 3: Integration

PROMPT:

Connect React frontend with Flask backend:
- Base URL: http://localhost:5000/api
- Use JWT in headers
- Handle errors properly

---

## 🧩 Step 4: Improvements

PROMPT:

- Add animations (card flip)
- Add loading states
- Improve UI/UX
- Fix bugs