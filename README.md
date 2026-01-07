# SkillSwap 🤝

SkillSwap is a peer-to-peer learning platform where students can exchange skills, connect with like-minded learners, chat in real time, and collaborate through shared resources.

The platform focuses on **skill matching**, **learning requests**, and **real-time communication**.

---

## 🚀 Features

### ✅ Implemented Features

- 🔐 **JWT-based Authentication**
  - User registration and login
  - Secure access using access & refresh tokens

- 📧 **Unique Email Enforcement**
  - Email must be unique during signup
  - Email uniqueness is also validated during profile updates

- 👤 **User Profiles**
  - Username & email management
  - Portfolio & social links:
    - GitHub
    - LinkedIn
    - LeetCode
    - Portfolio / Resume

- 🧠 **Skill Management**
  - Skills the user **has**
  - Skills the user **wants to learn**

- 🤝 **Learning Request System**
  - Send learning requests to other users
  - Accept or reject requests

- 🧮 **Smart Skill Matching (Cosine Similarity)**
  - Users are recommended based on:
    - Skills they have
    - Skills they want to learn
  - Matching logic implemented using **cosine similarity**
  - Helps surface the most relevant learning partners

- 💬 **Real-Time Chat**
  - One-to-one chat using **WebSockets**
  - Built with **Django Channels**
  - Message history support

- 🔗 **Video Call Support**
  - Google Meet links generated and shared directly in chat
  - Clicking the link opens Meet in a new tab
  - Link is visible to both users instantly

- 🛡️ **Secure Backend APIs**
  - Auth-protected endpoints
  - Clean REST architecture

---

## 🛠 Tech Stack

### Frontend
- Next.js (App Router)
- Tailwind CSS
- JavaScript
- WebSockets

### Backend
- Django
- Django REST Framework
- Django Channels
- SQLite (development)

---

## 📂 Project Structure

```text
skillswap/
├── backend/
│   ├── api/
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── chat/
│   │   ├── consumers.py
│   │   ├── routing.py
│   │   └── models.py
│   ├── core/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   ├── ml/
│   │   └── matcher.py
│   ├── staticfiles/
│   ├── db.sqlite3
│   └── manage.py
│
├── frontend/
│   ├── app/
│   │   ├── chat/
│   │   ├── connections/
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── signup/
│   │   ├── profile/
│   │   ├── search/
│   │   ├── skills/
│   │   └── users/
│   ├── lib/
│   │   └── api.js
│   ├── public/
│   └── package.json
│
├── README.md
└── .gitignore

---

## ⚙️ Local Setup

### 1️⃣ Clone the Repository

git clone https://github.com/<your-username>/skillswap.git  
cd skillswap

---

### 2️⃣ Backend Setup

cd backend  
python -m venv venv  
venv\Scripts\activate  
pip install -r requirements.txt  
python manage.py migrate  
python manage.py createsuperuser  
python manage.py runserver  

Backend runs at:  
http://127.0.0.1:8000

---

### 3️⃣ Frontend Setup

cd frontend  
npm install  
npm run dev  

Frontend runs at:  
http://localhost:3000

---

## 🔮 Upcoming Features

- ⭐ Ratings & feedback system
- 📅 Session scheduling
- 🔔 Notifications
- 🤖 Enhanced recommendation logic
- 📊 User activity insights

---

## 👤 Author

Naganjali Rajalbandi  
Information Science Student  
Aspiring Full-Stack Developer 🚀

---

## 📜 License

This project is developed for educational purposes.
