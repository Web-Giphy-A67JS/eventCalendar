import React from "react";
import { startOfWeek, addDays, format, isSameDay } from "date-fns";
import { useNavigate } from "react-router-dom";

const WorkWeekView = ({ currentDate, events }) => {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const workDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));
  const navigate = useNavigate();

  const handleDayClick = (day) => {
    const formattedDate = format(day, "yyyy-MM-dd");
    navigate(`/day-events?date=${formattedDate}`);
  };

  return (
    <div className="work-week-view grid grid-cols-5 gap-2 p-4">
      {workDays.map((day) => {
        const dayEvents = events.filter((event) => {
          const eventStartDate = new Date(event.startDate);
          const eventEndDate = new Date(event.endDate);

          // Check if the event spans the current day
          return (
            day >= new Date(eventStartDate.getFullYear(), eventStartDate.getMonth(), eventStartDate.getDate()) &&
            day <= new Date(eventEndDate.getFullYear(), eventEndDate.getMonth(), eventEndDate.getDate())
          );
        });

        return (
          <div
            key={day.toString()}
            className={`work-week-view__day border p-2 h-32 overflow-auto bg-white rounded shadow-md cursor-pointer ${
              isSameDay(day, new Date()) ? "bg-yellow-100" : ""
            }`}
            onClick={() => handleDayClick(day)}
          >
            <div className="work-week-view__day-header text-sm font-semibold">{format(day, "EEE d")}</div>
            {dayEvents.map((event) => (
              <div
                key={event.id}
                className="work-week-view__event block text-xs bg-blue-100 p-1 mt-1 rounded hover:underline"
              >
                {event.title}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default WorkWeekView;