import PropTypes from 'prop-types';
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import DayView from "./calendarViews/DayView";
import WeekView from "./calendarViews/WeekView";
import WorkWeekView from "./calendarViews/WorkWeekView";
import { format } from "date-fns";
import { fetchEvents } from "../../../services/event.services";
import { AppContext } from "../../store/app.context";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState("month");
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();
  const { user } = useContext(AppContext);
  const userId = user?.uid;

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const fetchedEvents = await fetchEvents();
        const userEvents = fetchedEvents.filter((event) =>
          event.participants.includes(userId)
        );
        setEvents(userEvents);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };
    if (userId) {
      loadEvents();
    }
  }, [userId]);

  const navigateDay = (direction) => {
    setCurrentDate((prevDate) =>
      new Date(
        prevDate.getFullYear(),
        prevDate.getMonth(),
        prevDate.getDate() + direction
      )
    );
  };

  const navigateWeek = (direction) => {
    setCurrentDate((prevDate) =>
      new Date(
        prevDate.getFullYear(),
        prevDate.getMonth(),
        prevDate.getDate() + direction * 7
      )
    );
  };

  const navigateMonth = (direction) => {
    setCurrentDate((prevDate) =>
      new Date(prevDate.getFullYear(), prevDate.getMonth() + direction, 1)
    );
  };

  const handleDayClick = (day, isCurrentMonth) => {
    if (isCurrentMonth) {
      const clickedDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const formattedDate = format(clickedDate, "yyyy-MM-dd");
      navigate(`/day-events?date=${formattedDate}`);
    }
  };

  const handleNewEventClick = () => {
    navigate("/create-event");
  };

  const renderView = () => {
    switch (selectedView) {
      case "day":
        return <DayView currentDate={currentDate} events={events} />;
      case "week":
        return <WeekView currentDate={currentDate} events={events} />;
      case "work-week":
        return <WorkWeekView currentDate={currentDate} events={events} />;
      case "month":
      default:
        return (
          <div className="calendar__month-view">
            <div className="grid grid-cols-7 gap-2 bg-gray-100 p-4 rounded-lg shadow-md">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center font-semibold text-gray-700 uppercase text-sm"
                >
                  {day}
                </div>
              ))}
              {generateCalendarMatrix(
                currentDate.getFullYear(),
                currentDate.getMonth()
              ).map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  const isToday =
                    cell.isCurrentMonth &&
                    cell.day === new Date().getDate() &&
                    currentDate.getMonth() === new Date().getMonth() &&
                    currentDate.getFullYear() === new Date().getFullYear();

                  const dayEvents = cell.isCurrentMonth
                    ? events.filter((event) => {
                        const eventStartDate = new Date(event.startDate);
                        const eventEndDate = new Date(event.endDate);
                        const normalizedEventStartDate = new Date(
                          eventStartDate.getFullYear(),
                          eventStartDate.getMonth(),
                          eventStartDate.getDate()
                        );
                        const normalizedEventEndDate = new Date(
                          eventEndDate.getFullYear(),
                          eventEndDate.getMonth(),
                          eventEndDate.getDate()
                        );
                        const cellDate = new Date(
                          currentDate.getFullYear(),
                          currentDate.getMonth(),
                          cell.day
                        );

                        return (
                          cellDate.getTime() >=
                            normalizedEventStartDate.getTime() &&
                          cellDate.getTime() <=
                            normalizedEventEndDate.getTime() &&
                          cellDate.getMonth() === currentDate.getMonth()
                        );
                      })
                    : [];

                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() =>
                        handleDayClick(cell.day, cell.isCurrentMonth)
                      }
                      className={`
                        p-2 rounded-lg border bg-white shadow-sm cursor-pointer
                        ${cell.isCurrentMonth ? "text-gray-800" : "text-gray-400"}
                        ${isToday ? "border-blue-500 bg-blue-50" : ""}
                        hover:shadow-md transition-shadow
                      `}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span
                          className={`text-sm font-bold ${
                            isToday ? "text-blue-600" : ""
                          }`}
                        >
                          {cell.day}
                        </span>
                        {isToday && (
                          <span className="text-xs text-blue-500 font-semibold">
                            Today
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className="bg-blue-100 text-blue-800 text-xs rounded px-2 py-1 truncate"
                            title={event.title}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-primary">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        
        <div className="flex items-center gap-2">
          <div className="flex border border-gray-200 rounded-md overflow-hidden">
            <button
              onClick={() =>
                selectedView === "day"
                  ? navigateDay(-1)
                  : selectedView === "month"
                  ? navigateMonth(-1)
                  : navigateWeek(-1)
              }
              className="px-4 py-2 bg-white text-text hover:bg-gray-50 transition duration-200"
            >
              {"< Previous"}
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 bg-white text-text hover:bg-gray-50 transition duration-200 border-l border-r border-gray-200"
            >
              Today
            </button>
            <button
              onClick={() =>
                selectedView === "day"
                  ? navigateDay(1)
                  : selectedView === "month"
                  ? navigateMonth(1)
                  : navigateWeek(1)
              }
              className="px-4 py-2 bg-white text-text hover:bg-gray-50 transition duration-200"
            >
              {"Next >"}
            </button>
          </div>
          
          <button
            onClick={handleNewEventClick}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition duration-200 transform hover:scale-105"
          >
            Create Event
          </button>
        </div>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {["day", "week", "work-week", "month"].map((view) => (
          <button
            key={view}
            onClick={() => setSelectedView(view)}
            className={`px-4 py-2 rounded-md transition duration-200 ${
              selectedView === view
                ? "bg-primary text-white"
                : "bg-white text-text hover:bg-gray-100"
            }`}
          >
            {view === "work-week" ? "Work Week" : view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>

      {renderView()}
    </div>
  );
};

const generateCalendarMatrix = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const matrix = Array(6)
    .fill()
    .map(() => Array(7).fill().map(() => ({ day: null, isCurrentMonth: false })));

  for (let i = startDay - 1; i >= 0; i--) {
    matrix[0][i] = {
      day: daysInPrevMonth - (startDay - i - 1),
      isCurrentMonth: false,
    };
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const index = startDay + day - 1;
    const row = Math.floor(index / 7);
    const col = index % 7;
    matrix[row][col] = { day, isCurrentMonth: true };
  }

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

Calendar.propTypes = {
  currentDate: PropTypes.instanceOf(Date),
  selectedView: PropTypes.string,
  animationClass: PropTypes.string,
  events: PropTypes.arrayOf(PropTypes.object),
  user: PropTypes.object,
};

export default Calendar;