# 🚀 GlobeTrotter - Quick Setup Guide

Follow these steps to get GlobeTrotter up and running on your machine.

## Prerequisites Checklist

- [ ] Node.js (v14+) installed - Check with `node --version`
- [ ] PostgreSQL (v12+) installed - Check with `psql --version`
- [ ] npm installed - Check with `npm --version`

## Step-by-Step Setup

### 1️⃣ Database Setup (5 minutes)

#### Option A: Using psql command line

```bash
# Start PostgreSQL service (if not running)
# Windows: Start PostgreSQL service from Services
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql

# Create database
psql -U postgres -c "CREATE DATABASE globetrotter;"

# Run schema
psql -U postgres -d globetrotter -f database/schema.sql

# Load seed data (optional but recommended)
psql -U postgres -d globetrotter -f database/seed.sql
```

#### Option B: Using pgAdmin or other GUI

1. Open pgAdmin
2. Create new database named `globetrotter`
3. Open Query Tool
4. Copy and paste contents of `database/schema.sql`
5. Execute
6. Copy and paste contents of `database/seed.sql`
7. Execute

### 2️⃣ Backend Setup (3 minutes)

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# The .env file is already created with default values
# Update database password if needed in backend/.env
# Default password is 'postgres'

# Start the backend server
npm start
```

✅ Backend should now be running on http://localhost:5000

Test it: Open http://localhost:5000/api/health in your browser

### 3️⃣ Frontend Setup (3 minutes)

```bash
# Open a NEW terminal window
# Navigate to frontend folder
cd frontend

# Install dependencies (if not already done)
npm install

# Install Tailwind CSS dependencies
npm install -D tailwindcss postcss autoprefixer

# The .env file is already created
# No changes needed for local development

# Start the frontend development server
npm start
```

✅ Frontend should now be running on http://localhost:3000

Your browser should automatically open to http://localhost:3000

### 4️⃣ Test the Application

#### Using Seed Data (Recommended)

If you loaded the seed data, you can login with:
- **Email**: demo@globetrotter.com
- **Password**: demo123

#### Creating New Account

1. Click "Sign up here" on the login page
2. Fill in your details
3. Click "Register"
4. You'll be automatically logged in

## 🎯 What You Should See

1. **Login Page** - Clean login form with GlobeTrotter branding
2. **Dashboard** - After login, see welcome message and popular destinations
3. **Create Trip** - Click "Plan a New Trip" to create your first trip
4. **My Trips** - View all your trips organized by status

## 🐛 Troubleshooting

### Backend won't start

**Error: "Cannot connect to database"**
- Check PostgreSQL is running
- Verify database credentials in `backend/.env`
- Ensure database `globetrotter` exists

**Error: "Port 5000 already in use"**
- Change PORT in `backend/.env` to another port (e.g., 5001)
- Update REACT_APP_API_URL in `frontend/.env` accordingly

### Frontend won't start

**Error: "Port 3000 already in use"**
- The terminal will ask if you want to use another port
- Type 'y' and press Enter

**Error: "Module not found"**
- Delete `node_modules` folder
- Delete `package-lock.json`
- Run `npm install` again

**Tailwind CSS not working**
- Ensure `tailwind.config.js` exists in frontend folder
- Ensure `postcss.config.js` exists in frontend folder
- Restart the development server

### Database Issues

**Error: "relation does not exist"**
- Schema wasn't created properly
- Re-run: `psql -U postgres -d globetrotter -f database/schema.sql`

**No cities or activities showing**
- Seed data wasn't loaded
- Run: `psql -U postgres -d globetrotter -f database/seed.sql`

## 📝 Quick Commands Reference

### Start Everything

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

### Stop Everything

- Press `Ctrl + C` in each terminal window

### Reset Database

```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS globetrotter;"
psql -U postgres -c "CREATE DATABASE globetrotter;"
psql -U postgres -d globetrotter -f database/schema.sql
psql -U postgres -d globetrotter -f database/seed.sql
```

## 🎉 Success Checklist

- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:3000
- [ ] Can access login page
- [ ] Can register new account
- [ ] Can login successfully
- [ ] Dashboard loads with data
- [ ] Can create a new trip

## 📞 Need Help?

If you're stuck:
1. Check the error message carefully
2. Review the troubleshooting section above
3. Check that all prerequisites are installed
4. Ensure all commands were run in the correct directory
5. Try restarting both servers

## 🎓 Next Steps

Once everything is running:
1. Explore the dashboard
2. Create your first trip
3. Browse cities and activities
4. Build an itinerary
5. Check out the budget breakdown

---

**Estimated Total Setup Time: 10-15 minutes**

Happy Traveling! 🌍✈️
