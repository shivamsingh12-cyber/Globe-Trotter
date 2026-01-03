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

      <main className="relative z-10 pt-28 pb-12 px-6 max-w-5xl mx-auto">
        {/* Search & Control Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Paragliding, Scuba Diving..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full glass-input bg-white/5 border border-white/20 rounded-xl px-4 py-3 pl-12 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-all font-medium"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            <button className="glass-card px-4 py-3 rounded-xl border border-white/20 hover:bg-white/10 transition-colors text-sm font-bold text-white whitespace-nowrap flex items-center gap-2">
              Group by <span className="text-gray-400 text-xs">▼</span>
            </button>
            <div className="relative group">
              <button className="glass-card px-4 py-3 rounded-xl border border-white/20 hover:bg-white/10 transition-colors text-sm font-bold text-white whitespace-nowrap flex items-center gap-2">
                Filter <span className="text-gray-400 text-xs">▼</span>
              </button>
              {/* Dropdown for filters could go here */}
            </div>

            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="glass-card px-4 py-3 rounded-xl border border-white/20 hover:bg-white/10 transition-colors text-sm font-bold text-white whitespace-nowrap appearance-none pr-8 cursor-pointer bg-transparent focus:bg-slate-800"
              >
                <option value="popularity">Sort by: Popularity</option>
                <option value="cost_low">Sort by: Price (Low)</option>
                <option value="cost_high">Sort by: Price (High)</option>
                <option value="duration">Sort by: Duration</option>
              </select>
            </div>
          </div>
        </div>

        {/* Categories Pills (Optional - kept for usability but styled minimally) */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar opacity-80 hover:opacity-100 transition-opacity">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border ${activeCategory === cat ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-gray-600 hover:border-gray-400'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results List (Vertical) */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">Results</h2>
          {filteredActivities.length > 0 ? (
            filteredActivities.map((activity) => (
              <div key={activity.id} className="glass-card p-4 rounded-xl border border-white/10 hover:border-indigo-500/50 hover:bg-white/5 transition-all group flex flex-col md:flex-row gap-6">

                {/* Image Thumbnail */}
                <div className="w-full md:w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden relative bg-slate-800">
                  <img
                    src={activity.image_url || `https://source.unsplash.com/random/400x300/?${activity.category},${activity.name}`}
                    alt={activity.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">{activity.name}</h3>
                      <span className="text-lg font-bold text-emerald-400">${parseFloat(activity.cost)}</span>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-3 max-w-2xl">{activity.description || 'Experience this amazing activity with professional guides and unforgettable views.'}</p>

                    <div className="flex flex-wrap gap-4 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                      <span className="flex items-center gap-1">⏱ {Math.floor(activity.duration / 60)}h {activity.duration % 60}m</span>
                      <span className="flex items-center gap-1">🏷 {activity.category}</span>
                      <span className="flex items-center gap-1">⭐ {activity.rating || 'New'}</span>
                    </div>
                  </div>

                  <div className="mt-4 md:mt-0 flex justify-end">
                    {tripId && stopId && (
                      <button
                        onClick={() => handleAddToStop(activity.id)}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-indigo-500/20 transition-all transform active:scale-95"
                      >
                        + Add to Itinerary
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="border border-dashed border-gray-700 rounded-xl p-12 text-center">
              <p className="text-gray-500">No activities found matching your criteria.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ActivitySearch;
