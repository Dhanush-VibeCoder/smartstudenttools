import React, { useState } from 'react';

// Paste the full ExamScorePredictor component code here from App.jsx
// --- ExamScorePredictor Component ---
const ExamScorePredictor = ({ darkMode }) => {
    const [currentScore, setCurrentScore] = useState('');
    const [completedWeight, setCompletedWeight] = useState('');
    const [targetFinalScore, setTargetFinalScore] = useState('');
  
    const [requiredScore, setRequiredScore] = useState(null);
    const [remainingWeight, setRemainingWeight] = useState(null);
    const [message, setMessage] = useState('');
    const [resultColor, setResultColor] = useState('');
    const [error, setError] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);
  
    // Validation logic
    const validateInputs = () => {
      const current = parseFloat(currentScore);
      const weight = parseFloat(completedWeight);
      const target = parseFloat(targetFinalScore);
  
      if (isNaN(current) || isNaN(weight) || isNaN(target) || currentScore.trim() === '' || completedWeight.trim() === '' || targetFinalScore.trim() === '') {
        setError('Please enter valid numbers for all fields.');
        return false;
      }
      if (current < 0 || weight < 0 || target < 0) {
        setError('Scores and weights cannot be negative.');
        return false;
      }
      if (current > 100 || target > 100) {
          setError('Scores cannot exceed 100%.');
          return false;
      }
      if (weight >= 100) {
        setError('Total weight of completed exams must be less than 100%.');
        return false;
      }
      if (target < current && weight !== 0) { // If there's already a score, target can't be lower
        setError('Target final score cannot be less than your current score, unless current weight is 0.');
        return false;
      }
  
      setError('');
      return true;
    };
  
    // Prediction logic
    const predictScore = () => {
      if (!validateInputs()) {
        setRequiredScore(null);
        setRemainingWeight(null);
        setMessage('');
        setResultColor('');
        setIsAnimating(false);
        return;
      }
  
      const current = parseFloat(currentScore);
      const weight = parseFloat(completedWeight);
      const target = parseFloat(targetFinalScore);
  
      const remWeight = 100 - weight;
      setRemainingWeight(remWeight.toFixed(2));
  
      // Current contribution to final score
      const currentContribution = (current * weight) / 100;
  
      // Required contribution from remaining exams
      const requiredTotalContribution = (target * 100) / 100; // Target is already a percentage
      const neededContribution = requiredTotalContribution - currentContribution;
  
      let calculatedRequiredScore = 0;
      if (remWeight > 0) {
        calculatedRequiredScore = (neededContribution / remWeight) * 100;
      } else if (remWeight === 0 && neededContribution === 0) {
          calculatedRequiredScore = current; // Already at 100% weight, required score is current score
      } else {
          // This case implies target is unreachable if remaining weight is 0 and needed contribution is not 0
          calculatedRequiredScore = Infinity;
      }
  
      setRequiredScore(calculatedRequiredScore.toFixed(2));
  
      let msg = '';
      let color = '';
  
      if (calculatedRequiredScore === Infinity) {
          msg = `🚨 Impossible! With 0% weight remaining, you cannot reach ${target}% if your current score is not already ${target}%.`;
          color = 'bg-red-100 border-red-300 text-red-800 dark:bg-red-700 dark:border-red-600 dark:text-red-100';
      } else if (calculatedRequiredScore <= 0) {
          msg = `🎉 You're already on track! You need 0% in upcoming exams to reach ${target}%.`;
          color = 'bg-green-100 border-green-300 text-green-800 dark:bg-green-700 dark:border-green-600 dark:text-green-100';
          setRequiredScore('0.00'); // Set to 0.00 if negative or zero
      } else if (calculatedRequiredScore <= 100) {
        msg = `🎯 You need to score an average of ${calculatedRequiredScore.toFixed(2)}% in your remaining exams to reach your goal of ${target}%.`;
        color = 'bg-green-100 border-green-300 text-green-800 dark:bg-green-700 dark:border-green-600 dark:text-green-100';
      } else {
        msg = `🚨 You need an average of ${calculatedRequiredScore.toFixed(2)}% in your remaining exams, which might be unrealistic.`;
        color = 'bg-red-100 border-red-300 text-red-800 dark:bg-red-700 dark:border-red-600 dark:text-red-100';
      }
  
      setMessage(msg);
      setResultColor(color);
      setIsAnimating(true);
    };
  
    // Reset all fields
    const handleReset = () => {
      setCurrentScore('');
      setCompletedWeight('');
      setTargetFinalScore('');
      setRequiredScore(null);
      setRemainingWeight(null);
      setMessage('');
      setResultColor('');
      setError('');
      setIsAnimating(false);
    };
  
    const resultAnimationClasses = isAnimating
      ? 'opacity-100 translate-y-0 scale-100'
      : 'opacity-0 translate-y-4 scale-95';
  
    return (
      <div className={`p-4 font-inter min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-50 to-blue-100'}`}>
        <div className="group p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-shadow duration-300 w-full max-w-3xl mx-auto border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-2 text-gray-900 dark:text-gray-100 flex items-center justify-center">
              <span className="mr-2 text-4xl">🔮</span> Exam Score Predictor
            </h2>
            <p className="text-lg md:text-xl font-normal leading-relaxed text-gray-700 dark:text-gray-300 mb-4">
              Predict the marks you need in upcoming exams to reach your desired final score or grade.
            </p>
          </div>
  
          {/* Input Section Card */}
          <div className={`p-6 rounded-xl shadow-inner border space-y-4 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <h3 className={`text-xl font-semibold text-center ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Prediction Inputs</h3>
            <div>
              <label htmlFor="current-score-main" className="sr-only">Current Score or Average (%)</label>
              <input
                type="text"
                id="current-score-main"
                name="current-score"
                autoComplete="off"
                value={currentScore}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setCurrentScore(value);
                    setError('');
                    setIsAnimating(false);
                  }
                }}
                placeholder="e.g., 75"
                className={`shadow-sm appearance-none border rounded-lg w-full py-3 px-4 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  error && (error.includes('score') || error.includes('numbers')) ? 'border-red-500' : `${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300 text-gray-700'}`
                }`}
              />
            </div>
  
            <div>
              <label htmlFor="completed-weight-main" className="sr-only">Completed Weight (%)</label>
              <input
                type="text"
                id="completed-weight-main"
                name="completed-weight"
                autoComplete="off"
                value={completedWeight}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setCompletedWeight(value);
                    setError('');
                    setIsAnimating(false);
                  }
                }}
                placeholder="e.g., 40"
                className={`shadow-sm appearance-none border rounded-lg w-full py-3 px-4 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  error && (error.includes('weight') || error.includes('numbers')) ? 'border-red-500' : `${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300 text-gray-700'}`
                }`}
              />
            </div>
  
            <div>
              <label htmlFor="target-final-score-main" className="sr-only">Target Final Score (%)</label>
              <input
                type="text"
                id="target-final-score-main"
                name="target-final-score"
                autoComplete="off"
                value={targetFinalScore}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setTargetFinalScore(value);
                    setError('');
                    setIsAnimating(false);
                  }
                }}
                placeholder="e.g., 90"
                className={`shadow-sm appearance-none border rounded-lg w-full py-3 px-4 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  error && (error.includes('target') || error.includes('numbers')) ? 'border-red-500' : `${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300 text-gray-700'}`
                }`}
              />
            </div>
  
            {error && <p className="text-red-500 text-xs italic text-center">{error}</p>}
  
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={predictScore}
                className={`flex-1 font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 ${darkMode ? 'bg-blue-700 hover:bg-blue-600 text-white focus:ring-blue-500' : 'bg-blue-800 hover:bg-blue-900 text-white focus:ring-blue-800'}`}
              >
                Predict Required Score
              </button>
              <button
                onClick={handleReset}
                className={`flex-1 font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-100 focus:ring-gray-500' : 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400'}`}
              >
                Reset
              </button>
            </div>
          </div>
  
  
          {requiredScore !== null && (
            <div
              className={`text-center p-6 rounded-xl shadow-md transform transition-all duration-500 ease-out ${resultColor}`}
            >
              <p className="text-xl font-semibold mb-2">Required in Remaining Exams:</p>
              <p className="text-5xl font-extrabold mb-4">{requiredScore}%</p>
              {remainingWeight !== null && (
                <p className="text-xl font-medium mb-4">Total Weight Left: {remainingWeight}%</p>
              )}
              <p className="text-lg">{message}</p>
            </div>
          )}
  
          {/* Description Section */}
          <div className={`p-5 rounded-lg border shadow-sm space-y-3 ${darkMode ? 'bg-purple-900 border-purple-700' : 'bg-purple-50 border-purple-200'}`}>
            <h3 className={`font-bold text-lg ${darkMode ? 'text-purple-200' : 'text-purple-800'}`}>
              📘 What is This Tool?
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              This tool estimates what you need to score in remaining exams or assessments to achieve your target percentage or GPA.
            </p>
            <h3 className={`font-bold text-lg ${darkMode ? 'text-purple-200' : 'text-purple-800'}`}>
              📐 How It Works:
            </h3>
            <ul className={`list-disc list-inside text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>We calculate the weighted contribution of your completed and remaining marks.</li>
              <li>Then we reverse-engineer the required score to reach your desired goal.</li>
            </ul>
            <h3 className={`font-bold text-lg ${darkMode ? 'text-purple-200' : 'text-purple-800'}`}>
              🧠 Why Use This?
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              It helps you plan smarter and study with a clear goal. You'll know exactly how much effort is needed for the rest of the term!
            </p>
            <h3 className={`font-bold text-lg ${darkMode ? 'text-purple-200' : 'text-purple-800'}`}>
              🚨 Pro Tip:
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Use this after each internal or test result update to stay on track!
            </p>
          </div>
        </div>
      </div>
    );
  };
  // --- End ExamScorePredictor Component ---

export default ExamScorePredictor; 