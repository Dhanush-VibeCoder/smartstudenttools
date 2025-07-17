import React, { useEffect, useState } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

// Example data structure for a calculation history entry:
// {
//   id: 'uuid-or-timestamp',
//   input: '8.5',
//   output: '80.0',
//   university: 'VTU',
//   type: 'GPA → %',
//   date: '2024-06-10T12:34:56.789Z'
// }

function getColor(value, type) {
  // For percentage: green (>=90), yellow (60-89), red (<60)
  // For CGPA: green (>=8), yellow (6-7.99), red (<6)
  if (type === 'CGPA → %') {
    if (value >= 90) return '#22c55e';
    if (value >= 60) return '#eab308';
    return '#ef4444';
  } else {
    if (value >= 8) return '#22c55e';
    if (value >= 6) return '#eab308';
    return '#ef4444';
  }
}

const CalculationHistory = ({ historyKey = 'gpa_calc_history', title = 'Calculation History', darkMode = false, showUniversity = true, showProgress = true }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem(historyKey);
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, [historyKey]);

  const clearHistory = () => {
    localStorage.removeItem(historyKey);
    setHistory([]);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const latest = history[0];
  const latestValue = parseFloat(latest?.output);

  // Add these lines:
  const isCgpaToPercentage = latest?.type === 'CGPA → %';
  const isPercentageToCgpa = latest?.type === '% → CGPA';

  // Default to 10.0 scale, or detect from your data if possible
  const gpaScale = 10.0;

  const progressValue = isCgpaToPercentage
    ? latestValue
    : isPercentageToCgpa
      ? (latestValue / gpaScale) * 100
      : 0;

  const progressLabel = isCgpaToPercentage
    ? `${latestValue}%`
    : isPercentageToCgpa
      ? `${latestValue} / ${gpaScale}`
      : latestValue;

  const latestColor = getColor(latestValue, latest?.type);
  const latestLabel = `${latestValue}${latest?.type === 'CGPA → %' ? '%' : ''}`;

  // Determine if any entry has a 'type' field
  const showType = history.some(entry => entry.type);

  return (
    <div className={`p-6 rounded-xl shadow-md border w-full max-w-2xl mx-auto mt-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <h3 className={`text-xl font-bold mb-4 text-center ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{title}</h3>
      {history.length === 0 ? (
        <p className={`text-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>No history yet. Your conversions will appear here.</p>
      ) : (
        <>
          {/* Latest Result as Circular Progress Bar */}
          {showProgress && (
            <div className="flex flex-col items-center mb-6">
              <div className="w-32 h-32 mb-2">
                <CircularProgressbar
                  value={progressValue}
                  text={`${progressLabel}`}
                  styles={buildStyles({
                    textColor: darkMode ? '#f3f4f6' : '#1f2937',
                    pathColor: latestColor,
                    trailColor: darkMode ? '#374151' : '#e5e7eb',
                    backgroundColor: darkMode ? '#1f2937' : '#fff',
                  })}
                />
              </div>
              <span className={`font-semibold text-lg ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{latestLabel}</span>
            </div>
          )}
          {/* History Table */}
          <div className="overflow-x-auto">
            <table className={`min-w-full rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <tr>
                  <th className={`py-3 px-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-200 border-gray-600' : 'text-gray-700 border-gray-200'} border-b`}>Date/Time</th>
                  {showType && (
                    <th className={`py-3 px-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-200 border-gray-600' : 'text-gray-700 border-gray-200'} border-b`}>Type</th>
                  )}
                  <th className={`py-3 px-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-200 border-gray-600' : 'text-gray-700 border-gray-200'} border-b`}>Input</th>
                  {showUniversity && (
                    <th className={`py-3 px-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-200 border-gray-600' : 'text-gray-700 border-gray-200'} border-b`}>University</th>
                  )}
                  <th className={`py-3 px-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-200 border-gray-600' : 'text-gray-700 border-gray-200'} border-b`}>Result</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry, idx) => (
                  <tr key={entry.id} className={`${idx % 2 === 0 ? (darkMode ? 'bg-gray-800' : 'bg-white') : (darkMode ? 'bg-gray-700' : 'bg-gray-50')} border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <td className={`p-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{formatDate(entry.date)}</td>
                    {showType && (
                      <td className={`p-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{entry.type}</td>
                    )}
                    <td className={`p-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                      {Array.isArray(entry.entries) ? (
                        <div className="space-y-1">
                          {entry.entries.map((e, i) => (
                            <div key={e.id || i}>
                              <span className="font-semibold">{e.annotation ? e.annotation : '(no note)'}:</span> {e.amount}
                            </div>
                          ))}
                        </div>
                      ) : typeof entry.input === 'object' && entry.input !== null ? (
                        <div className="space-y-1">
                          {Object.entries(entry.input).map(([k, v]) => (
                            <div key={k}>
                              <span className="font-semibold capitalize">{k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>{' '}
                              {typeof v === 'object' && v !== null
                                ? Array.isArray(v)
                                  ? v.join(', ')
                                  : Object.entries(v).map(([ek, ev]) => ev === true ? ek : null).filter(Boolean).join(', ') || JSON.stringify(v)
                                : v}
                            </div>
                          ))}
                        </div>
                      ) : entry.input}
                    </td>
                    {showUniversity && (
                      <td className={`p-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{entry.university}</td>
                    )}
                    <td className={`p-4 font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{
                      Array.isArray(entry.entries)
                        ? entry.entries.reduce((sum, e) => sum + (e.amount || 0), 0)
                        : entry.output
                    }</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center mt-4">
            <button
              onClick={clearHistory}
              className={`font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 ${darkMode ? 'bg-red-700 hover:bg-red-600 text-white focus:ring-red-500' : 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400'}`}
            >
              Clear History
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CalculationHistory; 