import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { tripAPI } from '../services/api';

const CalendarView = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [trips, setTrips] = useState([]);

  React.useEffect(() => {
    tripAPI.getAll().then(res => {
      setTrips(res.data.trips || []);
    }).catch(err => console.error("Error fetching trips for calendar:", err));
  }, []);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  // Events Logic
  const monthEvents = trips.filter(trip => {
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    return start <= monthEnd && end >= monthStart; // Overlaps
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20 font-sans">
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-indigo-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">←</button>
            <h1 className="text-xl font-bold">GlobalTrotter</h1>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/50"></div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">Trip Calendar</h2>
          <div className="flex justify-between items-center max-w-sm mx-auto mt-6">
            <button onClick={() => changeMonth(-1)} className="text-2xl hover:text-indigo-400 p-2">←</button>
            <h3 className="text-2xl font-bold w-48">{currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}</h3>
            <button onClick={() => changeMonth(1)} className="text-2xl hover:text-indigo-400 p-2">→</button>
          </div>
        </div>

        <div className="bg-white text-black rounded-lg overflow-hidden shadow-2xl">
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
              <div key={d} className="py-4 text-center font-bold text-sm tracking-wider">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 auto-rows-fr min-h-[600px]">
            {/* Empty slots for previous month */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-gray-50 border border-gray-100"></div>
            ))}

            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const currentDayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

              // Find events active on this day
              const activeEvents = monthEvents.filter(trip => {
                const start = new Date(trip.start_date);
                const end = new Date(trip.end_date);
                // Normalize time for comparison
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                return currentDayDate >= start && currentDayDate <= end;
              });

              return (
                <div key={day} className="border border-gray-100 p-2 relative min-h-[100px] hover:bg-gray-50 transition-colors">
                  <span className={`font-bold text-lg ${activeEvents.length > 0 ? 'text-indigo-600' : 'text-gray-700'}`}>{day}</span>

                  <div className="flex flex-col gap-1 mt-1">
                    {activeEvents.map(trip => (
                      <div key={trip.id}
                        className="text-[10px] bg-indigo-600 text-white rounded px-1 py-0.5 truncate cursor-pointer hover:bg-indigo-700"
                        onClick={() => navigate(`/itinerary/${trip.id}`)}
                      >
                        {trip.name}
                      </div>
                    ))}
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
