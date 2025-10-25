# Quick Start Guide

## 🚀 Get Up and Running in 5 Minutes

### 1. Clone the Repository
```bash
git clone https://github.com/mbuckingham74/meteo-app.git
cd meteo-app
```

### 2. Create Environment File

Your API key is **already configured locally** in `backend/.env` and will **never be committed to Git**.

For a new environment, create a `.env` file in the project root:

```bash
cat > .env << 'EOF'
# Database
DB_USER=root
DB_PASSWORD=jag97Dorp@091509!
DB_NAME=meteo_app

# Visual Crossing API
VISUAL_CROSSING_API_KEY=BTU88L6G4NBB69QRDGJ7UJEVQ
EOF
```

**⚠️ Security Note:** The `.env` file is in `.gitignore` and will NOT be pushed to GitHub.

### 3. Start the Application
```bash
docker-compose up -d
```

This starts:
- ✅ MySQL database on port **3307**
- ✅ Backend API on port **5001**
- ✅ Frontend React app on port **3000**

### 4. Initialize the Database
```bash
# Wait a few seconds for MySQL to start, then:
docker exec -it meteo-backend npm run db:init
```

This creates all tables and adds sample location data.

### 5. Verify Everything Works
```bash
# Check health endpoint
curl http://localhost:5001/api/health

# Expected output:
# {"status":"ok","database":"connected","message":"Meteo API is running",...}
```

### 6. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Database**: localhost:3307

## 📦 Your API Key is Safe

### ✅ What's Protected (NOT in Git)
- `backend/.env` - Your actual API key (gitignored)
- `.env` - Project root environment file (gitignored)

### ✅ What's in Git (Safe to Share)
- `backend/.env.example` - Template without real keys
- `DEPLOYMENT.md` - Instructions for deployment
- `docker-compose.yml` - Reads from `.env` file
- All source code

## 🔄 How It Works

1. **Local Development:**
   - Your API key is in `backend/.env` (gitignored)
   - Docker Compose reads from `.env` in project root
   - Environment variables are injected into containers

2. **Git Repository:**
   - Only `.env.example` is committed (template, no real keys)
   - `.gitignore` prevents `.env` from being committed
   - Your secrets stay local

3. **Deployment:**
   - Use GitHub Secrets, Heroku config vars, or cloud env variables
   - See `DEPLOYMENT.md` for platform-specific instructions

## 🛠️ Common Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend

# Restart backend after .env changes
docker-compose restart backend

# Initialize/reset database
docker exec -it meteo-backend npm run db:init

# Check if API key is loaded
docker exec meteo-backend printenv VISUAL_CROSSING_API_KEY
```

## 🆘 Troubleshooting

### API Key Not Working?
```bash
# Verify .env exists in project root
cat .env

# Verify environment variable in container
docker exec meteo-backend printenv VISUAL_CROSSING_API_KEY

# Restart to reload environment
docker-compose restart backend
```

### Database Connection Issues?
```bash
# Check MySQL is running
docker ps | grep mysql

# Check database logs
docker-compose logs mysql
```

## 📚 Next Steps

- Read `DEPLOYMENT.md` for production deployment
- Read `CLAUDE.md` for development guidance
- Check `database/README.md` for database schema details
