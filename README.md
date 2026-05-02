# 🎓 Study Manager: The Ultimate Learning Platform 🚀

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

An advanced, premium-tier study management platform designed to master subjects through active recall and spaced repetition. Powered by **Firebase Firestore** for real-time data and a high-performance **React** frontend.

---

## 🌟 Latest Updates & Features

### 📊 Admin Performance Analytics
- **Live Session Tracking:** Monitor student progress in real-time.
- **Persistent History:** Student names are now preserved in session history even if accounts are modified, ensuring data integrity.
- **Orphan Data Handling:** Graceful display of historical data for deleted users.

### 🎨 Premium UX & Branding
- **Dynamic Favicon Rounding:** Proprietary Canvas-based logic that automatically curves the browser tab icon for a modern "squircle" look.
- **Enhanced UI:** Optimized Navbar with increased border-radius and smooth glassmorphism effects.

### 🃏 Professional Flashcard Manager
- **Category Organization:** Custom categories for deep organization.
- **Authorship Transparency:** Know exactly who created each card—Official Admin content vs. Student contributions.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19 + Vite | Blazing fast SPA with modern state management. |
| **Styling** | Tailwind CSS 4.0 | Utility-first CSS for a sleek, premium UI/UX. |
| **Backend** | Flask (Python) | Robust RESTful API with JWT authentication. |
| **Database** | Firebase Firestore | Real-time, scalable NoSQL cloud database. |
| **Auth** | JWT + Firebase Admin | Secure, stateless authentication with cross-platform support. |
| **UX Features** | Canvas API | Dynamic favicon rounding and interactive UI elements. |

---

## 📂 Project Structure

```bash
├── study_management_backend/   # 🐍 Python Flask API
│   ├── routes/                 # API Endpoints (Auth, Student, Admin, Progress)
│   ├── firebase_config.py      # Cloud Database connection
│   ├── requirements.txt        # Backend dependencies
│   └── app.py                  # Backend Entrypoint
└── study_management_frontend/  # ⚛️ React Vite App
    ├── src/
    │   ├── components/         # Reusable UI Components (Navbar, Layouts)
    │   ├── context/            # Global Auth & State Management
    │   ├── pages/              # Dashboard, Admin Panel, Study Mode
    │   └── services/           # Axios-based API communication
    └── index.html              # Entry point with dynamic rounding script
```

---

## 🚀 Getting Started

### 1️⃣ Backend Setup
```powershell
cd study_management_backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
# Set your FIREBASE_CREDENTIALS in .env
python app.py
```
*Backend runs at `http://localhost:5000`*

### 2️⃣ Frontend Setup
```powershell
cd study_management_frontend
npm install
# Set VITE_API_BASE_URL=http://localhost:5000/api in .env
npm run dev
```
*Frontend runs at `http://localhost:5173`*

---

## 🛡️ Administrative Capabilities

- **Content Moderation:** Edit or delete any card to maintain platform quality.
- **Performance Auditing:** View detailed score percentages and completion counts for all students.
- **User Control:** Manage account roles and verify system health.

---

## 🗺️ Future Roadmap
- [ ] **AI Generation:** Auto-generate flashcards from PDFs using GenAI.
- [ ] **Study Streaks:** Gamification elements to encourage daily practice.
- [ ] **Global Leaderboard:** Rank students based on accuracy and speed.

---

## 📝 License
Built with ❤️ by the Parvam Training Team. Distributed under the MIT License.
