/**
 * @fileoverview Work week view component for the calendar.
 * Displays events for a work week (Monday to Friday).
 */
import React from 'react';
import { startOfWeek, addDays, format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';

/**
 * WorkWeekView component.
 * @param {object} props - The component props.
 * @param {Date} props.currentDate - The current date being displayed.
 * @param {Array} props.events - An array of event objects.
 * @returns {JSX.Element} The WorkWeekView component.
 */
const WorkWeekView = ({ currentDate, events }) => {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const workDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));
  const navigate = useNavigate();

  const handleDayContainerClick = (day) => {
    const formattedDate = format(day, 'yyyy-MM-dd');
    navigate(`/create-event?startDate=${formattedDate}`);
  };

  return (
    <div className="work-week-view grid grid-cols-5 gap-2 p-4">
      {workDays.map((day) => {
        const dayEvents = events.filter(
          (e) => format(new Date(e.startDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
        );
        return (
          <div
            key={day.toString()}
            className="work-week-view__day border p-2 h-32 overflow-auto bg-white rounded shadow-md cursor-pointer"
            onClick={() => handleDayContainerClick(day)}
          >
            <div className="work-week-view__day-header text-sm font-semibold">{format(day, 'EEE d')}</div>
            {dayEvents.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="work-week-view__event block text-xs bg-blue-100 p-1 mt-1 rounded hover:underline"
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

export default WorkWeekView;