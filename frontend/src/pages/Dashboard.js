import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tripAPI, cityAPI } from '../services/api';
import { getTripImage } from '../utils/imageUtils';

const Dashboard = () => {
  const [trips, setTrips] = useState([]);
  const [popularCities, setPopularCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.is_admin) {
      navigate('/admin');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      const [tripsResponse, citiesResponse] = await Promise.all([
        tripAPI.getAll(),
        cityAPI.getPopular(5)
      ]);

      setTrips(tripsResponse.data.trips);
      setPopularCities(citiesResponse.data.cities);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [sortType, setSortType] = useState('date'); // date, cost
  const [filterType, setFilterType] = useState('all'); // all, upcoming, past
  const [groupByCountry, setGroupByCountry] = useState(false);

  // Derived state for Trips
  const getProcessedTrips = () => {
    let processed = [...trips];

    // Filter
    const now = new Date();
    if (filterType === 'upcoming') {
      processed = processed.filter(t => new Date(t.start_date) > now);
    } else if (filterType === 'past') {
      processed = processed.filter(t => new Date(t.start_date) <= now);
    }

    // Sort
    processed.sort((a, b) => {
      if (sortType === 'date') {
        return new Date(b.start_date) - new Date(a.start_date); // Newest first
      } else if (sortType === 'cost') {
        return (parseFloat(b.total_cost) || 0) - (parseFloat(a.total_cost) || 0); // Highest cost first
      }
      return 0;
    });

    return processed;
  };

  // Derived state for Cities
  const getProcessedCities = () => {
    let processed = [...popularCities];
    if (groupByCountry) {
      processed.sort((a, b) => a.country.localeCompare(b.country));
    }
    return processed;
  };

  const processedTrips = getProcessedTrips();
  const processedCities = getProcessedCities();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading experience...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-indigo-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-xl">🌍</span>
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              GlobeTrotter
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/profile')}
              className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center">
                👤
              </div>
              <span className="hidden md:inline">{user?.first_name || 'Profile'}</span>
            </button>
            <button onClick={() => navigate('/community')} className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">Community</button>
            <button onClick={() => navigate('/calendar')} className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">Calendar</button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">

        {/* Welcome Section */}
        <div className="relative glass-card rounded-2xl p-8 md:p-12 mb-12 overflow-hidden group" style={{ backgroundImage: 'url(/images/dashboard-cover.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="absolute inset-0 bg-slate-900/60 group-hover:bg-slate-900/50 transition-colors"></div>
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

          <div className="relative z-10 max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Ready for your next <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Adventure, {user?.first_name}?</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-lg">
              Discover new destinations, plan your itinerary, and manage your budget all in one place.
            </p>
            <button
              onClick={() => navigate('/create-trip')}
              className="bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-white/10 flex items-center gap-2"
            >
              <span>+ Plan New Trip</span>
            </button>
          </div>
        </div>

        {/* Global Search & Controls */}
        <div className="max-w-4xl mx-auto mb-12 flex flex-col md:flex-row gap-4">
          <div className="flex-1 glass-card p-2 rounded-2xl flex items-center border border-gray-700 focus-within:border-indigo-500/50 transition-colors shadow-2xl shadow-black/50">
            <span className="pl-4 text-2xl">🔍</span>
            <input
              type="text"
              placeholder="Search for cities, activities..."
              className="w-full bg-transparent border-none text-white px-4 py-3 text-lg focus:outline-none placeholder-gray-500"
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/cities?search=${e.target.value}`)}
            />
          </div>

          {/* Professional Controls: Dropdowns */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {/* Group By Dropdown */}
            <div className="relative">
              <select
                value={groupByCountry ? 'country' : 'none'}
                onChange={(e) => setGroupByCountry(e.target.value === 'country')}
                className="glass-card px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-sm font-medium border border-white/5 bg-slate-800 text-white appearance-none cursor-pointer pr-8 focus:outline-none focus:border-indigo-500"
              >
                <option value="none" className="bg-slate-900 text-white">Group by: None</option>
                <option value="country" className="bg-slate-900 text-white">Group by: Country</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="glass-card px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-sm font-medium border border-white/5 bg-slate-800 text-white appearance-none cursor-pointer pr-8 focus:outline-none focus:border-indigo-500"
              >
                <option value="all" className="bg-slate-900 text-white">Filter: All Trips</option>
                <option value="upcoming" className="bg-slate-900 text-white">Filter: Upcoming</option>
                <option value="past" className="bg-slate-900 text-white">Filter: Past</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortType}
                onChange={(e) => setSortType(e.target.value)}
                className="glass-card px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-sm font-medium border border-white/5 bg-slate-800 text-white appearance-none cursor-pointer pr-8 focus:outline-none focus:border-indigo-500"
              >
                <option value="date" className="bg-slate-900 text-white">Sort by: Date</option>
                <option value="cost" className="bg-slate-900 text-white">Sort by: Cost</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
            </div>
          </div>
        </div>

        {/* Top Regional Selections */}
        <section className="mb-12">
          <div className="flex justify-between items-end mb-6">
            <h3 className="text-2xl font-bold">Top Regional Selections</h3>
            <button onClick={() => navigate('/cities')} className="text-indigo-400 hover:text-indigo-300 font-medium">View all</button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {processedCities.map((city, index) => (
              <div
                key={city.id}
                onClick={() => navigate(`/cities?search=${city.name}`)}
                className="group relative h-40 md:h-48 rounded-xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 border border-white/5"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <img
                  src={`/images/${city.name.toLowerCase().replace(/ /g, '-')}.webp`}
                  onError={(e) => { e.target.onerror = null; e.target.src = city.image_url || `https://source.unsplash.com/400x600/?${city.name}`; }}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-3 left-3">
                  <h4 className="font-bold text-base mb-0.5">{city.name}</h4>
                  <p className="text-[10px] text-gray-300 uppercase tracking-wider">{city.country}</p>
                </div>
              </div>
            ))}
          </div>
        </section>



        {/* Previous Trips */}
        <section className="relative">
          <div className="flex justify-between items-end mb-6">
            <h3 className="text-2xl font-bold">Previous Trips</h3>
            <button onClick={() => navigate('/my-trips')} className="text-indigo-400 hover:text-indigo-300 font-medium">View all</button>
          </div>

          {processedTrips.length === 0 ? (
            <div className="border-2 border-dashed border-gray-700 rounded-2xl p-12 text-center bg-slate-800/30">
              <span className="text-4xl block mb-4">✈️</span>
              <p className="text-gray-400 mb-6">You haven't created any trips yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {processedTrips.slice(0, 3).map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => navigate(`/itinerary/${trip.id}`)}
                  className="glass-card rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all cursor-pointer group h-64 flex flex-col"
                >
                  <div className="h-40 relative overflow-hidden flex-shrink-0">
                    <img
                      src={getTripImage(trip)}
                      alt={trip.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-xl mb-1 group-hover:text-blue-300 transition-colors line-clamp-1">{trip.name}</h4>
                      <p className="text-sm text-gray-400">{new Date(trip.start_date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-green-400 font-mono text-sm">${parseFloat(trip.total_cost || 0).toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Floating Plan Trip Button (Wireframe: Bottom Right) */}
          <div className="fixed bottom-8 right-8 z-50">
            <button
              onClick={() => navigate('/create-trip')}
              className="bg-white text-slate-900 px-6 py-3 rounded-full font-bold shadow-2xl hover:scale-105 transition-transform flex items-center gap-2 border-4 border-slate-900"
            >
              <span className="text-xl">+</span> Plan a trip
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
