import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ItineraryBuilder = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [stops, setStops] = useState([]);
  const [cities, setCities] = useState([]); // List of available cities for dropdown
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Track edits locally before saving
  const [editingStops, setEditingStops] = useState({});

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
      setStops(response.data.trip.stops || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching trip:', error);
      setLoading(false);
    }
  }, [tripId]);

  const fetchCities = useCallback(async () => {
    try {
      const response = await api.get('/cities');
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

      // Immediately update UI with the new section
      const addedStopRaw = response.data.stop || response.data;
      // Enrich with city name if possible, to avoid blank location name
      const city = cities.find(c => c.id === parseInt(newStop.city_id));
      const addedStop = { ...addedStopRaw, city_name: city ? city.name : '' };

      setStops(prevStops => [...prevStops, addedStop]);

      setShowAddStop(false);
      setNewStop({ city_id: '', name: '', budget: '', start_date: '', end_date: '', notes: '' });

      setNewStop({ city_id: '', name: '', budget: '', start_date: '', end_date: '', notes: '' });
    } catch (error) {
      console.error('Error adding section:', error);
      alert("Failed to add section. Please try again.");
    }
  };

  const handleDeleteStop = async (stopId) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      try {
        await api.delete(`/trips/${tripId}/stops/${stopId}`);
        // Immediately remove from UI
        setStops(prevStops => prevStops.filter(s => s.id !== stopId));
        // Also clear from edit state if it exists
        setEditingStops(prev => {
          const newState = { ...prev };
          delete newState[stopId];
          return newState;
        });
      } catch (error) {
        console.error('Error deleting stop:', error);
        alert("Failed to delete section.");
      }
    }
  };

  const handleAddActivity = async (activityId) => {
    if (!selectedStop) return;
    try {
      await api.post(`/trips/${tripId}/stops/${selectedStop.id}/activities`, {
        activity_id: activityId
      });
      fetchTripData();
      setShowAddActivity(false);
      alert("Activity added!");
    } catch (error) {
      console.error('Error adding activity:', error);
      alert("Failed to add activity.");
    }
  };

  // Handle local edits
  const handleStopChange = (stopId, field, value) => {
    setEditingStops(prev => ({
      ...prev,
      [stopId]: {
        ...stops.find(s => s.id === stopId),
        ...(prev[stopId] || {}),
        [field]: value
      }
    }));
  };

  const handleSaveStop = async (stopId) => {
    const updatedData = editingStops[stopId];
    if (!updatedData) {
      // Even if no changes, maybe user clicked save just to be sure.
      return;
    }

    try {
      await api.put(`/trips/${tripId}/stops/${stopId}`, updatedData);
      // Clear dirty state for this stop
      setEditingStops(prev => {
        const newState = { ...prev };
        delete newState[stopId];
        return newState;
      });
      fetchTripData();
      alert("Section saved successfully! ✅");
    } catch (error) {
      console.error("Failed to save stop", error);
      alert("Failed to save changes. ❌");
    }
  };

  // Helper to retrieve display value (edit state OR prop)
  const getStopValue = (stop, field) => {
    // If we have a pending edit, return that. Otherwise return persistent data.
    if (editingStops[stop.id] && editingStops[stop.id][field] !== undefined) {
      return editingStops[stop.id][field];
    }
    // Handle date formatting for inputs
    if (field === 'start_date' || field === 'end_date') {
      const val = stop[field];
      if (!val) return '';
      return val.split('T')[0]; // Format for date input
    }
    return stop[field] || '';
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

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-indigo-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-sm">🌍</span>
            </div>
            <h1 className="text-xl font-bold text-white">GlobeTrotter Builder</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/itinerary/${tripId}`)}
              className="hidden md:flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-full transition-colors text-white font-semibold text-sm shadow-lg shadow-indigo-600/30"
            >
              Finish & View Itinerary
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
            const isDirty = !!editingStops[stop.id];

            return (
              <div key={stop.id} className={`glass-card rounded-xl border ${isDirty ? 'border-yellow-500/50' : 'border-white/10'} p-6 shadow-lg transition-all group`}>

                {/* Editable Header */}
                <div className="mb-6 flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1 block">Section Title</label>
                    <input
                      className="bg-transparent border-b border-gray-600 focus:border-indigo-500 w-full text-xl font-bold text-white focus:outline-none pb-1"
                      value={getStopValue(stop, 'name')}
                      placeholder="e.g. Arrival in Paris"
                      onChange={(e) => handleStopChange(stop.id, 'name', e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() => handleDeleteStop(stop.id)}
                    className="text-gray-600 hover:text-red-400 p-2 rounded-full hover:bg-white/5 transition-colors"
                    title="Delete Section"
                  >
                    ✕
                  </button>
                </div>

                {/* Editable Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1 block">Date Range</label>
                    <div className="flex gap-2">
                      <input type="date"
                        className="bg-slate-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm w-full text-white focus:border-indigo-500 focus:outline-none [color-scheme:dark]"
                        value={getStopValue(stop, 'start_date')}
                        onChange={(e) => handleStopChange(stop.id, 'start_date', e.target.value)}
                      />
                      <input type="date"
                        className="bg-slate-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm w-full text-white focus:border-indigo-500 focus:outline-none [color-scheme:dark]"
                        value={getStopValue(stop, 'end_date')}
                        onChange={(e) => handleStopChange(stop.id, 'end_date', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1 block">Budget ($)</label>
                    <input type="number"
                      className="bg-slate-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm w-full text-white focus:border-indigo-500 focus:outline-none"
                      value={getStopValue(stop, 'budget')}
                      onChange={(e) => handleStopChange(stop.id, 'budget', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1 block">Notes / Description</label>
                  <textarea
                    className="w-full bg-slate-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:border-indigo-500 focus:outline-none min-h-[80px]"
                    value={getStopValue(stop, 'notes')}
                    onChange={(e) => handleStopChange(stop.id, 'notes', e.target.value)}
                    placeholder="Add details about this section..."
                  />
                </div>

                {/* Activities & Save Row */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-t border-white/5 pt-4">
                  <div className="w-full md:w-auto">
                    <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">Activities ({stop.activities?.length || 0})</h5>
                    <div className="space-y-1 mb-2">
                      {stop.activities && stop.activities.map(act => (
                        <div key={act.id} className="text-xs text-indigo-300 flex justify-between w-full md:w-[200px]">
                          <span>• {act.name}</span>
                          <span>${act.cost}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedStop(stop);
                        fetchActivities(stop.city_id); // Assuming city_id is still on stop object
                        setShowAddActivity(true);
                      }}
                      className="text-xs text-indigo-400 hover:text-white font-medium flex items-center gap-1"
                    >
                      + Add Activity
                    </button>
                  </div>

                  <button
                    onClick={() => handleSaveStop(stop.id)}
                    disabled={!isDirty}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg transition-all flex items-center gap-2
                            ${isDirty
                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/20 translate-y-0 opacity-100'
                        : 'bg-slate-700 text-gray-400 cursor-not-allowed opacity-50'
                      }`}
                  >
                    {isDirty ? '💾 Save Changes' : 'Saved'}
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
            <span className="text-2xl">+</span> Add another Section
          </button>

        </div>
      </main>

      {/* -- MODALS -- */}

      {/* Add Section Modal */}
      {showAddStop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-gray-700">
            <h3 className="text-xl font-bold mb-6 text-white border-b border-gray-800 pb-2">Add New Section</h3>
            <form onSubmit={handleAddStop} className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Section Title</label>
                <input
                  type="text"
                  value={newStop.name}
                  onChange={(e) => setNewStop({ ...newStop, name: e.target.value })}
                  className="w-full bg-slate-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-indigo-500"
                  placeholder="e.g. Flight to Paris"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Location</label>
                <select
                  value={newStop.city_id}
                  onChange={(e) => setNewStop({ ...newStop, city_id: e.target.value })}
                  className="w-full bg-slate-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-indigo-500"
                  required
                >
                  <option value="">Choose a destination...</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>{city.name}, {city.country}</option>
                  ))}
                </select>
              </div>

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

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Budget ($)</label>
                <input
                  type="number"
                  value={newStop.budget}
                  onChange={(e) => setNewStop({ ...newStop, budget: e.target.value })}
                  className="w-full bg-slate-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-indigo-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
                <textarea
                  value={newStop.notes}
                  onChange={(e) => setNewStop({ ...newStop, notes: e.target.value })}
                  className="w-full bg-slate-800 border border-gray-700 rounded-lg px-4 py-2 text-white h-20 resize-none outline-none focus:border-indigo-500"
                  placeholder="Details..."
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
                  Create Section
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
