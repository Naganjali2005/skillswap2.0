SkillSwap 2.0

A full-stack learning exchange platform where students can teach the skills they already know and learn skills from others.
This version includes recommendation matching (ML-based), real-time chat, authentication, and a modern full-stack architecture.

Table of Contents

Overview

Features

Tech Stack

System Architecture

Project Structure

Installation & Setup

Authentication Flow

Recommendation System (ML Layer)

Real-Time Chat (WebSockets)

API Endpoints

Future Enhancements

1. Overview

SkillSwap is a platform that enables peer-to-peer learning.
Users register, list skills they have, choose skills they want to learn, and get matched using a similarity-based recommendation model.
Once matched, users can send requests, accept or reject them, and communicate using real-time chat.

2. Features
Core Features

User Registration and Login (JWT Authentication)

Role-based skill exchange (Teacher ↔ Learner model)

Add Skills You Have / Skills You Want to Learn

Intelligent Recommendation System using cosine similarity

View profiles of matched users

Send and receive skill swap requests

Accept/Reject requests

View active connections

Chat System

Real-time chat using WebSockets

WebSocket backend powered by Django Channels

Automatic message persistence in database

Message timestamps

Sender-based bubble colors (You vs Partner)

System messages (room joined/connected)

Scroll-to-bottom behavior

Displays connection status (Connecting, Connected, Disconnected)

3. Tech Stack
Frontend

Next.js (App Router)

React

Tailwind CSS

Fetch utilities for API communication

WebSocket client for real-time chat

Backend

Django REST Framework

Django Channels (ASGI – WebSockets)

SQLite (development database)

JWT Authentication

Python 3.10 environment

Daphne ASGI server

Machine Learning Layer

Scikit-Learn (cosine similarity)

Skill similarity scoring and ranking

Real-time Layer

Django Channels

WebSockets

ASGI routing

4. System Architecture
Frontend (Next.js)
    |
    |--- HTTPS REST Calls ---> Django REST API
    |
    |--- WebSocket Connection ---> Django Channels (ASGI)
                                       |
                                       |--- Channel Layer
                                       |
                                       |--- ChatConsumer
                                                |
                                                |--- Saves message to DB
                                                |--- Broadcasts to room

5. Project Structure
skillswap2.0/
├── backend/
│   ├── core/ (project)
│   │   ├── asgi.py
│   │   ├── settings.py
│   │   └── urls.py
│   ├── api/ (main REST app)
│   ├── chat/ (WebSocket + Messaging app)
│   │   ├── consumers.py
│   │   ├── routing.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   └── urls.py
│   ├── ml/
│   │   └── matcher.py
│   ├── db.sqlite3
│   └── manage.py
│
└── frontend/
    ├── app/
    │   ├── chat/[roomId]/
    │   │   └── page.js
    │   ├── connections/
    │   ├── login/
    │   ├── signup/
    │   ├── dashboard/
    │   └── globals.css
    ├── lib/api.js
    └── package.json

6. Installation & Setup
Backend Setup
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

For WebSockets (ASGI)

Run using Daphne instead of runserver:

daphne core.asgi:application --port 8000

Frontend Setup
cd frontend
npm install
npm run dev


Frontend runs at:
http://localhost:3000

Backend runs at:
http://127.0.0.1:8000

7. Authentication Flow (JWT)

User registers → /api/auth/register/

User logs in → receives access + refresh tokens

Tokens stored in localStorage

Every API request includes Authorization: Bearer token

Token refresh handled manually using /api/auth/refresh/

8. Recommendation System (Machine Learning)
How it Works

Skills are converted into vectors

Cosine similarity is calculated between user skill sets

Top-K matches returned

Returned to frontend via /api/recommendations/

Libraries

sklearn

numpy

9. Real-Time Chat System (WebSockets)
WebSocket URL
ws://127.0.0.1:8000/ws/chat/<room_id>/

How Chat Works

Frontend opens WebSocket connection

Backend adds user to a chat group (chat_<room_id>)

When message is sent:

Frontend → WebSocket → Consumer

Consumer saves to database

Broadcasts message to the same group

All connected clients instantly receive the message

Data Flow
Next.js WebSocket Client
        ↓
Django Channels Router
        ↓
ChatConsumer.receive()
        ↓
Message Saved to DB
        ↓
group_send()
        ↓
All Clients in Room

Stored Message Model
room_id
sender_name
text
created_at

10. API Endpoints
Authentication
POST /api/auth/register/
POST /api/auth/login/
POST /api/auth/refresh/
GET  /api/auth/me/

Users & Skills
POST /api/users/<id>/skills-have/
POST /api/users/<id>/skills-want/
GET  /api/recommendations/

Requests
POST /api/requests/
GET  /api/requests/incoming/
GET  /api/requests/outgoing/
POST /api/requests/<id>/action/

Connections
GET /api/connections/

Chat REST API
GET /api/chat/<room_id>/messages/

WebSocket Route
ws://127.0.0.1:8000/ws/chat/<room_id>/

11. Future Enhancements
Chat Improvements

Message read receipts

Typing indicators

Delete/Edit messages

File sharing

Image preview in chat

Push notifications

Upcoming Major Features

Video calling

Screensharing

Voice calls

AI-generated learning paths

Docker deployment

PostgreSQL database for production

CI/CD setup