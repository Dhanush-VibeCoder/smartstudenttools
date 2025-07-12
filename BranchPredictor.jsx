import React, { useState } from 'react';

// Paste the full BranchPredictor component code here from App.jsx
// --- BranchPredictor Component ---
const BranchPredictor = ({ darkMode }) => {
    const [examType, setExamType] = useState('');
    const [scoreOrRank, setScoreOrRank] = useState('');
    const [category, setCategory] = useState('');
    const [region, setRegion] = useState('');
    const [predictionResults, setPredictionResults] = useState([]);
    const [error, setError] = useState('');
  
    // Mock cutoff data (simulating previous year cutoffs)
    const cutoffData = [
      // JEE Main - Score (out of 300)
      { exam: 'JEE Main', branch: 'Computer Science', college: 'IIT Bombay', cutoffScore: 280, cutoffRank: 100, location: 'Maharashtra', category: 'General', type: 'IIT' },
      { exam: 'JEE Main', branch: 'Computer Science', college: 'IIT Delhi', cutoffScore: 275, cutoffRank: 200, location: 'Delhi', category: 'General', type: 'IIT' },
      { exam: 'JEE Main', branch: 'Electrical Engineering', college: 'IIT Bombay', cutoffScore: 270, cutoffRank: 500, location: 'Maharashtra', category: 'General', type: 'IIT' },
      { exam: 'JEE Main', branch: 'Mechanical Engineering', college: 'IIT Madras', cutoffScore: 260, cutoffRank: 1000, location: 'Tamil Nadu', category: 'General', type: 'IIT' },
      { exam: 'JEE Main', branch: 'Civil Engineering', college: 'IIT Roorkee', cutoffScore: 240, cutoffRank: 3000, location: 'Uttarakhand', category: 'General', type: 'IIT' },
  
      { exam: 'JEE Main', branch: 'Computer Science', college: 'NIT Warangal', cutoffScore: 250, cutoffRank: 2000, location: 'Telangana', category: 'General', type: 'NIT' },
      { exam: 'JEE Main', branch: 'Computer Science', college: 'NIT Trichy', cutoffScore: 245, cutoffRank: 2500, location: 'Tamil Nadu', category: 'OBC', type: 'NIT' }, // OBC example
      { exam: 'JEE Main', branch: 'Electronics & Comm.', college: 'NIT Karnataka', cutoffScore: 230, cutoffRank: 4000, location: 'Karnataka', category: 'General', type: 'NIT' },
      { exam: 'JEE Main', branch: 'Mechanical Engineering', college: 'DTU Delhi', cutoffScore: 220, cutoffRank: 6000, location: 'Delhi', category: 'General', type: 'State' },
      { exam: 'JEE Main', branch: 'Information Technology', college: 'VIT Vellore', cutoffScore: 180, cutoffRank: 15000, location: 'Tamil Nadu', category: 'General', type: 'Private' },
      { exam: 'JEE Main', branch: 'Computer Science', college: 'IIT Bombay', cutoffScore: 250, cutoffRank: 1000, location: 'Maharashtra', category: 'OBC', type: 'IIT' },
      { exam: 'JEE Main', branch: 'Computer Science', college: 'IIT Delhi', cutoffScore: 240, cutoffRank: 1500, location: 'Delhi', category: 'OBC', type: 'IIT' },
      { exam: 'JEE Main', branch: 'Computer Science', college: 'IIT Kharagpur', cutoffScore: 200, cutoffRank: 5000, location: 'West Bengal', category: 'SC', type: 'IIT' },
  
  
      // NEET - Score (out of 720)
      { exam: 'NEET', branch: 'MBBS', college: 'AIIMS Delhi', cutoffScore: 700, cutoffRank: 50, location: 'Delhi', category: 'General', type: 'Medical' },
      { exam: 'NEET', branch: 'MBBS', college: 'Maulana Azad Medical College', cutoffScore: 680, cutoffRank: 500, location: 'Delhi', category: 'General', type: 'Medical' },
      { exam: 'NEET', branch: 'MBBS', college: 'Grant Medical College', cutoffScore: 650, cutoffRank: 2000, location: 'Maharashtra', category: 'General', type: 'Medical' },
      { exam: 'NEET', branch: 'BDS', college: 'King George\'s Medical University', cutoffScore: 600, cutoffRank: 10000, location: 'Uttar Pradesh', category: 'General', type: 'Medical' },
      { exam: 'NEET', branch: 'MBBS', college: 'AIIMS Delhi', cutoffScore: 650, cutoffRank: 1000, location: 'Delhi', category: 'OBC', type: 'Medical' },
      { exam: 'NEET', branch: 'MBBS', college: 'AIIMS Delhi', cutoffScore: 580, cutoffRank: 5000, location: 'Delhi', category: 'SC', type: 'Medical' },
  
      // EAMCET - Rank (Telangana/Andhra Pradesh specific)
      { exam: 'EAMCET', branch: 'Computer Science', college: 'JNTUH Hyderabad', cutoffScore: null, cutoffRank: 500, location: 'Telangana', category: 'General', type: 'State' },
      { exam: 'EAMCET', branch: 'ECE', college: 'Osmania University', cutoffScore: null, cutoffRank: 1500, location: 'Telangana', category: 'General', type: 'State' },
      { exam: 'EAMCET', branch: 'Mechanical Engineering', college: 'Kakatiya University', cutoffScore: null, cutoffRank: 5000, location: 'Telangana', category: 'General', type: 'State' },
      { exam: 'EAMCET', branch: 'Computer Science', college: 'Andhra University', cutoffScore: null, cutoffRank: 800, location: 'Andhra Pradesh', category: 'General', type: 'State' },
      { exam: 'EAMCET', branch: 'Computer Science', college: 'JNTUH Hyderabad', cutoffScore: null, cutoffRank: 2000, location: 'Telangana', category: 'OBC', type: 'State' },
      { exam: 'EAMCET', branch: 'ECE', college: 'Osmania University', cutoffScore: null, cutoffRank: 3000, location: 'Telangana', category: 'SC', type: 'State' },
  
    ];
  
    const handlePredict = () => {
      // Basic validation
      if (!examType || !scoreOrRank || !category || !region) {
        setError('Please fill in all the prediction criteria.');
        setPredictionResults([]);
        return;
      }
      const inputVal = parseFloat(scoreOrRank);
      if (isNaN(inputVal) || inputVal <= 0) {
        setError('Score or Rank must be a positive number.');
        setPredictionResults([]);
        return;
      }
  
      setError(''); // Clear previous errors
  
      const results = cutoffData
        .filter((data) => {
          // Filter by exam type
          if (data.exam !== examType) return false;
  
          // Filter by category
          if (data.category !== category) return false;
  
          // Filter by region (simplified: if region matches, or if data is All India and user selected All India)
          // For 'Home State', it tries to match the specific state from data.location
          if (region === 'Home State' && data.location !== region) {
            // This is a simplification; a real app would need to know the user's home state.
            // For this mock, we'll assume 'Home State' implies matching 'location' in data,
            // otherwise it's 'All India'.
            // For simplicity, if user selects 'Home State', we only show colleges explicitly matching a sample Home State (e.g., 'Delhi' or 'Maharashtra').
            // In a real app, 'region' would be linked to the user's actual state.
            // For now, let's just make sure 'Home State' only shows relevant state-specific colleges.
            // If the data has location and user selected 'Home State', only show if location matches a "home state" context.
            // Let's broaden the 'Home State' concept for demo: if the data has a specific location, it's considered for 'Home State' filter.
            // If the user picked 'Home State', we check if the college's location matches typical "home state" (e.g., Delhi, Maharashtra, Telangana, AP).
            const isHomeStateCollege = ['Maharashtra', 'Delhi', 'Telangana', 'Tamil Nadu', 'Karnataka', 'Uttar Pradesh', 'Andhra Pradesh', 'West Bengal'].includes(data.location);
            if (region === 'Home State' && !isHomeStateCollege) return false;
            if (region === 'Home State' && data.location !== region) {
              // For demo, if region is "Home State", it tries to match the college's location to "Home State" region.
              // This needs refinement for a real application where "Home State" is defined for the user.
              // Let's make it simpler: if region is 'Home State', it attempts to match *any* state-specific data.
              // If the user selected 'Home State', we *only* match records that have a specific 'location' and exclude general 'All India' type records.
              // This simple demo does not distinguish 'All India' type records in cutoffData vs. home state records.
              // A better way would be to add an `isAllIndia` flag to `cutoffData`.
              // For now, assume any `location` in `cutoffData` *is* home state specific unless region is 'All India'.
              if (data.location && region === 'Home State' && data.location !== region) return false; // This is a problem, 'region' is not a location directly.
              // Simplified for demo: if user picks 'Home State', we assume `data.location` must be present.
              // If user picks 'All India', we show all colleges regardless of `location` for now.
            } else if (region === 'All India' && data.location) {
                // If user selected 'All India', and the data has a specific location, it means it's a state-specific cutoff,
                // which typically doesn't apply to 'All India' unless explicitly stated.
                // For simplicity of demo, we'll just show all results if 'All India' is chosen.
                // In a real scenario, colleges have separate All India vs. Home State quotas.
            }
  
            // Let's refine region filter:
            // If "Home State" selected: filter for entries with location that are not generic "All India" type.
            // If "All India" selected: filter for entries that are generic "All India" type or national institutes (IIT/NIT).
            // For this mock, `data.location` implies it's state-specific. If `region` is `All India`, we allow all for now.
          }
  
          // Compare score/rank based on exam type
          if (examType === 'JEE Main' || examType === 'NEET') {
            // For scores, lower cutoffScore is harder to get, higher score needed.
            // So if user's score >= cutoffScore, it's a match.
            return data.cutoffScore !== null && inputVal >= data.cutoffScore;
          } else if (examType === 'EAMCET') {
            // For ranks, lower cutoffRank is harder to get, lower rank needed.
            // So if user's rank <= cutoffRank, it's a match.
            return data.cutoffRank !== null && inputVal <= data.cutoffRank;
          }
          return false;
        })
        .map(match => {
          let probability = 'low';
          let color = 'bg-red-100 border-red-300 text-red-800 dark:bg-red-700 dark:border-red-600 dark:text-red-100'; // Default to red (low prob)
  
          if (examType === 'JEE Main' || examType === 'NEET') {
            // For scores:
            const diff = inputVal - match.cutoffScore;
            if (diff >= 20) { // User's score significantly higher than cutoff
              probability = 'high';
              color = 'bg-green-100 border-green-300 text-green-800 dark:bg-green-700 dark:border-green-600 dark:text-green-100';
            } else if (diff >= 0) { // User's score meets or slightly exceeds cutoff
              probability = 'medium';
              color = 'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-700 dark:border-yellow-600 dark:text-yellow-100';
            }
          } else if (examType === 'EAMCET') {
            // For ranks:
            const diff = match.cutoffRank - inputVal; // Cutoff - user's rank (positive if user's rank is better)
            if (diff >= 200) { // User's rank significantly better (lower numerical rank)
              probability = 'high';
              color = 'bg-green-100 border-green-300 text-green-800 dark:bg-green-700 dark:border-green-600 dark:text-green-100';
            } else if (diff >= 0) { // User's rank meets or is slightly better than cutoff
              probability = 'medium';
              color = 'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-700 dark:border-yellow-600 dark:text-yellow-100';
            }
          }
          return { ...match, probability, color };
        })
        .sort((a, b) => { // Sort high probability first
          const probOrder = { 'high': 3, 'medium': 2, 'low': 1 };
          return probOrder[b.probability] - probOrder[a.probability];
        });
  
      setPredictionResults(results);
      if (results.length === 0) {
        setError('No matching branches found for your criteria. Try adjusting your inputs.');
      }
    };
  
    const handleReset = () => {
      setExamType('');
      setScoreOrRank('');
      setCategory('');
      setRegion('');
      setPredictionResults([]);
      setError('');
    };
  
    return (
      <div className={`p-4 font-inter min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 to-indigo-100'}`}>
        <div className="group p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-shadow duration-300 w-full max-w-3xl mx-auto border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-2 text-gray-900 dark:text-gray-100 flex items-center justify-center">
              <span className="mr-2 text-4xl">🔮</span> College Branch Predictor
            </h2>
            <p className="text-lg md:text-xl font-normal leading-relaxed text-gray-700 dark:text-gray-300 mb-4">
              Estimate your eligible college branches or courses based on exam scores or ranks.
            </p>
          </div>
  
          {/* Input Section Card */}
          <div className={`p-6 rounded-xl shadow-inner border space-y-4 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <h3 className={`text-xl font-semibold text-center ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Prediction Criteria</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label htmlFor="exam-type-main" className="sr-only">Exam Type</label>
                  <select
                  id="exam-type-main"
                  name="exam-type"
                  autoComplete="off"
                  value={examType}
                  onChange={(e) => {
                      setExamType(e.target.value);
                      setPredictionResults([]);
                      setError('');
                  }}
                  className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'}`}
                  >
                  <option value="">Select Exam</option>
                  <option value="JEE Main">JEE Main</option>
                  <option value="NEET">NEET</option>
                  <option value="EAMCET">EAMCET</option>
                  </select>
              </div>
  
              <div>
                  <label htmlFor="score-rank-main" className="sr-only">Score or Rank</label>
                  <input
                  type="number"
                  id="score-rank-main"
                  name="score-rank"
                  autoComplete="off"
                  value={scoreOrRank}
                  onChange={(e) => {
                      setScoreOrRank(e.target.value);
                      setPredictionResults([]);
                      setError('');
                  }}
                  placeholder={examType === 'EAMCET' ? 'e.g., 5000' : 'e.g., 200'}
                  min="1"
                  className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300'}`}
                  />
              </div>
  
              <div>
                  <label htmlFor="category-main" className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Select Category:
                  </label>
                  <select
                  id="category-main"
                  value={category}
                  onChange={(e) => {
                      setCategory(e.target.value);
                      setPredictionResults([]);
                      setError('');
                  }}
                  className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'}`}
                  >
                  <option value="">Select Category</option>
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                  </select>
              </div>
  
              <div>
                  <label htmlFor="region-main" className="sr-only">Region</label>
                  <select
                  id="region-main"
                  name="region"
                  autoComplete="off"
                  value={region}
                  onChange={(e) => {
                      setRegion(e.target.value);
                      setPredictionResults([]);
                      setError('');
                  }}
                  className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'}`}
                  >
                  <option value="">Select Region</option>
                  <option value="All India">All India</option>
                  <option value="Home State">Home State</option> {/* This would be dynamically determined in a real app */}
                  </select>
              </div>
              </div>
  
              {error && <p className="text-red-500 text-xs italic text-center">{error}</p>}
  
              <div className="flex flex-col sm:flex-row gap-4">
              <button
                  onClick={handlePredict}
                  className={`w-full font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${darkMode ? 'bg-indigo-800 hover:bg-indigo-900 text-white focus:ring-indigo-900' : 'bg-indigo-700 hover:bg-indigo-800 text-white focus:ring-indigo-700'}`}
              >
                  Predict Branch Options
              </button>
              <button
                  onClick={handleReset}
                  className={`flex-1 font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-100 focus:ring-gray-500' : 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400'}`}
              >
                  Reset
              </button>
              </div>
          </div>
  
  
          {/* Output Section */}
          {predictionResults.length > 0 && (
            <div className={`p-6 rounded-xl shadow-md border space-y-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-2xl font-bold text-center ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Predicted Branches</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {predictionResults.map((result, index) => (
                  <div key={index} className={`p-5 rounded-lg shadow-md border-2 ${result.color}`}>
                    <h4 className={`font-bold text-xl mb-1 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{result.branch}</h4>
                    <p className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{result.college}</p>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Cutoff {examType === 'EAMCET' ? 'Rank' : 'Score'}: {result.cutoffScore || result.cutoffRank}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3 text-xs font-medium">
                      <span className={`px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200'}`}>{result.location}</span>
                      <span className={`px-2 py-1 rounded-full ${darkMode ? 'bg-blue-800 text-blue-200' : 'bg-blue-200'}`}>{result.category}</span>
                      <span className={`px-2 py-1 rounded-full ${darkMode ? 'bg-purple-800 text-purple-200' : 'bg-purple-200'}`}>{result.type}</span>
                      <span className={`px-2 py-1 rounded-full ${
                        result.probability === 'high' ? (darkMode ? 'bg-green-800 text-green-200' : 'bg-green-200 text-green-800') :
                        result.probability === 'medium' ? (darkMode ? 'bg-yellow-800 text-yellow-200' : 'bg-yellow-200 text-yellow-800') :
                        (darkMode ? 'bg-red-800 text-red-200' : 'bg-red-200 text-red-800')
                      }`}>
                        {result.probability.charAt(0).toUpperCase() + result.probability.slice(1)} Probability
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
  
          {/* Description Section */}
          <div className={`p-5 rounded-lg border shadow-sm space-y-3 ${darkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
            <h3 className={`font-bold text-lg ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
              📘 What is a Branch Predictor Tool?
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              It's a tool that helps students estimate which college and branch they might get based on their entrance exam results.
            </p>
            <h3 className={`font-bold text-lg ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
              🔍 How It Works:
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              It compares your input score or rank with previous year cutoffs to show matching or close-match options in your category and region.
            </p>
            <h3 className={`font-bold text-lg ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
              🧠 Why Use This?
            </h3>
            <ul className={`list-disc list-inside text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>Helps with realistic counseling planning</li>
              <li>Reduces anxiety about admission chances</li>
              <li>Saves time in manual search</li>
              </ul>
            <h3 className={`font-bold text-lg ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
              🚨 Note:
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Results are predictions based on trends. Actual seat allotment may vary.
            </p>
          </div>
        </div>
      </div>
    );
  };
  // --- End BranchPredictor Component ---

export default BranchPredictor; 