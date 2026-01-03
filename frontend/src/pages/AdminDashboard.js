import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTrips: 0,
    activeTrips: 0,
    popularCities: [],
    popularActivities: [],
    userGrowth: [],
    revenueData: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAdminStats = async () => {
    try {
      // Attempt to fetch real stats, but fallback to robust mock data for visuals
      // const response = await api.get('/admin/stats');
      // setStats(response.data);

      // Simulating network delay for realism
      setTimeout(() => {
        const mockStats = {
          totalUsers: 12543,
          totalTrips: 8420,
          activeTrips: 1342,
          revenue: 452000,
          popularCities: [
            { name: 'Paris', count: 2450 },
            { name: 'Tokyo', count: 1890 },
            { name: 'New York', count: 1520 },
            { name: 'London', count: 1290 },
            { name: 'Barcelona', count: 950 }
          ],
          popularActivities: [
            { name: 'Sightseeing', value: 35 },
            { name: 'Food Tours', value: 25 },
            { name: 'Museums', value: 20 },
            { name: 'Adventure', value: 15 },
            { name: 'Shopping', value: 5 }
          ],
          userGrowth: [
            { month: 'Jan', users: 4000, trips: 2400 },
            { month: 'Feb', users: 3000, trips: 1398 },
            { month: 'Mar', users: 2000, trips: 9800 },
            { month: 'Apr', users: 2780, trips: 3908 },
            { month: 'May', users: 1890, trips: 4800 },
            { month: 'Jun', users: 2390, trips: 3800 },
            { month: 'Jul', users: 3490, trips: 4300 },
          ],
          revenueData: [
            { month: 'Jan', amount: 12000 },
            { month: 'Feb', amount: 15000 },
            { month: 'Mar', amount: 18000 },
            { month: 'Apr', amount: 16000 },
            { month: 'May', amount: 21000 },
            { month: 'Jun', amount: 25000 },
            { month: 'Jul', amount: 28000 },
          ]
        };
        setStats(mockStats);
        setLoading(false);
      }, 1000);

    } catch (error) {
      console.error('Error fetching admin stats:', error);
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-blue-400 animate-pulse">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-blue-500/30">

      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[10%] right-[10%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[10%] left-[10%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[100px]"></div>
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
              Admin Console
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">Administrator</p>
              <p className="text-xs text-gray-400">Super Access</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border-2 border-slate-800"></div>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-28 pb-12 px-6 max-w-7xl mx-auto">

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-16 h-16 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path></svg>
            </div>
            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Users</p>
            <h3 className="text-3xl font-bold text-white mt-2">{stats.totalUsers.toLocaleString()}</h3>
            <p className="text-emerald-400 text-sm mt-1 flex items-center">
              <span>↑ 12%</span>
              <span className="text-gray-500 ml-2">vs last month</span>
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-16 h-16 text-purple-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd"></path></svg>
            </div>
            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Active Trips</p>
            <h3 className="text-3xl font-bold text-white mt-2">{stats.activeTrips.toLocaleString()}</h3>
            <p className="text-emerald-400 text-sm mt-1 flex items-center">
              <span>↑ 5%</span>
              <span className="text-gray-500 ml-2">vs last month</span>
            </p>
          </div>
          <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-16 h-16 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path></svg>
            </div>
            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-3xl font-bold text-white mt-2">${stats.revenue.toLocaleString()}</h3>
            <p className="text-emerald-400 text-sm mt-1 flex items-center">
              <span>↑ 8%</span>
              <span className="text-gray-500 ml-2">vs last month</span>
            </p>
          </div>
          <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-16 h-16 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
            </div>
            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Top Destination</p>
            <h3 className="text-3xl font-bold text-white mt-2">{stats.popularCities[0]?.name || 'Unknown'}</h3>
            <p className="text-gray-500 text-sm mt-1">{stats.popularCities[0]?.count || 0} visits</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-6">User & Trip Growth</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.userGrowth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '0.5rem', color: '#F3F4F6' }}
                  />
                  <Area type="monotone" dataKey="users" stroke="#3B82F6" fillOpacity={1} fill="url(#colorUsers)" />
                  <Area type="monotone" dataKey="trips" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorTrips)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Popular Activities Pie Chart */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-6">Activity Preferences</h3>
            <div className="h-80 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.popularActivities}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.popularActivities.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '0.5rem', color: '#F3F4F6' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend Overlay */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <p className="text-2xl font-bold text-white">5</p>
                <p className="text-xs text-gray-400">Categories</p>
              </div>
            </div>
            {/* Custom Legend Below */}
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {stats.popularActivities.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Popular Cities Bar */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-6">Top Destinations</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.popularCities} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" stroke="#9CA3AF" />
                <YAxis dataKey="name" type="category" width={100} stroke="#9CA3AF" />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '0.5rem', color: '#F3F4F6' }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20}>
                  {stats.popularCities.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;
