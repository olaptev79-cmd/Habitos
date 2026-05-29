$ProjectDir = "C:\Projects\habitos-production-plus"
New-Item -ItemType Directory -Force -Path $ProjectDir | Out-Null
Copy-Item -Path "$PSScriptRoot\*" -Destination $ProjectDir -Recurse -Force
Write-Host "Project copied to $ProjectDir" -ForegroundColor Green
Write-Host "Backend: cd $ProjectDir\backend; Copy-Item .env.example .env; npm install; npm run seed; npm run dev" -ForegroundColor Yellow
Write-Host "Frontend: cd $ProjectDir\frontend; Copy-Item .env.example .env; npm install; npm run dev" -ForegroundColor Yellow
