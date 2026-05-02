
# 🎓 Study Manager: The Ultimate Learning Platform 🚀

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

An advanced, premium-tier study management platform designed to help students master their subjects through active recall and spaced repetition. Built with a robust **Flask** backend and a high-performance **React** frontend.

---

## 🌟 Key Features

### 📊 Dynamic Dashboard (Command Center)
- **Interactive Stats:** Real-time tracking of Total Cards, Review Targets, and Mastered content.
- **Instant Preview:** Click on "To Review" or "Mastered" to see your card lists directly on the dashboard without leaving the page.
- **Guided Onboarding:** A built-in tour system that walks new users through the platform features.

### 🃏 Professional Flashcard Manager
- **Category Organization:** Create custom categories (Biology, React, etc.) to keep your studies organized.
- **Search & Filter:** Instantly find cards using deep search and category filters.
- **Authorship Transparency:** See who created each card—whether it's a student-created card or an official admin-shared prompt.

### 🧠 Spaced Repetition Study Mode
- **Honest Grading:** Grade yourself with "Got It" or "I Don't No" buttons.
- **Smart Finish:** The interface intelligently switches to a "Finish" state on the final card for a natural session end.
- **Focused Review:** Clicking the "Try again" badge allows you to instantly restart a session with *only* the questions you missed.

### 🛡️ Administrative Power
- **Content Oversight:** Admins can view, edit, and delete *any* card on the platform to maintain quality.
- **User Management:** Full control over user accounts and roles (Student vs Admin).
- **Global Sharing:** Admin-created cards are instantly shared with all students as official study material.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React + Vite | Blazing fast SPA with modern state management. |
| **Styling** | Tailwind CSS | Utility-first CSS for a sleek, premium UI/UX. |
| **Backend** | Flask (Python) | Robust RESTful API with JWT authentication. |
| **Database** | SQLite / SQLAlchemy | Reliable data persistence with ORM mapping. |
| **Auth** | JWT (JSON Web Tokens) | Secure, stateless authentication for all users. |
| **UI Components** | Radix UI / Lucide | High-quality, accessible UI primitives and icons. |

---

## 📂 Project Structure

```bash
├── study_management_backend/   # 🐍 Python Flask API
│   ├── models/                 # Database Schemas (User, Flashcard)
│   ├── routes/                 # API Endpoints (Auth, Student, Admin)
│   ├── config/                 # App configurations
│   └── app.py                  # Backend Entrypoint
└── study_management_frontend/  # ⚛️ React Vite App
    ├── src/
    │   ├── components/         # Reusable UI Components
    │   ├── context/            # Auth & State Contexts
    │   ├── pages/              # Dashboard, Study, Flashcards, Profile
    │   └── services/           # API communication layer
    └── tailwind.config.js      # Custom design tokens
```

---

## 🛠️ Programming Languages & Technologies

This project utilizes a modern, multi-tier tech stack to deliver a high-quality experience:

- **Python (3.10+):** The backbone of our backend. Used for building the RESTful API, handling server-side logic, and managing database interactions with extreme efficiency.
- **JavaScript (ES6+):** Powers the entire frontend. Responsible for the dynamic, single-page application (SPA) experience, real-time stat updates, and interactive study logic.
- **SQL (SQLite):** Used via SQLAlchemy for structured data storage, ensuring user profiles and flashcards are persisted securely.
- **HTML5:** Provides the semantic foundation for the application, optimized for accessibility and SEO.
- **CSS3 (Tailwind):** Used for advanced, premium styling. Implements glassmorphism, smooth transitions, and responsive layouts.
- **Markdown:** Used for project documentation and metadata tracking.

---

## 📂 Core Project Files & Descriptions

### 🐍 Backend Core
- **`app.py`**: The heart of the backend. Initializes the Flask server, connects the database, and registers all API blueprints.
- **`routes/student.py`**: Contains the essential logic for flashcard CRUD operations and study result tracking.
- **`models/flashcard.py`**: Defines the database schema for cards, including authorship tracking and categories.

### ⚛️ Frontend Core
- **`DashboardPage.jsx`**: The primary user hub. Manages the interactive stat cards and the dynamic in-dashboard preview lists.
- **`StudyModePage.jsx`**: The engine behind the learning experience. Handles the "flip-card" logic, smart grading, and session completion.
- **`FlashcardManagerPage.jsx`**: A powerful interface for content creators. Manages card drafting, editing, and category organization.
- **`AuthContext.js`**: The security layer. Manages global user state, tokens, and role-based permissions (Admin vs. Student).

---

## 🚀 Getting Started

### 1️⃣ Backend Setup
```powershell
cd study_management_backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```
*Backend runs at `http://localhost:5000`*

### 2️⃣ Frontend Setup
```powershell
cd study_management_frontend
npm install
npm run dev
```
*Frontend runs at `http://localhost:5173`*

---

## 👤 User Roles

| Feature | Student | Admin |
| :--- | :---: | :---: |
| Create Flashcards | ✅ | ✅ |
| Edit Own Cards | ✅ | ✅ |
| Delete Own Cards | ✅ | ✅ |
| Delete Others' Cards | ❌ | ✅ |
| Global Card Sharing | ❌ | ✅ |
| Study Mode | ✅ | ✅ |
| Access Admin Panel | ❌ | ✅ |

---

## 🗺️ Roadmap
- [ ] **AI Assistant:** Auto-generate flashcards from uploaded PDFs.
- [ ] **Global Leaderboard:** Gamified study points and streaks.
- [ ] **Mobile App:** Native experience for studying on the go.
- [ ] **Dark Mode:** System-wide dark/light theme toggle.

---

## 📝 License
Built with ❤️ by the Parvam Training Team. Distributed under the MIT License.
