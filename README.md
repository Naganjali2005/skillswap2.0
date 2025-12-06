# SkillSwap 2.0

SkillSwap 2.0 is a full-stack web application that connects students based on the skills they **have** and the skills they **want to learn**.  
It uses a simple ML-based matching system (cosine similarity) to recommend the best peers to learn from or teach.



##  Tech Stack

**Frontend**
- Next.js (App Router)
- React
- Tailwind CSS
- Fetch-based API calls

**Backend**
- Django
- Django REST Framework (DRF)
- Custom ML matching (scikit-learn / cosine-style logic)

**Database**
- SQLite for development (can be swapped to PostgreSQL for production)

---

##  Features

###  User & Auth
- User signup and login
- Separate flows for:
  - Skills the user **has**
  - Skills the user **wants to learn**

###  Matching & Requests
- Backend exposes an API to:
  - Store user skills
  - Compute similarity between users based on skills
  - Return a ranked list of recommended matches
- Users can:
  - View recommended learners/teachers
  - Send learning requests
  - View incoming requests
  - Accept or reject requests

###  Dashboard
- Personalized dashboard showing:
  - Recommended users (based on skills)
  - Sent requests
  - Received requests

###  Profiles
- Users can view the profile of other users (skills_have / skills_want)
- Requests can be accepted after viewing profile for safety/fit

---

## 
Project Structure

```text
skillswap2.0/
│
├── backend/
│   ├── api/
│   │   ├── models.py         # Skill, UserSkillHave, UserSkillWant, Request/Conversation models
│   │   ├── serializers.py
│   │   ├── views.py          # API views and endpoints
│   │   ├── urls.py
│   │   └── services.py       # Matching logic and helper functions
│   │
│   ├── core/
│   │   ├── settings.py       # Django + DRF configuration
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   │
│   ├── ml/
│   │   └── matcher.py        # Cosine-style similarity / matching utilities
│   │
│   ├── manage.py
│   └── test_sklearn.py       # Local test for sklearn / matching
│
├── frontend/
│   ├── app/
│   │   ├── page.js           # Landing / home
│   │   ├── login/page.js     # Login page
│   │   ├── signup/page.js    # Signup page
│   │   ├── dashboard/page.js # Main dashboard
│   │   ├── requests/page.js  # Requests list
│   │   └── users/[id]/page.js# User profile view
│   │
│   ├── lib/api.js            # API helper for calling backend
│   ├── package.json
│   ├── next.config.mjs
│   └── other Next.js config files
│
├── .gitignore
└── README.md
