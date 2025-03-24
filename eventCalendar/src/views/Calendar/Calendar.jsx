import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DayView from './calendarViews/DayView';
import WeekView from './calendarViews/WeekView'; // Fixed import typo
import WorkWeekView from './calendarViews/WorkWeekView';
import { format } from 'date-fns';
import { fetchEvents } from '../../../services/event.services'; // Replace with your actual service

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState('month'); // Default view
  const [animationClass, setAnimationClass] = useState('');
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  // Fetch events when the component mounts
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const fetchedEvents = await fetchEvents(); // Assume this returns events like [{ id, title, startDate, endDate }]
        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
    };
    loadEvents();
  }, []);

  const navigateMonth = (direction) => {
    setAnimationClass(direction === 'prev' ? 'slide-left' : 'slide-right');
    setTimeout(() => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + (direction === 'prev' ? -1 : 1)));
      setAnimationClass('');
    }, 300);
  };

  const handleDayClick = (day, isCurrentMonth) => {
    if (isCurrentMonth) {
      const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const formattedDate = format(clickedDate, 'yyyy-MM-dd');
      navigate(`/day-events?date=${formattedDate}`); // Updated to match DayEvents.jsx
    }
  };

  const handleNewEventClick = () => {
    navigate('/create-event');
  };

  const renderView = () => {
    switch (selectedView) {
      case 'day':
        return <DayView currentDate={currentDate} events={events} />;
      case 'week':
        return <WeekView currentDate={currentDate} events={events} />;
      case 'work-week':
        return <WorkWeekView currentDate={currentDate} events={events} />;
      case 'month':
      default:
        return (
          <div className={`calendar__month-view ${animationClass}`}>
            <table className="calendar__table w-full border-collapse">
              <thead>
                <tr>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <th key={day} className="calendar__day-header p-2 text-sm font-medium bg-gray-50">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {generateCalendarMatrix(currentDate.getFullYear(), currentDate.getMonth()).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => {
                      const isToday =
                        cell.isCurrentMonth &&
                        cell.day === new Date().getDate() &&
                        currentDate.getMonth() === new Date().getMonth() &&
                        currentDate.getFullYear() === new Date().getFullYear();

                      return (
                        <td
                          key={colIndex}
                          onClick={() => handleDayClick(cell.day, cell.isCurrentMonth)}
                          className={`
                            calendar__day-cell p-2 text-center border
                            ${cell.isCurrentMonth ? 'text-gray-800' : 'text-gray-400'}
                            ${isToday ? 'bg-yellow-100 font-bold' : ''}
                            ${cell.isCurrentMonth ? 'hover:bg-gray-100 cursor-pointer' : ''}
                          `}
                        >
                          {cell.day}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
    }
  };

  return (
    <div className="calendar p-4 max-w-4xl mx-auto">
      <div className="calendar__header flex justify-between items-center mb-4">
        <h2 className="calendar__title text-xl font-semibold">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="calendar__navigation space-x-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="calendar__nav-button btn btn-ghost"
          >
            {'< Previous'}
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="calendar__today-button btn btn-ghost"
          >
            Today
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="calendar__nav-button btn btn-ghost"
          >
            {'Next >'}
          </button>
          <button
            onClick={handleNewEventClick}
            className="calendar__create-event-button btn btn-primary"
          >
            Create Event
          </button>
        </div>
      </div>

      <div className="calendar__view-switcher flex justify-center space-x-4 mb-4">
        <button
          onClick={() => setSelectedView('day')}
          className={`calendar__view-button btn ${selectedView === 'day' ? 'btn-active' : 'btn-ghost'}`}
        >
          Day
        </button>
        <button
          onClick={() => setSelectedView('week')}
          className={`calendar__view-button btn ${selectedView === 'week' ? 'btn-active' : 'btn-ghost'}`}
        >
          Week
        </button>
        <button
          onClick={() => setSelectedView('work-week')}
          className={`calendar__view-button btn ${selectedView === 'work-week' ? 'btn-active' : 'btn-ghost'}`}
        >
          Work Week
        </button>
        <button
          onClick={() => setSelectedView('month')}
          className={`calendar__view-button btn ${selectedView === 'month' ? 'btn-active' : 'btn-ghost'}`}
        >
          Month
        </button>
      </div>

      {renderView()}
    </div>
  );
};

// Matrix generator for the calendar
const generateCalendarMatrix = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const matrix = Array(6)
    .fill()
    .map(() => Array(7).fill().map(() => ({ day: null, isCurrentMonth: false })));

  // Fill previous month
  for (let i = startDay - 1; i >= 0; i--) {
    matrix[0][i] = {
      day: daysInPrevMonth - (startDay - i - 1),
      isCurrentMonth: false,
    };
  }

  // Fill current month
  for (let day = 1; day <= daysInMonth; day++) {
    const index = startDay + day - 1;
    const row = Math.floor(index / 7);
    const col = index % 7;
    matrix[row][col] = { day, isCurrentMonth: true };
  }

  // Fill next month
  let nextMonthDay = 1;
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {
      if (!matrix[row][col].day) {
        matrix[row][col] = { day: nextMonthDay++, isCurrentMonth: false };
      }
    }
  }

  return matrix;
};

export default Calendar;