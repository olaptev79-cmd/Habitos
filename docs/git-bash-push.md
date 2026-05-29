# Git Bash push guide

## If repository does not exist yet
1. Create an empty GitHub repository in the browser.
2. Copy its HTTPS URL.

## Commands
```bash
cd /c/Projects/exam-prep
git init
git add .
git commit -m "Initial commit: HabitOS final optimized pack"
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

## If remote already exists
```bash
cd /c/Projects/exam-prep
git remote set-url origin https://github.com/USERNAME/REPOSITORY.git
git add .
git commit -m "Update project to final optimized pack"
git push origin main
```

## If you need to fully replace the GitHub project
```bash
cd /c/Projects/exam-prep
git add .
git commit -m "Replace project with final optimized pack"
git push origin main --force
```
