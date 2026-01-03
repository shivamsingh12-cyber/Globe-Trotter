import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const UserProfile = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    photo_url: ''
  });
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchProfile();
    fetchUserTrips();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      setProfile(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const fetchUserTrips = async () => {
    try {
      const response = await api.get('/trips');
      // Backend returns { trips: [...] } or just [...]
      if (Array.isArray(response.data)) {
        setTrips(response.data);
      } else if (response.data && Array.isArray(response.data.trips)) {
        setTrips(response.data.trips);
      } else {
        console.error('Unexpected trips response format:', response.data);
        setTrips([]);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
      setTrips([]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/auth/profile', profile);
      setEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
    setSaving(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePhotoUpload = () => {
    // Determine how to handle photo upload - for now, just a placeholder action
    alert('Photo upload functionality would go here.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-blue-400 animate-pulse">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-blue-500/30">

      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[10%] right-[20%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              ←
            </button>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Profile & Settings
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="relative z-10 pt-28 pb-12 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-2xl p-4 sticky top-28 space-y-2">
              {['profile', 'trips', 'security', 'notifications'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all capitalize font-medium ${activeTab === tab
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Profile Header Card */}
                <div className="glass-card rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>

                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full border-4 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden shadow-2xl relative z-10">
                      {profile.photo_url ? (
                        <img src={profile.photo_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-4xl font-bold text-gray-400">{profile.first_name?.[0]}</div>
                      )}
                    </div>
                    {editing && (
                      <button
                        onClick={handlePhotoUpload}
                        className="absolute bottom-0 right-0 z-20 bg-blue-600 p-2 rounded-full text-white shadow-lg transform translate-x-1/4 translate-y-1/4 hover:scale-110 transition-transform"
                      >
                        📷
                      </button>
                    )}
                  </div>

                  <div className="flex-1 text-center md:text-left relative z-10 pt-4 md:pt-0">
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {profile.first_name} {profile.last_name}
                    </h2>
                    <p className="text-gray-400 flex items-center justify-center md:justify-start gap-2">
                      📧 {profile.email}
                    </p>
                    <p className="text-gray-400 flex items-center justify-center md:justify-start gap-2 mt-1">
                      📍 {profile.city && profile.country ? `${profile.city}, ${profile.country}` : 'Location not set'}
                    </p>
                  </div>

                  <button
                    onClick={() => setEditing(!editing)}
                    className={`px-6 py-2 rounded-xl font-medium transition-all relative z-10 ${editing
                      ? 'bg-white/10 text-white hover:bg-white/20'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20'
                      }`}
                  >
                    {editing ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>

                {/* Edit Form */}
                {editing && (
                  <div className="glass-card rounded-2xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      ✏️ Edit Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">First Name</label>
                        <input
                          type="text"
                          value={profile.first_name}
                          onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                          className="glass-input w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-gray-700 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">Last Name</label>
                        <input
                          type="text"
                          value={profile.last_name}
                          onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                          className="glass-input w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-gray-700 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">Phone</label>
                        <input
                          type="tel"
                          value={profile.phone || ''}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          className="glass-input w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-gray-700 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">City</label>
                        <input
                          type="text"
                          value={profile.city || ''}
                          onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                          className="glass-input w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-gray-700 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">Country</label>
                        <input
                          type="text"
                          value={profile.country || ''}
                          onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                          className="glass-input w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-gray-700 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="mt-8 flex justify-end">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transform active:scale-95 transition-all"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Stats / Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-bold text-white mb-2">{trips.length}</span>
                    <span className="text-sm text-gray-400">Total Trips</span>
                  </div>
                  <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-bold text-white mb-2">{trips.filter(t => t.status === 'completed').length}</span>
                    <span className="text-sm text-gray-400">Completed Adventures</span>
                  </div>
                  <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-bold text-white mb-2">0</span>
                    <span className="text-sm text-gray-400">Countries Visited</span>
                  </div>
                </div>
              </div>
            )}

            {/* Trips Tab */}
            {activeTab === 'trips' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <h3 className="text-xl font-bold mb-4">My Journeys</h3>
                <div className="grid grid-cols-1 gap-4">
                  {trips.length > 0 ? (
                    trips.map(trip => (
                      <div key={trip.id} className="glass-card p-4 rounded-2xl flex gap-4 items-center hover:bg-white/5 transition-colors cursor-pointer" onClick={() => navigate(`/itinerary/${trip.id}`)}>
                        <div className="w-24 h-24 rounded-xl bg-slate-800 relative overflow-hidden flex-shrink-0">
                          <img src={`https://source.unsplash.com/random/200x200/?travel`} alt="Trip" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-white">{trip.name}</h4>
                          <p className="text-sm text-gray-400">{new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}</p>
                          <div className="mt-2 text-xs">
                            <span className={`px-2 py-1 rounded-full ${trip.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                              {trip.status}
                            </span>
                          </div>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-white">
                          ➔
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-gray-400">No trips found. Start planning!</div>
                  )}
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="glass-card p-8 rounded-2xl animate-in fade-in duration-500">
                <h3 className="text-xl font-bold mb-6">Security Settings</h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-6 border-b border-white/5">
                    <div>
                      <h4 className="font-medium text-white">Password</h4>
                      <p className="text-sm text-gray-400">Last changed 3 months ago</p>
                    </div>
                    <button className="px-4 py-2 border border-gray-600 rounded-lg text-sm hover:bg-white/5">Change</button>
                  </div>
                  <div className="flex justify-between items-center pb-6 border-b border-white/5">
                    <div>
                      <h4 className="font-medium text-white">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-400">Add an extra layer of security</p>
                    </div>
                    <div className="w-12 h-6 bg-slate-700 rounded-full relative cursor-pointer">
                      <div className="w-4 h-4 bg-gray-500 rounded-full absolute top-1 left-1"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="glass-card p-8 rounded-2xl animate-in fade-in duration-500">
                <h3 className="text-xl font-bold mb-6">Notification Preferences</h3>
                <div className="space-y-4">
                  {['Email Newsletters', 'Trip Reminders', 'Special Offers', 'New Features'].map(item => (
                    <div key={item} className="flex justify-between items-center p-3 hover:bg-white/5 rounded-xl transition-colors">
                      <span className="text-gray-300">{item}</span>
                      <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                        <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
