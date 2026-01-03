import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ItineraryView = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTripData = useCallback(async () => {
    try {
      const response = await api.get(`/trips/${tripId}`);
      setTrip(response.data.trip);
      setStops(response.data.stops || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching trip:', error);
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchTripData();
  }, [fetchTripData]);

  const calculateTotalBudget = () => {
    // Sum of section budgets OR activity costs if budget not set
    return stops.reduce((total, stop) => {
      const sectionBudget = parseFloat(stop.budget) || 0;
      if (sectionBudget > 0) return total + sectionBudget;

      // Fallback to sum of activities if no manual budget
      const activitiesCost = (stop.activities || []).reduce((sum, act) => sum + (parseFloat(act.cost) || 0), 0);
      return total + activitiesCost;
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading itinerary...</div>
      </div>
    );
  }

  const totalBudget = calculateTotalBudget();

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none mb-0">
        <div className="absolute top-20 left-10 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-indigo-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/my-trips')}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              ←
            </button>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Trip Itinerary
            </h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/budget/${tripId}`)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-semibold border border-gray-700 transition-colors"
            >
              View Budget
            </button>
            {/* Only show Edit button if NOT in public shared view */}
            {!window.location.pathname.endsWith('/public') && (
              <button
                onClick={() => navigate(`/itinerary/${tripId}/edit`)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-semibold shadow-lg shadow-indigo-500/30 transition-colors"
              >
                ✏️ Edit Plan
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 relative z-10">

        {/* Trip Overview Card */}
        <div className="glass-card rounded-2xl p-8 mb-10 text-center relative overflow-hidden text-white">
          {/* Cover Photo Backdrop */}
          {trip?.cover_photo ? (
            <div className="absolute inset-0 z-0">
              <img src={trip.cover_photo} alt="Cover" className="w-full h-full object-cover opacity-20 blur-sm" />
              <div className="absolute inset-0 bg-slate-900/60"></div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 z-0"></div>
          )}

          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-2">{trip?.name}</h2>
            <p className="text-indigo-200 mb-8 text-lg">
              {new Date(trip.start_date).toLocaleDateString()} — {new Date(trip.end_date).toLocaleDateString()}
            </p>

            <div className="flex justify-center gap-12 border-t border-white/10 pt-8">
              <div className="text-center">
                <span className="block text-3xl font-bold">{stops.length}</span>
                <span className="text-xs text-gray-400 uppercase tracking-widest mt-1">Sections</span>
              </div>
              <div className="text-center">
                <span className="block text-3xl font-bold text-green-400">${totalBudget.toFixed(0)}</span>
                <span className="text-xs text-gray-400 uppercase tracking-widest mt-1">Total Budget</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sections List (Read Only) */}
        <div className="space-y-8">
          <h3 className="text-2xl font-bold text-white mb-6 pl-2 border-l-4 border-indigo-500">Your Journey</h3>

          {stops.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white/5 rounded-2xl border border-dashed border-white/10">
              <p>No sections added yet.</p>
              <button
                onClick={() => navigate(`/itinerary/${tripId}/edit`)}
                className="mt-4 text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Go to Editor
              </button>
            </div>
          ) : (
            stops.map((stop, index) => (
              <div key={stop.id} className="glass-card rounded-xl border border-white/10 p-6 shadow-lg relative overflow-hidden group">

                {/* Section Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-white mb-1">
                      <span className="text-indigo-400 mr-2">#{index + 1}</span>
                      {stop.name || stop.city_name || 'Section'}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      {stop.notes || "No description provided."}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">Budget</span>
                    <span className="text-lg font-bold text-green-400">
                      ${parseFloat(stop.budget || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="bg-slate-800/80 border border-white/10 px-3 py-1.5 rounded-md text-xs text-gray-300 flex items-center gap-2">
                    📅 {stop.start_date ? new Date(stop.start_date).toLocaleDateString() : 'N/A'} - {stop.end_date ? new Date(stop.end_date).toLocaleDateString() : 'N/A'}
                  </div>
                  <div className="bg-slate-800/80 border border-white/10 px-3 py-1.5 rounded-md text-xs text-gray-300 flex items-center gap-2">
                    📍 {stop.city_name || 'Location'}
                  </div>
                </div>

                {/* Activities */}
                {stop.activities && stop.activities.length > 0 && (
                  <div className="bg-slate-800/30 rounded-lg p-4 border border-white/5">
                    <h5 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider">Planned Activities</h5>
                    <div className="space-y-2">
                      {stop.activities.map((act, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <span className="text-gray-300">• {act.name}</span>
                          <span className="text-gray-500 font-mono">${act.cost}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ))
          )}
        </div>

      </main>
    </div>
  );
};

export default ItineraryView;
