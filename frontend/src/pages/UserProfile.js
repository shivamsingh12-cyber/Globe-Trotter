import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getTripImage } from '../utils/imageUtils';

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
      setProfile(response.data.user);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const fetchUserTrips = async () => {
    try {
      const response = await api.get('/trips');
      setTrips(response.data.trips || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
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

  /* Logic for categorization */
  const now = new Date();
  const preplannedTrips = trips.filter(t => new Date(t.end_date) >= now); // Upcoming + Ongoing
  const previousTrips = trips.filter(t => new Date(t.end_date) < now);   // Completed

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
              GlobeTrotter
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

      <main className="relative z-10 pt-28 pb-20 px-6 max-w-7xl mx-auto space-y-16">

        {/* Section 1: User Details */}
        <section className="glass-card rounded-3xl p-8 flex flex-col md:flex-row gap-8 relative overflow-hidden border border-white/10 shadow-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

          {/* Photo */}
          <div className="flex-shrink-0 flex items-center justify-center md:items-start relative z-10">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-slate-700/50 bg-slate-800 flex items-center justify-center overflow-hidden shadow-2xl relative">
                {profile.photo_url ? (
                  <img src={profile.photo_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-5xl font-bold text-white shadow-inner">
                    {profile.first_name?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              {!editing && (
                <button onClick={() => setEditing(true)} className="absolute bottom-1 right-1 z-20 bg-indigo-600 p-2.5 rounded-full text-white shadow-lg hover:scale-110 transition-all border-2 border-slate-900 cursor-pointer">
                  <span role="img" aria-label="edit">✏️</span>
                </button>
              )}
            </div>
          </div>

          {/* Details / Edit Form */}
          <div className="flex-1 relative z-10">
            <div className="flex justify-between items-start mb-8">
              <h2 className="text-3xl font-bold text-white tracking-tight">User Profile</h2>
              {editing && (
                <div className="flex gap-3">
                  <button onClick={() => setEditing(false)} className="px-5 py-2 text-sm text-gray-300 hover:text-white transition-colors bg-white/5 rounded-lg">Cancel</button>
                  <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            {editing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <label className="text-xs text-indigo-300 uppercase font-bold tracking-wider">First Name</label>
                  <input type="text" value={profile.first_name} onChange={(e) => setProfile({ ...profile, first_name: e.target.value })} className="glass-input w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 focus:border-indigo-500 outline-none text-white transition-all focus:bg-black/40" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-indigo-300 uppercase font-bold tracking-wider">Last Name</label>
                  <input type="text" value={profile.last_name} onChange={(e) => setProfile({ ...profile, last_name: e.target.value })} className="glass-input w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 focus:border-indigo-500 outline-none text-white transition-all focus:bg-black/40" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-indigo-300 uppercase font-bold tracking-wider">Email</label>
                  <input type="email" value={profile.email} disabled className="glass-input w-full px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-gray-500 cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-indigo-300 uppercase font-bold tracking-wider">Phone</label>
                  <input type="tel" value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="glass-input w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 focus:border-indigo-500 outline-none text-white transition-all focus:bg-black/40" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-indigo-300 uppercase font-bold tracking-wider">City</label>
                  <input type="text" value={profile.city || ''} onChange={(e) => setProfile({ ...profile, city: e.target.value })} className="glass-input w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 focus:border-indigo-500 outline-none text-white transition-all focus:bg-black/40" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-indigo-300 uppercase font-bold tracking-wider">Country</label>
                  <input type="text" value={profile.country || ''} onChange={(e) => setProfile({ ...profile, country: e.target.value })} className="glass-input w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 focus:border-indigo-500 outline-none text-white transition-all focus:bg-black/40" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                <div className="space-y-1">
                  <h3 className="text-xs text-indigo-300 uppercase font-bold tracking-wider">Full Name</h3>
                  <p className="text-xl font-medium text-white">{profile.first_name} {profile.last_name}</p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs text-indigo-300 uppercase font-bold tracking-wider">Email</h3>
                  <p className="text-xl font-medium text-white">{profile.email}</p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs text-indigo-300 uppercase font-bold tracking-wider">Location</h3>
                  <p className="text-xl font-medium text-white flex items-center gap-2">
                    <span className="text-red-400">📍</span> {profile.city && profile.country ? `${profile.city}, ${profile.country}` : <span className="text-gray-500 text-lg italic font-normal">Not set</span>}
                  </p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs text-indigo-300 uppercase font-bold tracking-wider">Status</h3>
                  <div className="flex gap-6 items-baseline">
                    <div className="text-xl font-medium text-white">
                      <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">{trips.length}</span> <span className="text-sm text-gray-400 font-normal">Trips</span>
                    </div>
                    <div className="text-xl font-medium text-white">
                      <span className="text-3xl font-bold text-white">{previousTrips.length}</span> <span className="text-sm text-gray-400 font-normal">Completed</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Section 2: Preplanned Trips (Upcoming/Ongoing) */}
        <section>
          <div className="flex items-center gap-3 mb-6 pl-2 border-l-4 border-indigo-500">
            <h2 className="text-2xl font-bold text-white">Preplanned Trips</h2>
            <span className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-medium">{preplannedTrips.length}</span>
          </div>

          {preplannedTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {preplannedTrips.map(trip => (
                <div key={trip.id} className="glass-card rounded-2xl overflow-hidden hover:border-indigo-500/40 transition-all group flex flex-col shadow-lg shadow-black/20">
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src={getTripImage(trip)}
                      alt={trip.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs border border-white/10 font-medium">
                      {new Date(trip.start_date) <= new Date() && new Date(trip.end_date) >= new Date() ?
                        <span className="text-green-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Ongoing</span> :
                        <span className="text-blue-400">Upcoming</span>}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col bg-slate-800/30">
                    <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{trip.name}</h3>
                    <p className="text-sm text-gray-400 mb-4 flex items-center gap-2">
                      <span>📅</span> {new Date(trip.start_date).toLocaleDateString()} — {new Date(trip.end_date).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => navigate(`/itinerary/${trip.id}`)}
                      className="mt-auto w-full py-3 bg-white/5 hover:bg-indigo-600 border border-white/10 hover:border-indigo-500/50 rounded-xl text-sm font-medium transition-all text-white flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-indigo-900/20"
                    >
                      View Details <span>→</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 rounded-3xl text-center border-dashed border-2 border-white/10 flex flex-col items-center max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center text-4xl mb-4">✈️</div>
              <h3 className="text-xl font-bold text-white mb-2">No upcoming adventures</h3>
              <p className="text-gray-400 mb-6 max-w-md">Your schedule is clear. Why not start planning your next dream vacation today?</p>
              <button onClick={() => navigate('/create-trip')} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all transform hover:scale-105">Start Planning +</button>
            </div>
          )}
        </section>

        {/* Section 3: Previous Trips */}
        <section>
          <div className="flex items-center gap-3 mb-6 pl-2 border-l-4 border-gray-600">
            <h2 className="text-2xl font-bold text-white">Previous Trips</h2>
            <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs font-medium">{previousTrips.length}</span>
          </div>

          {previousTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {previousTrips.map(trip => (
                <div key={trip.id} className="glass-card rounded-2xl overflow-hidden hover:border-white/20 transition-all group grayscale hover:grayscale-0 shadow-lg shadow-black/20">
                  <div className="h-40 relative">
                    <img
                      src={getTripImage(trip)}
                      alt={trip.name}
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-80"></div>
                  </div>
                  <div className="p-5 bg-slate-800/30">
                    <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{trip.name}</h3>
                    <p className="text-sm text-gray-400 mb-4 flex items-center gap-2">
                      <span>🏁</span> Completed {new Date(trip.end_date).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => navigate(`/itinerary/${trip.id}`)}
                      className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-colors"
                    >
                      View Memories
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card p-8 rounded-2xl text-center border-dashed border-2 border-white/10 flex flex-col items-center">
              <div className="text-4xl mb-3 opacity-50">🧭</div>
              <p className="text-gray-400">No completed trips yet. Your journey is just beginning!</p>
            </div>
          )}
        </section>

      </main>
    </div>
  );
};

export default UserProfile;
