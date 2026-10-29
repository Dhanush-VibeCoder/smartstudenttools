import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from './SEO';
import AdsterraBanner from './AdsterraBanner';

// Paste the full StudyPlanner component code here from App.jsx
// --- StudyPlanner Component ---
const StudyPlanner = ({ darkMode }) => {
    const [rating, setRating] = useState(0);
    const [ratingHover, setRatingHover] = useState(0);
    const [ratingSubmitted, setRatingSubmitted] = useState(false);

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
        <SEO
          title="Student Study Planner | Create Exam Revision Schedules Online - Smart Studies"
          description="Plan your exam preparation with a personalized study timetable. Allocate daily study time per subject, set revision goals, and ace your semester exams."
          url="https://smartstudenttools.xyz/study-planner"
        />
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

          {/* How to Use Section */}
          <div className={`p-5 rounded-lg border shadow-sm mt-8 space-y-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700`}>
            <h3 className={`font-bold text-lg text-gray-950 dark:text-gray-100`}>
              📖 How to Use the Study Planner
            </h3>
            <ol className="list-decimal list-inside text-sm text-gray-700 dark:text-gray-300 space-y-2">
              <li>List your subjects and assign them a priority (High, Medium, or Low).</li>
              <li>Select your start date, end date, and available daily study time in hours.</li>
              <li>Choose your planning strategy: Equal division or Priority-weighted.</li>
              <li>Toggle "Skip Weekends" or add specific break days to exclude them from the schedule.</li>
              <li>Click "Generate Plan" to calculate and review your detailed task list day-by-day.</li>
            </ol>
          </div>

          {/* Formulas & Allocation logic */}
          <div className={`p-5 rounded-lg border shadow-sm mt-8 space-y-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700`}>
            <h3 className={`font-bold text-lg text-gray-950 dark:text-gray-100`}>
              🧮 How the Scheduling Logic Works
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              Our planner calculates the total available study days by taking the range between your start and end dates and subtracting weekend exclusions and custom break days.
              <br />
              - **Equal Allocation:** Total study time is divided equally among all subjects:
              <br />
              <code className="block my-2 bg-gray-100 dark:bg-gray-900 p-2 rounded text-center font-mono">
                Subject Time = Total Days * Daily Hours / Number of Subjects
              </code>
              - **Priority Allocation:** Subjects receive time weights based on priority: High (weight = 3), Medium (weight = 2), Low (weight = 1):
              <br />
              <code className="block my-2 bg-gray-100 dark:bg-gray-900 p-2 rounded text-center font-mono">
                Subject Time = (Subject Weight / Sum of Weights) * Total Study Time
              </code>
            </p>
          </div>

          {/* Example Walkthrough Section */}
          <div className={`p-5 rounded-lg border shadow-sm mt-8 space-y-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700`}>
            <h3 className={`font-bold text-lg text-gray-950 dark:text-gray-100`}>
              ✏️ Example Study Schedule Calculation
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              Suppose you have 10 days before exams and want to study 3 hours per day (Total = 30 hours). You have 2 subjects:
              <br />
              - **Maths** (Priority: High, Weight = 3)
              <br />
              - **History** (Priority: Low, Weight = 1)
              <br />
              The total weight sum is 3 + 1 = 4. Using the priority-based formula:
              <br />
              - **Maths Study Time:** (3 / 4) * 30 hours = 22.5 hours.
              <br />
              - **History Study Time:** (1 / 4) * 30 hours = 7.5 hours.
              <br />
              The generator will map this out to dedicate the first 7.5 days to Maths and the remaining 2.5 days to History.
            </p>
          </div>

          {/* FAQs Section */}
          <div className="mt-8">
            <h3 className={`font-bold text-xl mb-4 text-gray-900 dark:text-gray-100`}>
              ❓ Frequently Asked Questions
              </h3>
            <div className="space-y-4">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                <button
                  className="w-full flex justify-between items-center text-left font-semibold text-lg py-3 focus:outline-none text-gray-900 dark:text-gray-100"
                  onClick={(e) => {
                    const content = e.currentTarget.nextElementSibling;
                    const icon = e.currentTarget.querySelector('.accordion-icon');
                    if (content.style.maxHeight) {
                      content.style.maxHeight = null;
                      icon.style.transform = 'rotate(0deg)';
                    } else {
                      content.style.maxHeight = content.scrollHeight + 'px';
                      icon.style.transform = 'rotate(45deg)';
                    }
                  }}
                >
                  <span>How does priority-based study planning help?</span>
                  <span className="accordion-icon text-2xl rotate-0 transition-transform duration-300 text-gray-500">+</span>
                </button>
                <div className="accordion-content max-h-0 overflow-hidden transition-all duration-500 ease-in-out text-gray-700 dark:text-gray-300">
                  <p className="pt-2">It structures your study schedule so that harder or more critical classes (High priority) get allocated more hours. This ensures you spend the bulk of your prep on subjects that need it the most, rather than wasting valuable time on easy modules.</p>
                </div>
              </div>
              <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                <button
                  className="w-full flex justify-between items-center text-left font-semibold text-lg py-3 focus:outline-none text-gray-900 dark:text-gray-100"
                  onClick={(e) => {
                    const content = e.currentTarget.nextElementSibling;
                    const icon = e.currentTarget.querySelector('.accordion-icon');
                    if (content.style.maxHeight) {
                      content.style.maxHeight = null;
                      icon.style.transform = 'rotate(0deg)';
                    } else {
                      content.style.maxHeight = content.scrollHeight + 'px';
                      icon.style.transform = 'rotate(45deg)';
                    }
                  }}
                >
                  <span>Can I export or save my generated study schedule?</span>
                  <span className="accordion-icon text-2xl rotate-0 transition-transform duration-300 text-gray-500">+</span>
                </button>
                <div className="accordion-content max-h-0 overflow-hidden transition-all duration-500 ease-in-out text-gray-700 dark:text-gray-300">
                  <p className="pt-2">Yes! Once your plan is generated, a Print button becomes available. You can print the calendar directly or save it as a PDF for offline reference.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Tools & Articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <h4 className="font-bold text-lg mb-3 text-gray-900 dark:text-gray-100">🛠️ Related Academic Tools</h4>
              <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
                <li><Link to="/attendance-tracker" className="hover:underline">Attendance Tracker</Link></li>
                <li><Link to="/grade-calculator" className="hover:underline">Grade Calculator</Link></li>
                <li><Link to="/backlog-tracker" className="hover:underline">Backlog Tracker</Link></li>
              </ul>
            </div>
            <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <h4 className="font-bold text-lg mb-3 text-gray-900 dark:text-gray-100">📚 Related Articles</h4>
              <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
                <li><a href="https://yourdomain.com/blog/exam-prep-methods" target="_blank" rel="noopener noreferrer" className="hover:underline">Spaced Repetition and Active Recall Systems</a></li>
                <li><a href="https://yourdomain.com/blog/beat-procrastination" target="_blank" rel="noopener noreferrer" className="hover:underline">How to Beat Exam Procrastination and Stay Focused</a></li>
              </ul>
            </div>
          </div>

          {/* Interactive Rating Component */}
          <div className="p-6 rounded-xl border shadow-sm text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 mt-8">
            <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">Rate &amp; Give Feedback</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Rate this page to help us improve</p>
            {ratingSubmitted ? (
              <p className="text-green-600 font-semibold">Thank you for rating this tool {rating} stars!</p>
            ) : (
              <div className="flex justify-center items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`text-3xl focus:outline-none transition-colors ${
                      star <= (ratingHover || rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                    }`}
                    onClick={() => { setRating(star); setRatingSubmitted(true); }}
                    onMouseEnter={() => setRatingHover(star)}
                    onMouseLeave={() => setRatingHover(0)}
                  >
                    ★
                  </button>
                ))}
              </div>
            )}
          </div>
          <AdsterraBanner />
        </div>
      </div>
    );
  };
  // --- End StudyPlanner Component ---

export default StudyPlanner; 