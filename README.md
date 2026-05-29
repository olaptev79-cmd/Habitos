# HabitOS Production Plus

Full-stack habit tracker with:
- React + Vite frontend
- Express API backend
- SQLite persistence via better-sqlite3
- JWT authentication
- Habit creation
- Habit daily check-ins
- Journal creation
- Analytics endpoint
- Render-ready structure

## Demo login
- Email: demo@habitos.app
- Password: demo1234

## Local run
### Backend
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev

### Frontend
cd frontend
cp .env.example .env
npm install
npm run dev

## Render
### Backend Web Service
- Root Directory: backend
- Build Command: npm install
- Start Command: npm start
- Environment Variables: PORT, JWT_SECRET, DB_PATH

### Frontend Static Site
- Root Directory: frontend
- Build Command: npm install && npm run build
- Publish Directory: dist
- Environment Variable: VITE_API_URL


## vNext hardening
- render.yaml included
- Persistent SQLite path configured for Render disk
- Stronger validation helpers added
- Frontend chunks split for lighter initial load


## Final optimization layer
- Improved mobile and tablet breakpoints
- Reduced overflow risks with min-width and stacked controls
- Stronger Vite build settings for cleaner production output
- Added Git Bash push guide in docs/git-bash-push.md
