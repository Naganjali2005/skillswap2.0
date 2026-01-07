# SkillSwap 🤝

SkillSwap is a peer-to-peer learning platform where students can exchange skills,  
chat in real time, and collaborate using shared resources and calls.

---

## 🚀 Features

### ✅ Implemented
- 🔐 JWT-based authentication (Login & Register)
- 📧 Unique email enforcement (signup + profile update)
- 👤 User profiles with portfolio links
  - GitHub
  - LinkedIn
  - LeetCode
  - Resume / Portfolio
- 🧠 Skill management
  - Skills you have
  - Skills you want to learn
- 🔄 Learning request system (send / accept)
- 💬 Real-time chat using WebSockets (Django Channels)
- 🔗 Video calls via Google Meet link sharing
- 🛡️ Secure APIs with role-based access

---

## 🛠 Tech Stack

### Frontend
- Next.js (App Router)
- Tailwind CSS
- WebSockets

### Backend
- Django
- Django REST Framework
- Django Channels
- SQLite (development)

---

## ⚙️ Local Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/<your-username>/skillswap.git
cd skillswap
```

---

### 2️⃣ Backend setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend runs at:  
http://127.0.0.1:8000

---

### 3️⃣ Frontend setup
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:  
http://localhost:3000

---

## 📌 Project Structure
```text
skillswap/
├── backend/
│   ├── api/
│   ├── chat/
│   ├── call/
│   └── core/
├── frontend/
│   └── app/
│       ├── chat/
│       ├── connections/
│       ├── profile/
│       └── dashboard/
```

---

## 🔮 Upcoming Features
- ⭐ Ratings & feedback system
- 📅 Session scheduling
- 🔔 Notifications
- 🤖 Smart skill matching
- 📊 User activity insights

---

## 👤 Author

Naganjali Rajalbandi  
Information Science Student  
Aspiring Full-Stack Developer 🚀

---

## 📜 License
This project is for educational purposes.
