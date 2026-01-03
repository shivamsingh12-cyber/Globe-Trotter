import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ActivitySearch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get('tripId');
  const stopId = searchParams.get('stopId');
  const cityId = searchParams.get('cityId');
  const { user } = useAuth();

  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(500); // Max price slider
  const [filters, setFilters] = useState({
    sortBy: 'popularity'
  });

  useEffect(() => {
    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityId]);

  useEffect(() => {
    filterActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, activeCategory, priceRange, filters, activities]);

  const fetchActivities = async () => {
    try {
      const url = cityId ? `/activities?city_id=${cityId}` : '/activities';
      const response = await api.get(url);
      setActivities(response.data.activities || []);
      setFilteredActivities(response.data.activities || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setLoading(false);
    }
  };

  const filterActivities = () => {
    let result = [...activities];

    // Search filter
    if (searchTerm) {
      result = result.filter(activity =>
        activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (activity.description && activity.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (activeCategory !== 'All') {
      result = result.filter(activity => activity.category === activeCategory);
    }

    // Price Filter
    result = result.filter(activity => parseFloat(activity.cost) <= priceRange);

    // Sorting
    switch (filters.sortBy) {
      case 'cost_low':
        result.sort((a, b) => parseFloat(a.cost) - parseFloat(b.cost));
        break;
      case 'cost_high':
        result.sort((a, b) => parseFloat(b.cost) - parseFloat(a.cost));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'duration':
        result.sort((a, b) => (a.duration || 0) - (b.duration || 0));
        break;
      default:
        // Default popularity random shuffle for demo feel or maintain order
        break;
    }

    setFilteredActivities(result);
  };

  const handleAddToStop = async (activityId) => {
    if (!tripId || !stopId) {
      // If browsing without a specific trip context, maybe ask to create one or select one (future feature)
      alert('Please start a trip plan to add activities.');
      return;
    }
    try {
      await api.post(`/trips/${tripId}/stops/${stopId}/activities`, {
        activity_id: activityId
      });
      // Add a small toast or visual feedback here ideally
      navigate(`/itinerary/${tripId}`);
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  const categories = ['All', ...new Set(activities.map(a => a.category))].sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-blue-400 animate-pulse">Discovering experiences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              ←
            </button>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Explore Activities
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-800/50 rounded-full px-4 py-2 border border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold">
                {user?.first_name?.[0] || 'U'}
              </div>
              <span className="text-sm font-medium text-gray-300 hidden md:block">
                {user?.first_name || 'User'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-28 pb-12 px-6 max-w-7xl mx-auto">
        {/* Search & Filter Bar */}
        <div className="glass-card p-6 rounded-2xl mb-8 border border-white/5">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search adventures, food, culture..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-input w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/50 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-500"
              />
            </div>

            {/* Quick Categories */}
            <div className="flex overflow-x-auto gap-2 max-w-full pb-2 md:pb-0 no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-white'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort & Price */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex flex-col w-32">
                <label className="text-xs text-gray-400 mb-1">Max Cost: ${priceRange}</label>
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="10"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="glass-input px-4 py-2 rounded-xl bg-slate-800/50 border border-gray-700 focus:border-blue-500 outline-none text-sm text-gray-300"
              >
                <option value="popularity">Popularity</option>
                <option value="cost_low">Price: Low to High</option>
                <option value="cost_high">Price: High to Low</option>
                <option value="duration">Duration</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.length > 0 ? (
            filteredActivities.map((activity) => (
              <div key={activity.id} className="group relative glass-card rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
                {/* Image Section */}
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={activity.image_url || `https://source.unsplash.com/random/800x600/?${activity.category},${activity.name}`}
                    alt={activity.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>
                  <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-medium text-white">
                    {activity.category}
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-xl font-bold text-white shadow-black drop-shadow-lg">{activity.name}</h3>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5">
                  {activity.description && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2 h-10">{activity.description}</p>
                  )}

                  <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 uppercase tracking-widest">Cost</span>
                      <span className="text-lg font-bold text-green-400">
                        {parseFloat(activity.cost) === 0 ? 'Free' : `$${parseFloat(activity.cost)}`}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-500 uppercase tracking-widest">Duration</span>
                      <span className="text-sm text-gray-300">
                        {activity.duration ? `${Math.floor(activity.duration / 60)}h ${activity.duration % 60}m` : 'Flexible'}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  {tripId && stopId && (
                    <button
                      onClick={() => handleAddToStop(activity.id)}
                      className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-3 rounded-xl shadow-lg shadow-blue-500/20 transform active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                    >
                      <span>+</span> Add to Itinerary
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="text-6xl mb-4 opacity-50">🔭</div>
              <h3 className="text-2xl font-bold text-gray-300 mb-2">No activities found</h3>
              <p className="text-gray-500">Try adjusting your filters or price range</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ActivitySearch;
