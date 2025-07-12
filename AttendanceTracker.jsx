import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import html2canvas from 'html2canvas';


// --- AttendanceTracker Component ---
const AttendanceTracker = ({ darkMode }) => {
  // State for daily attendance logs
  const [attendanceLog, setAttendanceLog] = useState([]); // [{ date: 'YYYY-MM-DD', attended: boolean, id: unique_id }]
  const [newDate, setNewDate] = useState('');
  const [newAttended, setNewAttended] = useState(true); // Default to 'Yes'

  // Calculated attendance stats
  const [totalClasses, setTotalClasses] = useState(0);
  const [totalAttended, setTotalAttended] = useState(0);
  const [attendancePercentage, setAttendancePercentage] = useState(0);

  // Alerts and UI states
  const [error, setError] = useState('');
  const [showAlertLowAttendance, setShowAlertLowAttendance] = useState(false);
  const [showAlertMissedClasses, setShowAlertMissedClasses] = useState(false);

  // Effect to recalculate attendance whenever attendanceLog changes
  useEffect(() => {
    let total = attendanceLog.length;
    let attended = attendanceLog.filter(entry => entry.attended).length;
    let percentage = total === 0 ? 0 : (attended / total) * 100;

    setTotalClasses(total);
    setTotalAttended(attended);
    setAttendancePercentage(percentage.toFixed(2));

    // Check for alerts
    setShowAlertLowAttendance(percentage < 75 && total > 0);

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    let missedClassesThisMonth = 0;

    attendanceLog.forEach(entry => {
      const entryDate = new Date(entry.date);
      if (entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear && !entry.attended) {
        missedClassesThisMonth++;
      }
    });
    setShowAlertMissedClasses(missedClassesThisMonth >= 4);

  }, [attendanceLog]);

  // Function to add a new attendance entry
  const addAttendanceEntry = () => {
    if (!newDate) {
      setError('Please select a date.');
      return;
    }

    const dateExists = attendanceLog.some(entry => entry.date === newDate);
    if (dateExists) {
      setError('Attendance for this date already exists. Please edit the existing entry or choose a different date.');
      return;
    }

    setAttendanceLog(prevLog => [
      ...prevLog,
      { id: Date.now(), date: newDate, attended: newAttended }
    ].sort((a, b) => new Date(a.date) - new Date(b.date))); // Sort by date

    setNewDate('');
    setNewAttended(true);
    setError('');
  };

  // Function to update an attendance entry (e.g., toggle attended status)
  const updateAttendanceEntry = (id, field, value) => {
    setAttendanceLog(prevLog =>
      prevLog.map(entry =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  // Function to delete an attendance entry
  const deleteAttendanceEntry = (id) => {
    setAttendanceLog(prevLog => prevLog.filter(entry => entry.id !== id));
  };

  // Function to reset all attendance data
  const handleReset = () => {
    setAttendanceLog([]);
    setNewDate('');
    setNewAttended(true);
    setError('');
    setShowAlertLowAttendance(false);
    setShowAlertMissedClasses(false);
  };

  // Prepare data for a simple SVG line chart
  const getChartData = () => {
    if (attendanceLog.length < 2) return [];

    const sortedLog = [...attendanceLog].sort((a, b) => new Date(a.date) - new Date(b.date));
    let cumulativeTotal = 0;
    let cumulativeAttended = 0;
    const chartData = [];

    sortedLog.forEach((entry, index) => {
      cumulativeTotal++;
      if (entry.attended) {
        cumulativeAttended++;
      }
      const currentPercentage = (cumulativeAttended / cumulativeTotal) * 100;
      chartData.push({
        x: index, // Use index for x-axis to represent time progression
        y: currentPercentage,
        date: entry.date
      });
    });
    return chartData;
  };

  const chartData = getChartData();
  const chartWidth = 300;
  const chartHeight = 150;
  const padding = 20;

  const getPoints = () => {
    if (chartData.length === 0) return "";

    const xScale = (chartWidth - 2 * padding) / (chartData.length - 1 || 1);
    const yScale = (chartHeight - 2 * padding) / 100; // Percentage from 0 to 100

    return chartData.map((point, i) => {
      const x = padding + i * xScale;
      const y = chartHeight - padding - point.y * yScale; // Invert Y for SVG coordinates
      return `${x},${y}`;
    }).join(" ");
  };

  return (
    <div className={`p-4 font-inter ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-yellow-50 to-orange-100'}`}>
      <div className={`p-8 rounded-2xl shadow-xl w-full max-w-4xl mx-auto border space-y-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="text-center">
          <h2 className={`text-3xl font-bold flex items-center justify-center ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            <span className="mr-2 text-4xl">🗓️</span> Attendance Tracker
          </h2>
          <p className={`mt-2 text-md ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Log your daily attendance, track trends, and stay on top of your required percentage.
          </p>
        </div>

        {/* Daily Attendance Log Form Card */}
        <div className={`p-6 rounded-xl shadow-inner mb-6 border space-y-4 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-center ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Add Daily Attendance</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <label htmlFor="log-date-main" className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Date:
              </label>
              <input
                type="date"
                id="log-date-main"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300'}`}
                max={new Date().toISOString().split('T')[0]} // Prevent future dates
              />
            </div>
            <div>
              <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Attended:
              </label>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="attended-status"
                    value="true"
                    checked={newAttended === true}
                    onChange={() => setNewAttended(true)}
                    className="form-radio text-blue-600 h-4 w-4"
                  />
                  <span className={`ml-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="attended-status"
                    value="false"
                    checked={newAttended === false}
                    onChange={() => setNewAttended(false)}
                    className="form-radio text-red-600 h-4 w-4"
                  />
                  <span className={`ml-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>No</span>
                </label>
              </div>
            </div>
          </div>
          {error && <p className="text-red-500 text-xs italic mt-2 text-center col-span-2">{error}</p>}
          <button
            onClick={addAttendanceEntry}
            className={`mt-4 w-full font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 ${darkMode ? 'bg-blue-700 hover:bg-blue-600 text-white focus:ring-blue-500' : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'}`}
          >
            Add Entry
          </button>
        </div>

        {/* Current Attendance Summary Card */}
        <div className={`p-6 rounded-xl shadow-md border text-center space-y-4 ${darkMode ? 'bg-purple-900 border-purple-700' : 'bg-purple-50 border-purple-200'}`}>
          <h3 className={`text-xl font-semibold ${darkMode ? 'text-purple-200' : 'text-purple-800'}`}>Your Current Attendance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-lg font-medium">
            <div className={`p-3 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white'}`}>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Classes:</p>
              <p className="text-blue-700 text-3xl font-bold">{totalClasses}</p>
            </div>
            <div className={`p-3 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white'}`}>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Classes Attended:</p>
              <p className="text-green-600 text-3xl font-bold">{totalAttended}</p>
            </div>
            <div className={`p-3 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white'}`}>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Attendance %:</p>
              <p className="text-blue-700 text-3xl font-bold">{attendancePercentage}%</p>
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        {(showAlertLowAttendance || showAlertMissedClasses) && (
          <div className="space-y-3">
            {showAlertLowAttendance && (
              <div className={`border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm ${darkMode ? 'bg-red-900 dark:text-red-300' : 'bg-red-100'}`} role="alert">
                <p className="font-bold">🚨 Risk of shortage!</p>
                <p className="text-sm">Your attendance is below the 75% threshold. Please monitor it closely.</p>
              </div>
            )}
            {showAlertMissedClasses && (
              <div className={`border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md shadow-sm ${darkMode ? 'bg-yellow-900 dark:text-yellow-300' : 'bg-yellow-100'}`} role="alert">
                <p className="font-bold">⚠️ Watch your attendance!</p>
                <p className="text-sm">You've missed 4 or more classes this month. Beware!</p>
              </div>
            )}
          </div>
        )}

        {/* Attendance Trend Chart Card */}
        {chartData.length > 1 && (
            <div className={`p-6 rounded-xl shadow-md border text-center space-y-4 ${darkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
                <h3 className={`text-xl font-semibold ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>Attendance Trend Over Time</h3>
                <div className="overflow-x-auto">
                    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className={`w-full h-auto rounded-lg p-2 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        {/* X Axis Line */}
                        <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke={`${darkMode ? '#6B7280' : '#ccc'}`} strokeWidth="1" />
                        {/* Y Axis Line */}
                        <line x1={padding} y1={padding} x2={padding} y2={chartHeight - padding} stroke={`${darkMode ? '#6B7280' : '#ccc'}`} strokeWidth="1" />

                        {/* Y Axis Labels (0%, 50%, 100%) */}
                        <text x={padding - 5} y={chartHeight - padding} textAnchor="end" fontSize="10" fill={`${darkMode ? '#9CA3AF' : '#666'}`}>0%</text>
                        <text x={padding - 5} y={chartHeight - padding - (50 * (chartHeight - 2 * padding) / 100)} textAnchor="end" fontSize="10" fill={`${darkMode ? '#9CA3AF' : '#666'}`}>50%</text>
                        <text x={padding - 5} y={padding + 5} textAnchor="end" fontSize="10" fill={`${darkMode ? '#9CA3AF' : '#666'}`}>100%</text>

                        {/* Line for 75% threshold */}
                        <line
                            x1={padding}
                            y1={chartHeight - padding - (75 * (chartHeight - 2 * padding) / 100)}
                            x2={chartWidth - padding}
                            y2={chartHeight - padding - (75 * (chartHeight - 2 * padding) / 100)}
                            stroke="#FF6384" // A contrasting color for the threshold
                            strokeWidth="1"
                            strokeDasharray="4 4"
                        />
                        <text x={chartWidth - padding + 5} y={chartHeight - padding - (75 * (chartHeight - 2 * padding) / 100) + 4} fontSize="10" fill="#FF6384">75%</text>

                        {/* Plotting the line */}
                        <polyline
                            fill="none"
                            stroke="#4A90E2" // Blue color for the trend line
                            strokeWidth="2"
                            points={getPoints()}
                        />
                        {/* Plotting points */}
                        {chartData.map((point, i) => (
                            <circle
                                key={i}
                                cx={padding + i * ((chartWidth - 2 * padding) / (chartData.length - 1 || 1))}
                                cy={chartHeight - padding - point.y * ((chartHeight - 2 * padding) / 100)}
                                r="3"
                                fill="#4A90E2"
                                title={`${point.date}: ${point.y.toFixed(2)}%`}
                            />
                        ))}
                    </svg>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Visual representation of your attendance percentage over time.
                </p>
            </div>
        )}

        {/* Attendance Log Table Card */}
        {attendanceLog.length > 0 && (
          <div className={`p-6 rounded-xl shadow-md border overflow-x-auto space-y-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-xl font-semibold text-center ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Your Attendance Log</h3>
            <table className={`min-w-full rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <tr>
                  <th className={`py-3 px-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Date</th>
                  <th className={`py-3 px-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Attended</th>
                  <th className={`py-3 px-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {attendanceLog.map((entry, index) => (
                  <tr key={entry.id} className={`${index % 2 === 0 ? (darkMode ? 'bg-gray-800' : 'bg-white') : (darkMode ? 'bg-gray-700' : 'bg-gray-50')} border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <td className={`p-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{entry.date}</td>
                    <td className="p-4">
                      <select
                        id={`attendance-status-main-${entry.id}`}
                        name={`attendance-status-${entry.id}`}
                        value={entry.attended.toString()}
                        onChange={(e) => updateAttendanceEntry(entry.id, 'attended', e.target.value === 'true')}
                        className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-800'}`}
                      >
                        <option value="true">Yes ✅</option>
                        <option value="false">No ❌</option>
                      </select>
                      <label htmlFor={`attendance-status-main-${entry.id}`} className="sr-only">Attendance Status</label>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => deleteAttendanceEntry(entry.id)}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                        title="Delete Entry"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1H9a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Reset Button */}
        {attendanceLog.length > 0 && (
          <div className="flex justify-center">
            <button
              onClick={handleReset}
              className={`font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-100 focus:ring-gray-500' : 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400'}`}
            >
              Reset All Attendance
            </button>
          </div>
        )}

        {/* Description Section */}
        <div className={`p-5 rounded-lg border shadow-sm space-y-3 ${darkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
          <h3 className={`font-bold text-lg ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
            📘 How Attendance is Calculated:
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Your attendance percentage is determined by dividing the number of classes you've attended by the total number of classes held, then multiplying by 100.
            <br />
            Formula: $Attendance \% = (C_A / T_C) \times 100$, where $C_A$ = Classes Attended, $T_C$ = Total Classes
            <br />
            This percentage is crucial for college eligibility for exams and internal marks.
          </p>
          <h3 className={`font-bold text-lg ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
            📊 How Trends and Alerts Help:
          </h3>
          <ul className={`list-disc list-inside text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <li><span className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Trend Line:</span> Visualizes your attendance over time, helping you spot positive or negative patterns.</li>
            <li><span className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Low Attendance Alert:</span> Notifies you immediately if your attendance drops below the critical 75% mark, allowing you to take corrective action.</li>
            <li><span className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Monthly Missed Classes Alert:</span> Warns you if you've missed 4 or more classes this month, prompting you to be more mindful of your attendance.</li>
          </ul>
          <h3 className={`font-bold text-lg ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
            💡 Pro Tip:
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Make it a habit to log your attendance daily. Early tracking helps prevent last-minute attendance shortages and keeps your academic journey smooth!
          </p>
        </div>
      </div>
    </div>
  );
};
// --- End AttendanceTracker Component ---
export default AttendanceTracker;   