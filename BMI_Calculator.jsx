import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import AdsterraBanner from './AdsterraBanner';
import html2canvas from 'html2canvas';
import SEO from './SEO';

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
  const [rating, setRating] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

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
    const text = `My BMI is ${bmi.toFixed(1)} (${category.label}) on ${new Date().toLocaleDateString()}. Calculate yours at: https://smartstudenttools.xyz/bmi-calculator`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };
  const handleShareInstagram = () => {
    alert('Instagram does not support direct web sharing. Please download the image and upload it to your Instagram story or post.');
  };

  return (
    <>
      <SEO
        title="Student BMI Calculator | Healthy Body Mass Index & Tips - Smart Studies"
        description="Calculate your Body Mass Index (BMI) using metric or imperial units. Get student health recommendations, ideal weight range, and calorie tips."
        url="https://smartstudenttools.xyz/bmi-calculator"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          'name': 'BMI Calculator',
          'description': 'Calculate your Body Mass Index (BMI) with metric or imperial units. Get health tips, history, and a shareable result card.',
          'applicationCategory': 'HealthApplication',
          'operatingSystem': 'All',
          'url': 'https://smartstudenttools.xyz/bmi-calculator',
          'publisher': {
            '@type': 'Organization',
            'name': 'Smart Student Tools'
          }
        }}
      />
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
        <AdsterraBanner />
      </div>

      {/* Structured Content Section */}
      <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-8 text-gray-800 dark:text-gray-200">
        
        {/* About BMI */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold">📘 About Body Mass Index (BMI)</h3>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            Body Mass Index (BMI) is a simple statistical estimate of a person's body fat based on their height and weight. BMI classifications help categorise individuals into health risk bands: Underweight (BMI &lt; 18.5), Normal (18.5 – 24.9), Overweight (25.0 – 29.9), and Obese (BMI ≥ 30). While BMI is a convenient screening tool, it does have limitations, such as not directly measuring body fat percentage or accounting for athletic muscle density or age differences.
          </p>
        </div>

        {/* How to Use Section */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold">📖 How to Use the BMI Calculator</h3>
          <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-gray-300 space-y-2">
            <li>Select your preferred unit system: **Metric** (kg/cm) or **Imperial** (lbs/ft/in).</li>
            <li>Input your height values in the corresponding text boxes.</li>
            <li>Input your weight values in the weight field.</li>
            <li>Optionally specify your age and gender for complete records.</li>
            <li>Click **Calculate** to see your BMI score, health category band, and personalized exercise/nutrition tips.</li>
          </ol>
        </div>

        {/* Formulas Section */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold">📊 Metric &amp; Imperial BMI Formulas</h3>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            The calculator applies the following standard mathematical equations:
            <br />
            - **Metric Formula:**
            <code className="block my-2 bg-gray-100 dark:bg-gray-950 p-2 rounded font-mono text-center">
              BMI = Weight (kg) / [Height (m)]^2
            </code>
            - **Imperial Formula:**
            <code className="block my-2 bg-gray-100 dark:bg-gray-950 p-2 rounded font-mono text-center">
              BMI = [Weight (lbs) / (Height (in))^2] * 703
            </code>
          </p>
        </div>

        {/* Practical Example */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold">✏️ Walkthrough BMI Calculation</h3>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            Suppose a student has a weight of 70 kilograms and a height of 175 centimeters (1.75 meters):
            <br />
            1. Convert height to meters: 175 cm = 1.75 m.
            <br />
            2. Square the height: 1.75 * 1.75 = 3.0625.
            <br />
            3. Divide weight by squared height: 70 / 3.0625 = 22.86.
            <br />
            - **Resulting BMI:** 22.86 (This falls comfortably within the **Normal** range of 18.5 to 24.9).
          </p>
        </div>

        {/* Advantages Section */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold">🌟 Advantages of our BMI Tracker</h3>
          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-2">
            <li><span className="font-semibold text-gray-950 dark:text-white">Active Advice:</span> Suggests tailored physical advice depending on your classification.</li>
            <li><span className="font-semibold text-gray-950 dark:text-white">Trend Graphing:</span> An inline SVG vector graph maps your recent calculations to track weight changes.</li>
            <li><span className="font-semibold text-gray-950 dark:text-white">Privacy-First:</span> All health data is kept inside your browser cache.</li>
          </ul>
        </div>

        {/* FAQs Section */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold">❓ Frequently Asked Questions</h3>
          <div className="space-y-3">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
              <button
                className="w-full flex justify-between items-center text-left font-semibold text-base py-2 focus:outline-none"
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
                <span>Does BMI apply to athletes and bodybuilders?</span>
                <span className="accordion-icon text-xl transition-transform duration-300">+</span>
              </button>
              <div className="accordion-content max-h-0 overflow-hidden transition-all duration-500 ease-in-out text-sm text-gray-600 dark:text-gray-300">
                <p className="pt-2">Not perfectly. Because muscle is much denser than fat, muscular athletes and bodybuilders can score high BMI values (placing them in the Overweight or Obese bands) even though they have low body fat percentages.</p>
              </div>
            </div>
            <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
              <button
                className="w-full flex justify-between items-center text-left font-semibold text-base py-2 focus:outline-none"
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
                <span>What is a healthy BMI range for young adults?</span>
                <span className="accordion-icon text-xl transition-transform duration-300">+</span>
              </button>
              <div className="accordion-content max-h-0 overflow-hidden transition-all duration-500 ease-in-out text-sm text-gray-600 dark:text-gray-300">
                <p className="pt-2">A healthy BMI range is between 18.5 and 24.9. Maintaining a value inside this range is generally linked with lower risks of heart disease, type 2 diabetes, and hypertension.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Tools & Articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-lg mb-3">🛠️ Related Utility Tools</h4>
            <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
              <li><Link to="/unit-converter" className="hover:underline">Unit Converter</Link></li>
              <li><Link to="/expense-tracker" className="hover:underline">Expense Tracker</Link></li>
              <li><Link to="/calculator" className="hover:underline">Standard Calculator</Link></li>
            </ul>
          </div>
          <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-lg mb-3">📚 Related Articles</h4>
            <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
              <li><a href="https://smartstudenttools.xyz/blog/bmi-limitations" target="_blank" rel="noopener noreferrer" className="hover:underline">Understanding the Limitations of Body Mass Index</a></li>
              <li><a href="https://smartstudenttools.xyz/blog/nutrition-for-students" target="_blank" rel="noopener noreferrer" className="hover:underline">Healthy Meal Prep Tips for College Students</a></li>
            </ul>
          </div>
        </div>

        {/* Interactive Rating Component */}
        <div className="p-6 rounded-xl border shadow-sm text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">Rate &amp; Give Feedback</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Help us improve the health tracker layout</p>
          {ratingSubmitted ? (
            <p className="text-green-600 font-semibold">Thank you for your rating of {rating} stars!</p>
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

      </div>
      <AdsterraBanner />
    </>
  );
};

export default BMICalculator; 
