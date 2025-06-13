import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculateCyclePhase } from '@/utils/periodCalculations';
import { CycleData, PeriodEntry } from '@/types/period';

interface CalendarViewProps {
  cycleData: CycleData;
  periodEntries: PeriodEntry[];
  onDateClick: (date: string) => void;
}

const CalendarView = ({ cycleData, periodEntries, onDateClick }: CalendarViewProps) => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(2025, today.getMonth(), 1));

  const getFlowColor = (flow: string) => {
    switch (flow) {
      case 'light':
        return 'bg-pink-100 border-pink-300 text-pink-800';
      case 'medium':
        return 'bg-pink-200 border-pink-400 text-pink-800';
      case 'heavy':
        return 'bg-pink-300 border-pink-500 text-pink-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-600';
    }
  };

  const { calendarDays, monthYear } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDay = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dayInfo = calculateCyclePhase(
        new Date(currentDay),
        new Date(cycleData.lastPeriodStart),
        cycleData.cycleLength,
        cycleData.periodLength
      );

      const periodEntry = periodEntries.find(
        entry => entry.date === currentDay.toISOString().split('T')[0]
      );

      days.push({
        date: new Date(currentDay),
        dayInfo,
        periodEntry,
        isCurrentMonth: currentDay.getMonth() === month,
        isToday: currentDay.toDateString() === new Date().toDateString()
      });

      currentDay.setDate(currentDay.getDate() + 1);
    }

    return {
      calendarDays: days,
      monthYear: firstDay.toLocaleDateString('en-GB', { 
        month: 'long', 
        year: 'numeric' 
      })
    };
  }, [currentDate, cycleData, periodEntries]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth('prev')}
          className="h-9 w-9 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h2 className="text-xl font-semibold text-gray-800">{monthYear}</h2>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth('next')}
          className="h-9 w-9 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => (
          <button
            key={index}
            onClick={() => onDateClick(day.date.toISOString().split('T')[0])}
            className={`relative aspect-square p-2 rounded-lg text-sm transition-all hover:scale-105 ${
              day.isCurrentMonth ? 'text-gray-800' : 'text-gray-400'
            } ${
              day.isToday ? 'ring-2 ring-primary' : ''
            } ${
              day.periodEntry 
                ? getFlowColor(day.periodEntry.flow)
                : 'bg-gray-50 hover:bg-gray-100 border border-gray-100'
            }`}
          >
            <span className="font-medium">{day.date.getDate()}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-pink-100 border border-pink-300" />
          <span>Light Flow</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-pink-200 border border-pink-400" />
          <span>Medium Flow</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-pink-300 border border-pink-500" />
          <span>Heavy Flow</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
