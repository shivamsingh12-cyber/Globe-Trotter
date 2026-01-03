import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Added import
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import api, { adminAPI, cityAPI } from '../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth(); // Added hook
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'cities', 'activities', 'trends'
  const [isLoading, setIsLoading] = useState(true);

  // ... (rest of the component state) ...
  // Data State
  const [users, setUsers] = useState([]);
  const [popularCities, setPopularCities] = useState([]);
  const [popularActivities, setPopularActivities] = useState([]);
  const [trends, setTrends] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, revenue: 0 }); // Global stats

  // Edit User State
  const [editingUser, setEditingUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Dropdown UI State
  const [activeDropdown, setActiveDropdown] = useState(null); // 'group', 'filter', 'sort' or null

  // Logic State
  const [sortConfig, setSortConfig] = useState({ key: 'default', direction: 'desc' });
  const [filterConfig, setFilterConfig] = useState('all');
  const [groupConfig, setGroupConfig] = useState('none');

  // Search/Filter state
  const [searchTerm, setSearchTerm] = useState('');

  // Handlers
  const handleEditClick = (user) => {
    setEditingUser({ ...user }); // Copy to avoid direct mutation
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.updateUser(editingUser.id, editingUser);
      setIsEditModalOpen(false);
      setEditingUser(null);
      // Refresh user list
      const usersRes = await adminAPI.getUsers();
      setUsers(usersRes.data.users);
      alert('User updated successfully!');
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user. Please try again.');
    }
  };

  useEffect(() => {
    // Reset filters/sort when tab changes to avoid confusion
    setSortConfig({ key: 'default', direction: 'desc' });
    setFilterConfig('all');
    setGroupConfig('none');
    setActiveDropdown(null);
  }, [activeTab]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // Parallel fetch for efficiency
      const [statsRes, usersRes, citiesRes, itemsRes, trendsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        cityAPI.getPopular(10), // Reuse public API for popular cities
        adminAPI.getPopularActivities(),
        adminAPI.getTrends()
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data.users);
      setPopularCities(citiesRes.data.cities);
      setPopularActivities(itemsRes.data.activities);
      setTrends(trendsRes.data.trends);

    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // --- Logic Implementations ---

  // Generic Sorter
  const applySort = (data, type) => {
    if (sortConfig.key === 'default') return data;

    return [...data].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      // Handle dates
      if (sortConfig.key === 'created_at' || sortConfig.key === 'joined') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      // Handle strings
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Controls Renderer
  const DropdownMenu = ({ type, options, onSelect, current }) => (
    <div className="absolute top-full mt-2 right-0 w-48 bg-slate-800 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => { onSelect(opt.value); setActiveDropdown(null); }}
          className={`w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors flex justify-between items-center
                      ${current === opt.value ? 'text-blue-400 font-bold bg-white/5' : 'text-gray-300'}
                  `}
        >
          {opt.label}
          {current === opt.value && <span>✓</span>}
        </button>
      ))}
    </div>
  );

  const renderEditUserModal = () => {
    if (!isEditModalOpen || !editingUser) return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-slate-800 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-4">Edit User</h3>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">First Name</label>
                <input
                  type="text"
                  value={editingUser.first_name || ''}
                  onChange={e => setEditingUser({ ...editingUser, first_name: e.target.value })}
                  className="w-full bg-slate-900 border border-gray-600 rounded p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Last Name</label>
                <input
                  type="text"
                  value={editingUser.last_name || ''}
                  onChange={e => setEditingUser({ ...editingUser, last_name: e.target.value })}
                  className="w-full bg-slate-900 border border-gray-600 rounded p-2 text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={editingUser.email}
                onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                className="w-full bg-slate-900 border border-gray-600 rounded p-2 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">City</label>
                <input
                  type="text"
                  value={editingUser.city || ''}
                  onChange={e => setEditingUser({ ...editingUser, city: e.target.value })}
                  className="w-full bg-slate-900 border border-gray-600 rounded p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Country</label>
                <input
                  type="text"
                  value={editingUser.country || ''}
                  onChange={e => setEditingUser({ ...editingUser, country: e.target.value })}
                  className="w-full bg-slate-900 border border-gray-600 rounded p-2 text-white"
                />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingUser.is_admin}
                  onChange={e => setEditingUser({ ...editingUser, is_admin: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-900 border-gray-600 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">Is Admin?</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-lg text-gray-300 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // --- Render Functions for Tabs ---

  const renderManageUsers = () => {
    // 1. Filter
    let processedUsers = users.filter(u =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.first_name && u.first_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (filterConfig !== 'all') {
      processedUsers = processedUsers.filter(u =>
        filterConfig === 'admin' ? u.is_admin : !u.is_admin
      );
    }

    // 2. Sort
    processedUsers = applySort(processedUsers, 'users');

    // 3. Group (Visual separation)
    const renderTable = (userList) => (
      <table className="w-full text-left">
        <thead className="bg-slate-800/50 text-gray-400 uppercase text-xs">
          <tr>
            <th className="px-6 py-4">User</th>
            <th className="px-6 py-4">Location</th>
            <th className="px-6 py-4">Role</th>
            <th className="px-6 py-4">Joined</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {userList.map((user) => (
            <tr key={user.id} className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-xs font-bold">
                    {user.first_name ? user.first_name[0] : user.email[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-white">{user.first_name} {user.last_name}</div>
                    <div className="text-sm text-gray-400">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-gray-300">
                {user.city ? `${user.city}, ${user.country}` : 'Not set'}
              </td>
              <td className="px-6 py-4">
                {user.is_admin ? (
                  <span className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded text-xs border border-purple-500/20">Admin</span>
                ) : (
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs border border-blue-500/20">Traveller</span>
                )}
              </td>
              <td className="px-6 py-4 text-gray-400 text-sm">
                {new Date(user.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-right">
                <button onClick={() => handleEditClick(user)} className="text-gray-400 hover:text-white transition-colors">Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );

    if (groupConfig === 'role') {
      const admins = processedUsers.filter(u => u.is_admin);
      const travellers = processedUsers.filter(u => !u.is_admin);

      return (
        <div className="space-y-8">
          {admins.length > 0 && (
            <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
              <div className="p-4 bg-purple-500/10 border-b border-purple-500/20 font-bold text-purple-300">ADMINS ({admins.length})</div>
              <div className="overflow-x-auto">{renderTable(admins)}</div>
            </div>
          )}
          {travellers.length > 0 && (
            <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
              <div className="p-4 bg-blue-500/10 border-b border-blue-500/20 font-bold text-blue-300">TRAVELLERS ({travellers.length})</div>
              <div className="overflow-x-auto">{renderTable(travellers)}</div>
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          {renderTable(processedUsers)}
          {processedUsers.length === 0 && (
            <div className="p-8 text-center text-gray-400">No users found matching "{searchTerm}"</div>
          )}
        </div>
      </div>
    );
  };

  // Helper for City Card to avoid duplication
  const renderCityCard = (city, index) => (
    <div key={city.id} className="glass-card p-0 rounded-2xl overflow-hidden group">
      <div className="h-40 relative">
        <img
          src={city.image_url || `https://source.unsplash.com/random/800x600/?${city.name}`}
          alt={city.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute bottom-4 left-4">
          <h3 className="text-xl font-bold text-white">{city.name}</h3>
          <p className="text-sm text-gray-300">{city.country}</p>
        </div>
        <div className="absolute top-4 right-4 bg-white/10 backdrop-blur px-2 py-1 rounded text-xs font-bold border border-white/20">
          #{index + 1}
        </div>
      </div>
      <div className="p-4 flex justify-between items-center">
        <div>
          <div className="text-xs text-gray-400 uppercase">Popularity</div>
          <div className="text-lg font-bold text-emerald-400">{city.popularity_score}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400 uppercase">Visits</div>
          <div className="text-lg font-bold text-white">{city.visit_count || 0}</div>
        </div>
      </div>
    </div>
  );

  const renderPopularCities = () => {
    let processedCities = [...popularCities];

    // Filter by search
    if (searchTerm) {
      processedCities = processedCities.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // Sort
    processedCities = applySort(processedCities, 'cities');

    if (groupConfig === 'region') {
      // Group by region (assuming region exists, if not use country)
      const grouped = processedCities.reduce((acc, city) => {
        const key = city.region || city.country || 'Other';
        if (!acc[key]) acc[key] = [];
        acc[key].push(city);
        return acc;
      }, {});

      return (
        <div className="space-y-8">
          {Object.entries(grouped).map(([region, cities]) => (
            <div key={region}>
              <h3 className="text-xl font-bold text-gray-400 mb-4 pl-2 border-l-4 border-blue-500">{region}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cities.map((city, index) => renderCityCard(city, index))}
              </div>
            </div>
          ))}
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {processedCities.map((city, index) => renderCityCard(city, index))}
      </div>
    );
  };

  const renderPopularActivities = () => {
    let processedActivities = [...popularActivities];

    // Sort
    processedActivities = applySort(processedActivities, 'activities');

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-6">Top Activities Distribution</h3>
          <div className="h-80 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={processedActivities} // Use processed data
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {processedActivities.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          {processedActivities.map((activity, index) => (
            <div key={index} className="glass-card p-4 rounded-xl flex items-center justify-between hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-bold text-white">{activity.name}</h4>
                  <p className="text-sm text-gray-400">{activity.category}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-white">{activity.value}</span>
                <span className="text-gray-500 text-sm ml-1">bookings</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTrends = () => {
    return (
      <div className="space-y-6">
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-3xl font-bold text-emerald-400 mt-1">${stats.revenue.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
              $
            </div>
          </div>
          <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Users</p>
              <h3 className="text-3xl font-bold text-blue-400 mt-1">{stats.totalUsers.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
              👥
            </div>
          </div>
        </div>

        {/* Middle Row: Content Split (Popular Activities List + Pie Chart) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Popular Activities List */}
          <div className="glass-card p-6 rounded-2xl col-span-1">
            <h3 className="text-lg font-bold text-white mb-6">Popular Activities</h3>
            <div className="space-y-6">
              {popularActivities.slice(0, 4).map((activity, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <div>
                    <p className="text-sm font-bold text-gray-200">{activity.name}</p>
                    <p className="text-xs text-gray-500">{activity.category} • {activity.value} bookings</p>
                  </div>
                </div>
              ))}
              {popularActivities.length === 0 && <p className="text-gray-500 text-sm">No activity data available.</p>}
            </div>
          </div>

          {/* Right: Pie Chart */}
          <div className="glass-card p-6 rounded-2xl col-span-2 flex flex-col items-center justify-center">
            <h3 className="text-lg font-bold text-white mb-4 w-full text-left">Activity Distribution</h3>
            <div className="h-64 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={popularActivities}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {popularActivities.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Row: User Trends Area Chart */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-6">User Trends</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }} />
                <Area type="monotone" dataKey="users" stroke="#3B82F6" fillOpacity={1} fill="url(#colorUsers)" />
                <Area type="monotone" dataKey="trips" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorTrips)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Footer Row: Bar Chart (Cities) */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-6">Top Destinations</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularCities.slice(0, 5)} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" stroke="#9CA3AF" hide />
                <YAxis dataKey="name" type="category" width={100} stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '0.5rem', color: '#F3F4F6' }}
                />
                <Bar dataKey="popularity_score" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20}>
                  {popularCities.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans pb-20">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              GlobalTrotter Admin
            </h1>
            <span className="px-2 py-1 bg-white/10 rounded text-xs text-gray-400 border border-white/10">v2.0</span>
          </div>

          <button onClick={() => { logout(); navigate('/login'); }} className="text-sm text-gray-400 hover:text-white transition-colors">
            Logout
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">

        {/* Wireframe-inspired Controls */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search bar ......"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-white focus:outline-none placeholder-gray-500 font-mono text-sm"
              />
            </div>

            {/* Functional Filter Buttons */}
            <div className="flex gap-2 relative">
              {/* GROUP BY */}
              {activeTab !== 'trends' && activeTab !== 'activities' && (
                <div className="relative">
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === 'group' ? null : 'group')}
                    className={`px-6 py-2.5 border rounded-lg text-sm font-mono transition-colors
                            ${groupConfig !== 'none' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'border-gray-600 hover:bg-white/5 text-gray-300'}
                        `}
                  >
                    Group by
                  </button>
                  {activeDropdown === 'group' && (
                    <DropdownMenu
                      type="group"
                      current={groupConfig}
                      onSelect={setGroupConfig}
                      options={
                        activeTab === 'users' ? [
                          { label: 'None', value: 'none' },
                          { label: 'Role', value: 'role' },
                        ] : activeTab === 'cities' ? [
                          { label: 'None', value: 'none' },
                          { label: 'Region/Country', value: 'region' },
                        ] : []
                      }
                    />
                  )}
                </div>
              )}

              {/* FILTER */}
              {activeTab === 'users' && (
                <div className="relative">
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === 'filter' ? null : 'filter')}
                    className={`px-6 py-2.5 border rounded-lg text-sm font-mono transition-colors
                            ${filterConfig !== 'all' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'border-gray-600 hover:bg-white/5 text-gray-300'}
                        `}
                  >
                    Filter
                  </button>
                  {activeDropdown === 'filter' && (
                    <DropdownMenu
                      type="filter"
                      current={filterConfig}
                      onSelect={setFilterConfig}
                      options={[
                        { label: 'All Users', value: 'all' },
                        { label: 'Admins Only', value: 'admin' },
                        { label: 'Travellers Only', value: 'traveller' },
                      ]}
                    />
                  )}
                </div>
              )}

              {/* SORT BY */}
              {activeTab !== 'trends' && (
                <div className="relative">
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === 'sort' ? null : 'sort')}
                    className={`px-6 py-2.5 border rounded-lg text-sm font-mono transition-colors
                             ${sortConfig.key !== 'default' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'border-gray-600 hover:bg-white/5 text-gray-300'}
                        `}
                  >
                    Sort by...
                  </button>
                  {activeDropdown === 'sort' && (
                    <DropdownMenu
                      type="sort"
                      current={sortConfig.key} // Simplified check, usually would check key+dir
                      onSelect={(val) => {
                        // Simple mapping for demo
                        const config = val.split('-');
                        setSortConfig({ key: config[0], direction: config[1] || 'desc' });
                      }}
                      options={
                        activeTab === 'users' ? [
                          { label: 'Newest First', value: 'created_at-desc' },
                          { label: 'Oldest First', value: 'created_at-asc' },
                          { label: 'Name (A-Z)', value: 'first_name-asc' },
                          { label: 'Name (Z-A)', value: 'first_name-desc' },
                        ] : activeTab === 'cities' ? [
                          { label: 'Most Popular', value: 'popularity_score-desc' },
                          { label: 'Least Popular', value: 'popularity_score-asc' },
                          { label: 'Name (A-Z)', value: 'name-asc' },
                        ] : activeTab === 'activities' ? [
                          { label: 'Most Bookings', value: 'value-desc' },
                          { label: 'Name (A-Z)', value: 'name-asc' },
                        ] : []
                      }
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 'users', label: 'Manage Users' },
              { id: 'cities', label: 'Popular cities' },
              { id: 'activities', label: 'Popular Activites' },
              { id: 'trends', label: 'User Trends and Analytics' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                          py-3 rounded-xl border transition-all text-sm font-medium
                          ${activeTab === tab.id
                    ? 'bg-white text-slate-900 border-white font-bold shadow-lg shadow-white/10'
                    : 'bg-transparent text-gray-400 border-gray-600 hover:border-gray-400 hover:text-white'}
                       `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          {activeTab === 'users' && renderManageUsers()}
          {activeTab === 'cities' && renderPopularCities()}
          {activeTab === 'activities' && renderPopularActivities()}
          {activeTab === 'trends' && renderTrends()}
        </div>

        {renderEditUserModal()} {/* Add Modal Here */}

      </main>
    </div>
  );
};

export default AdminDashboard;
