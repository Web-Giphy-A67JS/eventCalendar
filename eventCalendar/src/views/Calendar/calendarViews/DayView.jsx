import React from "react";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { useNavigate } from "react-router-dom";

const DayView = ({ currentDate, events }) => {
  const navigate = useNavigate();

  // Filter events that occur on the current day
  const dayEvents = events.filter((event) => {
    const eventStartDate = new Date(event.startDate);
    const eventEndDate = new Date(event.endDate);

    // Check if the event overlaps with the current day
    return isWithinInterval(currentDate, {
      start: startOfDay(eventStartDate),
      end: endOfDay(eventEndDate),
    });
  });

  const handleDayClick = () => {
    const formattedDate = format(currentDate, "yyyy-MM-dd");
    navigate(`/day-events?date=${formattedDate}`);
  };

  return (
    <div
      className="day-view bg-base-100 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleDayClick}
    >
      <h3 className="text-2xl font-bold text-primary mb-4">
        {format(currentDate, "MMMM d, yyyy")}
      </h3>
      {dayEvents.length > 0 ? (
        <ul className="space-y-4">
          {dayEvents.map((event) => (
            <li
              key={event.id}
              className="p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <h4 className="text-lg font-semibold text-blue-600">
                {event.title}
              </h4>
              <p className="text-sm text-gray-600">
                {format(new Date(event.startDate), "HH:mm")} -{" "}
                {format(new Date(event.endDate), "HH:mm")}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-center">No events for this day.</p>
      )}
    </div>
  );
};

export default DayView;