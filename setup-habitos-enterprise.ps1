$ProjectDir = "C:\Projects\habitos-enterprise"
Write-Host "Enterprise pack ready for extraction into $ProjectDir" -ForegroundColor Cyan
Write-Host "Recommended steps:" -ForegroundColor Yellow
Write-Host "1. Extract archive" -ForegroundColor Yellow
Write-Host "2. cd backend; npm install; npm run seed; npm test; npm start" -ForegroundColor Yellow
Write-Host "3. cd frontend; npm install; npm run build; npm run dev" -ForegroundColor Yellow
Write-Host "4. Push to GitHub and connect to Render" -ForegroundColor Yellow
