@echo off
echo 🚀 Setting up Finance Manager Backend...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js (v18 or higher) first.
    pause
    exit /b 1
)

echo 📦 Installing dependencies...
npm install

echo 🔧 Setting up environment variables...
if not exist .env (
    copy env.example .env
    echo ✅ Created .env file from template
    echo ⚠️  Please update .env with your database credentials and API keys
) else (
    echo ✅ .env file already exists
)

echo 🗄️  Setting up database...
echo MongoDB Atlas connection configured in .env file
echo Database: Cluster0

REM Generate Prisma client
echo 🔨 Generating Prisma client...
npm run db:generate

REM Push schema to database
echo 📊 Pushing database schema...
npm run db:push

REM Seed database
echo 🌱 Seeding database with sample data...
npm run db:seed

echo ✅ Backend setup completed!
echo.
echo 🎉 You can now start the development server with:
echo    npm run dev
echo.
echo 📋 Demo Account:
echo    Email: demo@financemanager.com
echo    Password: demo123
echo.
echo 🌐 API will be available at: http://localhost:3001
echo 📖 API Documentation: http://localhost:3001/health
pause
