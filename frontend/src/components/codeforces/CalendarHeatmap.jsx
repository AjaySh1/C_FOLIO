import { Tooltip } from 'react-tooltip';
import { format, eachDayOfInterval } from 'date-fns';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

const startDate = startOfMonth(subMonths(new Date(), 6));
const endDate = endOfMonth(subMonths(new Date(), 1));
import { motion } from 'framer-motion';

const CalendarHeatmap = ({ submissionCalendar }) => {
  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const startDate = startOfMonth(subMonths(new Date(), 6));
const endDate = endOfMonth(subMonths(new Date(), 1));
  const allDays = eachDayOfInterval({ start: startDate, end: endDate });

  // Pad the first week so it starts on Sunday
  const firstDayOfWeek = allDays[0].getDay();
  let paddedDays = [...allDays];
  if (firstDayOfWeek !== 0) {
    for (let i = 0; i < firstDayOfWeek; i++) {
      paddedDays.unshift(null);
    }
  }
  // Pad the last week so it ends on Saturday
  const lastDayOfWeek = paddedDays[paddedDays.length - 1]?.getDay();
  if (lastDayOfWeek !== 6) {
    for (let i = lastDayOfWeek + 1; i <= 6; i++) {
      paddedDays.push(null);
    }
  }

  // Group days into weeks
  const weeks = [];
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7));
  }

  // Calculate month spans: start and end week index for each month
  const monthSpans = [];
  let lastMonth = null;
  let spanStart = 0;
  weeks.forEach((week, idx) => {
    const firstDay = week.find(d => d !== null);
    if (firstDay) {
      const month = format(firstDay, 'MMM yyyy');
      if (month !== lastMonth) {
        if (lastMonth !== null) {
          monthSpans.push({ label: lastMonth, start: spanStart, end: idx });
        }
        lastMonth = month;
        spanStart = idx;
      }
    }
    if (idx === weeks.length - 1 && lastMonth !== null) {
      monthSpans.push({ label: lastMonth, start: spanStart, end: weeks.length });
    }
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6 relative"
    >
      <h3 className="text-xl font-semibold mb-6 text-blue-400">6-Month Activity</h3>

      {/* Month Labels as flex row, each label spans correct number of week columns */}
      <div className="flex mb-2 ml-8" style={{ minHeight: '18px' }}>
        {monthSpans.map((month, i) => (
          <div
            key={month.label + month.start}
            className="text-xs text-gray-400 font-medium text-center"
            style={{ width: `${(month.end - month.start) * 28}px`, minWidth: '60px' }}
          >
            {month.label}
          </div>
        ))}
      </div>

      <div className="flex">
        {/* Weekday Labels */}
        <div className="flex flex-col gap-1 text-xs text-gray-400 mr-2">
          {WEEKDAYS.map(day => (
            <div key={day} className="h-4 w-8 flex items-center justify-end pr-1">
              {day}
            </div>
          ))}
        </div>
        {/* Heatmap Grid */}
        <div className="flex gap-1">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-1">
              {week.map((day, dayIdx) => {
                if (!day) {
                  return <div key={weekIdx + '-' + dayIdx} className="h-4 w-4 rounded-sm bg-transparent" />;
                }
                const dateString = format(day, 'yyyy-MM-dd');
                const count = submissionCalendar[dateString] || 0;
                return (
                  <div
                    key={dateString}
                    data-tooltip-id="heatmap-tooltip"
                    data-tooltip-content={`${format(day, 'MMM dd, yyyy')} - ${count} submission${count !== 1 ? 's' : ''}`}
                    className={`h-4 w-4 rounded-sm transition-all ${
                      count === 0 ? 'bg-gray-700' : 
                      count < 3 ? 'bg-blue-400' : 
                      count < 5 ? 'bg-blue-500' : 'bg-blue-600'
                    } hover:scale-110 cursor-pointer`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <Tooltip
        id="heatmap-tooltip"
        className="!bg-gray-800 !text-white !rounded-lg !px-3 !py-2 !text-sm !border !border-gray-700"
        place="top"
      />
    </motion.div>
  );
};

export default CalendarHeatmap;