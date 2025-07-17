import React, { useState, useEffect, useRef } from 'react';
import AdBanner from './AdBanner.jsx';
import html2canvas from 'html2canvas';

const BMI_CATEGORIES = [
  { label: 'Underweight', color: 'bg-blue-400', min: 0, max: 18.5 },
  { label: 'Normal', color: 'bg-green-500', min: 18.5, max: 24.9 },
  { label: 'Overweight', color: 'bg-yellow-400', min: 25, max: 29.9 },
  { label: 'Obese', color: 'bg-red-500', min: 30, max: 100 },
];

const getBMICategory = (bmi) => {
  for (const cat of BMI_CATEGORIES) {
    if (bmi >= cat.min && bmi < cat.max) return cat;
  }
  return BMI_CATEGORIES[BMI_CATEGORIES.length - 1];
};

const BMI_TIPS = {
  Underweight: {
    diet: "Increase calorie intake with nutritious foods like nuts, dairy, and whole grains. Eat more frequently.",
    exercise: "Focus on strength training to build muscle mass. Avoid excessive cardio.",
    mental: "Consult a healthcare provider if you feel tired or weak. Body image concerns are valid—seek support if needed."
  },
  Normal: {
    diet: "Maintain a balanced diet rich in fruits, vegetables, lean proteins, and whole grains.",
    exercise: "Continue regular physical activity—aim for at least 150 minutes of moderate exercise per week.",
    mental: "Great job! Keep up healthy habits and manage stress with relaxation techniques."
  },
  Overweight: {
    diet: "Reduce processed foods and sugary drinks. Focus on portion control and more vegetables.",
    exercise: "Increase activity—try brisk walking, cycling, or swimming. Add strength training.",
    mental: "Small changes add up! Set realistic goals and celebrate progress. Seek support if needed."
  },
  Obese: {
    diet: "Consult a nutritionist for a personalized plan. Emphasize vegetables, lean proteins, and whole grains.",
    exercise: "Start with low-impact activities like walking or water aerobics. Gradually increase intensity.",
    mental: "You are not alone. Consider talking to a healthcare provider or counselor for support."
  }
};

const BMI_HISTORY_KEY = 'bmi_calculator_history';

