import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Community = () => {
  const navigate = useNavigate();
  const [publicTrips, setPublicTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    sortBy: 'recent'
  });

  useEffect(() => {
    fetchPublicTrips();
  }, []);

  const fetchPublicTrips = async () => {
    try {
      const response = await api.get('/trips/public');
      setPublicTrips(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching public trips:', error);
      // Mock data for demonstration
      setPublicTrips([
        {
          id: 1,
          name: 'European Adventure',
          description: 'A 2-week journey through Paris, Rome, and Barcelona',
          user_name: 'John Doe',
          start_date: '2024-06-01',
          end_date: '2024-06-15',
          stops_count: 3,
          total_budget: 2500
        },
        {
          id: 2,
          name: 'Asian Discovery',
          description: 'Exploring Tokyo, Bangkok, and Singapore',
          user_name: 'Jane Smith',
          start_date: '2024-07-10',
          end_date: '2024-07-25',
          stops_count: 3,
          total_budget: 3000
        },
        {
          id: 3,
          name: 'US Road Trip',
          description: 'Cross-country adventure from NYC to LA',
          user_name: 'Mike Johnson',
          start_date: '2024-08-01',
          end_date: '2024-08-20',
          stops_count: 5,
          total_budget: 4000
        }
      ]);
      setLoading(false);
    }
  };

  const handleCopyTrip = async (tripId) => {
    try {
      await api.post(`/trips/${tripId}/copy`);
      alert('Trip copied to your account!');
      navigate('/my-trips');
    } catch (error) {
      console.error('Error copying trip:', error);
      alert('Please login to copy this trip');
    }
  };

  const filteredTrips = publicTrips.filter(trip =>
    trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (trip.description && trip.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading community trips...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-white"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold">GlobeTrotter</h1>
          </div>
          <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Community tab Screen</h2>

        {/* Search and Filters */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search bar ......"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400"
              />
            </div>
            <button className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white">
              Group by
            </button>
            <button className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white">
              Filter
            </button>
            <button className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white">
              Sort by...
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="bg-gray-700 rounded-lg p-4 mb-6 text-sm text-gray-300">
          <p className="font-semibold mb-2">Community section where all the users can share their experience about a certain trip or activity.</p>
          <p>Using the search, groupby or filter and sortby option, the user can narrow down the result that he is looking for...</p>
        </div>

        {/* Community Tab Content */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Community tab</h3>
          
          <div className="space-y-4">
            {filteredTrips.length > 0 ? (
              filteredTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="flex items-start space-x-4 bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
                >
                  {/* User Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-500 rounded-full"></div>
                  </div>

                  {/* Trip Content */}
                  <div className="flex-1">
                    <div className="bg-gray-600 rounded-lg p-4">
                      <h4 className="font-semibold text-lg">{trip.name}</h4>
                      <p className="text-gray-400 text-sm mt-1">by {trip.user_name}</p>
                      <p className="text-gray-300 mt-2">{trip.description}</p>
                      
                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-400">
                        <span>📅 {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}</span>
                        <span>📍 {trip.stops_count} stops</span>
                        <span>💰 ${trip.total_budget}</span>
                      </div>

                      <div className="flex space-x-3 mt-4">
                        <button
                          onClick={() => navigate(`/trip/${trip.id}/public`)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
                        >
                          View Itinerary
                        </button>
                        <button
                          onClick={() => handleCopyTrip(trip.id)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm"
                        >
                          Copy Trip
                        </button>
                        <button className="px-4 py-2 bg-gray-500 hover:bg-gray-400 rounded-lg text-sm">
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-8">
                No public trips found
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Community;
