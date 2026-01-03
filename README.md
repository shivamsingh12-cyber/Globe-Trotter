# 🌍 GlobeTrotter - Travel Planning Application

A comprehensive travel planning platform that empowers users to create personalized multi-city itineraries, manage budgets, discover destinations, and share travel plans with the community.

## 📋 Features

### Core Functionality
- ✅ **User Authentication** - Secure login and registration with JWT
- ✅ **Dashboard** - Personalized home with trip overview and recommendations
- ✅ **Trip Management** - Create, edit, and delete trips
- ✅ **Multi-City Itineraries** - Plan trips with multiple destinations
- ✅ **Activity Planning** - Browse and add activities to each stop
- ✅ **Budget Tracking** - Automatic cost calculation and breakdown
- ✅ **City Search** - Discover destinations with filters
- ✅ **Activity Search** - Find activities by category and cost
- ✅ **Calendar View** - Visualize trip timeline
- ✅ **Public Sharing** - Share trips with the community
- ✅ **User Profile** - Manage account settings

### Screens Implemented
1. ✅ Login Screen
2. ✅ Registration Screen
3. ✅ Dashboard/Home Screen
4. ✅ Create Trip Screen
5. ⏳ Itinerary Builder Screen
6. ✅ My Trips List Screen
7. ⏳ User Profile Screen
8. ⏳ City Search Screen
9. ⏳ Activity Search Screen
10. ⏳ Itinerary View Screen
11. ⏳ Budget Breakdown Screen
12. ⏳ Calendar/Timeline Screen
13. ⏳ Community/Public View Screen

## 🛠️ Technology Stack

### Frontend
- **React.js** - UI framework
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - API calls
- **date-fns** - Date handling
- **Recharts** - Data visualization

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **JWT** - Authentication
- **bcrypt** - Password hashing

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd globetrotter
```

### 2. Database Setup

#### Create PostgreSQL Database
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE globetrotter;

# Exit psql
\q
```

#### Run Database Schema
```bash
psql -U postgres -d globetrotter -f database/schema.sql
```

#### Seed Database (Optional)
```bash
psql -U postgres -d globetrotter -f database/seed.sql
```

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
# Copy .env.example to .env and update values
cp .env.example .env

# Update .env with your database credentials:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=globetrotter
# DB_USER=postgres
# DB_PASSWORD=your_password
# JWT_SECRET=your_secret_key

# Start backend server
npm start

# Or use nodemon for development
npm run dev
```

Backend will run on `http://localhost:5000`

### 4. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Install Tailwind CSS (if not already installed)
npm install -D tailwindcss postcss autoprefixer

# Configure environment variables
# Copy .env.example to .env
cp .env.example .env

# Start frontend development server
npm start
```

Frontend will run on `http://localhost:3000`

## 🚀 Usage

### Running the Application

1. **Start PostgreSQL** - Ensure PostgreSQL is running
2. **Start Backend** - `cd backend && npm start`
3. **Start Frontend** - `cd frontend && npm start`
4. **Access Application** - Open `http://localhost:3000`

### Default Credentials (if using seed data)
- **Email**: demo@globetrotter.com
- **Password**: demo123

## 📁 Project Structure

```
globetrotter/
├── frontend/                 # React frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React context (Auth)
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── App.js           # Main app component
│   │   └── index.js         # Entry point
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                  # Express backend API
│   ├── config/              # Configuration files
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Custom middleware
│   ├── routes/              # API routes
│   ├── server.js            # Server entry point
│   └── package.json
│
├── database/                 # Database files
│   ├── schema.sql           # Database schema
│   └── seed.sql             # Seed data
│
├── TODO.md                   # Implementation checklist
└── README.md                 # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Trips
- `GET /api/trips` - Get all user trips
- `GET /api/trips/:id` - Get trip by ID
- `POST /api/trips` - Create new trip
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip
- `POST /api/trips/stops` - Add stop to trip
- `POST /api/trips/activities` - Add activity to stop
- `GET /api/trips/:id/budget` - Get trip budget

### Cities
- `GET /api/cities` - Get all cities (with filters)
- `GET /api/cities/:id` - Get city by ID
- `GET /api/cities/popular` - Get popular cities
- `GET /api/cities/countries` - Get countries list

### Activities
- `GET /api/activities` - Get all activities (with filters)
- `GET /api/activities/:id` - Get activity by ID
- `GET /api/activities/city/:city_id` - Get activities by city
- `GET /api/activities/categories` - Get activity categories

## 🗄️ Database Schema

### Tables
1. **users** - User accounts and profiles
2. **trips** - Trip information
3. **cities** - Available destinations
4. **activities** - Available activities
5. **trip_stops** - Cities in each trip
6. **stop_activities** - Activities for each stop
7. **expenses** - Budget tracking

## 🔐 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=globetrotter
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📝 Development Notes

### Adding New Features
1. Create database migrations if needed
2. Add backend API endpoints
3. Create frontend components/pages
4. Update routing in App.js
5. Test thoroughly

### Code Style
- Use ES6+ features
- Follow React best practices
- Use functional components with hooks
- Implement proper error handling
- Add loading states for async operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

Developed for the GlobeTrotter Hackathon

## 🐛 Known Issues

- Admin dashboard not yet implemented
- Some advanced filtering features pending
- Mobile responsiveness needs improvement

## 🚧 Future Enhancements

- [ ] Real-time collaboration on trips
- [ ] Integration with booking APIs
- [ ] Mobile app (React Native)
- [ ] Social features (comments, likes)
- [ ] AI-powered trip recommendations
- [ ] Weather integration
- [ ] Currency conversion
- [ ] Offline mode
- [ ] Export trip to PDF

## 📞 Support

For issues and questions, please create an issue in the repository.

---

**Happy Traveling! 🌍✈️**
