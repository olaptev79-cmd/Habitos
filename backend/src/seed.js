import { db } from './db.js';

db.exec(`DELETE FROM checkins; DELETE FROM journal; DELETE FROM habits; DELETE FROM users; DELETE FROM sqlite_sequence;`);
const insertUser = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
const user = insertUser.run('Demo User', 'demo@habitos.app', 'demo1234');
const userId = user.lastInsertRowid;

const insertHabit = db.prepare('INSERT INTO habits (user_id, name, category, schedule, streak, completion_rate) VALUES (?, ?, ?, ?, ?, ?)');
const habits = [
  ['Morning walk', 'Health', '07:30 daily', 19, 94],
  ['Reading', 'Learning', '21:00 daily', 13, 88],
  ['Deep work', 'Focus', 'Weekdays', 7, 81],
  ['Hydration', 'Health', 'All day', 24, 85]
];
const habitIds = habits.map((h) => insertHabit.run(userId, ...h).lastInsertRowid)


const insertCheck = db.prepare('INSERT INTO checkins (habit_id, completed_on, status) VALUES (?, ?, ?)');
const days = ['2026-05-23','2026-05-24','2026-05-25','2026-05-26','2026-05-27','2026-05-28','2026-05-29'];
habitIds.forEach((id, idx) => {
  days.slice(0, 4 + (idx % 4)).forEach((day) => insertCheck.run(id, day, 'done'));
});

const insertJournal = db.prepare('INSERT INTO journal (user_id, note_date, text, mood) VALUES (?, ?, ?, ?)');
insertJournal.run(userId, '2026-05-29', 'Strong morning block. Walk and reading done before lunch.', 'focused');
insertJournal.run(userId, '2026-05-28', 'Good consistency overall. Sleep slipped a little.', 'steady');
insertJournal.run(userId, '2026-05-27', 'Best deep work day this week.', 'sharp');

console.log('Seed complete');
