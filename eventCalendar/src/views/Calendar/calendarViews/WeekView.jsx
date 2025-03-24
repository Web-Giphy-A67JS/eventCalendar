import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay } from "date-fns";
import { useNavigate } from "react-router-dom";

const WeekView = ({ currentDate, events }) => {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const navigate = useNavigate();

  const handleDayClick = (day) => {
    const formattedDate = format(day, "yyyy-MM-dd");
    navigate(`/day-events?date=${formattedDate}`);
  };

  return (
    <div className="week-view grid grid-cols-7 gap-2 p-4">
      {days.map((day) => {
        const dayEvents = events.filter((event) => {
          const eventStartDate = new Date(event.startDate);
          const eventEndDate = new Date(event.endDate);

          return (
            day >= new Date(eventStartDate.getFullYear(), eventStartDate.getMonth(), eventStartDate.getDate()) &&
            day <= new Date(eventEndDate.getFullYear(), eventEndDate.getMonth(), eventEndDate.getDate())
          );
        });

        return (
          <div
            key={day.toString()}
            className={`week-view__day border p-2 h-32 overflow-auto bg-white rounded shadow-md cursor-pointer ${
              isSameDay(day, new Date()) ? "bg-yellow-100" : ""
            }`}
            onClick={() => handleDayClick(day)}
          >
            <div className="week-view__day-header text-sm font-semibold">{format(day, "EEE d")}</div>
            {dayEvents.map((event) => (
              <div
                key={event.id}
                className="week-view__event block text-xs bg-blue-100 p-1 mt-1 rounded hover:underline"
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

export default WeekView;