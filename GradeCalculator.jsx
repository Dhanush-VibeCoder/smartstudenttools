import React, { useState } from 'react';

// Paste the full GradeCalculator component code here from App.jsx
// --- GradeCalculator Component ---
const GradeCalculator = ({ darkMode }) => {
    const [subjects, setSubjects] = useState([
      { id: 1, name: '', obtained: '', max: '', credits: '', grade: '', gpa: '' },
    ]);
    const [nextSubjectId, setNextSubjectId] = useState(2);
    const [inputMode, setInputMode] = useState('marks'); // 'marks', 'grade', 'gpa'
  
    const [totalPercentage, setTotalPercentage] = useState(null);
    const [weightedGpa, setWeightedGpa] = useState(null);
    const [finalGrade, setFinalGrade] = useState(null);
    const [resultColor, setResultColor] = useState('');
    const [error, setError] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);
  
    // What-if simulator states
    const [simulatedSubjectId, setSimulatedSubjectId] = useState('');
    const [simulatedValue, setSimulatedValue] = useState('');
    const [simulatedResult, setSimulatedResult] = useState(null);
    const [simulatedGrade, setSimulatedGrade] = useState(null);
    const [simulatedResultColor, setSimulatedResultColor] = useState('');
  
  
    const gradeToPercentage = {
      'A': 95, // Mid-point of 90-100
      'B': 85, // Mid-point of 80-89
      'C': 75, // Mid-point of 70-79
      'D': 65, // Mid-point of 60-69
      'F': 55, // Mid-point of 0-59 (assuming F is usually <60)
    };
  
    const gradeToGpaPoints = {
      'A': 4.0,
      'B': 3.0,
      'C': 2.0,
      'D': 1.0,
      'F': 0.0,
    };
  
    const percentageToGpaPoints = (percentage) => {
      if (percentage >= 90) return 4.0;
      if (percentage >= 80) return 3.0;
      if (percentage >= 70) return 2.0;
      if (percentage >= 60) return 1.0;
      return 0.0;
    };
  
    const percentageToGrade = (percentage) => {
      if (percentage >= 90) return 'A';
      if (percentage >= 80) return 'B';
      if (percentage >= 70) return 'C';
      if (percentage >= 60) return 'D';
      return 'F';
    };
  
  
    const handleSubjectChange = (id, field, value) => {
      setSubjects((prevSubjects) =>
        prevSubjects.map((subject) =>
          subject.id === id ? { ...subject, [field]: value } : subject
        )
      );
      setTotalPercentage(null);
      setWeightedGpa(null);
      setFinalGrade(null);
      setResultColor('');
      setError('');
      setIsAnimating(false);
      setSimulatedResult(null); // Clear simulation results on main input change
      setSimulatedGrade(null);
      setSimulatedResultColor('');
    };
  
    const addSubject = () => {
      setSubjects((prevSubjects) => [
        ...prevSubjects,
        { id: nextSubjectId, name: '', obtained: '', max: '', credits: '', grade: '', gpa: '' },
      ]);
      setNextSubjectId((prevId) => prevId + 1);
    };
  
    const removeSubject = (id) => {
      setSubjects((prevSubjects) => prevSubjects.filter((subject) => subject.id !== id));
      setTotalPercentage(null);
      setWeightedGpa(null);
      setFinalGrade(null);
      setResultColor('');
      setError('');
      setIsAnimating(false);
      setSimulatedResult(null);
      setSimulatedGrade(null);
      setSimulatedResultColor('');
    };
  
    const getSubjectPercentage = (subject, modeOverride = inputMode) => {
      let percentage = 0;
      if (modeOverride === 'marks') {
        const obtained = parseFloat(subject.obtained);
        const max = parseFloat(subject.max);
        if (!isNaN(obtained) && !isNaN(max) && max > 0) {
          percentage = (obtained / max) * 100;
        }
      } else if (modeOverride === 'grade') {
        percentage = gradeToPercentage[subject.grade?.toUpperCase()] || 0;
      } else if (modeOverride === 'gpa') {
        const gpa = parseFloat(subject.gpa);
        // Assuming 4.0 scale for direct GPA input, convert to percentage
        if (!isNaN(gpa) && gpa >= 0 && gpa <= 4.0) {
          percentage = (gpa / 4.0) * 100;
        }
      }
      return percentage;
    };
  
    const validateInputs = (currentSubjects, currentMode) => {
      let isValid = true;
      let newError = '';
      let hasCreditsInput = false; // Check if *any* credit is entered
  
      if (currentSubjects.length === 0) {
        newError = 'Please add at least one subject.';
        setError(newError);
        return false;
      }
  
      for (const subject of currentSubjects) {
        if (!subject.name.trim()) {
          newError = 'Subject name cannot be empty.';
          isValid = false;
          break;
        }
  
        if (subject.credits !== '' && !isNaN(parseFloat(subject.credits))) {
          hasCreditsInput = true;
        }
  
        if (currentMode === 'marks') {
          const obtained = parseFloat(subject.obtained);
          const max = parseFloat(subject.max);
  
          if (isNaN(obtained) || subject.obtained.trim() === '') {
            newError = `Please enter valid marks obtained for ${subject.name}.`;
            isValid = false;
            break;
          } else if (obtained < 0) {
            newError = `Marks obtained for ${subject.name} cannot be negative.`;
            isValid = false;
            break;
          }
  
          if (isNaN(max) || subject.max.trim() === '') {
            newError = `Please enter valid maximum marks for ${subject.name}.`;
            isValid = false;
            break;
          } else if (max <= 0) {
            newError = `Maximum marks for ${subject.name} must be greater than 0.`;
            isValid = false;
            break;
          }
  
          if (obtained > max) {
            newError = `Marks obtained for ${subject.name} cannot exceed maximum marks.`;
            isValid = false;
            break;
          }
        } else if (currentMode === 'grade') {
          if (!subject.grade.trim() || !gradeToPercentage.hasOwnProperty(subject.grade.toUpperCase())) {
            newError = `Please enter a valid letter grade (A, B, C, D, F) for ${subject.name}.`;
            isValid = false;
            break;
          }
        } else if (currentMode === 'gpa') {
          const gpa = parseFloat(subject.gpa);
          if (isNaN(gpa) || subject.gpa.trim() === '') {
            newError = `Please enter valid GPA points for ${subject.name}.`;
            isValid = false;
            break;
          } else if (gpa < 0 || gpa > 4.0) { // Assuming 4.0 scale
            newError = `GPA points for ${subject.name} must be between 0.0 and 4.0.`;
            isValid = false;
            break;
          }
        }
  
        if (subject.credits !== '' && (isNaN(parseFloat(subject.credits)) || parseFloat(subject.credits) < 0)) {
          newError = `Credits for ${subject.name} must be a non-negative number.`;
          isValid = false;
          break;
        }
      }
  
      if (hasCreditsInput && isValid) {
          for (const subject of currentSubjects) {
              // If any subject has marks/grade/gpa entered, then credits are expected for all if a weighted calc is intended
              const isInputFilled = (currentMode === 'marks' && subject.obtained.trim() !== '') ||
                                   (currentMode === 'grade' && subject.grade.trim() !== '') ||
                                   (currentMode === 'gpa' && subject.gpa.trim() !== '');
  
              if (isInputFilled && (subject.credits === '' || isNaN(parseFloat(subject.credits)))) {
                  newError = `Please enter credits for all subjects if using weighted calculation.`;
                  isValid = false;
                  break;
              }
          }
      }
  
      setError(newError);
      return isValid;
    };
  
    const calculateGrade = (subjectsToCalculate = subjects, modeToCalculate = inputMode) => {
      if (!validateInputs(subjectsToCalculate, modeToCalculate)) {
          return { overallPercentage: null, weightedGpa: null, finalGrade: null, resultColor: '' };
      }
  
      let totalObtained = 0; // For overall percentage (sum of obtained marks)
      let totalMax = 0;      // For overall percentage (sum of max marks)
      let totalWeightedPoints = 0; // For weighted GPA calculation
      let totalCredits = 0;        // For weighted GPA calculation
      let hasCredits = false;
  
      subjectsToCalculate.forEach((subject) => {
        const currentSubjectPercentage = getSubjectPercentage(subject, modeToCalculate);
  
        // Accumulate for overall percentage (if marks mode, or conceptual average for other modes)
        // For grade/gpa modes, we still need a "total percentage" based on the averages
        totalObtained += (currentSubjectPercentage * 100); // Scale percentage to represent "marks out of 100"
        totalMax += 100; // Each subject is conceptually "out of 100" when converted to percentage
  
        const credits = parseFloat(subject.credits);
        if (!isNaN(credits) && credits > 0) {
          hasCredits = true;
          totalWeightedPoints += (currentSubjectPercentage * credits);
          totalCredits += credits;
        }
      });
  
      let overallPercentage = 0;
      if (totalMax > 0) {
        // If marks are present, calculate based on marks. Otherwise, average of percentages.
        if (modeToCalculate === 'marks') {
            const rawTotalObtained = subjectsToCalculate.reduce((sum, s) => sum + parseFloat(s.obtained || 0), 0);
            const rawTotalMax = subjectsToCalculate.reduce((sum, s) => sum + parseFloat(s.max || 0), 0);
            overallPercentage = rawTotalMax > 0 ? (rawTotalObtained / rawTotalMax) * 100 : 0;
        } else {
            // For grade/gpa modes, totalMax is sum of 100s, totalObtained is sum of percentages
            overallPercentage = totalMax > 0 ? (totalObtained / totalMax) : 0; // Divide by 100 because totalMax is sum of 100s
        }
      }
  
  
      let calculatedWeightedGpa = null;
      let finalCalculatedPercentage = overallPercentage;
  
      if (hasCredits && totalCredits > 0) {
          finalCalculatedPercentage = totalWeightedPoints / totalCredits; // This is the weighted average percentage
          calculatedWeightedGpa = percentageToGpaPoints(finalCalculatedPercentage);
      } else {
          // If no credits or total credits is 0, then GPA is simply derived from overallPercentage
          calculatedWeightedGpa = percentageToGpaPoints(overallPercentage);
      }
  
      let grade = percentageToGrade(finalCalculatedPercentage);
      let color = '';
      if (finalCalculatedPercentage >= 90) {
        color = 'bg-green-100 border-green-300 text-green-800 dark:bg-green-700 dark:border-green-600 dark:text-green-100';
      } else if (finalCalculatedPercentage >= 80) {
        color = 'bg-green-100 border-green-300 text-green-800 dark:bg-green-700 dark:border-green-600 dark:text-green-100';
      } else if (finalCalculatedPercentage >= 70) {
        color = 'bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-700 dark:border-orange-600 dark:text-orange-100';
      } else if (finalCalculatedPercentage >= 60) {
        color = 'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-700 dark:border-yellow-600 dark:text-yellow-100';
      } else {
        color = 'bg-red-100 border-red-300 text-red-800 dark:bg-red-700 dark:border-red-600 dark:text-red-100';
      }
  
      return {
          overallPercentage: finalCalculatedPercentage.toFixed(2),
          weightedGpa: calculatedWeightedGpa !== null ? calculatedWeightedGpa.toFixed(2) : null,
          finalGrade: grade,
          resultColor: color
      };
    };
  
    const handleCalculate = () => {
      const { overallPercentage, weightedGpa, finalGrade, resultColor } = calculateGrade();
      setTotalPercentage(overallPercentage);
      setWeightedGpa(weightedGpa);
      setFinalGrade(finalGrade);
      setResultColor(resultColor);
      setIsAnimating(true);
    };
  
    const handleReset = () => {
      setSubjects([{ id: 1, name: '', obtained: '', max: '', credits: '', grade: '', gpa: '' }]);
      setNextSubjectId(2);
      setInputMode('marks');
      setTotalPercentage(null);
      setWeightedGpa(null);
      setFinalGrade(null);
      setResultColor('');
      setError('');
      setIsAnimating(false);
      setSimulatedSubjectId('');
      setSimulatedValue('');
      setSimulatedResult(null);
      setSimulatedGrade(null);
      setSimulatedResultColor('');
    };
  
    const simulateWhatIf = () => {
      if (!simulatedSubjectId || simulatedValue.trim() === '') {
        setError('Please select a subject and enter a simulated value.');
        setSimulatedResult(null);
        setSimulatedGrade(null);
        setSimulatedResultColor('');
        return;
      }
  
      const tempSubjects = subjects.map(sub => {
        if (sub.id === parseInt(simulatedSubjectId)) {
          let updatedSub = { ...sub };
          if (inputMode === 'marks') {
            const simVal = parseFloat(simulatedValue);
            if (isNaN(simVal) || simVal < 0 || simVal > parseFloat(sub.max || 100)) {
              setError('Simulated marks must be a valid number between 0 and Max Marks.');
              setSimulatedResult(null); return null;
            }
            updatedSub.obtained = simulatedValue;
          } else if (inputMode === 'grade') {
            if (!gradeToPercentage.hasOwnProperty(simulatedValue.toUpperCase())) {
              setError('Simulated grade must be A, B, C, D, or F.');
              setSimulatedResult(null); return null;
            }
            updatedSub.grade = simulatedValue;
          } else if (inputMode === 'gpa') {
            const simVal = parseFloat(simulatedValue);
            if (isNaN(simVal) || simVal < 0 || simVal > 4.0) {
              setError('Simulated GPA must be between 0.0 and 4.0.');
              setSimulatedResult(null); return null;
            }
            updatedSub.gpa = simulatedValue;
          }
          return updatedSub;
        }
        return sub;
      }).filter(Boolean); // Filter out null if validation failed inside map
  
      if (!tempSubjects || tempSubjects.length !== subjects.length) { // If filtering occurred, means validation failed
          return;
      }
  
      const { overallPercentage, weightedGpa, finalGrade, resultColor } = calculateGrade(tempSubjects, inputMode);
      if (overallPercentage !== null) {
        setSimulatedResult(weightedGpa || overallPercentage); // Show GPA if weighted, else percentage
        setSimulatedGrade(finalGrade);
        setSimulatedResultColor(resultColor);
        setError(''); // Clear error if simulation was successful
      } else {
          // Error from calculateGrade will be propagated to `error` state
          setSimulatedResult(null);
          setSimulatedGrade(null);
          setSimulatedResultColor('');
      }
    };
  
  
    const resultAnimationClasses = isAnimating
      ? 'opacity-100 translate-y-0 scale-100'
      : 'opacity-0 translate-y-4 scale-95';
  
    return (
      <div className={`p-4 font-inter min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 to-indigo-100'}`}>
        <div className="group p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-shadow duration-300 w-full max-w-3xl mx-auto border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-2 text-gray-900 dark:text-gray-100 flex items-center justify-center">
              <span className="mr-2 text-4xl">📊</span> Grade Calculator
            </h2>
            <p className="text-lg md:text-xl font-normal leading-relaxed text-gray-700 dark:text-gray-300 mb-4">
              Enter your subject-wise marks, grades, or GPA and credits to compute your overall grade.
            </p>
          </div>
  
          {/* Input Mode Selector Card */}
          <div className={`p-6 rounded-xl shadow-inner border space-y-4 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <h3 className={`text-xl font-semibold text-center ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Input Mode Selection</h3>
              <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Input Mode:</label>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                      <label className="inline-flex items-center">
                          <input
                              type="radio"
                              name="inputMode"
                              value="marks"
                              checked={inputMode === 'marks'}
                              onChange={(e) => {
                                  setInputMode(e.target.value);
                                  setSubjects(subjects.map(s => ({ ...s, obtained: '', max: '', grade: '', gpa: '' }))); // Clear relevant fields
                                  setError('');
                                  setTotalPercentage(null);
                                  setWeightedGpa(null);
                                  setFinalGrade(null);
                                  setIsAnimating(false);
                                  setSimulatedResult(null);
                                  setSimulatedGrade(null);
                                  setSimulatedResultColor('');
                              }}
                              className="form-radio text-purple-600 h-4 w-4"
                          />
                          <span className={`ml-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Marks</span>
                      </label>
                      <label className="inline-flex items-center">
                          <input
                              type="radio"
                              name="inputMode"
                              value="grade"
                              checked={inputMode === 'grade'}
                              onChange={(e) => {
                                  setInputMode(e.target.value);
                                  setSubjects(subjects.map(s => ({ ...s, obtained: '', max: '', grade: '', gpa: '' })));
                                  setError('');
                                  setTotalPercentage(null);
                                  setWeightedGpa(null);
                                  setFinalGrade(null);
                                  setIsAnimating(false);
                                  setSimulatedResult(null);
                                  setSimulatedGrade(null);
                                  setSimulatedResultColor('');
                              }}
                              className="form-radio text-purple-600 h-4 w-4"
                          />
                          <span className={`ml-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Letter Grade</span>
                      </label>
                      <label className="inline-flex items-center">
                          <input
                              type="radio"
                              name="inputMode"
                              value="gpa"
                              checked={inputMode === 'gpa'}
                              onChange={(e) => {
                                  setInputMode(e.target.value);
                                  setSubjects(subjects.map(s => ({ ...s, obtained: '', max: '', grade: '', gpa: '' })));
                                  setError('');
                                  setTotalPercentage(null);
                                  setWeightedGpa(null);
                                  setFinalGrade(null);
                                  setIsAnimating(false);
                                  setSimulatedResult(null);
                                  setSimulatedGrade(null);
                                  setSimulatedResultColor('');
                              }}
                              className="form-radio text-purple-600 h-4 w-4"
                          />
                          <span className={`ml-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>CGPA Points (4.0 Scale)</span>
                      </label>
                  </div>
              </div>
          </div>
  
  
          {/* Subjects Input Table Card */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-xl shadow-md overflow-x-auto space-y-4">
              <h3 className={`text-xl font-semibold text-center ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Subject Details</h3>
              <table className={`min-w-full rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <tr>
                          <th className={`py-3 px-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Subject Name</th>
                          {inputMode === 'marks' && (
                              <>
                                  <th className={`py-3 px-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Marks Obtained</th>
                                  <th className={`py-3 px-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Max Marks</th>
                              </>
                          )}
                          {inputMode === 'grade' && (
                              <th className={`py-3 px-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Letter Grade</th>
                          )}
                          {inputMode === 'gpa' && (
                              <th className={`py-3 px-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>CGPA Points</th>
                          )}
                          <th className={`py-3 px-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Credits (Optional)</th>
                          <th className={`py-3 px-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}></th>
                      </tr>
                  </thead>
                  <tbody>
                  {subjects.map((subject, index) => (
                      <tr key={subject.id} className={`${index % 2 === 0 ? (darkMode ? 'bg-gray-800' : 'bg-white') : (darkMode ? 'bg-gray-700' : 'bg-gray-50')} border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                      <td className="p-4">
                          <label htmlFor={`subject-name-${subject.id}`} className="sr-only">Subject Name</label>
                          <input
                          type="text"
                          id={`subject-name-${subject.id}`}
                          name={`subject-name-${subject.id}`}
                          autoComplete="off"
                          value={subject.name}
                          onChange={(e) => handleSubjectChange(subject.id, 'name', e.target.value)}
                          placeholder="e.g., Math"
                          className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300'}`}
                          />
                      </td>
                      {inputMode === 'marks' && (
                          <>
                              <td className="p-4">
                                  <label htmlFor={`subject-obtained-${subject.id}`} className="sr-only">Marks Obtained</label>
                                  <input
                                      type="text"
                                      id={`subject-obtained-${subject.id}`}
                                      name={`subject-obtained-${subject.id}`}
                                      autoComplete="off"
                                      value={subject.obtained}
                                      onChange={(e) => {
                                          const value = e.target.value;
                                          if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                              handleSubjectChange(subject.id, 'obtained', value);
                                          }
                                      }}
                                      placeholder="e.g., 85"
                                      className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300'}`}
                                  />
                              </td>
                              <td className="p-4">
                                  <label htmlFor={`subject-max-${subject.id}`} className="sr-only">Max Marks</label>
                                  <input
                                      type="text"
                                      id={`subject-max-${subject.id}`}
                                      name={`subject-max-${subject.id}`}
                                      autoComplete="off"
                                      value={subject.max}
                                      onChange={(e) => {
                                          const value = e.target.value;
                                          if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                              handleSubjectChange(subject.id, 'max', value);
                                          }
                                      }}
                                      placeholder="e.g., 100"
                                      className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300'}`}
                                  />
                              </td>
                          </>
                      )}
                      {inputMode === 'grade' && (
                          <>
                              <td className="p-4">
                                  <label htmlFor={`subject-grade-${subject.id}`} className="sr-only">Letter Grade</label>
                                  <select
                                      id={`subject-grade-${subject.id}`}
                                      name={`subject-grade-${subject.id}`}
                                      autoComplete="off"
                                      value={subject.grade}
                                      onChange={(e) => handleSubjectChange(subject.id, 'grade', e.target.value.toUpperCase())}
                                      className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'}`}
                                  >
                                      <option value="">Select Grade</option>
                                      <option value="A">A</option>
                                      <option value="B">B</option>
                                      <option value="C">C</option>
                                      <option value="D">D</option>
                                      <option value="F">F</option>
                                  </select>
                              </td>
                          </>
                      )}
                      {inputMode === 'gpa' && (
                          <>
                              <td className="p-4">
                                  <label htmlFor={`subject-gpa-${subject.id}`} className="sr-only">CGPA Points</label>
                                  <input
                                      type="text"
                                      id={`subject-gpa-${subject.id}`}
                                      name={`subject-gpa-${subject.id}`}
                                      autoComplete="off"
                                      value={subject.gpa}
                                      onChange={(e) => {
                                          const value = e.target.value;
                                          if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                              handleSubjectChange(subject.id, 'gpa', value);
                                          }
                                      }}
                                      placeholder="e.g., 3.7"
                                      className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300'}`}
                                  />
                              </td>
                          </>
                      )}
                      <td className="p-4">
                          <label htmlFor={`subject-credits-${subject.id}`} className="sr-only">Credits</label>
                          <input
                          type="text"
                          id={`subject-credits-${subject.id}`}
                          name={`subject-credits-${subject.id}`}
                          autoComplete="off"
                          value={subject.credits}
                          onChange={(e) => {
                              const value = e.target.value;
                              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                              handleSubjectChange(subject.id, 'credits', value);
                              }
                          }}
                          placeholder="e.g., 3"
                          className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300'}`}
                          />
                      </td>
                      <td className="p-4">
                          {subjects.length > 1 && (
                          <button
                              onClick={() => removeSubject(subject.id)}
                              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                              title="Remove Subject"
                          >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
                              </svg>
                          </button>
                          )}
                      </td>
                      </tr>
                  ))}
                  </tbody>
              </table>
  
              <div className="flex justify-center">
                  <button
                      onClick={addSubject}
                      className={`flex items-center font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 ${darkMode ? 'bg-purple-700 hover:bg-purple-600 text-white focus:ring-purple-600' : 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500'}`}
                  >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                      Add Subject
                  </button>
              </div>
          </div>
  
  
          {error && <p className="text-red-500 text-xs italic text-center">{error}</p>}
  
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleCalculate}
              className={`flex-1 font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 ${darkMode ? 'bg-blue-700 hover:bg-blue-600 text-white focus:ring-blue-500' : 'bg-blue-800 hover:bg-blue-900 text-white focus:ring-blue-800'}`}
            >
              Calculate Grade
            </button>
            <button
              onClick={handleReset}
              className={`flex-1 font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-100 focus:ring-gray-500' : 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400'}`}
            >
              Reset
            </button>
          </div>
  
          {totalPercentage !== null && (
            <div
              className={`text-center p-6 rounded-xl shadow-md transform transition-all duration-500 ease-out ${resultAnimationClasses} ${resultColor}`}
            >
              <p className="text-xl font-semibold mb-2">Overall Percentage:</p>
              <p className="text-5xl font-extrabold mb-4">{totalPercentage}%</p>
              {weightedGpa !== null && (
                <p className="text-xl font-semibold mb-4">Weighted GPA (4.0 Scale): {weightedGpa}</p>
              )}
              <p className="text-2xl font-bold">Final Grade: {finalGrade}</p>
            </div>
          )}
  
          {/* Grade Scale Chart Card */}
          <div className={`p-5 rounded-lg border shadow-sm space-y-4 ${darkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
              <h3 className={`font-bold text-lg text-center ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                  Grade Scale:
              </h3>
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 text-sm ${darkMode ? 'text-gray-300' : ''}`}>
                  <div className="flex items-center">
                      <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
                      <span className="font-semibold">A:</span> 90-100% (4.0 GPA)
                  </div>
                  <div className="flex items-center">
                      <span className="w-4 h-4 bg-green-400 rounded-full mr-2"></span>
                      <span className="font-semibold">B:</span> 80-89% (3.0 GPA)
                  </div>
                  <div className="flex items-center">
                      <span className="w-4 h-4 bg-orange-400 rounded-full mr-2"></span>
                      <span className="font-semibold">C:</span> 70-79% (2.0 GPA)
                  </div>
                  <div className="flex items-center">
                      <span className="w-4 h-4 bg-yellow-400 rounded-full mr-2"></span>
                      <span className="font-semibold">D:</span> 60-69% (1.0 GPA)
                  </div>
                  <div className="flex items-center">
                      <span className="w-4 h-4 bg-red-400 rounded-full mr-2"></span>
                      <span className="font-semibold">F:</span> Below 60% (0.0 GPA)
                  </div>
              </div>
          </div>
  
          {/* What-if Simulator Card */}
          <div className={`p-6 rounded-xl shadow-inner border space-y-4 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <h3 className={`text-xl font-semibold text-center ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>What-if Simulator</h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>See how a different score in one subject impacts your overall grade.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                      <label htmlFor="simulated-subject-main" className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Select Subject:
                      </label>
                      <select
                          id="simulated-subject-main"
                          value={simulatedSubjectId}
                          onChange={(e) => {
                              setSimulatedSubjectId(e.target.value);
                              setError('');
                              setSimulatedResult(null); // Clear previous simulation result
                              setSimulatedGrade(null);
                              setSimulatedResultColor('');
                          }}
                          className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'}`}
                      >
                          <option value="">Choose a Subject</option>
                          {subjects.map(subject => (
                              <option key={subject.id} value={subject.id}>
                                  {subject.name || `Subject ${subject.id}`}
                              </option>
                          ))}
                      </select>
                  </div>
                  <div>
                      <label htmlFor="simulated-value-main" className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Simulated {inputMode === 'marks' ? 'Marks' : inputMode === 'grade' ? 'Grade' : 'GPA'} :
                      </label>
                      <input
                          type={inputMode === 'marks' || inputMode === 'gpa' ? 'text' : 'text'}
                          id="simulated-value-main"
                          value={simulatedValue}
                          onChange={(e) => {
                              const val = e.target.value;
                              if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                  setSimulatedValue(val);
                              }
                              setError('');
                              setSimulatedResult(null); // Clear previous simulation result
                              setSimulatedGrade(null);
                              setSimulatedResultColor('');
                          }}
                          placeholder={
                              inputMode === 'marks' ? 'e.g., 90' :
                              inputMode === 'grade' ? 'e.g., A' :
                              'e.g., 3.8'
                          }
                          className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300'}`}
                      />
                  </div>
              </div>
              <button
                  onClick={simulateWhatIf}
                  className={`w-full font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${darkMode ? 'bg-indigo-800 hover:bg-indigo-900 text-white focus:ring-indigo-900' : 'bg-indigo-700 hover:bg-indigo-800 text-white focus:ring-indigo-700'}`}
              >
                  Simulate
              </button>
  
              {simulatedResult !== null && !error && (
                  <div
                      className={`text-center mt-4 p-4 rounded-xl shadow-md transform transition-all duration-500 ease-out ${simulatedResultColor}`}
                  >
                      <p className="text-lg font-semibold mb-1">Simulated Overall Percentage:</p>
                      <p className="text-4xl font-extrabold mb-2">{simulatedResult}%</p>
                      <p className="text-xl font-bold">Simulated Final Grade: {simulatedGrade}</p>
                  </div>
              )}
          </div>
  
  
          <div className={`p-5 rounded-lg border shadow-sm space-y-3 ${darkMode ? 'bg-purple-900 border-purple-700' : 'bg-purple-50 border-purple-200'}`}>
            <h3 className={`font-bold text-lg ${darkMode ? 'text-purple-200' : 'text-purple-800'}`}>
              📘 How Grade Calculation Works:
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              This tool provides two main ways to calculate your academic standing:
              <br/><br/>
              <span className="font-semibold">Total Percentage:</span> This is calculated as the sum of all marks obtained divided by the sum of all maximum marks, multiplied by 100.
              <br/>
              Formula: $P = (\sum MO / \sum MM) \times 100$, where $P$ = Percentage, $MO$ = Marks Obtained, $MM$ = Max Marks
              <br/><br/>
              <span className="font-semibold">Weighted GPA:</span> If you provide credits for your subjects, the tool calculates a weighted average. Each subject's percentage (derived from marks, letter grade, or GPA points) is multiplied by its credits, summed up, and then divided by the total credits. This weighted percentage is then mapped to a 4.0 GPA scale.
              <br/>
              Formula: $W_P = (\sum (SP \times C)) / \sum C$, where $W_P$ = Weighted Percentage, $SP$ = Subject Percentage, $C$ = Credits
            </p>
            <h3 className={`font-bold text-lg ${darkMode ? 'text-purple-200' : 'text-purple-800'}`}>
              🧠 Why Use This?
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Manual grade calculation can be confusing and error-prone, especially with different grading schemes (marks, letter grades, GPA points) and weighted subjects. This tool handles these complexities, simplifying your academic planning and helping you understand your performance accurately.
            </p>
            <h3 className={`font-bold text-lg ${darkMode ? 'text-purple-200' : 'text-purple-800'}`}>
              🧪 What-if Simulator:
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Curious how a better score in one exam could change your overall GPA? The "What-if Simulator" allows you to hypothetically change a subject's marks, grade, or GPA and instantly see the impact on your final overall percentage and grade. It's a powerful tool for setting academic goals and prioritizing your study efforts.
            </p>
          </div>
        </div>
      </div>
    );
  };
  // --- End GradeCalculator Component ---

export default GradeCalculator; 