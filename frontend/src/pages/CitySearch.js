import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api, { cityAPI, activityAPI, tripAPI } from '../services/api';

const CitySearch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get('tripId');

  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    country: '',
    region: '',
    sortBy: 'popularity'
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterCities();
  }, [searchTerm, filters, cities, activities]);
  // Added activities to dependency to re-filter when they load

  const fetchData = async () => {
    try {
      setLoading(true);
      const [citiesRes, activitiesRes] = await Promise.all([
        cityAPI.getAll(),
        activityAPI.getAll()
      ]);

      setCities(citiesRes.data.cities || []);
      setFilteredCities(citiesRes.data.cities || []);

      setActivities(activitiesRes.data.activities || []);
      setFilteredActivities(activitiesRes.data.activities || []);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const filterCities = () => {
    let result = [...cities];
    let activityResult = [...activities];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();

      // Filter Cities
      result = result.filter(city =>
        city.name.toLowerCase().includes(term) ||
        city.country.toLowerCase().includes(term)
      );

      // Filter Activities (Match Name, Category, OR City Name)
      activityResult = activityResult.filter(activity => {
        const activityCity = cities.find(c => c.id === activity.city_id);
        const cityName = activityCity ? activityCity.name.toLowerCase() : '';

        return (
          activity.name.toLowerCase().includes(term) ||
          activity.category.toLowerCase().includes(term) ||
          cityName.includes(term)
        );
      });
    }

    // Country filter
    if (filters.country) {
      result = result.filter(city => city.country === filters.country);
      activityResult = activityResult.filter(activity => {
        const activityCity = cities.find(c => c.id === activity.city_id);
        return activityCity && activityCity.country === filters.country;
      });
    }

    // Region filter
    if (filters.region) {
      result = result.filter(city => city.region === filters.region);
    }

    // Sorting
    const sortFn = (a, b) => {
      if (filters.sortBy === 'popularity') return (b.popularity_score || 0) - (a.popularity_score || 0);
      if (filters.sortBy === 'name') return a.name.localeCompare(b.name);
      if (filters.sortBy === 'cost_low') return (a.cost_index || a.cost || 0) - (b.cost_index || b.cost || 0);
      return 0;
    };

    result.sort(sortFn);
    // For activities, we might not have popularity score, using cost or default
    activityResult.sort((a, b) => (a.cost || 0) - (b.cost || 0));

    setFilteredCities(result);
    setFilteredActivities(activityResult);
  };

  const handleAddToTrip = async (cityId) => {
    if (!tripId) {
      if (window.confirm('No trip selected. Would you like to create a new trip?')) {
        navigate('/create-trip');
      }
      return;
    }
    try {
      await api.post(`/trips/${tripId}/stops`, {
        city_id: cityId,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        order_index: 0
      });
      navigate(`/itinerary/${tripId}/edit`);
    } catch (error) {
      console.error('Error adding city to trip:', error);
    }
  };

  const uniqueCountries = [...new Set(cities.map(c => c.country))].sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading destinations...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-10 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-white/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
            >
              ←
            </button>
            <h1 className="text-xl font-bold text-white">
              GlobalTrotter Search
            </h1>
          </div>
          {tripId && (
            <div className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20 uppercase tracking-wide">
              Adding to Trip
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Unified Search & Controls */}
        <div className="mb-8 p-1">
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Paragliding, Paris..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 focus:border-white/50 rounded-lg px-4 py-2.5 text-white focus:outline-none transition-colors placeholder-gray-500"
              />
            </div>

            <div className="flex gap-2">
              <button className="px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">Group by</button>
              <button className="px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">Filter</button>
              <select
                className="px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors appearance-none cursor-pointer focus:outline-none"
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              >
                <option value="popularity">Sort by...</option>
                <option value="name">Name</option>
                <option value="cost_low">Cost (Low)</option>
              </select>
            </div>
          </div>

          <h2 className="text-xl font-bold mb-4 border-b border-white/10 pb-2">Results</h2>

          <div className="space-y-3">
            {/* Cities List */}
            {filteredCities.map((city) => (
              <div key={`city-${city.id}`} className="bg-slate-800 border border-white/10 rounded-lg p-4 hover:border-white/30 transition-all flex flex-col sm:flex-row gap-4 items-center cursor-pointer group" onClick={() => tripId ? handleAddToTrip(city.id) : null}>
                {/* Compact Image */}
                <div className="w-full sm:w-32 h-20 bg-slate-700 rounded-md overflow-hidden flex-shrink-0 relative">
                  <img
                    src={city.image_url || `https://source.unsplash.com/random/400x300/?${city.name},city`}
                    alt={city.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 w-full text-center sm:text-left">
                  <h3 className="text-lg font-bold text-white mb-1">{city.name}, {city.country}</h3>
                  <p className="text-gray-400 text-sm line-clamp-1">{city.description}</p>
                </div>

                {/* Checkmark style action for simplicity */}
                <div className="flex-shrink-0">
                  {tripId ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAddToTrip(city.id); }}
                      className="px-5 py-2 bg-white text-slate-900 hover:bg-gray-200 text-sm font-bold rounded shadow-sm"
                    >
                      Add Destination
                    </button>
                  ) : (
                    <span className="text-xs font-mono text-gray-500 bg-slate-900 px-2 py-1 rounded border border-white/5">CITY</span>
                  )}
                </div>
              </div>
            ))}

            {/* Activities List */}
            {filteredActivities.map((activity) => (
              <div key={`activity-${activity.id}`} className="bg-slate-800 border border-white/10 rounded-lg p-4 hover:border-indigo-500/50 transition-all flex flex-col sm:flex-row gap-4 items-center group">
                <div className="w-full sm:w-32 h-20 bg-slate-700 rounded-md overflow-hidden flex-shrink-0 relative">
                  <img
                    src={activity.image_url || `https://source.unsplash.com/random/400x300/?${activity.category},${activity.name}`}
                    alt={activity.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                <div className="flex-1 w-full text-center sm:text-left">
                  <h3 className="text-lg font-bold text-white mb-1">{activity.name}</h3>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-gray-400">
                    <span>{activity.category}</span>
                    <span>•</span>
                    <span>${parseFloat(activity.cost)}</span>
                    <span>•</span>
                    <span>{activity.duration ? `${Math.floor(activity.duration / 60)}h` : 'Flexible'}</span>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {tripId ? (
                    <button onClick={() => { }} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded shadow-sm">
                      Add Option
                    </button>
                  ) : (
                    <span className="text-xs font-mono text-indigo-300 bg-indigo-900/20 px-2 py-1 rounded border border-indigo-500/20">OPTION</span>
                  )}
                </div>
              </div>
            ))}

            {filteredCities.length === 0 && filteredActivities.length === 0 && (
              <div className="py-12 text-center opacity-50 border border-dashed border-white/10 rounded-lg">
                <p className="text-lg">No options found for "{searchTerm}"</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CitySearch;
