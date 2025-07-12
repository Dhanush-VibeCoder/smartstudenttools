import React, { useState } from 'react';

// Paste the full BacklogTracker component code here from App.jsx
// --- BacklogTracker Component ---
const BacklogTracker = ({ darkMode }) => {
    const [semesters, setSemesters] = useState(
      Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        name: `Sem ${i + 1}`,
        subjects: [{ id: 1, name: '', status: '' }],
        nextSubjectId: 2,
      }))
    );
    const [currentSemesterId, setCurrentSemesterId] = useState(1);
    const [error, setError] = useState('');
  
    const currentSemester = semesters.find((sem) => sem.id === currentSemesterId);
  
    const calculateSummary = () => {
      if (!currentSemester) return { total: 0, passed: 0, backlogs: 0 };
  
      const total = currentSemester.subjects.length;
      const passed = currentSemester.subjects.filter(
        (s) => s.status === 'passed'
      ).length;
      const backlogs = total - passed;
      return { total, passed, backlogs };
    };
  
    const summary = calculateSummary();
  
    const handleSubjectChange = (subjectId, field, value) => {
      setSemesters((prevSemesters) =>
        prevSemesters.map((sem) =>
          sem.id === currentSemesterId
            ? {
                ...sem,
                subjects: sem.subjects.map((subject) =>
                  subject.id === subjectId ? { ...subject, [field]: value } : subject
                ),
              }
            : sem
        )
      );
      setError('');
    };
  
    const addSubject = () => {
      setSemesters((prevSemesters) =>
        prevSemesters.map((sem) =>
          sem.id === currentSemesterId
            ? {
                ...sem,
                subjects: [
                  ...sem.subjects,
                  { id: sem.nextSubjectId, name: '', status: '' },
                ],
                nextSubjectId: sem.nextSubjectId + 1,
              }
            : sem
        )
      );
      setError('');
    };
  
    const removeSubject = (subjectId) => {
      setSemesters((prevSemesters) =>
        prevSemesters.map((sem) =>
          sem.id === currentSemesterId
            ? {
                ...sem,
                subjects: sem.subjects.filter((subject) => subject.id !== subjectId),
              }
            : sem
        )
      );
      setError('');
    };
  
    const validateSemesterInputs = () => {
      let isValid = true;
      let newError = '';
  
      if (!currentSemester || currentSemester.subjects.length === 0) {
        newError = 'Please add at least one subject for this semester.';
        isValid = false;
      } else {
        for (const subject of currentSemester.subjects) {
          if (!subject.name.trim()) {
            newError = `Subject name cannot be empty in ${currentSemester.name}.`;
            isValid = false;
            break;
          }
          if (!subject.status) {
            newError = `Status must be selected for ${subject.name} in ${currentSemester.name}.`;
            isValid = false;
            break;
          }
        }
      }
      setError(newError);
      return isValid;
    };
  
    const handleResetSemester = () => {
      setSemesters((prevSemesters) =>
        prevSemesters.map((sem) =>
          sem.id === currentSemesterId
            ? {
                ...sem,
                subjects: [{ id: 1, name: '', status: '' }],
                nextSubjectId: 2,
              }
            : sem
        )
      );
      setError('');
    };
  
    const calculateOverallBacklogs = () => {
      let overallPassed = 0;
      let overallFailed = 0;
      semesters.forEach(sem => {
        sem.subjects.forEach(subject => {
          if (subject.status === 'passed') {
            overallPassed++;
          } else if (subject.status === 'failed') {
            overallFailed++;
          }
        });
      });
      return { overallPassed, overallFailed };
    };
  
    const { overallPassed, overallFailed } = calculateOverallBacklogs();
    const overallTotal = overallPassed + overallFailed;
  
    const pieChartRadius = 50;
    const pieChartCircumference = 2 * Math.PI * pieChartRadius;
  
    const passedDasharray = overallTotal > 0 ? (overallPassed / overallTotal) * pieChartCircumference : 0;
    const failedDasharray = overallTotal > 0 ? (overallFailed / overallTotal) * pieChartCircumference : 0;
  
    return (
      <div className={`p-4 font-inter min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-green-50 to-blue-100'}`}>
        <div className="group p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-shadow duration-300 w-full max-w-3xl mx-auto border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-2 text-gray-900 dark:text-gray-100 flex items-center justify-center">
              <span className="mr-2 text-4xl">📚</span> Backlog Tracker
            </h2>
            <p className="text-lg md:text-xl font-normal leading-relaxed text-gray-700 dark:text-gray-300 mb-4">
              Keep track of pending subjects (backlogs), visualize progress, and plan reattempts semester-wise.
            </p>
          </div>
  
          {/* Semester Navigation Card */}
          <div className={`p-6 rounded-xl shadow-inner border space-y-4 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <h3 className={`text-xl font-semibold text-center ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Select Semester</h3>
              <div className="flex flex-wrap justify-center gap-2">
              {semesters.map((sem) => (
                  <button
                  key={sem.id}
                  onClick={() => setCurrentSemesterId(sem.id)}
                  className={`py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
                      currentSemesterId === sem.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : `${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
                  }`}
                  >
                  {sem.name}
                  </button>
              ))}
              </div>
          </div>
  
  
          {/* Subjects Input Table Card */}
          <div className={`p-6 rounded-xl shadow-md border overflow-x-auto space-y-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-xl font-semibold text-center ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              {currentSemester ? currentSemester.name : 'Select a Semester'} Subjects
            </h3>
            {currentSemester && (
              <table className={`min-w-full rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <tr>
                    <th className={`py-3 px-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Subject Name</th>
                    <th className={`py-3 px-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Status</th>
                    <th className={`py-3 px-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}></th>
                  </tr>
                </thead>
                <tbody>
                  {currentSemester.subjects.map((subject, index) => (
                    <tr
                      key={subject.id}
                      className={`${index % 2 === 0 ? (darkMode ? 'bg-gray-800' : 'bg-white') : (darkMode ? 'bg-gray-700' : 'bg-gray-50')} border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}
                    >
                      <td className="p-4">
                        <label htmlFor={`subject-name-main-${subject.id}`} className="sr-only">Subject Name</label>
                        <input
                          type="text"
                          id={`subject-name-main-${subject.id}`}
                          name={`subject-name-${subject.id}`}
                          autoComplete="off"
                          value={subject.name}
                          onChange={(e) => handleSubjectChange(subject.id, 'name', e.target.value)}
                          placeholder="e.g., Data Structures"
                          className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300'}`}
                        />
                      </td>
                      <td className="p-4">
                        <label htmlFor={`subject-status-main-${subject.id}`} className="sr-only">Status</label>
                        <select
                          id={`subject-status-main-${subject.id}`}
                          name={`subject-status-${subject.id}`}
                          autoComplete="off"
                          value={subject.status}
                          onChange={(e) => handleSubjectChange(subject.id, 'status', e.target.value)}
                          className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'}`}
                        >
                          <option value="">Select Status</option>
                          <option value="passed">Passed ✅</option>
                          <option value="failed">Failed ❌</option>
                        </select>
                      </td>
                      <td className="p-4">
                        {currentSemester.subjects.length > 1 && (
                          <button
                            onClick={() => removeSubject(subject.id)}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                            title="Remove Subject"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
  
              <div className="flex flex-col sm:flex-row gap-4">
              <button
                  onClick={addSubject}
                  className={`flex-1 font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 ${darkMode ? 'bg-blue-700 hover:bg-blue-600 text-white focus:ring-blue-500' : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'}`}
              >
                  <span className="mr-2">+</span> Add Subject
              </button>
              <button
                  onClick={handleResetSemester}
                  className={`flex-1 font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-100 focus:ring-gray-500' : 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400'}`}
              >
                  Reset Semester
              </button>
              </div>
          </div>
  
          {error && <p className="text-red-500 text-xs italic text-center">{error}</p>}
  
  
          <div className={`p-6 rounded-xl shadow-md border text-center space-y-4 ${darkMode ? 'bg-purple-900 border-purple-700' : 'bg-purple-50 border-purple-200'}`}>
            <h3 className={`text-xl font-semibold ${darkMode ? 'text-purple-200' : 'text-purple-800'}`}>
              Summary for {currentSemester?.name || 'Selected Semester'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-lg font-medium">
              <div className={`p-3 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white'}`}>
                <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Total Subjects:</p>
                <p className="text-blue-900 text-3xl font-bold">{summary.total}</p>
              </div>
              <div className={`p-3 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white'}`}>
                <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Passed Subjects:</p>
                <p className="text-green-600 text-3xl font-bold">{summary.passed}</p>
              </div>
              <div className={`p-3 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white'}`}>
                <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Backlogs:</p>
                <p className="text-red-600 text-3xl font-bold">{summary.backlogs}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default BacklogTracker;