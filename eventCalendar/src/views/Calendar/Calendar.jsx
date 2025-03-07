import { useState } from 'react';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [animationClass, setAnimationClass] = useState('');
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = currentDate.getDate();
  const isCurrentMonthAndYear = 
    currentDate.getFullYear() === new Date().getFullYear() && 
    currentDate.getMonth() === new Date().getMonth();

  const matrix = generateCalendarMatrix(year, month);

  const handleDayClick = (day, isCurrentMonth) => {
    if (isCurrentMonth) {
      setSelectedDay(day);
    }
  };

  // Navigation handlers
  const navigateMonth = (direction) => {
    setAnimationClass(direction === 'prev' ? 'slide-left' : 'slide-right');
    setTimeout(() => {
      setCurrentDate(new Date(year, month + (direction === 'prev' ? -1 : 1)));
      setAnimationClass('');
      setSelectedDay(null);
    }, 300);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {currentDate.toLocaleString('default', { month: 'long' })} {year}
        </h2>
        <div className="space-x-2">
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
        </div>
      </div>

      <div className={`overflow-hidden transition-transform duration-300 ${animationClass}`}>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <th key={day} className="p-2 text-sm font-medium bg-gray-50">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, colIndex) => {
                  const isToday = cell.day === today && cell.isCurrentMonth && isCurrentMonthAndYear;
                  const isSelected = cell.day === selectedDay && cell.isCurrentMonth;
                  
                  return (
                    <td
                      key={colIndex}
                      onClick={() => handleDayClick(cell.day, cell.isCurrentMonth)}
                      className={`
                        p-2 text-center border
                        ${cell.isCurrentMonth ? 'text-gray-800' : 'text-gray-400'}
                        ${isToday ? 'bg-yellow-100 font-bold' : ''}
                        ${isSelected ? 'bg-green-500 text-white animate-pulse' : ''}
                        ${cell.isCurrentMonth ? 'hover:bg-gray-100 cursor-pointer' : ''}
                      `}
                    >
                      {cell.day}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Matrix generator from user's original code
const generateCalendarMatrix = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const matrix = Array(6).fill().map(() => 
    Array(7).fill().map(() => ({ day: null, isCurrentMonth: false }))
  );

  // Fill previous month
  for (let i = startDay - 1; i >= 0; i--) {
    matrix[0][i] = { 
      day: daysInPrevMonth - (startDay - i - 1), 
      isCurrentMonth: false 
    };
  }

  // Fill current month
  for (let day = 1; day <= daysInMonth; day++) {
    const index = startDay + day - 1;
    const row = Math.floor(index / 7);
    const col = index % 7;
    matrix[row][col] = { day, isCurrentMonth: true };
  }

  // Fill next month
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

export default Calendar;