import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import all pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateTrip from './pages/CreateTrip';
import MyTrips from './pages/MyTrips';
import ItineraryBuilder from './pages/ItineraryBuilder';
import ItineraryView from './pages/ItineraryView';
import CitySearch from './pages/CitySearch';
import ActivitySearch from './pages/ActivitySearch';
import UserProfile from './pages/UserProfile';
import Community from './pages/Community';
import CalendarView from './pages/CalendarView';
import AdminDashboard from './pages/AdminDashboard';
import BudgetBreakdown from './pages/BudgetBreakdown';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Component (redirects to home/admin if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (user) {
    if (user.is_admin) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-trip"
        element={
          <ProtectedRoute>
            <CreateTrip />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-trips"
        element={
          <ProtectedRoute>
            <MyTrips />
          </ProtectedRoute>
        }
      />
      <Route
        path="/itinerary/:tripId"
        element={
          <ProtectedRoute>
            <ItineraryView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/itinerary/:tripId/edit"
        element={
          <ProtectedRoute>
            <ItineraryBuilder />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trip/:tripId"
        element={
          <ProtectedRoute>
            <ItineraryView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/budget/:tripId"
        element={
          <ProtectedRoute>
            <BudgetBreakdown />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cities"
        element={
          <ProtectedRoute>
            <CitySearch />
          </ProtectedRoute>
        }
      />
      <Route
        path="/activities"
        element={
          <ProtectedRoute>
            <ActivitySearch />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/community"
        element={
          <ProtectedRoute>
            <Community />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <CalendarView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar/:tripId"
        element={
          <ProtectedRoute>
            <CalendarView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Public Trip View (for shared trips) */}
      <Route path="/trip/:tripId/public" element={<ItineraryView />} />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 404 - Redirect to dashboard or login */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
