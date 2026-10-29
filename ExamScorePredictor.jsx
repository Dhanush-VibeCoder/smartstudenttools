import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from './SEO';
import AdsterraBanner from './AdsterraBanner';

// Paste the full ExamScorePredictor component code here from App.jsx
// --- ExamScorePredictor Component ---
const ExamScorePredictor = ({ darkMode }) => {
    const [rating, setRating] = useState(0);
    const [ratingHover, setRatingHover] = useState(0);
    const [ratingSubmitted, setRatingSubmitted] = useState(false);

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
        <SEO
          title="Exam Score Predictor | What Score Do I Need to Pass? - Smart Studies"
          description="Calculate the minimum exam score you need to reach your target percentage or GPA. Supports subject weightings, internal marks, and semester grade calculations."
          url="https://smartstudenttools.xyz/exam-score-predictor"
        />
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

          {/* How to Use Section */}
          <div className={`p-5 rounded-lg border shadow-sm mt-8 space-y-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700`}>
            <h3 className={`font-bold text-lg text-gray-950 dark:text-gray-100`}>
              📖 How to Use the Exam Score Predictor
            </h3>
            <ol className="list-decimal list-inside text-sm text-gray-700 dark:text-gray-300 space-y-2">
              <li>Input your current average score (in percentage) obtained in the term so far.</li>
              <li>Input the total weight (in percentage) of the assignments/exams you have completed.</li>
              <li>Set your target overall final score (in percentage) that you want to achieve by the end of the term.</li>
              <li>Review the calculated target: the tool will show what percentage you need to score on all remaining tasks.</li>
            </ol>
          </div>

          {/* Formulas and Ratios Section */}
          <div className={`p-5 rounded-lg border shadow-sm mt-8 space-y-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700`}>
            <h3 className={`font-bold text-lg text-gray-950 dark:text-gray-100`}>
              📊 Target Grade Formula
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              The required score on remaining coursework is computed using the following equation:
              <br />
              <code className="block my-2 bg-gray-100 dark:bg-gray-900 p-2 rounded text-center font-mono">
                Required Score = (Target Final - (Current Score * Completed Weight)) / (1 - Completed Weight)
              </code>
            </p>
          </div>

          {/* Detailed Example */}
          <div className={`p-5 rounded-lg border shadow-sm mt-8 space-y-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700`}>
            <h3 className={`font-bold text-lg text-gray-950 dark:text-gray-100`}>
              ✏️ Practical Score Prediction Example
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              Suppose your current score is 80% on assignments that make up 40% of your final grade. You want to achieve an overall final grade of 85%.
              <br />
              - The remaining grade weight is: 100% - 40% = 60%.
              <br />
              - Your current contribution to the final grade is: 80% * 0.40 = 32%.
              <br />
              - You need 85% - 32% = 53% more points to reach your target.
              <br />
              - Your required average on the remaining 60% of tests is:
              <br />
              <code className="block my-2 bg-gray-100 dark:bg-gray-900 p-2 rounded text-center font-mono">
                Required Score = (53 / 60) * 100 = 88.33%
              </code>
              So you need to average 88.33% on all remaining exams to secure an overall grade of 85%.
            </p>
          </div>

          {/* Advantages Section */}
          <div className={`p-5 rounded-lg border shadow-sm mt-8 space-y-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700`}>
            <h3 className={`font-bold text-lg text-gray-950 dark:text-gray-100`}>
              🌟 Advantages of Target Score Projections
            </h3>
            <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-2">
              <li><span className="font-semibold text-gray-900 dark:text-gray-100">Realistic Goal Setting:</span> Know exactly how much effort is required in the final week of classes.</li>
              <li><span className="font-semibold text-gray-900 dark:text-gray-100">Stress Reduction:</span> Avoid anxiety by knowing if your academic targets are mathematically achievable.</li>
              <li><span className="font-semibold text-gray-900 dark:text-gray-100">Weighted Grading Awareness:</span> Gain a better understanding of how different class tasks contribute to your final standing.</li>
            </ul>
          </div>

          {/* FAQ Section */}
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
                  <span>What happens if the calculator shows a required score over 100%?</span>
                  <span className="accordion-icon text-2xl rotate-0 transition-transform duration-300 text-gray-500">+</span>
                </button>
                <div className="accordion-content max-h-0 overflow-hidden transition-all duration-500 ease-in-out text-gray-700 dark:text-gray-300">
                  <p className="pt-2">If the required score exceeds 100%, it means your target is mathematically impossible to reach given your current grades and the remaining weights. In this case, you may want to lower your target goal or ask your teacher about extra credit opportunities.</p>
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
                  <span>How is grade weight determined?</span>
                  <span className="accordion-icon text-2xl rotate-0 transition-transform duration-300 text-gray-500">+</span>
                </button>
                <div className="accordion-content max-h-0 overflow-hidden transition-all duration-500 ease-in-out text-gray-700 dark:text-gray-300">
                  <p className="pt-2">Grade weights are outlined in your course syllabus. For example, midterm exams might be worth 30%, assignments 20%, and the final exam 50% of the total final grade.</p>
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
                <li><Link to="/study-planner" className="hover:underline">Study Planner</Link></li>
              </ul>
            </div>
            <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <h4 className="font-bold text-lg mb-3 text-gray-900 dark:text-gray-100">📚 Related Articles</h4>
              <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
                <li><Link to="/blog/academic-survival-guide-calculate-grades-predict-scores-clear-backlogs" className="hover:underline">The Academic Survival Guide: How to Calculate Grades, Predict Exam Scores, and Clear Backlogs</Link></li>
                <li><a href="https://smartstudenttools.xyz/blog/understanding-syllabi" target="_blank" rel="noopener noreferrer" className="hover:underline">Syllabus Guide: Decoding Grade Slabs and Weights</a></li>
              </ul>
            </div>
          </div>

          {/* Interactive Rating Component */}
          <div className="p-6 rounded-xl border shadow-sm text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 mt-8">
            <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">Rate & Give Feedback</h4>
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
  // --- End ExamScorePredictor Component ---

export default ExamScorePredictor; 