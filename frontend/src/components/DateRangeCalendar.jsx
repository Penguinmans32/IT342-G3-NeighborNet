import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isToday,
  isBefore,
  isAfter,
  isSameDay,
  addMonths,
  isWithinInterval,
  parseISO,
  isEqual
} from 'date-fns';
import { MdChevronLeft, MdChevronRight, MdCalendarToday } from 'react-icons/md';

const DateRangeCalendar = ({ startDate, endDate, onChange, minDate, maxDate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoverDate, setHoverDate] = useState(null);
  const [selecting, setSelecting] = useState(false);
  const [selectStart, setSelectStart] = useState(null);
  
  const today = new Date();
  const minSelectableDate = minDate ? new Date(minDate) : today;
  const maxSelectableDate = maxDate ? new Date(maxDate) : null;
  
  useEffect(() => {
    // If dates are provided, use the start date as the current month view
    if (startDate) {
      setCurrentMonth(new Date(startDate));
    } else if (minDate) {
      // If no start date but minDate is provided, use that for the initial view
      setCurrentMonth(new Date(minDate));
    }
  }, [startDate, minDate]);

  const handleDateClick = (date) => {
    // Check if date is within allowed range
    if ((isBefore(date, minSelectableDate) && !isSameDay(date, minSelectableDate)) || 
        (maxSelectableDate && (isAfter(date, maxSelectableDate) && !isSameDay(date, maxSelectableDate)))) {
      return;
    }

    if (!selecting) {
      // Starting a new selection
      setSelecting(true);
      setSelectStart(date);
      onChange({ start: format(date, 'yyyy-MM-dd'), end: format(date, 'yyyy-MM-dd') });
    } else {
      // Completing the selection
      setSelecting(false);
      
      // Check if clicking the same day as start - this is allowed
      if (isSameDay(date, selectStart)) {
        onChange({
          start: format(date, 'yyyy-MM-dd'),
          end: format(date, 'yyyy-MM-dd')
        });
      } else {
        // Ensure correct order (start date is before end date)
        const isReverseOrder = isBefore(date, selectStart);
        const newStartDate = isReverseOrder ? date : selectStart;
        const newEndDate = isReverseOrder ? selectStart : date;
        
        onChange({
          start: format(newStartDate, 'yyyy-MM-dd'),
          end: format(newEndDate, 'yyyy-MM-dd')
        });
      }
      
      setIsOpen(false);
      setHoverDate(null);
    }
  };

  const handleDateHover = (date) => {
    if (selecting && selectStart) {
      setHoverDate(date);
    }
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const monthStart = startOfMonth(currentMonth);
  
  // Create array of days for the grid, including empty spaces for proper alignment
  const firstDayOfMonth = monthStart.getDay();
  let calendarDays = [];
  
  // Add empty spaces for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  
  // Add all days of the month
  calendarDays = [...calendarDays, ...days];

  // Check if a date is within the selected range
  const isInRange = (date) => {
    if (!startDate || !endDate) return false;
    
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    // Handle case for single day selection
    if (isEqual(start, end) && isSameDay(date, start)) {
      return true;
    }
    
    // Handle regular range
    return isWithinInterval(date, { start, end });
  };

  const nextMonth = () => {
    const newMonth = addMonths(currentMonth, 1);
    // Don't allow navigating past maxDate if provided
    if (maxSelectableDate && isAfter(startOfMonth(newMonth), maxSelectableDate)) {
      return;
    }
    setCurrentMonth(newMonth);
  };
  
  const prevMonth = () => {
    const newMonth = addMonths(currentMonth, -1);
    // Don't allow navigating to months before minDate
    if (isBefore(endOfMonth(newMonth), minSelectableDate)) {
      return;
    }
    setCurrentMonth(newMonth);
  };

  // Check if a date is outside the allowed range
  const isDisabledDate = (date) => {
    if (isBefore(date, minSelectableDate) && !isSameDay(date, minSelectableDate)) {
      return true;
    }
    
    if (maxSelectableDate && (isAfter(date, maxSelectableDate) && !isSameDay(date, maxSelectableDate))) {
      return true;
    }
    
    return false;
  };

  return (
    <div className="relative w-full">
      {/* Date display field */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 
                  focus:ring-green-500 focus:border-green-500 outline-none transition-all
                  cursor-pointer flex items-center justify-between hover:border-green-400"
      >
        <div className="flex items-center gap-2 text-gray-600">
          <MdCalendarToday className="text-green-500" />
          {startDate && endDate ? (
            <span>
              {format(new Date(startDate), 'MMM dd, yyyy')} 
              {!isSameDay(new Date(startDate), new Date(endDate)) && 
                ` - ${format(new Date(endDate), 'MMM dd, yyyy')}`}
            </span>
          ) : startDate ? (
            <span>{format(new Date(startDate), 'MMM dd, yyyy')}</span>
          ) : (
            <span className="text-gray-400">Select date range</span>
          )}
        </div>
        <div className="text-green-500">
          {isOpen ? '▲' : '▼'}
        </div>
      </div>

      {/* Calendar dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 mt-2 bg-white rounded-xl shadow-xl p-4 w-full border border-gray-200"
          >
            <div className="mb-4 flex items-center justify-between">
              <button 
                onClick={prevMonth}
                className="p-1 rounded-full hover:bg-green-50 text-green-600"
              >
                <MdChevronLeft size={24} />
              </button>
              <h3 className="font-medium text-gray-700">
                {format(currentMonth, 'MMMM yyyy')}
              </h3>
              <button 
                onClick={nextMonth}
                className="p-1 rounded-full hover:bg-green-50 text-green-600"
              >
                <MdChevronRight size={24} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                if (day === null) {
                  return <div key={`empty-${i}`} className="aspect-square"></div>;
                }

                // Check if this day is the start or end date
                const isStartDate = startDate && isSameDay(day, new Date(startDate));
                const isEndDate = endDate && isSameDay(day, new Date(endDate));
                const isSelected = isStartDate || isEndDate;
                
                // Check if this day is in the selected range
                const isInSelectedRange = isInRange(day);
                
                // Check if date is disabled
                const isDisabled = isDisabledDate(day);
                
                // Check if today (for special styling)
                const isTodayDate = isToday(day);
                
                // This shows if the date is at item's available boundaries
                const isMinDate = isSameDay(day, minSelectableDate);
                const isMaxDate = maxSelectableDate && isSameDay(day, maxSelectableDate);

                return (
                  <div 
                    key={day.toString()}
                    onClick={() => !isDisabled && handleDateClick(day)}
                    onMouseEnter={() => handleDateHover(day)}
                    className={`
                      aspect-square flex items-center justify-center rounded-md text-sm relative
                      transition-all duration-200
                      ${!isInSelectedRange && !isDisabled ? 'hover:bg-green-50' : ''}
                      ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer'}
                      ${isTodayDate && !isSelected ? 'border border-green-400' : ''}
                      ${isMinDate || isMaxDate ? 'ring-1 ring-green-300' : ''}
                    `}
                  >
                    {/* Background for range - using green gradient for more attractive look */}
                    {isInSelectedRange && (
                      <div className={`
                        absolute inset-0 bg-gradient-to-b from-green-50 to-green-100
                        ${isStartDate && isEndDate ? 'rounded-md' : ''}
                        ${isStartDate && !isEndDate ? 'rounded-l-md' : ''}
                        ${isEndDate && !isStartDate ? 'rounded-r-md' : ''}
                        ${!isStartDate && !isEndDate ? 'border-y border-green-100' : ''}
                        ${isStartDate ? 'border-l border-green-200' : ''}
                        ${isEndDate ? 'border-r border-green-200' : ''}
                      `}></div>
                    )}
                    
                    {/* Day number with selected styling */}
                    <div className={`
                      z-10 w-8 h-8 flex items-center justify-center rounded-full
                      transition-all duration-200
                      ${isSelected ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md' : ''}
                      ${isInSelectedRange && !isSelected ? 'text-green-800' : ''}
                      ${(isMinDate || isMaxDate) && !isSelected ? 'text-green-700 font-medium' : ''}
                    `}>
                      {format(day, 'd')}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 text-center text-xs text-green-600 font-medium">
              {selecting ? 'Click a date to complete selection' : 'Select a date to begin'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DateRangeCalendar;