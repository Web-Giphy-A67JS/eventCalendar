/**
 * @fileoverview Week view component for the calendar.
 * Displays events for a week.
 */
import React from 'react';
import { startOfWeek, endOfWeek, eachDayOfInterval, format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';

/**
 * WeekView component.
 * @param {object} props - The component props.
 * @param {Date} props.currentDate - The current date being displayed.
 * @param {Array} props.events - An array of event objects.
 * @returns {JSX.Element} The WeekView component.
 */
const WeekView = ({ currentDate, events }) => {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const navigate = useNavigate();

  const handleDayContainerClick = (day) => {
    const formattedDate = format(day, 'yyyy-MM-dd');
    navigate(`/create-event?startDate=${formattedDate}`);
  };

  return (
    <div className="week-view grid grid-cols-7 gap-2 p-4">
      {days.map((day) => {
        const dayEvents = events.filter(
          (e) => format(new Date(e.startDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
        );
        return (
          <div
            key={day.toString()}
            className="week-view__day border p-2 h-32 overflow-auto bg-white rounded shadow-md cursor-pointer"
            onClick={() => handleDayContainerClick(day)}
          >
            <div className="week-view__day-header text-sm font-semibold">{format(day, 'EEE d')}</div>
            {dayEvents.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="week-view__event block text-xs bg-blue-100 p-1 mt-1 rounded hover:underline"
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

export default WeekView;