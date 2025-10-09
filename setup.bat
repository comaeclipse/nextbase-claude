@echo off
echo ====================================
echo VetRetire Next.js Setup Script
echo ====================================
echo.

echo Step 1: Installing dependencies...
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo.
    echo Installation failed. Trying alternative method...
    echo.
    echo Generating Prisma Client first...
    call npx prisma generate
    echo.
    echo Installing packages...
    call npm install
)

echo.
echo ====================================
echo Setup Complete!
echo ====================================
echo.
echo To start the development server, run:
echo   npm run dev
echo.
echo Then open http://localhost:3000
echo.
pause

