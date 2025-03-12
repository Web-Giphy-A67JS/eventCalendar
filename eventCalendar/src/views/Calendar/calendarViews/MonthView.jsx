/**
 * @fileoverview Month view component for the calendar.
 * Displays events for a month.
 */
import React from 'react';
import { getDaysInMonth, startOfMonth, addDays, format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';

/**
 * MonthView component.
 * @param {object} props - The component props.
 * @param {Date} props.currentDate - The current date being displayed.
 * @param {Array} props.events - An array of event objects.
 * @returns {JSX.Element} The MonthView component.
 */
const MonthView = ({ currentDate, events }) => {
  const daysInMonth = getDaysInMonth(currentDate);
  const monthStart = startOfMonth(currentDate);
  const navigate = useNavigate();

  const handleDayContainerClick = (day) => {
    const formattedDate = format(day, 'yyyy-MM-dd');
    navigate(`/create-event?startDate=${formattedDate}`);
  };

  return (
    <div className="month-view grid grid-cols-7 gap-2 p-4">
      {Array.from({ length: daysInMonth }).map((_, i) => {
        const day = addDays(monthStart, i);
        const dayEvents = events.filter(
          (e) => format(new Date(e.startDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
        );
        return (
          <div
            key={i}
            className="month-view__day border p-2 h-24 overflow-auto bg-white rounded shadow-md cursor-pointer"
            onClick={() => handleDayContainerClick(day)}
          >
            <div className="month-view__day-header text-sm">{format(day, 'd')}</div>
            {dayEvents.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="month-view__event block text-xs bg-blue-100 p-1 mt-1 rounded hover:underline"
              >
                {event.title}
              </Link>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default MonthView;