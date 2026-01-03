import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ItineraryBuilder = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  // Removed unused 'trip' state
  const [stops, setStops] = useState([]);
  const [cities, setCities] = useState([]); // List of available cities for dropdown
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddStop, setShowAddStop] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [selectedStop, setSelectedStop] = useState(null); // The section we are adding activity to

  // Form state for new section
  const [newStop, setNewStop] = useState({
    city_id: '',
    name: '', // Section Title (e.g. "Flight to Paris")
    budget: '',
    start_date: '',
    end_date: '',
    notes: ''
  });

  const fetchTripData = useCallback(async () => {
    try {
      const response = await api.get(`/trips/${tripId}`);
      // setTrip(response.data.trip); // removed unused trip state
      setStops(response.data.stops || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching trip:', error);
      setLoading(false);
    }
  }, [tripId]);

  const fetchCities = useCallback(async () => {
    try {
      const response = await api.get('/cities');
      // Handle various response structures robustly
      let citiesData = [];
      if (response.data && Array.isArray(response.data.cities)) {
        citiesData = response.data.cities;
      } else if (Array.isArray(response.data)) {
        citiesData = response.data;
      }
      setCities(citiesData);
    } catch (error) {
      console.error('Error fetching cities:', error);
      setCities([]);
    }
  }, []);

  useEffect(() => {
    fetchTripData();
    fetchCities();
  }, [fetchTripData, fetchCities]);

  const fetchActivities = async (cityId) => {
    try {
      const response = await api.get(`/activities?city_id=${cityId}`);
      setActivities(response.data.activities || response.data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const handleAddStop = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(`/trips/${tripId}/stops`, {
        ...newStop,
        order_index: stops.length
      });
      // Handle potential response structure differences
      const addedStop = response.data.stop || response.data;

      // Optimistically update list without re-fetching immediately to avoid flicker
      setStops(prevStops => [...prevStops, addedStop]);

      setShowAddStop(false);
      setNewStop({ city_id: '', name: '', budget: '', start_date: '', end_date: '', notes: '' });

    } catch (error) {
      console.error('Error adding section:', error);
    }
  };

  const handleDeleteStop = async (stopId) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      try {
        await api.delete(`/trips/${tripId}/stops/${stopId}`);
        setStops(prevStops => prevStops.filter(s => s.id !== stopId));
      } catch (error) {
        console.error('Error deleting stop:', error);
      }
    }
  };

  const handleAddActivity = async (activityId) => {
    if (!selectedStop) return;
    try {
      await api.post(`/trips/${tripId}/stops/${selectedStop.id}/activities`, {
        activity_id: activityId
      });
      fetchTripData(); // Refresh to see new budget/activities (activities need join data usually, or just refetch)
      setShowAddActivity(false);
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  const getCityDetails = (cityId) => {
    if (!cities.length) return {};
    return cities.find(c => c.id === parseInt(cityId)) || {};
  };

  // Budget is now explicitly set OR calculated
  const getSectionBudget = (stop) => {
    if (stop.budget && parseFloat(stop.budget) > 0) {
      return parseFloat(stop.budget);
    }
    // Fallback if manual budget is 0
    if (!stop.activities) return 0;
    return stop.activities.reduce((sum, act) => sum + (parseFloat(act.cost) || 0), 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading Trip...</div>
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

      {/* Header - Matching Wireframe "GlobalTrotter" style */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-indigo-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-sm">🌍</span>
            </div>
            <h1 className="text-xl font-bold text-white">GlobeTrotter</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-md transition-colors text-gray-400 text-sm"
            >
              Done
            </button>
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center text-white text-sm cursor-default">
              👤
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 relative z-10">

        {/* Sections List */}
        <div className="space-y-6">
          {stops.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-white/5 rounded-2xl border border-dashed border-white/10">
              <p>No sections added yet. Start by adding a new section below.</p>
            </div>
          )}

          {stops.map((stop, index) => {
            const city = getCityDetails(stop.city_id);
            const cityName = city.name || 'Unknown Location';
            const title = stop.name || cityName; // Use custom title if available

            return (
              <div key={stop.id} className="glass-card rounded-xl border border-white/10 p-6 shadow-lg hover:border-indigo-500/30 transition-all group">
                {/* Section Title */}
                <div className="mb-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-white">Section {index + 1}: {title}</h3>
                    <button
                      onClick={() => handleDeleteStop(stop.id)}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                      title="Delete Section"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">
                    {stop.notes || "All the necessary information about this section. This can be anything like travel section, hotel or any other activity."}
                  </p>
                </div>

                {/* Badges / Buttons Row */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="bg-slate-800 border border-white/10 px-4 py-3 rounded-lg text-sm text-gray-300 min-w-[200px] text-center">
                    Date Range: {stop.start_date ? new Date(stop.start_date).toLocaleDateString() : 'xxx'} to {stop.end_date ? new Date(stop.end_date).toLocaleDateString() : 'yyy'}
                  </div>
                  <div className="bg-slate-800 border border-white/10 px-4 py-3 rounded-lg text-sm text-gray-300 min-w-[200px] text-center">
                    Budget of this section: ${getSectionBudget(stop).toFixed(2)}
                  </div>
                </div>

                {/* Activities Preview (Optional, to show content acts as 'necessary info') */}
                <div className="space-y-2">
                  {stop.activities && stop.activities.map(act => (
                    <div key={act.id} className="flex justify-between items-center text-sm text-gray-400 pl-2 border-l-2 border-indigo-500/30">
                      <span>{act.name}</span>
                      <span className="text-green-400">${act.cost}</span>
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      setSelectedStop(stop);
                      fetchActivities(stop.city_id);
                      setShowAddActivity(true);
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 mt-2 font-medium"
                  >
                    + Add / Manage Activities (Optional)
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add Another Section Button */}
          <button
            onClick={() => setShowAddStop(true)}
            className="w-full py-4 border border-white/20 rounded-xl flex items-center justify-center gap-2 text-white hover:bg-white/5 transition-colors font-medium text-lg"
          >
            <span className="text-xl">+</span> Add another Section
          </button>

        </div>
      </main>

      {/* -- MODALS -- */}

      {/* Add Section Modal */}
      {showAddStop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-gray-700">
            <h3 className="text-xl font-bold mb-6 text-white border-b border-gray-800 pb-2">Add Section</h3>
            <form onSubmit={handleAddStop} className="space-y-4">

              {/* Section Title (Travel, Hotel, etc.) */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Section Title</label>
                <input
                  type="text"
                  value={newStop.name}
                  onChange={(e) => setNewStop({ ...newStop, name: e.target.value })}
                  className="w-full bg-slate-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Travel to Paris, Hotel Check-in, City Tour"
                  required
                />
              </div>

              {/* Location Selection (Required for logic, but can be secondary visually) */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Location / City</label>
                <select
                  value={newStop.city_id}
                  onChange={(e) => setNewStop({ ...newStop, city_id: e.target.value })}
                  className="w-full bg-slate-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                  required
                >
                  <option value="">Choose a destination...</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>{city.name}, {city.country}</option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newStop.start_date}
                    onChange={(e) => setNewStop({ ...newStop, start_date: e.target.value })}
                    className="w-full bg-slate-800 border border-gray-700 rounded-lg px-4 py-2 text-white [color-scheme:dark]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">End Date</label>
                  <input
                    type="date"
                    value={newStop.end_date}
                    onChange={(e) => setNewStop({ ...newStop, end_date: e.target.value })}
                    className="w-full bg-slate-800 border border-gray-700 rounded-lg px-4 py-2 text-white [color-scheme:dark]"
                    required
                  />
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Budget for this Section ($)</label>
                <input
                  type="number"
                  value={newStop.budget}
                  onChange={(e) => setNewStop({ ...newStop, budget: e.target.value })}
                  className="w-full bg-slate-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-600"
                  placeholder="0.00"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description / Notes</label>
                <textarea
                  value={newStop.notes}
                  onChange={(e) => setNewStop({ ...newStop, notes: e.target.value })}
                  className="w-full bg-slate-800 border border-gray-700 rounded-lg px-4 py-2 text-white h-20 resize-none"
                  placeholder="Details regarding this section..."
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddStop(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-semibold transition-colors text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-white text-black hover:bg-gray-200 rounded-xl text-sm font-bold transition-colors"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Activity Modal */}
      {showAddActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-gray-700 flex flex-col max-h-[80vh]">
            <h3 className="text-xl font-bold mb-4 text-white border-b border-gray-800 pb-2">Select Activity</h3>
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2 pt-2">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <button
                    key={activity.id}
                    onClick={() => handleAddActivity(activity.id)}
                    className="w-full text-left group bg-slate-800 hover:bg-slate-700 border border-gray-700 hover:border-indigo-500 rounded-lg p-4 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-200 group-hover:text-white">{activity.name}</h4>
                      <span className="text-green-400 text-sm font-mono">
                        ${activity.cost}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{activity.description}</p>
                  </button>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">No activities found for this location.</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowAddActivity(false)}
              className="mt-4 w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-semibold transition-colors text-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ItineraryBuilder;
