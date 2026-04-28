# Testing ai-edu Platform

## Test Accounts
- **Student:** demo@aiedu.com / demo123
- **Admin:** admin@aiedu.com / admin123
- **Parent:** parent@aiedu.com / parent123
- Seed database first: `(cd edutech/backend && poetry run python -m app.seed)`

## Local Dev Setup
```bash
# Backend (needs .env with MONGODB_ATLAS_URI, JWT_SECRET, GEMINI_API_KEY)
source edutech/backend/.env && export MONGODB_ATLAS_URI JWT_SECRET GEMINI_API_KEY
(cd edutech/backend && poetry run fastapi dev app/main.py --port 8000)

# Frontend (point to local backend)
VITE_API_URL=http://localhost:8000 (cd edutech/frontend && npm run dev -- --port 5173)
```

## Key Navigation Paths
- **Dashboard:** /dashboard (student), /admin (admin), /parent (parent)
- **Courses:** /courses → /courses/:id (course detail with chapters)
- **Classroom:** /classroom/:courseId/:chapterId (AI Video + Chat + Notes)
  - ClassroomPage doesn't fetch course/chapter data, just uses URL params for display
  - Can navigate directly to any /classroom/any-id/any-chapter for testing
- **Store:** /store (character/avatar purchase)
- **Profile:** /profile (settings, logout at bottom)

## AI Video Lesson Feature
- Route: /classroom/:courseId/:chapterId → Video tab (default active)
- Flow: Select character → Type topic → Click generate → Gemini generates 6-10 slides → TTS plays slides
- Backend endpoint: POST /ai/generate-lesson
- Uses Gemini API (gemini-2.0-flash model)
- Web Speech API for browser-native TTS (no additional API calls)
- Characters come from user's purchased avatars in store, fallback to default emojis

## Gemini API Notes
- Free tier has daily quota limits per model
- If gemini-2.0-flash quota is exceeded, gemini-2.5-flash can be used as fallback
- Quota resets daily
- API key is stored in backend .env (gitignored) and as Fly.io secret for deployment

## Deployment
- **Backend:** Fly.io at https://app-iiglqgra.fly.dev
- **Frontend:** Vercel (auto-deploys from `initial` branch)
- Frontend VITE_API_URL defaults to deployed backend URL
- Backend secrets set via: `fly secrets set KEY=VALUE -a app-iiglqgra`

## Route Guards
- /admin requires role="admin"
- /parent requires role="parent"
- /dashboard, /profile, /store, /classroom, /quiz require authentication
- /courses and /leaderboard are public
- Without login, protected routes redirect to /login
