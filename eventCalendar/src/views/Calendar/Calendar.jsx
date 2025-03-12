import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import DayView from './calendarViews/DayView.jsx';
import WeekView from './calendarViews/WeekView.jsx';
import WorkWeekView from './calendarViews/WorkWeekView.jsx';
import MonthView from './calendarViews/MonthView.jsx';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('month');
  const [events] = useState([]);

  const navigate = useNavigate();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handleNewEventClick=()=>{
     navigate('/create-event');
  }

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(year, month + (direction === 'prev' ? -1 : 1)));
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  return (
    <div className="calendar p-4 max-w-4xl mx-auto">
      <div className="calendar__header flex justify-between items-center mb-4">
        <h2 className="calendar__title text-xl font-semibold">
          {currentDate.toLocaleString('default', { month: 'long' })} {year}
        </h2>
        <div className="calendar__controls space-x-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="btn btn-ghost"
          >
            Previous
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="btn btn-ghost"
          >
            Next
          </button>
          <button
            className="btn btn-primary ml-4"
            onClick={handleNewEventClick}
          >
            New Event
          </button>
        </div>
      </div>
      <div className="calendar__view-selector flex justify-center space-x-4 mb-4">
        <button
          className={`btn btn-sm ${currentView === 'month' ? 'btn-active' : 'btn-ghost'}`}
          onClick={() => handleViewChange('month')}
        >
          Month
        </button>
        <button
          className={`btn btn-sm ${currentView === 'week' ? 'btn-active' : 'btn-ghost'}`}
          onClick={() => handleViewChange('week')}
        >
          Week
        </button>
        <button
          className={`btn btn-sm ${currentView === 'workweek' ? 'btn-active' : 'btn-ghost'}`}
          onClick={() => handleViewChange('workweek')}
        >
          Work Week
        </button>
        <button
          className={`btn btn-sm ${currentView === 'day' ? 'btn-active' : 'btn-ghost'}`}
          onClick={() => handleViewChange('day')}
        >
          Day
        </button>
      </div>
      <div className="calendar__view">
        {currentView === 'month' && <MonthView currentDate={currentDate} events={events} />}
        {currentView === 'week' && <WeekView currentDate={currentDate} events={events} />}
        {currentView === 'workweek' && <WorkWeekView currentDate={currentDate} events={events} />}
        {currentView === 'day' && <DayView currentDate={currentDate} events={events} />}
      </div>
    </div>
  );
};

export default Calendar;