import PropTypes from 'prop-types';
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
    <div className="week-view bg-base-100 rounded-lg shadow-md p-4">
      {/* Week Header */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {days.map((day) => (
          <div
            key={day.toString()}
            className={`text-center font-semibold text-sm p-2 rounded ${
              isSameDay(day, new Date()) ? "bg-blue-100 text-blue-600" : "text-white"
            }`}
          >
            {format(day, "EEE d")}
          </div>
        ))}
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-2">
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
              className={`border rounded-lg p-2 h-48 overflow-auto bg-white shadow-sm hover:shadow-md transition-shadow ${
                isSameDay(day, new Date()) ? "border-blue-500" : "border-gray-200"
              }`}
              onClick={() => handleDayClick(day)}
            >
              {dayEvents.length > 0 ? (
                <ul className="space-y-2">
                  {dayEvents.map((event) => (
                    <li
                      key={event.id}
                      className="bg-blue-100 text-blue-800 text-xs rounded px-2 py-1 truncate hover:bg-blue-200 transition"
                      title={event.title}
                    >
                      {event.title}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-400 text-center">No events</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

WeekView.propTypes = {
  currentDate: PropTypes.instanceOf(Date),
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string,
      startDate: PropTypes.string,
      endDate: PropTypes.string,
    })
  ),
};

export default WeekView;