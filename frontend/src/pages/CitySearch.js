import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const CitySearch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get('tripId');

  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    country: '',
    region: '',
    sortBy: 'popularity'
  });

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    filterCities();
  }, [searchTerm, filters, cities]);

  const fetchCities = async () => {
    try {
      const response = await api.get('/cities');
      setCities(response.data.cities || []);
      setFilteredCities(response.data.cities || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cities:', error);
      setLoading(false);
    }
  };

  const filterCities = () => {
    let result = [...cities];

    // Search filter
    if (searchTerm) {
      result = result.filter(city =>
        city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Country filter
    if (filters.country) {
      result = result.filter(city => city.country === filters.country);
    }

    // Region filter
    if (filters.region) {
      result = result.filter(city => city.region === filters.region);
    }

    // Sorting
    switch (filters.sortBy) {
      case 'popularity':
        result.sort((a, b) => b.popularity_score - a.popularity_score);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'cost_low':
        result.sort((a, b) => a.cost_index - b.cost_index);
        break;
      case 'cost_high':
        result.sort((a, b) => b.cost_index - a.cost_index);
        break;
      default:
        break;
    }

    setFilteredCities(result);
  };

  const handleAddToTrip = async (cityId) => {
    if (!tripId) {
      // If no trip selected, maybe create a new one or show error
      // For now, let's just navigate to create trip or show alert
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
    <div className="min-h-screen bg-slate-900 text-white pb-10">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-indigo-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              ←
            </button>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Discover Destinations
            </h1>
          </div>
          {tripId && (
            <div className="text-sm text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Adding to current trip
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Search & Filters */}
        <div className="glass-card rounded-2xl p-6 mb-8 sticky top-20 z-30">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                placeholder="Search for cities, countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800/50 border border-gray-600 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="flex gap-4 overflow-x-auto pb-1 md:pb-0">
              <select
                value={filters.country}
                onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                className="bg-slate-800/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Countries</option>
                {uniqueCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="bg-slate-800/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="popularity">Most Popular</option>
                <option value="name">Name A-Z</option>
                <option value="cost_low">Cost: Low to High</option>
                <option value="cost_high">Cost: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCities.map((city) => (
            <div
              key={city.id}
              className="group glass-card rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
              onClick={() => tripId ? handleAddToTrip(city.id) : null}
            >
              <div className="h-48 relative overflow-hidden">
                <img
                  src={city.image_url || `https://source.unsplash.com/800x600/?${city.name},city`}
                  alt={city.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-80"></div>

                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold border border-white/10">
                  Example Cost: ${city.cost_index * 10}/day
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-bold text-white mb-1">{city.name}</h3>
                  <div className="flex items-center text-sm text-gray-300">
                    <span className="mr-2">📍 {city.country}</span>
                    <span>• {city.region}</span>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <p className="text-gray-400 text-sm line-clamp-3 mb-4 h-15">
                  {city.description || `Discover the beauty of ${city.name}, a vibrant city in ${city.country} known for its unique culture and attractions.`}
                </p>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700/50">
                  <div className="flex gap-2">
                    <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">
                      Attr: {Math.floor(city.popularity_score / 10)}+
                    </span>
                  </div>
                  {tripId && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToTrip(city.id);
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-semibold shadow-lg shadow-indigo-500/30 transition-colors"
                    >
                      Add to Trip
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCities.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🌍</div>
            <h3 className="text-2xl font-bold text-gray-300 mb-2">No destinations found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default CitySearch;
