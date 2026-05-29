$ProjectDir = "C:\Projects\habitos-final-boss"
Write-Host "Final Boss pack path: $ProjectDir" -ForegroundColor Cyan
Write-Host "Run in order:" -ForegroundColor Yellow
Write-Host "cd backend; npm install; npm run migrate; npm run seed; npm test; npm run smoke; npm start" -ForegroundColor Yellow
Write-Host "cd frontend; npm install; npm run build; npm run dev" -ForegroundColor Yellow
Write-Host "After that push to GitHub and connect Render using render.yaml" -ForegroundColor Yellow
