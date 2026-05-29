$ProjectDir = "C:\Projects\habitos-ultimate"
Write-Host "Creating project in $ProjectDir" -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $ProjectDir | Out-Null
Write-Host "1. Extract the archive into this folder" -ForegroundColor Yellow
Write-Host "2. Open PowerShell in the project root" -ForegroundColor Yellow
Write-Host "3. Run: cd backend; npm install; npm run seed; npm start" -ForegroundColor Yellow
Write-Host "4. In a new terminal run: cd frontend; npm install; npm run dev" -ForegroundColor Yellow
