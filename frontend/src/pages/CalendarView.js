import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isWithinInterval, parseISO } from 'date-fns';
import api from '../services/api';

const CalendarView = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, [tripId]);

  const fetchTrips = async () => {
    try {
      const response = await api.get('/trips');
      let fetchedTrips = [];

      // Ensure response.data is an array
      if (Array.isArray(response.data)) {
        fetchedTrips = response.data;
      } else if (response.data && Array.isArray(response.data.trips)) {
        // Handle case where backend returns { trips: [...] }
        fetchedTrips = response.data.trips;
      } else {
        console.warn('API returned non-array trips, using mock data:', response.data);
        throw new Error('Invalid data format');
      }

      // If a specific tripId is provided, we might want to highlight it or filter, 
      // but usually a calendar shows all. We'll set the current month to that trip's start date.
      if (tripId) {
        const targetTrip = fetchedTrips.find(t => t.id === parseInt(tripId));
        if (targetTrip && targetTrip.start_date) {
          setCurrentMonth(new Date(targetTrip.start_date));
        }
      }

      setTrips(fetchedTrips);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching trips:', error);
      // Mock data for demonstration and stability
      const mockTrips = [
        { id: 1, name: 'Paris Getaway (Demo)', start_date: '2024-06-01', end_date: '2024-06-15', status: 'upcoming' },
        { id: 2, name: 'Tokyo Adventure', start_date: '2024-07-10', end_date: '2024-07-20', status: 'planning' },
        { id: 3, name: 'NYC Business', start_date: '2024-05-12', end_date: '2024-05-15', status: 'completed' }
      ];
      setTrips(mockTrips);
      setLoading(false);
    }
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getTripsForDay = (day) => {
    return trips.filter(trip => {
      const start = new Date(trip.start_date);
      const end = new Date(trip.end_date);
      return isWithinInterval(day, { start, end });
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-blue-400 animate-pulse">Loading calendar...</p>
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
              Trip Calendar
            </h1>
          </div>
          <button
            onClick={() => navigate('/create-trip')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
          >
            + Plan New Trip
          </button>
        </div>
      </header>

      <main className="relative z-10 pt-28 pb-12 px-6 max-w-7xl mx-auto">

        {/* Calendar Controls */}
        <div className="glass-card p-4 rounded-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white capitalize">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1">
              <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-md transition-colors">
                ←
              </button>
              <button onClick={goToToday} className="px-3 py-2 text-sm font-medium hover:bg-white/10 rounded-md transition-colors">
                Today
              </button>
              <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-md transition-colors">
                →
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span>Upcoming</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span>Planning</span>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-white/5 bg-white/5">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-4 text-center text-sm font-medium text-gray-400 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Days Cells */}
          <div className="grid grid-cols-7 auto-rows-fr bg-slate-800/30">
            {calendarDays.map((day, dayIdx) => {
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());
              const dayTrips = getTripsForDay(day);

              return (
                <div
                  key={day.toString()}
                  className={`min-h-[140px] p-2 border-b border-r border-white/5 relative group transition-colors ${!isCurrentMonth ? 'bg-slate-900/50 text-gray-600' : 'text-gray-300 hover:bg-white/5'
                    } ${isToday ? 'bg-blue-500/10' : ''}`}
                >
                  <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-500 text-white' : ''
                    }`}>
                    {format(day, 'd')}
                  </span>

                  {/* Trips on this day */}
                  <div className="mt-2 space-y-1">
                    {dayTrips.map(trip => {
                      // Determine pill style based on status
                      let pillColor = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
                      if (trip.status === 'completed') pillColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                      if (trip.status === 'planning') pillColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';

                      // Only show trip name on the start date or if it's the first day of the week displayed
                      const isStart = isSameDay(day, new Date(trip.start_date));
                      const isGridStart = dayIdx % 7 === 0;
                      const showLabel = isStart || isGridStart;

                      return (
                        <div
                          key={trip.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/itinerary/${trip.id}`);
                          }}
                          className={`text-xs px-2 py-1 rounded border cursor-pointer hover:brightness-125 truncate transition-all ${pillColor}`}
                          title={trip.name}
                        >
                          {showLabel ? trip.name : '•'}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
};

export default CalendarView;
