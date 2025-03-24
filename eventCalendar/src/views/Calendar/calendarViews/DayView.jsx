/**
 * @fileoverview Day view component for the calendar.
 * Displays events for a single day.
 */
import React from 'react';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * DayView component.
 * @param {object} props - The component props.
 * @param {Date} props.currentDate - The current date being displayed.
 * @param {Array} props.events - An array of event objects.
 * @returns {JSX.Element} The DayView component.
 */
const DayView = ({ currentDate, events }) => {
  const dayEvents = events.filter(
    (e) => format(new Date(e.startDate), 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
  );

  const navigate = useNavigate();

  const handleDayContainerClick = () => {
    const formattedDate = format(currentDate, 'yyyy-MM-dd');
    navigate(`/create-event?startDate=${formattedDate}`);
  };

  return (
    <div className="day-view bg-white border rounded shadow-md cursor-pointer p-4" onClick={handleDayContainerClick}>
      <h3 className="day-view__title text-lg font-semibold mb-2">
        {format(currentDate, 'MMMM d, yyyy')}
      </h3>
      {dayEvents.length > 0 ? (
        <ul className="day-view__events space-y-2">
          {dayEvents.map((event) => (
            <li key={event.id} className="day-view__event p-2 bg-blue-100 rounded">
              <Link to={`/events/${event.id}`} className="hover:underline">
                {event.title} ({format(new Date(event.startDate), 'HH:mm')} - {format(new Date(event.endDate), 'HH:mm')})
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="day-view__no-events">No events for this day.</p>
      )}
    </div>
  );
};
DayView.propTypes = {
  currentDate: PropTypes.instanceOf(Date).isRequired,
  events: PropTypes.array.isRequired,
};

export default DayView;