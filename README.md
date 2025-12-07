SkillSwap 2.0 – Peer-to-Peer Skill Exchange Platform

SkillSwap 2.0 is a full-stack platform that enables users to teach skills they know and learn new skills from peers.
It includes authentication, skill-based recommendations, connection management, and real-time chat using WebSockets.

1. Features
1.1 Authentication

JWT-based registration and login

Secure token-based protected routes

/api/auth/me/ for authenticated user details

1.2 Skill Management

Add skills you have

Add skills you want to learn

Skills used to match compatible partners

1.3 Recommendation System

Cosine similarity-based matching

Top ranked users returned as recommendations

Backend ML layer implemented using scikit-learn

1.4 Requests & Connections

Send learning requests

Accept or reject requests

Connection list generated from accepted requests

View connected user profiles

1.5 Real-Time Chat

One-to-one live chat using WebSockets

Implemented with Django Channels (ASGI)

Persistent chat history stored in database

Chat bubbles with sender/receiver distinction

Timestamps for each message

Online, Connecting, Disconnected indicators

Auto-scroll to last message

Per-connection chat rooms using room IDs

2. Tech Stack
2.1 Frontend

Next.js (App Router)

React

Tailwind CSS

WebSocket client integration

LocalStorage-based token storage

2.2 Backend

Django

Django REST Framework

Django Channels (ASGI)

Daphne server

SQLite (development)

2.3 Machine Learning

Scikit-learn

NumPy

Custom similarity-based recommendation engine

2.4 Realtime Layer

ASGI

Channels

WebSockets

3. System Architecture
Frontend (Next.js)
│
├── REST API → Django REST Framework
│
└── WebSocket → Django Channels (ASGI)
                    │
                    ├── ChatConsumer handles messages
                    ├── Saves messages to DB
                    └── Broadcasts to group "chat_<roomId>"

4. Project Structure
skillswap2.0/
│
├── backend/
│   ├── core/                 # Django project config
│   ├── api/                  # Auth, users, skills, matching
│   ├── chat/                 # Real-time chat app (Channels)
│   ├── ml/                   # Matching model logic
│   └── manage.py
│
└── frontend/
    ├── app/                  # Next.js pages
    ├── lib/api.js            # API helper
    └── package.json

5. Installation & Setup
5.1 Backend Setup
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate

5.2 Running Backend with WebSockets
daphne core.asgi:application --port 8000

5.3 Frontend Setup
cd frontend
npm install
npm run dev


Frontend runs on:
http://localhost:3000

Backend runs on:
http://127.0.0.1:8000

6. Authentication Flow
6.1 Register
POST /api/auth/register/

6.2 Login

Returns:

access token

refresh token

6.3 Current User
GET /api/auth/me/

7. Recommendation System
7.1 Process

Convert skills into representations

Calculate similarity scores

Sort users

Return recommendations

7.2 Libraries

scikit-learn

numpy

8. Real-Time Chat System
8.1 WebSocket URL
ws://127.0.0.1:8000/ws/chat/<roomId>/

8.2 Chat Flow

Frontend opens WebSocket connection

Backend assigns user to chat_<roomId> group

Consumer handles incoming messages

Messages are stored in DB

All clients in group receive updates instantly

8.3 REST Endpoint for Chat History
GET /api/chat/<roomId>/messages/

8.4 Chat Message Model

room_id

sender_name

text

created_at

9. REST API Endpoints
Authentication
POST /api/auth/register/
POST /api/auth/login/
GET  /api/auth/me/

Users & Skills
POST /api/users/<id>/skills-have/
POST /api/users/<id>/skills-want/
GET  /api/recommendations/

Requests & Connections
GET  /api/requests/incoming/
GET  /api/requests/outgoing/
POST /api/requests/send/
POST /api/requests/<id>/action/
GET  /api/connections/

Chat
GET /api/chat/<roomId>/messages/
ws://127.0.0.1:8000/ws/chat/<roomId>/

10. Future Enhancements

One-to-one video calls (WebRTC)

Screen sharing

Typing indicators

Read receipts

File and media sharing

Push notifications

Docker-based deployment

PostgreSQL migration

11. License

This project is created for educational and portfolio development purposes.