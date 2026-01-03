import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import api from '../services/api';

const BudgetBreakdown = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [stops, setStops] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTripData = useCallback(async () => {
    try {
      // Fetch Trip Details (Stops contain activities and city info)
      const tripResponse = await api.get(`/trips/${tripId}`);
      setTrip(tripResponse.data.trip);
      setStops(tripResponse.data.trip.stops || []);

      // Fetch Budget Breakdown (Expenses table)
      try {
        const budgetResponse = await api.get(`/trips/${tripId}/budget`);
        const backendExpenses = budgetResponse.data.budget.expenses || [];
        // Map backend 'total' to frontend 'amount'
        const mappedExpenses = backendExpenses.map(e => ({
          category: e.category,
          amount: parseFloat(e.total)
        }));
        setExpenses(mappedExpenses);
      } catch (budgetError) {
        console.warn('Could not fetch budget breakdown', budgetError);
        setExpenses([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching trip:', error);
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchTripData();
  }, [fetchTripData]);

  const calculateTotalProjectedCost = () => {
    let totalStops = 0;
    stops.forEach(stop => {
      if (stop.budget && parseFloat(stop.budget) > 0) {
        totalStops += parseFloat(stop.budget);
      } else if (stop.activities) {
        totalStops += stop.activities.reduce((sum, act) => sum + (parseFloat(act.cost) || 0), 0);
      }
    });

    const totalExpenses = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
    return totalStops + totalExpenses;
  };

  const calculateActivityTotal = () => {
    let total = 0;
    stops.forEach(stop => {
      if (stop.activities) {
        stop.activities.forEach(act => total += (parseFloat(act.cost) || 0));
      }
    });
    return total;
  };

  const getDayCount = () => {
    if (!trip?.start_date || !trip?.end_date) return 1;
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff + 1 : 1;
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280', '#06B6D4', '#E11D48', '#84CC16', '#7C3AED'];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-blue-400 animate-pulse">Loading budget data...</p>
        </div>
      </div>
    );
  }

  // If no data at all
  if (!trip) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Trip Not Found</h2>
          <button onClick={() => navigate('/dashboard')} className="text-blue-400 hover:text-blue-300">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  const totalBudget = calculateTotalProjectedCost();
  const dayCount = getDayCount();
  const avgPerDay = totalBudget / dayCount;

  // Prepare data for charts
  const pieData = expenses.map(exp => ({
    name: exp.category,
    value: parseFloat(exp.amount)
  })).filter(item => item.value > 0);

  const activityTotal = calculateActivityTotal();
  if (activityTotal > 0) {
    const existingIdx = pieData.findIndex(p => p.name === 'Activities');
    if (existingIdx >= 0) {
      pieData[existingIdx].value += activityTotal;
    } else {
      pieData.push({ name: 'Activities', value: activityTotal });
    }
  }

  stops.forEach(stop => {
    if (stop.budget && parseFloat(stop.budget) > 0) {
      const actsCost = (stop.activities || []).reduce((sum, act) => sum + (parseFloat(act.cost) || 0), 0);
      if (parseFloat(stop.budget) > actsCost) {
        const remainingBudget = parseFloat(stop.budget) - actsCost;
        pieData.push({
          name: stop.name || stop.city_name || 'Section',
          value: remainingBudget
        });
      }
    }
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-blue-500/30">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-emerald-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[10%] left-[10%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px]"></div>
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
            <div>
              <h1 className="text-xl font-bold text-white">Budget & Cost Breakdown</h1>
              <p className="text-xs text-gray-400">{trip?.name}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-28 pb-12 px-6 max-w-7xl mx-auto">

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-6xl">💰</span>
            </div>
            <p className="text-gray-400 text-sm font-medium">Total Estimated Cost</p>
            <h3 className="text-3xl font-bold text-white mt-1 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400">
              ${totalBudget.toFixed(2)}
            </h3>
          </div>

          <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-6xl">📅</span>
            </div>
            <p className="text-gray-400 text-sm font-medium">Daily Average</p>
            <h3 className="text-3xl font-bold text-white mt-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
              ${avgPerDay.toFixed(2)}
              <span className="text-sm text-gray-400 font-normal ml-1">/ day</span>
            </h3>
          </div>

          <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-6xl">🌍</span>
            </div>
            <p className="text-gray-400 text-sm font-medium">Confirmed Activities</p>
            <h3 className="text-3xl font-bold text-white mt-1 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              {stops.reduce((acc, stop) => acc + (stop.activities?.length || 0), 0)}
              <span className="text-sm text-gray-400 font-normal ml-1">activities across {stops.length} locations</span>
            </h3>
          </div>
        </div>

        {/* Charts Section */}
        {pieData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Expense Distribution */}
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-6">Expense Distribution</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Spending vs Category */}
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-6">Cost Breakdown</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pieData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#94a3b8' }} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card p-12 text-center rounded-2xl mb-8 border-dashed border-white/10">
            <p className="text-gray-400 text-lg">No expense data available yet. Add activities or sections with budgets to see the breakdown.</p>
          </div>
        )}

        {/* Detailed List */}
        <div className="glass-card rounded-2xl p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Expense Details by Section</h3>
            <button className="text-sm text-blue-400 hover:text-blue-300 opacity-50 cursor-not-allowed">Download Report</button>
          </div>

          <div className="space-y-4">
            {stops.length > 0 ? (
              stops.map((stop, index) => {
                const actsTotal = stop.activities?.reduce((sum, act) => sum + (parseFloat(act.cost) || 0), 0) || 0;
                const sectionBudget = parseFloat(stop.budget) || 0;
                const displayTotal = sectionBudget > 0 ? sectionBudget : actsTotal;

                return (
                  <div key={index} className="bg-slate-800/50 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex justify-between items-center mb-3 pb-3 border-b border-white/5">
                      <h4 className="font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        {stop.name || stop.city_name || `Section ${index + 1}`}
                      </h4>
                      <div className="text-right">
                        <span className="font-bold text-emerald-400 block">${displayTotal.toFixed(2)}</span>
                        {sectionBudget > 0 && <span className="text-xs text-gray-500">Manual Budget</span>}
                      </div>
                    </div>
                    {stop.activities && stop.activities.length > 0 ? (
                      <div className="space-y-2">
                        {stop.activities.map((activity, i) => (
                          <div key={i} className="flex justify-between text-sm text-gray-400 hover:text-gray-200 transition-colors">
                            <span>{activity.name}</span>
                            <span>${parseFloat(activity.cost).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm italic">No activities planned yet.</p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                No sections added to this trip yet.
              </div>
            )}
          </div>

          {/* Miscellaneous Expenses (from expenses table) */}
          {expenses.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-bold text-white mb-4">General Expenses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {expenses.map((exp, i) => (
                  <div key={i} className="bg-slate-800/30 rounded-lg p-3 flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                      <span className="text-gray-300">{exp.category}</span>
                    </div>
                    <span className="text-white font-medium">${parseFloat(exp.amount).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default BudgetBreakdown;
