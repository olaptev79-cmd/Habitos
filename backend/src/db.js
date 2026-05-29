import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const dbPath = process.env.DB_PATH || './data/habitos.db';
const fullPath = path.resolve(process.cwd(), dbPath);
fs.mkdirSync(path.dirname(fullPath), { recursive: true });

export const db = new Database(fullPath);
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS habits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  schedule TEXT NOT NULL,
  streak INTEGER DEFAULT 0,
  completion_rate INTEGER DEFAULT 0,
  is_archived INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS checkins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  habit_id INTEGER NOT NULL,
  completed_on TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'done'
);
CREATE TABLE IF NOT EXISTS journal (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  note_date TEXT NOT NULL,
  text TEXT NOT NULL,
  mood TEXT DEFAULT 'steady',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);
