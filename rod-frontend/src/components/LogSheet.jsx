import { useEffect, useState } from 'react';

export default function LogSheet({ logs }) {
  const [dutyData, setDutyData] = useState([]);

  useEffect(() => {
    console.log('Logs:', JSON.stringify(logs, null, 2));

    const dutyStatuses = ['off_duty', 'driving', 'on_duty_non_driving'];
    const processedData = logs.map((log) => {
      // 24 hours * 4 quarters = 96 segments
      const quarters = Array(24 * 4).fill(null);
      const totals = { off_duty: 0, driving: 0, on_duty_non_driving: 0 };

      if (log.segments && Array.isArray(log.segments)) {
        log.segments.forEach((segment) => {
          const status = segment.status;
          // Convert start and end times to quarter indices (0-95)
          const startQuarter = Math.floor(segment.start * 4);
          const endQuarter = Math.ceil(segment.end * 4);
          const duration = segment.end - segment.start;

          if (dutyStatuses.includes(status)) {
            totals[status] += duration;
            for (let q = startQuarter; q < endQuarter && q < 96; q++) {
              quarters[q] = status;
            }
          }
        });
      } else {
        console.warn(`No segments found for Day ${log.day}`);
      }

      return { day: log.day, quarters, totals };
    });

    setDutyData(processedData);
  }, [logs]);

  const dutyStatuses = ['off_duty', 'driving', 'on_duty_non_driving'];
  const statusColors = {
    off_duty: 'bg-gray-400',
    driving: 'bg-green-500',
    on_duty_non_driving: 'bg-yellow-500',
  };

  const hourLabels = Array.from({ length: 24 }, (_, i) => {
    if (i === 0) return 'mid night';
    if (i === 12) return 'noon';
    return i;
  });

  // Helper function to get quarters for a specific hour
  const getHourQuarters = (quarters, hour) => {
    const startIdx = hour * 4;
    return quarters.slice(startIdx, startIdx + 4);
  };

  return (
    <div className="p-6 rounded-lg shadow-lg mb-28">
      <h2 className="text-xl font-semibold text-white mb-4">Driver Log Sheet</h2>
      <div className="max-h-[640px] overflow-auto">
        {dutyData.map((dayData, dayIndex) => (
          <div key={dayData.day} className="bg-gray-700 py-8 px-6 mb-6 min-w-[1000px]">
            <h3 className="text-white font-semibold mb-2">Day {dayData.day}</h3>
            <div className="relative">
              <table className="w-full border-collapse text-sm text-white">
                <tbody>
                  {/* Row for Duty Status labels */}
                  <tr>
                    <td className="border border-gray-600 p-2 w-32">Duty Status</td>
                    {Array.from({ length: 24 }).map((_, hour) => (
                      <td
                        key={hour}
                        className="border border-gray-600 p-2 w-10 text-center"
                      >
                        {hourLabels[hour]}
                      </td>
                    ))}
                    <td className="border border-gray-600 p-2 w-20 text-center">
                      Total Hours
                    </td>
                  </tr>
                  {/* Rows for each duty status */}
                  {dutyStatuses.map((status) => (
                    <tr key={status}>
                      <td className="border border-gray-600 p-2 text-left">
                        {status.replace('_', ' ')}
                      </td>
                      {Array.from({ length: 24 }).map((_, hour) => {
                        const hourQuarters = getHourQuarters(dayData.quarters, hour);
                        return (
                          <td
                            key={hour}
                            className="border border-gray-600 py-1 relative h-6"
                          >
                            <div className="flex w-full h-full">
                              {hourQuarters.map((qStatus, qIdx) => (
                                <div
                                  key={qIdx}
                                  className={`flex items-center w-1/4 h-full ${
                                    qStatus === status ? statusColors[status] : 'bg-transparent'
                                  }`}
                                >
                                  {qStatus === status && (
                                    <div className=" flex  h-1 w-full bg-black opacity-80" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </td>
                        );
                      })}
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
