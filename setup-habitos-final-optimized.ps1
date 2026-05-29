$ProjectDir = "C:\Projects\exam-prep"
Write-Host "Final optimized pack target path: $ProjectDir" -ForegroundColor Cyan
Write-Host "Backend:" -ForegroundColor Yellow
Write-Host "cd backend; npm install; npm run migrate; npm run seed; npm test; npm run smoke; npm start" -ForegroundColor Yellow
Write-Host "Frontend:" -ForegroundColor Yellow
Write-Host "cd frontend; npm install; npm run build; npm run dev" -ForegroundColor Yellow
Write-Host "Git Bash push commands are in docs/git-bash-push.md" -ForegroundColor Yellow
