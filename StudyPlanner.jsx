import React, { useState } from 'react';

// Paste the full StudyPlanner component code here from App.jsx
// --- StudyPlanner Component ---
const StudyPlanner = ({ darkMode }) => {
    const [subjects, setSubjects] = useState([{ id: 1, name: '', priority: 'medium' }]);
    const [nextSubjectId, setNextSubjectId] = useState(2);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [dailyStudyTime, setDailyStudyTime] = useState('');
    const [studyType, setStudyType] = useState('equal'); // 'equal' or 'priority'
    const [weekendsOff, setWeekendsOff] = useState(false);
    const [breakDays, setBreakDays] = useState(''); // Comma-separated dates
  
    const [studyPlan, setStudyPlan] = useState([]);
    const [error, setError] = useState('');
  
    // Helper function to format date to刳-MM-DD
    const formatDate = (date) => {
      const d = new Date(date);
      let month = '' + (d.getMonth() + 1);
      let day = '' + d.getDate();
      const year = d.getFullYear();
  
      if (month.length < 2) month = '0' + month;
      if (day.length < 2) day = '0' + day;
  
      return [year, month, day].join('-');
    };
  
    const handleSubjectChange = (id, field, value) => {
      setSubjects((prevSubjects) =>
        prevSubjects.map((subject) =>
          subject.id === id ? { ...subject, [field]: value } : subject
        )
      );
      setStudyPlan([]); // Clear plan on input change
      setError('');
    };
  
    const addSubject = () => {
      setSubjects((prevSubjects) => [
        ...prevSubjects,
        { id: nextSubjectId, name: '', priority: 'medium' },
      ]);
      setNextSubjectId((prevId) => prevId + 1);
    };
  
    const removeSubject = (id) => {
      setSubjects((prevSubjects) => prevSubjects.filter((subject) => subject.id !== id));
      setStudyPlan([]); // Clear plan on subject removal
      setError('');
    };
  
    const validateInputs = () => {
      if (subjects.length === 0 || subjects.some(s => !s.name.trim())) {
        setError('Please add at least one subject and ensure all subject names are filled.');
        return false;
      }
      if (!startDate || !endDate) {
        setError('Please select both a start and end date.');
        return false;
      }
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start > end) {
        setError('Start date cannot be after end date.');
        return false;
      }
      const dailyTime = parseFloat(dailyStudyTime);
      if (isNaN(dailyTime) || dailyTime <= 0) {
        setError('Please enter a valid daily study time (e.g., 3 hours/day).');
        return false;
      }
  
      // Validate break days format if entered
      if (breakDays.trim() !== '') {
        const dates = breakDays.split(',').map(d => d.trim());
        for (const dateStr of dates) {
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) {
            setError(`Invalid break day date format: "${dateStr}". UseBRUARY-MM-DD.`);
            return false;
          }
        }
      }
  
      setError('');
      return true;
    };
  
    const generatePlan = () => {
      if (!validateInputs()) {
        setStudyPlan([]);
        return;
      }
  
      const start = new Date(startDate);
      const end = new Date(endDate);
      const dailyTime = parseFloat(dailyStudyTime);
      const plan = [];
      const availableSubjects = subjects.filter(s => s.name.trim() !== '');
  
      if (availableSubjects.length === 0) {
        setError('Please enter valid subjects to generate a plan.');
        setStudyPlan([]);
        return;
      }
  
      const breakDayDates = breakDays.split(',').map(d => formatDate(d.trim())).filter(Boolean);
  
      // Assign numeric weights for priority-based distribution
      const priorityWeights = {
        'low': 1,
        'medium': 2,
        'high': 3,
      };
  
      let totalWeight = 0;
      if (studyType === 'priority') {
        availableSubjects.forEach(sub => {
          totalWeight += priorityWeights[sub.priority] || 0;
        });
        if (totalWeight === 0) { // Fallback if all priorities are invalid or zero
          setStudyType('equal');
          console.warn('Priority weights sum to zero, defaulting to equal distribution.');
        }
      }
  
  
      let currentDate = new Date(start);
      let subjectIndex = 0; // For equal distribution
      let currentPrioritySubjectIndex = 0; // For priority distribution
  
      while (currentDate <= end) {
        const day = currentDate.getDay(); // 0 for Sunday, 6 for Saturday
        const formattedCurrentDate = formatDate(currentDate);
  
        // Skip weekends if option is selected
        if (weekendsOff && (day === 0 || day === 6)) {
          currentDate.setDate(currentDate.getDate() + 1);
          continue;
        }
  
        // Skip break days
        if (breakDayDates.includes(formattedCurrentDate)) {
          currentDate.setDate(currentDate.getDate() + 1);
          continue;
        }
  
        const dailyTasks = [];
        let remainingDailyTime = dailyTime;
  
        // Distribute study time
        if (studyType === 'equal') {
          const hoursPerSubject = remainingDailyTime / availableSubjects.length; // Simple equal division
          availableSubjects.forEach((subject) => {
            dailyTasks.push({
              subject: subject.name,
              hours: hoursPerSubject.toFixed(2),
              done: false,
            });
          });
        } else { // Priority-based distribution
          // Sort subjects by priority (descending) for simpler distribution
          const sortedSubjects = [...availableSubjects].sort((a, b) =>
            (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0)
          );
  
          // Distribute time based on weights
          sortedSubjects.forEach(subject => {
              if (remainingDailyTime <= 0) return;
  
              const weight = priorityWeights[subject.priority] || 0;
              if (totalWeight === 0) { // Fallback if no weights were valid or provided
                  const hours = remainingDailyTime / sortedSubjects.length;
                  dailyTasks.push({ subject: subject.name, hours: hours.toFixed(2), done: false });
                  remainingDailyTime -= hours;
              } else {
                  const proportion = weight / totalWeight;
                  const hours = remainingDailyTime * proportion;
                  dailyTasks.push({ subject: subject.name, hours: hours.toFixed(2), done: false });
                  remainingDailyTime -= hours;
              }
          });
  
          // If time remains due to rounding or if not all subjects were assigned, distribute evenly to remaining
          if (remainingDailyTime > 0 && dailyTasks.length > 0) {
              const extraPerTask = remainingDailyTime / dailyTasks.length;
              dailyTasks.forEach(task => {
                  task.hours = (parseFloat(task.hours) + extraPerTask).toFixed(2);
              });
          }
        }
  
        if (dailyTasks.length > 0) {
          plan.push({
            date: formattedCurrentDate,
            tasks: dailyTasks,
          });
        }
  
        currentDate.setDate(currentDate.getDate() + 1); // Move to next day
      }
      setStudyPlan(plan);
    };
  
  
    const toggleTaskDone = (dateIndex, taskIndex) => {
      setStudyPlan((prevPlan) =>
        prevPlan.map((day, dIdx) =>
          dIdx === dateIndex
            ? {
                ...day,
                tasks: day.tasks.map((task, tIdx) =>
                  tIdx === taskIndex ? { ...task, done: !task.done } : task
                ),
              }
            : day
        )
      );
    };
  
    const handleReset = () => {
      setSubjects([{ id: 1, name: '', priority: 'medium' }]);
      setNextSubjectId(2);
      setStartDate('');
      setEndDate('');
      setDailyStudyTime('');
      setStudyType('equal');
      setWeekendsOff(false);
      setBreakDays('');
      setStudyPlan([]);
      setError('');
    };
  
    return (
      <div className={`p-4 font-inter min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-50 to-purple-100'}`}>
        <div className="group p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-shadow duration-300 w-full max-w-3xl mx-auto border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-2 text-gray-900 dark:text-gray-100 flex items-center justify-center">
              <span className="mr-2 text-4xl">🗓️</span> Study Planner
            </h2>
            <p className="text-lg md:text-xl font-normal leading-relaxed text-gray-700 dark:text-gray-300 mb-4">
              Generate a smart, balanced schedule for exam prep or daily study goals.
            </p>
          </div>
  
          {/* Study Plan Input Card */}
          <div className={`p-6 rounded-xl shadow-inner border space-y-4 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <h3 className={`text-2xl font-bold text-center ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Plan Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Subject Name and Priority */}
                <div className="flex flex-col gap-2">
                  {subjects.map((subject, index) => (
                    <div key={subject.id} className="flex flex-col sm:flex-row gap-2 mb-3 w-full">
                      <input
                        type="text"
                        id={`subject-name-${subject.id}`}
                        name={`subject-name-${subject.id}`}
                        autoComplete="off"
                        value={subject.name}
                        onChange={(e) => handleSubjectChange(subject.id, 'name', e.target.value)}
                        placeholder="Subject Name"
                        className={`flex-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300'}`}
                      />
                      <div className="flex flex-col w-full sm:w-auto">
                        <label htmlFor={`subject-priority-${subject.id}`} className="block text-sm font-semibold mb-1">
                          Priority:
                        </label>
                        <select
                          id={`subject-priority-${subject.id}`}
                          name={`subject-priority-${subject.id}`}
                          autoComplete="off"
                          value={subject.priority}
                          onChange={(e) => handleSubjectChange(subject.id, 'priority', e.target.value)}
                          className={`flex-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'}`}
                        >
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="high">High Priority</option>
                        </select>
                      </div>
                      {subjects.length > 1 && (
                        <button
                          onClick={() => removeSubject(subject.id)}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200 flex-shrink-0"
                          title="Remove Subject"
                          aria-label="Remove subject"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addSubject}
                    className={`flex items-center justify-center w-full font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 mt-2 ${darkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-800 hover:bg-blue-900 text-white'}`}
                  >
                    <span className="mr-2">+</span> Add Subject
                  </button>
                </div>
                {/* Start Date */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="start-date-main" className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Start Date:</label>
                  <input
                    type="date"
                    id="start-date-main"
                    name="start-date"
                    autoComplete="off"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300'}`}
                  />
                </div>
                <div>
                  <label htmlFor="end-date-main" className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      End Date:
                  </label>
                  <input
                      type="date"
                      id="end-date-main"
                      name="end-date"
                      autoComplete="off"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300'}`}
                  />
                </div>
                <div>
                  <label htmlFor="daily-study-time-main" className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Daily Study Time (Hours):
                  </label>
                  <input
                      type="number"
                      id="daily-study-time-main"
                      name="daily-study-time"
                      autoComplete="off"
                      value={dailyStudyTime}
                      onChange={(e) => setDailyStudyTime(e.target.value)}
                      placeholder="e.g., 3"
                      min="0.5"
                      step="0.5"
                      className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300'}`}
                  />
                </div>
                <div>
                  <label htmlFor="study-type-main" className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Preferred Study Type:
                  </label>
                  <select
                      id="study-type-main"
                      name="study-type"
                      autoComplete="off"
                      value={studyType}
                      onChange={(e) => setStudyType(e.target.value)}
                      className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'}`}
                  >
                      <option value="equal">Equal Distribution</option>
                      <option value="priority">Priority-Based</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                      type="checkbox"
                      id="weekends-off-main"
                      name="weekends-off"
                      checked={weekendsOff}
                      onChange={(e) => setWeekendsOff(e.target.checked)}
                      className={`mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
                  />
                  <label htmlFor="weekends-off-main" className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Weekends Off
                  </label>
                </div>
                <div>
                  <label htmlFor="break-days-main" className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Break Days (YYYY-MM-DD, comma-separated):
                  </label>
                  <input
                      type="text"
                      id="break-days-main"
                      name="break-days"
                      autoComplete="off"
                      value={breakDays}
                      onChange={(e) => setBreakDays(e.target.value)}
                      placeholder="e.g., 2024-07-04, 2024-12-25"
                      className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300'}`}
                  />
                </div>
              </div>
              {error && <p className="text-red-500 text-xs italic text-center">{error}</p>}
              <div className="flex flex-col sm:flex-row gap-4">
                  <button
                      onClick={generatePlan}
                      className={`w-full font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${darkMode ? 'bg-indigo-800 hover:bg-indigo-900 text-white focus:ring-indigo-900' : 'bg-indigo-700 hover:bg-indigo-800 text-white focus:ring-indigo-700'}`}
                  >
                      Generate Plan
                  </button>
                  <button
                      onClick={handleReset}
                      className={`flex-1 font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-100 focus:ring-gray-500' : 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400'}`}
                  >
                      Reset
                  </button>
              </div>
          </div>
  
  
          {studyPlan.length > 0 && (
            <div className={`p-6 rounded-xl shadow-md border space-y-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-2xl font-bold text-center ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Your Study Plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studyPlan.map((day, dateIndex) => (
                  <div key={day.date} className={`p-4 rounded-lg shadow-md border ${darkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
                    <h4 className={`font-bold text-lg mb-2 ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>{day.date}</h4>
                    <ul className="space-y-2">
                      {day.tasks.map((task, taskIndex) => (
                        <li key={taskIndex} className={`flex items-center justify-between p-2 rounded-md ${task.done ? (darkMode ? 'bg-green-800 line-through text-gray-400' : 'bg-green-100 line-through text-gray-600') : (darkMode ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-800')}`}>
                          <span>
                            <span className="font-semibold">{task.subject}:</span> {task.hours} hours
                          </span>
                          <button
                            onClick={() => toggleTaskDone(dateIndex, taskIndex)}
                            className={`p-1 rounded-full ${task.done ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 hover:bg-gray-400'} text-white transition-colors duration-200`}
                            title={task.done ? 'Mark as Undone' : 'Mark as Done'}
                            aria-label={task.done ? 'Mark as undone' : 'Mark as done'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={task.done ? "M6 18L18 6M6 6l12 12" : "M5 13l4 4L19 7"}></path>
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
  
          <div className={`p-5 rounded-lg border shadow-sm space-y-3 ${darkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
            <h3 className={`font-bold text-lg ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
              📘 What is a Study Planner?
            </h3>
            <p className={`text-base md:text-lg font-normal leading-relaxed text-gray-700 dark:text-gray-300`}>
              A study planner helps break your syllabus into daily or weekly tasks so you can stay organized and focused. It's especially useful during exam season.
            </p>
            <h3 className={`font-bold text-lg ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
              🔍 How It Works:
            </h3>
            <p className={`text-base md:text-lg font-normal leading-relaxed text-gray-700 dark:text-gray-300`}>
              This tool divides your available days and study hours equally across subjects — or based on priority — and generates a clear, trackable plan.
            </p>
            <h3 className={`font-bold text-lg ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
              ✅ Why Use It?
            </h3>
            <ul className={`list-disc list-inside text-base md:text-lg font-normal leading-relaxed text-gray-700 dark:text-gray-300 space-y-1`}>
              <li>Reduces procrastination</li>
              <li>Prevents last-minute cramming</li>
              <li>Builds consistency</li>
              <li>Keeps you accountable</li>
            </ul>
            <h3 className={`font-bold text-lg ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
              🧠 Pro Tip:
            </h3>
            <p className={`text-base md:text-lg font-normal leading-relaxed text-gray-700 dark:text-gray-300`}>
              Print or bookmark your plan and check tasks off daily for best results!
            </p>
          </div>
        </div>
      </div>
    );
  };
  // --- End StudyPlanner Component ---

export default StudyPlanner; 