import React from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const DayView = ({ currentDate, events }) => {
  const dayEvents = events.filter(
    (e) => format(new Date(e.startDate), "yyyy-MM-dd") === format(currentDate, "yyyy-MM-dd")
  );
  const navigate = useNavigate();

  const handleDayClick = () => {
    const formattedDate = format(currentDate, "yyyy-MM-dd");
    navigate(`/day-events?date=${formattedDate}`);
  };

  return (
    <div
      className="day-view bg-white border rounded shadow-md cursor-pointer p-4"
      onClick={handleDayClick}
    >
      <h3 className="day-view__title text-lg font-semibold mb-2">
        {format(currentDate, "MMMM d, yyyy")}
      </h3>
      {dayEvents.length > 0 ? (
        <ul className="day-view__events space-y-2">
          {dayEvents.map((event) => (
            <li key={event.id} className="day-view__event p-2 bg-blue-100 rounded">
              {event.title} ({format(new Date(event.startDate), "HH:mm")} -{" "}
              {format(new Date(event.endDate), "HH:mm")})
            </li>
          ))}
        </ul>
      ) : (
        <p className="day-view__no-events">No events for this day.</p>
      )}
    </div>
  );
};

export default DayView;