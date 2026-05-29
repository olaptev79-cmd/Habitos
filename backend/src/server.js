import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { db } from './db.js';
import { requireFields, sanitizeText, ensureMin } from './validation.js';
import { hashPassword, verifyPassword } from './auth.js';
import { signAccessToken, signRefreshToken } from './tokens.js';

const app = express();
const PORT = process.env.PORT || 10000;
const CLIENT_URL = process.env.CLIENT_URL || '*';

app.use(helmet());
app.use(cors({ origin: CLIENT_URL === '*' ? true : CLIENT_URL, credentials: false }));
app.use(express.json({ limit: '300kb' }));
app.use(morgan('tiny'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'habitos-api' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'habitos-api', timestamp: Date.now() }));

function auth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

app.post('/api/auth/register', (req, res) => {
  const payload = req.body || {};
  const missing = requireFields(payload, ['name', 'email', 'password']);
  if (missing.length) return res.status(400).json({ message: `Missing: ${missing.join(', ')}` });
  const name = sanitizeText(payload.name, 40);
  const email = sanitizeText(payload.email, 120).toLowerCase();
  const password = String(payload.password || '');
  if (!email.includes('@') || password.length < 6) return res.status(400).json({ message: 'Invalid credentials payload' });
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) return res.status(409).json({ message: 'User already exists' });
  const result = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(name, email, hashPassword(password));
  const user = { id: result.lastInsertRowid, name, email, role: 'user' };
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  res.status(201).json({ token: accessToken, refreshToken, user });
});

app.post('/api/auth/login', (req, res) => {
  const email = sanitizeText(req.body?.email || '', 120).toLowerCase();
  const password = String(req.body?.password || '');
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !verifyPassword(password, user.password)) return res.status(401).json({ message: 'Invalid email or password' });
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  res.json({ token: accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email, role: user.role || 'user' } });
});

app.get('/api/me', auth, (req, res) => {
  const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(req.user.sub);
  res.json(user);
});

app.post('/api/auth/refresh', (req, res) => {
  const refreshToken = String(req.body?.refreshToken || '');
  if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' });
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
    if (payload.type !== 'refresh') return res.status(401).json({ message: 'Invalid refresh token' });
    const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(payload.sub);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ token: signAccessToken(user) });
  } catch {
    res.status(401).json({ message: 'Refresh token expired or invalid' });
  }
});

function requireRole(role) {
  return (req, res, next) => {
    if ((req.user.role || 'user') !== role) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}

app.get('/api/admin/overview', auth, requireRole('admin'), (_req, res) => {
  const users = db.prepare('SELECT COUNT(*) AS total FROM users').get().total;
  const habits = db.prepare('SELECT COUNT(*) AS total FROM habits').get().total;
  const journal = db.prepare('SELECT COUNT(*) AS total FROM journal').get().total;
  res.json({ users, habits, journal });
});

app.get('/api/dashboard', auth, (req, res) => {
  const habits = db.prepare('SELECT * FROM habits WHERE user_id = ? ORDER BY id DESC').all(req.user.sub);
  const journal = db.prepare('SELECT * FROM journal WHERE user_id = ? ORDER BY id DESC LIMIT 6').all(req.user.sub);
  const completedToday = db.prepare("SELECT COUNT(*) AS total FROM checkins WHERE user_id = ? AND completed_at = date('now')").get(req.user.sub).total;
  res.json({
    summary: {
      activeHabits: habits.length,
      completedToday,
      currentStreak: habits.reduce((max, item) => Math.max(max, item.streak || 0), 0),
      consistency: habits.length ? Math.round(habits.reduce((sum, item) => sum + (item.completion_rate || 0), 0) / habits.length) : 0
    },
    habits,
    journal
  });
});

app.get('/api/analytics', auth, (req, res) => {
  const points = [72, 74, 71, 78, 82, 80, 86].map((value, index) => ({ day: `D${index + 1}`, value }));
  res.json({ trend: points, focus: ['Sleep', 'Study', 'Fitness'] });
});

app.post('/api/habits', auth, (req, res) => {
  const payload = req.body || {};
  const missing = requireFields(payload, ['name', 'category', 'schedule']);
  if (missing.length) return res.status(400).json({ message: `Missing: ${missing.join(', ')}` });
  const name = sanitizeText(payload.name, 64);
  const category = sanitizeText(payload.category, 32);
  const schedule = sanitizeText(payload.schedule, 48);
  const result = db.prepare('INSERT INTO habits (user_id, name, category, schedule, streak, completion_rate) VALUES (?, ?, ?, ?, 0, 0)').run(req.user.sub, name, category, schedule);
  res.status(201).json({ id: result.lastInsertRowid, name, category, schedule, streak: 0, completion_rate: 0 });
});

app.post('/api/habits/:id/checkin', auth, (req, res) => {
  const habit = db.prepare('SELECT * FROM habits WHERE id = ? AND user_id = ?').get(req.params.id, req.user.sub);
  if (!habit) return res.status(404).json({ message: 'Habit not found' });
  const today = new Date().toISOString().slice(0, 10);
  db.prepare('INSERT INTO checkins (habit_id, user_id, completed_at) VALUES (?, ?, ?)').run(habit.id, req.user.sub, today);
  db.prepare('UPDATE habits SET streak = streak + 1, completion_rate = MIN(completion_rate + 7, 100) WHERE id = ?').run(habit.id);
  res.json({ message: 'Check-in recorded' });
});

app.delete('/api/habits/:id', auth, (req, res) => {
  const result = db.prepare('DELETE FROM habits WHERE id = ? AND user_id = ?').run(req.params.id, req.user.sub);
  if (!result.changes) return res.status(404).json({ message: 'Habit not found' });
  res.json({ message: 'Habit deleted' });
});

app.put('/api/settings/profile', auth, (req, res) => {
  const name = sanitizeText(req.body?.name || '', 40);
  if (!ensureMin(name, 2)) return res.status(400).json({ message: 'Name is too short' });
  db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name, req.user.sub);
  res.json({ message: 'Profile updated', name });
});

app.post('/api/journal', auth, (req, res) => {
  const payload = req.body || {};
  const text = sanitizeText(payload.text || '', 280);
  const mood = sanitizeText(payload.mood || 'steady', 16);
  if (!ensureMin(text, 6)) return res.status(400).json({ message: 'Journal entry is too short' });
  const today = new Date().toISOString().slice(0, 10);
  const result = db.prepare('INSERT INTO journal (user_id, note_date, text, mood) VALUES (?, ?, ?, ?)').run(req.user.sub, today, text, mood);
  res.status(201).json({ id: result.lastInsertRowid, text, mood, note_date: today });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`HabitOS API listening on ${PORT}`);
});
