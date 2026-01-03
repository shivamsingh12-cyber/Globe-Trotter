import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripAPI } from '../services/api';
import { getTripImage } from '../utils/imageUtils';

const MyTrips = () => {
  const [allTrips, setAllTrips] = useState([]); // Store raw data
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Controls State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortType, setSortType] = useState('date'); // date, cost
  const [filterType, setFilterType] = useState('all'); // all, public, private
  const [groupByCountry, setGroupByCountry] = useState(false);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await tripAPI.getAll();
      setAllTrips(response.data.trips || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await tripAPI.delete(tripId);
        fetchTrips();
      } catch (error) {
        console.error('Error deleting trip:', error);
      }
    }
  };

  // Process trips based on controls
  const getProcessedTrips = () => {
    let processed = [...allTrips];

    // 1. Search
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      processed = processed.filter(t =>
        t.name.toLowerCase().includes(lowerTerm) ||
        (t.description && t.description.toLowerCase().includes(lowerTerm))
      );
    }

    // 2. Filter (Time-based / Status)
    const now = new Date();
    if (filterType === 'upcoming') {
      processed = processed.filter(t => new Date(t.start_date) > now);
    } else if (filterType === 'completed') {
      processed = processed.filter(t => new Date(t.end_date) < now);
    } else if (filterType === 'ongoing') {
      processed = processed.filter(t => {
        const start = new Date(t.start_date);
        const end = new Date(t.end_date);
        return start <= now && end >= now;
      });
    }

    // 3. Sort
    processed.sort((a, b) => {
      if (sortType === 'date') {
        return new Date(b.start_date) - new Date(a.start_date); // Newest first
      } else if (sortType === 'cost') {
        return (parseFloat(b.total_cost) || 0) - (parseFloat(a.total_cost) || 0); // Highest cost first
      }
      return 0;
    });

    // 4. Grouping (Visualization mainly, but here we just sort by country if grouped)
    if (groupByCountry) {
      // Logic to group visually would require changing the whole view structure.
      // For now, we'll sort them by country so they appear together.
      processed.sort((a, b) => {
        const cA = a.cities?.[0]?.country || '';
        const cB = b.cities?.[0]?.country || '';
        return cA.localeCompare(cB);
      });
    }

    return processed;
  };

  const processedList = getProcessedTrips();

  // Categorize Processed List (This now categorizes the ALREADY filtered list)
  const now = new Date();
  const trips = {
    ongoing: processedList.filter(trip => {
      const start = new Date(trip.start_date);
      const end = new Date(trip.end_date);
      return start <= now && end >= now;
    }),
    upcoming: processedList.filter(trip => new Date(trip.start_date) > now),
    completed: processedList.filter(trip => new Date(trip.end_date) < now)
  };


  const TripSection = ({ title, tripsList }) => (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        {title} <span className="text-sm font-normal text-gray-400 bg-white/10 px-3 py-1 rounded-full">{tripsList.length}</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tripsList.map(trip => (
          <div key={trip.id} className="glass-card rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all group flex flex-col h-full">
            <div className="h-48 relative overflow-hidden">
              {getTripImage(trip) ? (
                <img
                  src={getTripImage(trip)}
                  alt={trip.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-4xl">
                  ✈️
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
              <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg text-xs text-white border border-white/10">
                {trip.is_public ? 'Public' : 'Private'}
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">{trip.name}</h3>
                <p className="text-gray-400 text-sm line-clamp-2">{trip.description || 'No description added.'}</p>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-gray-300">
                  <span className="w-6 text-center mr-2">📅</span>
                  {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <span className="w-6 text-center mr-2">📍</span>
                  {trip.stop_count || 0} Places
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <span className="w-6 text-center mr-2">💰</span>
                  ${parseFloat(trip.total_cost || 0).toLocaleString()}
                </div>
              </div>

              <div className="mt-auto flex gap-2">
                <button
                  onClick={() => navigate(`/itinerary/${trip.id}/edit`)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-indigo-500/20"
                >
                  Plan
                </button>
                <button
                  onClick={() => navigate(`/itinerary/${trip.id}`)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl font-medium transition-colors border border-white/5"
                >
                  View
                </button>
                <button
                  onClick={() => handleDeleteTrip(trip.id)}
                  className="w-10 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading Your Adventures...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-indigo-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center transition-colors text-white">
              <span className="text-xl">←</span>
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-xl">🌍</span>
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">GlobeTrotter</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/create-trip')}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-lg shadow-indigo-500/25 text-white font-medium text-sm"
            >
              + New Trip
            </button>
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center text-white shadow-lg cursor-default">
              👤
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">My Trips</h2>
            <p className="text-gray-400">Manage and view all your planned adventures.</p>
          </div>
        </div>

        {/* Global Search & Controls */}
        <div className="mb-12 flex flex-col md:flex-row gap-4">
          <div className="flex-1 glass-card p-2 rounded-2xl flex items-center border border-gray-700 focus-within:border-indigo-500/50 transition-colors shadow-2xl shadow-black/50">
            <span className="pl-4 text-2xl">🔍</span>
            <input
              type="text"
              placeholder="Search trips..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none text-white px-4 py-3 text-lg focus:outline-none placeholder-gray-500"
            />
          </div>

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
                <option value="all" className="bg-slate-900 text-white">Filter: All</option>
                <option value="upcoming" className="bg-slate-900 text-white">Filter: Up-coming</option>
                <option value="ongoing" className="bg-slate-900 text-white">Filter: Ongoing</option>
                <option value="completed" className="bg-slate-900 text-white">Filter: Completed</option>
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

        {trips.ongoing.length > 0 && <TripSection title="Ongoing" tripsList={trips.ongoing} />}
        {trips.upcoming.length > 0 && <TripSection title="Up-coming" tripsList={trips.upcoming} />}
        {trips.completed.length > 0 && <TripSection title="Completed" tripsList={trips.completed} />}

        {/* Empty State */}
        {trips.ongoing.length === 0 && trips.upcoming.length === 0 && trips.completed.length === 0 && (
          <div className="text-center py-24 glass-card rounded-3xl border border-dashed border-white/10">
            <div className="text-8xl mb-6 opacity-50">✈️</div>
            <h3 className="text-2xl font-bold text-white mb-3">No trips found</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              {searchTerm || filterType !== 'all' ? 'Try adjusting your filters.' : 'Your adventure journal is empty. Start planning your next dream vacation today!'}
            </p>
            <button
              onClick={() => navigate('/create-trip')}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-xl shadow-indigo-500/25 transition-all transform hover:scale-105"
            >
              Start Planning Now
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyTrips;
