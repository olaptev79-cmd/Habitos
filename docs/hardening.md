# HabitOS vNext hardening pack

## Improvements
- Added Render blueprint via render.yaml
- Added persistent disk path for SQLite on Render
- Added stronger payload sanitizing helpers
- Added Vite manual chunk splitting for React and charts
- Added cleaner loading/error UI notes

## Render note
Use a persistent disk for SQLite because only files written under the disk mount path survive restarts and redeploys.
