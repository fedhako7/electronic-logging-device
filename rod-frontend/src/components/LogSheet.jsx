import { useEffect, useState } from 'react';

export default function LogSheet({ logs }) {
  const [dutyData, setDutyData] = useState([]);

  useEffect(() => {
    console.log('Logs:', JSON.stringify(logs, null, 2));

    const dutyStatuses = ['off_duty', 'driving', 'on_duty_non_driving'];
    const processedData = logs.map((log) => {
      const hours = Array(25).fill(null); // 25 hours to match 24 intervals + pre-midnight
      const totals = { off_duty: 0, driving: 0, on_duty_non_driving: 0 };

      if (log.segments && Array.isArray(log.segments)) {
        log.segments.forEach((segment) => {
          const status = segment.status;
          const start = Math.floor(segment.start);
          const end = Math.ceil(segment.end);
          const duration = segment.end - segment.start;

          if (dutyStatuses.includes(status)) {
            totals[status] += duration;
            for (let h = start; h < end && h < 25; h++) {
              hours[h] = status;
            }
          }
        });
      } else {
        console.warn(`No segments found for Day ${log.day}`);
      }

      return { day: log.day, hours, totals };
    });

    setDutyData(processedData);
  }, [logs]);

  const dutyStatuses = ['off_duty', 'driving', 'on_duty_non_driving'];
  const statusColors = {
    off_duty: 'bg-gray-400',
    driving: 'bg-green-500',
    on_duty_non_driving: 'bg-yellow-500',
  };

  const hourLabels = Array.from({ length: 25 }, (_, i) => {
    if (i === 0) return 'm.n';
    if (i === 12) return 'noon';
    if (i === 24) return 'm.n';
    return i;
  });

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold text-white mb-4">Driver Log Sheet</h2>
      <div className="max-h-[600px] overflow-auto">
        {dutyData.map((dayData, dayIndex) => (
          <div key={dayData.day} className="mb-6">
            <h3 className="text-white font-semibold mb-2">Day {dayData.day}</h3>
            <div className="relative">
              {/* Time labels above the table, aligned with separators */}
              <div className="flex text-white text-xs mb-1">
                <span className="w-32" /> {/* Offset for Duty Status column */}
                {hourLabels.map((label, i) => (
                  <span key={i} className="w-10 text-left">
                    {label}
                  </span>
                ))}
                <span className="w-20" /> {/* Offset for Total Hours column */}
              </div>
              <table className="w-full border-collapse text-sm text-white">
                <thead>
                  <tr>
                    <th className="border border-gray-600 p-2 w-32">Duty Status</th>
                    {Array.from({ length: 25 }).map((_, i) => (
                      <th key={i} className="border border-gray-600 p-2 w-10" />
                    ))}
                    <th className="border border-gray-600 p-2 w-20">Total Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {dutyStatuses.map((status) => (
                    <tr key={status}>
                      <td className="border border-gray-600 p-2 text-left">
                        {status.replace('_', ' ')}
                      </td>
                      {Array.from({ length: 25 }).map((_, hour) => (
                        <td
                          key={hour}
                          className={`border border-gray-600 p-1 ${
                            dayData.hours[hour] === status ? statusColors[status] : 'bg-transparent'
                          }`}
                        >
                          {dayData.hours[hour] === status && (
                            <div className="h-4 w-full bg-black opacity-50" />
                          )}
                        </td>
                      ))}
                      <td className="border border-gray-600 p-2 text-center">
                        {dayData.totals[status].toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
