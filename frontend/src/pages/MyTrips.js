import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripAPI } from '../services/api';

const MyTrips = () => {
  const [trips, setTrips] = useState({ ongoing: [], upcoming: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await tripAPI.getAll();
      const allTrips = response.data.trips;

      const now = new Date();
      const categorized = {
        ongoing: allTrips.filter(trip => {
          const start = new Date(trip.start_date);
          const end = new Date(trip.end_date);
          return start <= now && end >= now;
        }),
        upcoming: allTrips.filter(trip => new Date(trip.start_date) > now),
        completed: allTrips.filter(trip => new Date(trip.end_date) < now)
      };

      setTrips(categorized);
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

  const TripSection = ({ title, tripsList }) => (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        {title} <span className="text-sm font-normal text-gray-400 bg-white/10 px-3 py-1 rounded-full">{tripsList.length}</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tripsList.map(trip => (
          <div key={trip.id} className="glass-card rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all group flex flex-col h-full">
            <div className="h-48 relative overflow-hidden">
              {trip.cover_photo ? (
                <img src={trip.cover_photo} alt={trip.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
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

          {/* Search Bar - styled */}
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search trips..."
              className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-5 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all shadow-inner pl-12"
            />
            <span className="absolute left-4 top-3.5 text-gray-500">🔍</span>
          </div>
        </div>

        {trips.ongoing.length > 0 && <TripSection title="Happening Now" tripsList={trips.ongoing} />}
        {trips.upcoming.length > 0 && <TripSection title="Upcoming Adventures" tripsList={trips.upcoming} />}
        {trips.completed.length > 0 && <TripSection title="Past Journeys" tripsList={trips.completed} />}

        {/* Empty State */}
        {trips.ongoing.length === 0 && trips.upcoming.length === 0 && trips.completed.length === 0 && (
          <div className="text-center py-24 glass-card rounded-3xl border border-dashed border-white/10">
            <div className="text-8xl mb-6 opacity-50">✈️</div>
            <h3 className="text-2xl font-bold text-white mb-3">No trips found</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">Your adventure journal is empty. Start planning your next dream vacation today!</p>
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