const BMICalculator = () => {
  const [heightUnit, setHeightUnit] = useState('cm');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [height, setHeight] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState(null);
  const [category, setCategory] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [error, setError] = useState('');
  const [unitSystem, setUnitSystem] = useState('metric'); // 'metric' or 'imperial'
  const [history, setHistory] = useState([]);
  const cardRef = useRef(null);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');

  // Update units when system changes
  React.useEffect(() => {
    if (unitSystem === 'metric') {
      setHeightUnit('cm');
      setWeightUnit('kg');
    } else {
      setHeightUnit('ftin');
      setWeightUnit('lb');
    }
    setHeight(''); setHeightFt(''); setHeightIn(''); setWeight('');
  }, [unitSystem]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(BMI_HISTORY_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch {}
  }, []);

  // Save to history
  const saveToHistory = (bmiVal, categoryLabel) => {
    const newEntry = {
      id: Date.now(),
      bmi: bmiVal,
      category: categoryLabel,
      date: new Date().toISOString(),
    };
    let hist = [];
    try {
      const stored = localStorage.getItem(BMI_HISTORY_KEY);
      if (stored) hist = JSON.parse(stored);
    } catch {}
    hist.unshift(newEntry);
    if (hist.length > 50) hist = hist.slice(0, 50);
    localStorage.setItem(BMI_HISTORY_KEY, JSON.stringify(hist));
    setHistory(hist);
  };

  const handleCalculate = (e) => {
    e?.preventDefault();
    setError('');
    let hMeters = 0;
    let wKg = 0;
    if (heightUnit === 'cm') {
      if (!height || isNaN(height) || height <= 0) return setError('Enter valid height');
      hMeters = Number(height) / 100;
    } else {
      if (!heightFt || isNaN(heightFt) || heightFt < 0) return setError('Enter valid feet');
      if (!heightIn || isNaN(heightIn) || heightIn < 0) return setError('Enter valid inches');
      const totalInches = Number(heightFt) * 12 + Number(heightIn);
      hMeters = totalInches * 0.0254;
    }
    if (weightUnit === 'kg') {
      if (!weight || isNaN(weight) || weight <= 0) return setError('Enter valid weight');
      wKg = Number(weight);
    } else {
      if (!weight || isNaN(weight) || weight <= 0) return setError('Enter valid weight');
      wKg = Number(weight) * 0.453592;
    }
    if (hMeters <= 0) return setError('Height must be positive');
    const bmiVal = wKg / (hMeters * hMeters);
    setBmi(bmiVal);
    setCategory(getBMICategory(bmiVal));
    saveToHistory(bmiVal, getBMICategory(bmiVal).label);
  };

  const handleClear = () => {
    setHeight(''); setHeightFt(''); setHeightIn(''); setWeight(''); setBmi(null); setCategory(null); setError('');
  };

  // Download/share handlers
  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { backgroundColor: null });
    const link = document.createElement('a');
    link.download = `BMI_Result_${new Date().toISOString().slice(0,10)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
  const handleShareWhatsApp = () => {
    if (!bmi || !category) return;
    const text = `My BMI is ${bmi.toFixed(1)} (${category.label}) on ${new Date().toLocaleDateString()}. Calculate yours at: https://smartstudenttools.com/bmi-calculator`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };
  const handleShareInstagram = () => {
    alert('Instagram does not support direct web sharing. Please download the image and upload it to your Instagram story or post.');
  };

  return (
    <div className="min-h-screen font-inter bg-gradient-to-br from-blue-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md mx-auto mt-8 mb-4 rounded-2xl shadow-lg p-6 md:p-10 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-extrabold leading-tight text-gray-900 dark:text-gray-100 flex items-center">
            <span className="mr-2 text-2xl md:text-3xl">⚖️</span> BMI Calculator
          </h2>
          <button
            className="ml-2 text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-white text-xl focus:outline-none"
            onClick={() => setShowInfo((v) => !v)}
            aria-label="What is BMI?"
            tabIndex={0}
          >
            ℹ️
          </button>
        </div>
        {/* Unit System Toggle */}
        <div className="flex justify-center mb-4 gap-2">
          <button
            type="button"
            className={`px-4 py-2 rounded-l-lg font-semibold border transition-colors duration-150 focus:outline-none ${unitSystem === 'metric' ? 'bg-blue-700 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100'}`}
            onClick={() => setUnitSystem('metric')}
          >
            Metric (kg/cm)
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-r-lg font-semibold border transition-colors duration-150 focus:outline-none ${unitSystem === 'imperial' ? 'bg-blue-700 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100'}`}
            onClick={() => setUnitSystem('imperial')}
          >
            Imperial (lb/in)
          </button>
        </div>
        {showInfo && (
          <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-100 text-sm shadow-inner">
            <b>Body Mass Index (BMI)</b> is a simple calculation using a person's height and weight. It is used to screen for weight categories that may lead to health problems. <br />
            <span className="font-semibold">Formula:</span> BMI = weight (kg) / [height (m)]²
          </div>
        )}
        <form className="space-y-4" onSubmit={handleCalculate}>
          {/* Age & Gender Inputs */}
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">Age <span className="text-xs text-gray-400">(optional)</span></label>
              <input
                type="number"
                min="0"
                value={age}
                onChange={e => setAge(e.target.value)}
                placeholder="e.g. 20"
                className="w-full py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
                aria-label="Age"
              />
            </div>
            <div className="flex-1">
              <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">Gender <span className="text-xs text-gray-400">(optional)</span></label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value)}
                className="w-full py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
                aria-label="Gender"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          {/* Height Input */}
          <div>
            <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">Height</label>
            <div className="flex gap-2 items-center">
              <select
                value={heightUnit}
                onChange={e => setHeightUnit(e.target.value)}
                className="py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
              >
                <option value="cm">cm</option>
                <option value="ftin">ft+in</option>
              </select>
              {heightUnit === 'cm' ? (
                <input
                  type="number"
                  min="0"
                  value={height}
                  onChange={e => setHeight(e.target.value)}
                  placeholder="e.g. 170"
                  className="flex-1 py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
                  aria-label="Height in cm"
                />
              ) : (
                <div className="flex gap-2 flex-1">
                  <input
                    type="number"
                    min="0"
                    value={heightFt}
                    onChange={e => setHeightFt(e.target.value)}
                    placeholder="ft"
                    className="w-20 py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
                    aria-label="Height in feet"
                  />
                  <input
                    type="number"
                    min="0"
                    value={heightIn}
                    onChange={e => setHeightIn(e.target.value)}
                    placeholder="in"
                    className="w-20 py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
                    aria-label="Height in inches"
                  />
                </div>
              )}
            </div>
          </div>
          {/* Weight Input */}
          <div>
            <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">Weight</label>
            <div className="flex gap-2 items-center">
              <select
                value={weightUnit}
                onChange={e => setWeightUnit(e.target.value)}
                className="py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
              >
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
              <input
                type="number"
                min="0"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder={weightUnit === 'kg' ? 'e.g. 65' : 'e.g. 143'}
                className="flex-1 py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
                aria-label="Weight"
              />
            </div>
          </div>
          {error && <div className="text-red-500 text-sm font-semibold mt-1">{error}</div>}
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="flex-1 font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 bg-blue-700 hover:bg-blue-800 text-white focus:ring-blue-500 text-lg"
            >
              Calculate BMI
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="flex-1 font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 focus:ring-gray-400 text-lg"
            >
              Clear
            </button>
          </div>
        </form>
        {/* Result Box */}
        {bmi && category && !error && (
          <>
            {/* Shareable Result Card */}
            <div className="flex justify-center mt-8">
              <div ref={cardRef} className={`w-full max-w-xs rounded-2xl shadow-xl p-6 bg-gradient-to-br from-blue-100 to-green-100 dark:from-gray-800 dark:to-gray-900 border-2 ${category.color.replace('bg-', 'border-')} text-center space-y-2`}>
                <div className="text-2xl font-bold mb-2">BMI Result</div>
                <div className="text-4xl font-extrabold mb-1">{bmi.toFixed(1)}</div>
                <div className={`text-lg font-semibold mb-2 ${category.color.replace('bg-', 'text-')}`}>{category.label}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">{new Date().toLocaleDateString()}</div>
                <div className="flex justify-center gap-2 mt-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-blue-400" />
                  <span className="inline-block w-3 h-3 rounded-full bg-green-500" />
                  <span className="inline-block w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="inline-block w-3 h-3 rounded-full bg-red-500" />
                </div>
              </div>
            </div>
            {/* Share/Download Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mt-4 mb-2">
              <button onClick={handleDownloadCard} className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold shadow focus:outline-none">Download Card</button>
              <button onClick={handleShareWhatsApp} className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold shadow focus:outline-none">Share on WhatsApp</button>
              <button onClick={handleShareInstagram} className="px-4 py-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-semibold shadow focus:outline-none">Share on Instagram</button>
            </div>
            {/* Personalized Health Tips */}
            <div className="mt-6 p-5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-inner">
              <h4 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-100">Personalized Health Tips</h4>
              {age || gender ? (
                <div className="mb-2 text-blue-700 dark:text-blue-300 text-sm font-semibold">{`Tips for${gender ? ` ${gender.charAt(0).toUpperCase() + gender.slice(1)}` : ''}${age ? `, Age ${age}` : ''}`}</div>
              ) : null}
              <div className="mb-1"><span className="font-semibold text-blue-700 dark:text-blue-300">Diet:</span> {BMI_TIPS[category.label].diet}</div>
              <div className="mb-1"><span className="font-semibold text-green-700 dark:text-green-300">Exercise:</span> {BMI_TIPS[category.label].exercise}</div>
              <div><span className="font-semibold text-purple-700 dark:text-purple-300">Mental Health:</span> {BMI_TIPS[category.label].mental}</div>
            </div>
          </>
        )}
      </div>
      {/* BMI History Section */}
      <div className="mt-10 w-full max-w-md mx-auto">
        <h3 className="text-lg font-bold mb-2 text-center text-gray-800 dark:text-gray-100">Past BMI Records</h3>
        {history.length === 0 ? (
          <div className="text-gray-500 text-center">No records yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="p-2">Date</th>
                  <th className="p-2">BMI</th>
                  <th className="p-2">Category</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => (
                  <tr key={entry.id} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="p-2 whitespace-nowrap">{new Date(entry.date).toLocaleDateString()}<br /><span className="text-xs text-gray-400">{new Date(entry.date).toLocaleTimeString()}</span></td>
                    <td className="p-2 font-semibold">{entry.bmi.toFixed(1)}</td>
                    <td className="p-2">{entry.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* BMI Trend Graph */}
      {history.length > 1 && (
        <div className="mt-8 w-full max-w-md mx-auto">
          <h3 className="text-lg font-bold mb-2 text-center text-gray-800 dark:text-gray-100">BMI Trend Over Time</h3>
          <div className="w-full h-40 bg-gray-50 dark:bg-gray-900 rounded-lg p-2 flex items-end">
            <svg width="100%" height="100%" viewBox={`0 0 320 120`} preserveAspectRatio="none">
              {/* X axis */}
              <line x1="0" y1="110" x2="320" y2="110" stroke="#bbb" strokeWidth="2" />
              {/* Y axis */}
              <line x1="30" y1="10" x2="30" y2="110" stroke="#bbb" strokeWidth="2" />
              {/* Plot points and lines */}
              {(() => {
                const maxBmi = Math.max(...history.map(h => h.bmi), 40);
                const minBmi = Math.min(...history.map(h => h.bmi), 15);
                const range = maxBmi - minBmi || 1;
                const points = history.slice(0, 20).reverse().map((h, i, arr) => {
                  const x = 30 + ((290 / (arr.length - 1 || 1)) * i);
                  const y = 110 - ((h.bmi - minBmi) / range) * 100;
                  return { x, y };
                });
                // Line
                const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
                return <>
                  <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="2.5" />
                  {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="4" fill="#2563eb" stroke="#fff" strokeWidth="1.5" />
                  ))}
                </>;
              })()}
            </svg>
          </div>
        </div>
      )}
      <AdBanner />
    </div>
  );
};

export default BMICalculator; 