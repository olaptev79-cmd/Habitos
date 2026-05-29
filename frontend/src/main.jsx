import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';
import './styles.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000/api';

async function api(path, options = {}) {
  const token = localStorage.getItem('habitos_token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || 'Request failed');
  return payload;
}

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: 'demo@habitos.app', password: 'demo123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = await api(`/auth/${mode}`, { method: 'POST', body: JSON.stringify(form) });
      localStorage.setItem('habitos_token', payload.token);
      if (payload.refreshToken) localStorage.setItem('habitos_refresh', payload.refreshToken);
      onAuth(payload.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card hero-panel">
        <div className="eyebrow">HabitOS / final boss</div>
        <h1>Structured habits with a calmer, sharper operating system.</h1>
        <p className="lead">A polished full-stack starter with analytics, settings, admin scaffolding, and Render-friendly deployment shape.</p>
      </section>
      <section className="auth-card form-panel">
        <div className="tabs">
          <button className={mode === 'login' ? 'tab active' : 'tab'} onClick={() => setMode('login')}>Login</button>
          <button className={mode === 'register' ? 'tab active' : 'tab'} onClick={() => setMode('register')}>Register</button>
        </div>
        <form onSubmit={submit} className="auth-form">
          {mode === 'register' && <label><span>Name</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Oleg" /></label>}
          <label><span>Email</span><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="demo@habitos.app" /></label>
          <label><span>Password</span><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="******" /></label>
          {error ? <div className="error-state">{error}</div> : null}
          <button className="primary-button" disabled={loading}>{loading ? 'Please wait…' : mode === 'login' ? 'Enter workspace' : 'Create account'}</button>
        </form>
      </section>
    </main>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('overview');
  const [form, setForm] = useState({ name: '', category: '', schedule: '' });
  const [journalText, setJournalText] = useState('');
  const [settingsName, setSettingsName] = useState('');

  async function load() {
    try {
      const [me, dash, analyticsData] = await Promise.all([api('/me'), api('/dashboard'), api('/analytics')]);
      setUser(me); setSettingsName(me.name || ''); setDashboard(dash); setAnalytics(analyticsData); setError('');
      try { setAdmin(await api('/admin/overview')); } catch { setAdmin(null); }
    } catch (err) {
      localStorage.removeItem('habitos_token');
      localStorage.removeItem('habitos_refresh');
      setUser(null); setDashboard(null); setAnalytics(null); setAdmin(null); setError(err.message);
    }
  }

  useEffect(() => {
    if (localStorage.getItem('habitos_token')) load();
  }, []);

  const stats = useMemo(() => dashboard?.summary ? [
    ['Active habits', dashboard.summary.activeHabits],
    ['Completed today', dashboard.summary.completedToday],
    ['Best streak', `${dashboard.summary.currentStreak} d`],
    ['Consistency', `${dashboard.summary.consistency}%`]
  ] : [], [dashboard]);

  if (!user) return <AuthScreen onAuth={() => load()} />;
  if (!dashboard || !analytics) return <main className="app-shell"><section className="panel empty-state">Loading your workspace…</section></main>;

  async function addHabit(event) {
    event.preventDefault();
    await api('/habits', { method: 'POST', body: JSON.stringify(form) });
    setForm({ name: '', category: '', schedule: '' });
    load();
  }

  async function addJournal(event) {
    event.preventDefault();
    await api('/journal', { method: 'POST', body: JSON.stringify({ text: journalText, mood: 'focused' }) });
    setJournalText('');
    load();
  }

  async function checkIn(id) {
    await api(`/habits/${id}/checkin`, { method: 'POST' });
    load();
  }

  async function deleteHabit(id) {
    await api(`/habits/${id}`, { method: 'DELETE' });
    load();
  }

  async function saveSettings(event) {
    event.preventDefault();
    await api('/settings/profile', { method: 'PUT', body: JSON.stringify({ name: settingsName }) });
    load();
  }

  return (
    <main className="app-shell">
      <header className="topbar panel">
        <div>
          <div className="eyebrow">HabitOS dashboard</div>
          <h1>Welcome back, {user.name}.</h1>
        </div>
        <div className="topbar-actions">
          <nav className="tabs small-tabs">
            <button className={tab === 'overview' ? 'tab active' : 'tab'} onClick={() => setTab('overview')}>Overview</button>
            <button className={tab === 'settings' ? 'tab active' : 'tab'} onClick={() => setTab('settings')}>Settings</button>
            {admin ? <button className={tab === 'admin' ? 'tab active' : 'tab'} onClick={() => setTab('admin')}>Admin</button> : null}
          </nav>
          <button className="ghost-button" onClick={() => { localStorage.removeItem('habitos_token'); localStorage.removeItem('habitos_refresh'); setUser(null); }}>Logout</button>
        </div>
      </header>

      {error ? <section className="panel error-state">{error}</section> : null}

      {tab === 'overview' && <>
        <section className="stats-grid">
          {stats.map(([label, value]) => <article className="panel stat-card" key={label}><span>{label}</span><strong>{value}</strong></article>)}
        </section>

        <section className="content-grid">
          <article className="panel chart-panel">
            <div className="section-head"><h2>Momentum</h2><span>7-day signal</span></div>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.trend}>
                  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8a6a52" stopOpacity="0.45" /><stop offset="100%" stopColor="#8a6a52" stopOpacity="0" /></linearGradient></defs>
                  <XAxis dataKey="day" stroke="#8f867c" tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#c8a07d" fill="url(#g)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="panel stack-panel">
            <div className="section-head"><h2>New habit</h2><span>Quick add</span></div>
            <form onSubmit={addHabit} className="stack-form">
              <input placeholder="Habit name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              <input placeholder="Schedule" value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} />
              <button className="primary-button">Create habit</button>
            </form>
          </article>

          <article className="panel list-panel">
            <div className="section-head"><h2>Habit stack</h2><span>{dashboard.habits.length} active</span></div>
            <div className="habit-list">
              {dashboard.habits.map((habit) => (
                <div className="habit-row" key={habit.id}>
                  <div>
                    <strong>{habit.name}</strong>
                    <p>{habit.category} · {habit.schedule}</p>
                  </div>
                  <div className="habit-actions">
                    <span>{habit.streak} d</span>
                    <button className="ghost-button" onClick={() => checkIn(habit.id)}>Check-in</button>
                    <button className="ghost-button danger-button" onClick={() => deleteHabit(habit.id)}>Delete</button>
                  </div>
                </div>
              ))}
              {!dashboard.habits.length ? <div className="empty-state">No habits yet. Add your first system above.</div> : null}
            </div>
          </article>

          <article className="panel journal-panel">
            <div className="section-head"><h2>Journal</h2><span>Daily clarity</span></div>
            <form onSubmit={addJournal} className="stack-form">
              <textarea rows="4" placeholder="Write a short note about today's energy, wins, or blockers." value={journalText} onChange={(e) => setJournalText(e.target.value)} />
              <button className="primary-button">Save note</button>
            </form>
            <div className="journal-list">
              {dashboard.journal.map((entry) => <div className="journal-card" key={entry.id}><strong>{entry.note_date}</strong><p>{entry.text}</p></div>)}
            </div>
          </article>
        </section>
      </>}

      {tab === 'settings' && <section className="content-grid single-grid">
        <article className="panel stack-panel">
          <div className="section-head"><h2>Profile settings</h2><span>Personalize workspace</span></div>
          <form onSubmit={saveSettings} className="stack-form">
            <input placeholder="Display name" value={settingsName} onChange={(e) => setSettingsName(e.target.value)} />
            <button className="primary-button">Save profile</button>
          </form>
        </article>
      </section>}

      {tab === 'admin' && admin && <section className="content-grid single-grid">
        <article className="panel stack-panel">
          <div className="section-head"><h2>Admin overview</h2><span>Role-protected snapshot</span></div>
          <div className="stats-grid admin-grid">
            <article className="panel stat-card"><span>Users</span><strong>{admin.users}</strong></article>
            <article className="panel stat-card"><span>Habits</span><strong>{admin.habits}</strong></article>
            <article className="panel stat-card"><span>Journal entries</span><strong>{admin.journal}</strong></article>
          </div>
        </article>
      </section>}
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
