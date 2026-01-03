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
      setStops(response.data.trip.stops || []);
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

  // Helper to generate days text
  const getDayLabel = (date, index) => {
    return `Day ${index + 1}`;
  };

  // Group stops/activities by day (Simulated for now based on index if dates match or just sequential)
  // For Screen 9 exact match: "Day 1", "Physical Activity", "Expense"

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20 font-sans">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none mb-0">
        <div className="absolute top-20 left-10 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-indigo-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/my-trips')} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">←</button>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Trip Itinerary</h1>
          </div>
          <button onClick={() => navigate(`/budget/${tripId}`)} className="px-4 py-2 bg-slate-800 border border-gray-700 rounded-lg hover:bg-slate-700">View Budget</button>
        </div>
      </header>

      {/* Main Content (Screen 9 Layout) */}
      <main className="max-w-5xl mx-auto px-4 py-8 relative z-10 glass-card mt-8 rounded-3xl p-8 border border-white/10">

        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">Itinerary for {trip?.name || 'Your Trip'}</h2>
          <p className="text-gray-400">{trip ? `${new Date(trip.start_date).toLocaleDateString()} - ${new Date(trip.end_date).toLocaleDateString()}` : ''}</p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-12 gap-4 text-gray-400 uppercase text-xs font-bold tracking-wider mb-2 px-4">
            <div className="col-span-2">Day</div>
            <div className="col-span-7">Physical Activity / Stop</div>
            <div className="col-span-3 text-right">Expense</div>
          </div>

          {stops.length > 0 ? (
            stops.map((stop, index) => (
              <div key={stop.id} className="grid grid-cols-12 gap-4 items-center bg-slate-800/40 p-4 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-colors group">
                {/* Day Column */}
                <div className="col-span-2">
                  <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center border border-white/10 shadow-lg">
                    <span className="text-lg font-bold text-white">Day {index + 1}</span>
                  </div>
                </div>

                {/* Activity Column */}
                <div className="col-span-7">
                  <h4 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">{stop.name || stop.city_name}</h4>
                  <p className="text-gray-400 text-sm mb-2">{stop.notes || 'Explore the city and local attractions.'}</p>

                  {/* Nested Activities */}
                  {stop.activities && stop.activities.length > 0 && (
                    <div className="space-y-2 mt-3 pl-4 border-l-2 border-indigo-500/30">
                      {stop.activities.map((act, i) => (
                        <div key={i} className="flex justify-between items-center text-sm bg-slate-900/50 p-2 rounded">
                          <span className="text-gray-300">{act.name}</span>
                          <span className="text-gray-500">${act.cost}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {(!stop.activities || stop.activities.length === 0) && (
                    <button className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-2">+ Add Activity</button>
                  )}
                </div>

                {/* Expense Column */}
                <div className="col-span-3 text-right">
                  <div className="text-2xl font-bold text-green-400">${parseFloat(stop.budget || 0)}</div>
                  <span className="text-xs text-gray-500">Estimated Cost</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-12 py-12 text-center border-2 border-dashed border-gray-700/50 rounded-xl">
              <p className="text-gray-500 mb-4">No days planned yet.</p>
              <button onClick={() => navigate(`/itinerary/${tripId}/edit`)} className="px-6 py-2 bg-indigo-600 rounded-lg text-white font-bold">Start Planning</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ItineraryView;
