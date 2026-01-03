import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripAPI, cityAPI, activityAPI } from '../services/api';

const CreateTrip = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Data States
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestedPlaces, setSuggestedPlaces] = useState([]);
  const [suggestedActivities, setSuggestedActivities] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchRequiredData();
  }, []);

  const fetchRequiredData = async () => {
    try {
      // Fetch all cities for autocomplete
      const citiesRes = await cityAPI.getAll();
      setCities(citiesRes.data.cities || []);

      // Fetch suggestions for the bottom section
      const placesRes = await cityAPI.getPopular(3);
      setSuggestedPlaces(placesRes.data.cities || []);

      const activitiesRes = await activityAPI.getAll({ limit: 6 });
      setSuggestedActivities(activitiesRes.data.activities || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, destination: value });

    if (value.length > 0) {
      const filtered = cities.filter(city =>
        city.name.toLowerCase().includes(value.toLowerCase()) ||
        city.country.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCities(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectCity = (cityName) => {
    setFormData({ ...formData, destination: cityName });
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const tripData = {
        name: formData.name,
        description: `Trip to ${formData.destination}`,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_public: false,
        destination: formData.destination
      };

      console.log('Creating trip with data:', tripData);
      const response = await tripAPI.create(tripData);
      console.log('Trip created response:', response);

      // Verify the trip ID exists before navigating
      const tripId = response.data.trip?.id || response.data.id;

      if (tripId) {
        // Handle city stop creation if we matched a city
        const selectedCity = cities.find(c => c.name.toLowerCase() === formData.destination.toLowerCase());

        if (selectedCity) {
          try {
            await tripAPI.addStop({
              trip_id: tripId,
              city_id: selectedCity.id,
              start_date: formData.start_date,
              end_date: formData.end_date,
              order_index: 0
            });
            console.log('Added stop for city:', selectedCity.name);
          } catch (stopErr) {
            console.error("Failed to add stop automatically:", stopErr);
            // Verify if we should show error or just continue
          }
        }

        navigate(`/itinerary/${tripId}/edit`);
      } else {
        throw new Error('No trip ID returned from server');
      }

    } catch (err) {
      console.error('Submit Error:', err);
      setError('Failed to create trip. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-indigo-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
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
              onClick={() => navigate('/dashboard')}
              className="hidden md:flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300 text-sm font-medium"
            >
              Cancel Plan
            </button>
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center text-white shadow-lg cursor-default">
              👤
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">

        {/* Form Container */}
        <div className="max-w-2xl mx-auto glass-card rounded-2xl p-8 mb-12 border border-white/10 shadow-2xl">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <span className="text-4xl">✈️</span> Plan a New Trip
          </h2>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Trip Name */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2 pl-1">
                Trip Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                placeholder="e.g., European Summer 2024"
                required
              />
            </div>

            {/* Select Place with Autocomplete */}
            <div className="relative">
              <label className="block text-gray-300 text-sm font-medium mb-2 pl-1">
                Select a Place *
              </label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handlePlaceChange}
                onFocus={() => formData.destination && setShowSuggestions(true)}
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                placeholder="Search for a destination..."
                required
                autoComplete="off"
              />

              {/* Autocomplete Dropdown */}
              {showSuggestions && filteredCities.length > 0 && (
                <div className="absolute z-50 left-0 right-0 mt-2 bg-slate-800 border border-white/10 rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                  {filteredCities.map((city) => (
                    <div
                      key={city.id}
                      onClick={() => selectCity(city.name)}
                      className="px-5 py-3 hover:bg-white/5 cursor-pointer flex items-center justify-between transition-colors border-b border-white/5 last:border-0"
                    >
                      <div>
                        <span className="text-white font-medium">{city.name}</span>
                        <span className="text-gray-400 text-sm ml-2">- {city.country}</span>
                      </div>
                      <span className="text-xl">✈️</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2 pl-1">
                Start Date *
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all [color-scheme:dark] shadow-inner"
                required
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2 pl-1">
                End Date *
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all [color-scheme:dark] shadow-inner"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              {loading ? 'Creating Adventure...' : 'Create Trip & Build Itinerary 🚀'}
            </button>
          </form>
        </div>

        {/* Suggestions Section (Below Form as per layout) */}
        <section className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <span className="text-3xl">💡</span> Suggestions for your trip
          </h3>

          {/* Places Grid */}
          <div>
            <h4 className="text-lg font-semibold text-gray-300 mb-4 px-1">Top Destinations</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {suggestedPlaces.map((city) => (
                <div
                  key={city.id}
                  onClick={() => selectCity(city.name)}
                  className="glass-card p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer group border border-transparent hover:border-indigo-500/30"
                >
                  <div className="w-full h-32 bg-slate-800 rounded-lg mb-3 overflow-hidden relative">
                    {city.image_url ? (
                      <img src={city.image_url} alt={city.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl bg-slate-800">🏙️</div>
                    )}
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                  </div>
                  <p className="font-bold text-white mb-0.5">{city.name}</p>
                  <p className="text-xs text-gray-400 uppercase tracking-widest">{city.country}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Activities Grid */}
          <div>
            <h4 className="text-lg font-semibold text-gray-300 mb-4 px-1">Popular Activities</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {suggestedActivities.slice(0, 6).map((activity) => (
                <div
                  key={activity.id}
                  className="glass-card p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer group border border-transparent hover:border-purple-500/30"
                >
                  <div className="w-full h-32 bg-slate-800 rounded-lg mb-3 overflow-hidden relative">
                    {activity.image_url ? (
                      <img src={activity.image_url} alt={activity.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl bg-slate-800">🎯</div>
                    )}
                  </div>
                  <p className="font-semibold text-white text-sm line-clamp-1 mb-1">{activity.name}</p>
                  <p className="text-xs font-mono text-green-400">${activity.cost}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default CreateTrip;
