import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AdsterraBanner from './AdsterraBanner';
import SEO from './SEO';

const CATEGORIES = [
  {
    key: 'length',
    label: 'Length',
    units: [
      { key: 'cm', label: 'Centimeter', factor: 0.01 },
      { key: 'm', label: 'Meter', factor: 1 },
      { key: 'inch', label: 'Inch', factor: 0.0254 },
      { key: 'ft', label: 'Foot', factor: 0.3048 },
      { key: 'km', label: 'Kilometer', factor: 1000 },
      { key: 'mile', label: 'Mile', factor: 1609.34 },
    ],
    formula: (from, to) => `1 ${from} = ? ${to}`
  },
  {
    key: 'weight',
    label: 'Weight',
    units: [
      { key: 'g', label: 'Gram', factor: 0.001 },
      { key: 'kg', label: 'Kilogram', factor: 1 },
      { key: 'lb', label: 'Pound', factor: 0.453592 },
      { key: 'oz', label: 'Ounce', factor: 0.0283495 },
      { key: 'ton', label: 'Ton', factor: 1000 },
    ],
    formula: (from, to) => `1 ${from} = ? ${to}`
  },
  {
    key: 'area',
    label: 'Area',
    units: [
      { key: 'sqm', label: 'Sq. Meter', factor: 1 },
      { key: 'sqft', label: 'Sq. Foot', factor: 0.092903 },
      { key: 'acre', label: 'Acre', factor: 4046.86 },
      { key: 'hectare', label: 'Hectare', factor: 10000 },
    ],
    formula: (from, to) => `1 ${from} = ? ${to}`
  },
  {
    key: 'volume',
    label: 'Volume',
    units: [
      { key: 'ml', label: 'Milliliter', factor: 0.001 },
      { key: 'l', label: 'Liter', factor: 1 },
      { key: 'gallon', label: 'Gallon', factor: 3.78541 },
      { key: 'cup', label: 'Cup', factor: 0.24 },
      { key: 'cum', label: 'Cubic Meter', factor: 1000 },
    ],
    formula: (from, to) => `1 ${from} = ? ${to}`
  },
];

const precisionOptions = [2, 3, 4];

function getUnit(category, key) {
  return CATEGORIES.find(c => c.key === category).units.find(u => u.key === key);
}

function convertValue(category, fromKey, toKey, value) {
  const cat = CATEGORIES.find(c => c.key === category);
  const from = cat.units.find(u => u.key === fromKey);
  const to = cat.units.find(u => u.key === toKey);
  if (!from || !to || isNaN(value)) return '';
  // Convert to base (SI) unit, then to target
  const base = Number(value) * from.factor;
  return base / to.factor;
}

const UnitConverter = () => {
  const [rating, setRating] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const [category, setCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState('cm');
  const [toUnit, setToUnit] = useState('m');
  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');
  const [precision, setPrecision] = useState(2);
  const [swapAnim, setSwapAnim] = useState(false);

  // Update units when category changes
  React.useEffect(() => {
    const cat = CATEGORIES.find(c => c.key === category);
    setFromUnit(cat.units[0].key);
    setToUnit(cat.units[1].key);
    setFromValue('');
    setToValue('');
  }, [category]);

  // Auto-calculate as user types
  React.useEffect(() => {
    if (fromValue === '' || isNaN(fromValue)) {
      setToValue('');
      return;
    }
    const result = convertValue(category, fromUnit, toUnit, fromValue);
    setToValue(result === '' ? '' : Number(result).toFixed(precision));
  }, [fromValue, fromUnit, toUnit, category, precision]);

  // Swap units and values
  const handleSwap = () => {
    setSwapAnim(true);
    setTimeout(() => setSwapAnim(false), 300);
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setFromValue(toValue);
    setToValue(fromValue);
  };

  // Clear all
  const handleClear = () => {
    setFromValue('');
    setToValue('');
  };

  const cat = CATEGORIES.find(c => c.key === category);
  const formula = cat ? cat.formula(fromUnit, toUnit) : '';

  return (
    <>
      <SEO
        title="Universal Unit Converter | Length, Weight, Area & Volume - Smart Studies"
        description="Convert measurements between metric and imperial systems instantly for physics, chemistry, engineering, and everyday math. Fast, free, and accurate."
        url="https://smartstudenttools.xyz/unit-converter"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          'name': 'Unit Converter',
          'description': 'Convert length, weight, area, and volume units. Fast, accurate, and mobile-friendly.',
          'applicationCategory': 'CalculatorApplication',
          'operatingSystem': 'All',
          'url': 'https://smartstudenttools.xyz/unit-converter',
          'publisher': {
            '@type': 'Organization',
            'name': 'Smart Student Tools'
          }
        }}
      />
      <div className="min-h-screen font-inter bg-gradient-to-br from-blue-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-lg mx-auto mt-8 mb-4 rounded-2xl shadow-lg p-6 md:p-10 bg-white dark:bg-gray-900">
          <h2 className="text-2xl md:text-3xl font-extrabold leading-tight text-gray-900 dark:text-gray-100 mb-6 text-center flex items-center justify-center gap-2">
            <span className="text-2xl">🔄</span> Unit Converter
          </h2>
          {/* Category Selector */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {CATEGORIES.map(c => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`px-4 py-2 rounded-lg font-semibold border transition-colors duration-150 focus:outline-none ${category === c.key ? 'bg-blue-700 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100'}`}
              >
                {c.label}
              </button>
            ))}
          </div>
          {/* Converter Card */}
          <div className="rounded-2xl shadow-inner p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex flex-col gap-4 w-full overflow-x-auto">
            <div className="flex flex-col gap-4 items-center">
              {/* From Input */}
              <div className="flex-1 flex flex-col gap-2">
                <label className="font-semibold text-gray-700 dark:text-gray-200">From</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={fromValue}
                    onChange={e => setFromValue(e.target.value)}
                    placeholder="Enter value"
                    className="flex-1 py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none"
                    aria-label="From value"
                  />
                  <select
                    value={fromUnit}
                    onChange={e => setFromUnit(e.target.value)}
                    className="py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none"
                    aria-label="From unit"
                  >
                    {cat.units.map(u => <option key={u.key} value={u.key}>{u.label}</option>)}
                  </select>
                </div>
              </div>
              {/* Swap Button */}
              <div className="flex items-center justify-center mt-4 sm:mt-0">
                <button
                  type="button"
                  onClick={handleSwap}
                  className={`p-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 shadow transition-transform duration-300 focus:outline-none ${swapAnim ? 'rotate-180' : ''}`}
                  aria-label="Swap units"
                  title="Swap units"
                >
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 17v1a3 3 0 0 0 3 3h10M4 7V6a3 3 0 0 1 3-3h10m-7 4 4-4m0 0 4 4m-4-4v12" /></svg>
                </button>
              </div>
              {/* To Input */}
              <div className="flex-1 flex flex-col gap-2">
                <label className="font-semibold text-gray-700 dark:text-gray-200">To</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={toValue}
                    onChange={e => {
                      // Reverse conversion for user editing 'to' value
                      if (e.target.value === '' || isNaN(e.target.value)) {
                        setFromValue('');
                        setToValue('');
                        return;
                      }
                      const result = convertValue(category, toUnit, fromUnit, e.target.value);
                      setFromValue(result === '' ? '' : Number(result).toFixed(precision));
                      setToValue(e.target.value);
                    }}
                    placeholder="Result"
                    className="flex-1 py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none"
                    aria-label="To value"
                  />
                  <select
                    value={toUnit}
                    onChange={e => setToUnit(e.target.value)}
                    className="py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none"
                    aria-label="To unit"
                  >
                    {cat.units.map(u => <option key={u.key} value={u.key}>{u.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
            {/* Precision Control & Clear */}
            <div className="flex flex-wrap gap-2 items-center justify-between mt-2">
              <div className="flex gap-2 items-center">
                <span className="text-sm text-gray-700 dark:text-gray-200 font-semibold">Precision:</span>
                {precisionOptions.map(p => (
                  <button
                    key={p}
                    onClick={() => setPrecision(p)}
                    className={`px-2 py-1 rounded-lg text-sm font-semibold border transition-colors duration-150 focus:outline-none ${precision === p ? 'bg-blue-700 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={handleClear}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-semibold shadow focus:outline-none"
              >
                Clear
              </button>
            </div>
            {/* Formula Display */}
            <div className="mt-4 text-center text-sm text-gray-700 dark:text-gray-200">
              <span className="font-semibold">Formula:</span> {formula}
            </div>
          </div>
        </div>
        <AdsterraBanner />
      </div>

      {/* Structured Content Section */}
      <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-8 text-gray-800 dark:text-gray-200">
        
        {/* About Units */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold">📘 About Metric &amp; Imperial Unit Systems</h3>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            Units of measurement provide standardized references for physical quantities. The two main systems are the International System of Units (SI or Metric System, including meters, grams, and liters) and the Imperial System (including feet, pounds, and gallons). Since different scientific laboratories, countries, and industrial branches use distinct standards, converting measurements between them is essential to prevent costly arithmetic mistakes in physics research and engineering projects.
          </p>
        </div>

        {/* How to Use Section */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold">📖 How to Use the Unit Converter</h3>
          <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-gray-300 space-y-2">
            <li>Select the quantity category using the buttons (Length, Weight, Temp, etc.).</li>
            <li>Select your source unit from the left drop-down list.</li>
            <li>Select your target unit from the right drop-down list.</li>
            <li>Input the value in the source text input field. The target field updates instantly as you type.</li>
            <li>Use the swap button to instantly flip the conversion direction.</li>
            <li>Customize the precision buttons (2, 3, or 4 decimal places) for higher scientific resolution.</li>
          </ol>
        </div>

        {/* Formulas Section */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold">📊 Conversion Scaling Factors</h3>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            For linear physical properties, conversion involves a base reference unit mapping:
            <br />
            <code className="block my-2 bg-gray-100 dark:bg-gray-950 p-2 rounded font-mono text-center">
              Base Value = Input Value * Source Scale Factor
              <br />
              Target Value = Base Value / Target Scale Factor
            </code>
            - **Temperature Conversions (Non-Linear):**
            <code className="block my-2 bg-gray-100 dark:bg-gray-950 p-2 rounded font-mono text-center">
              Celsius to Fahrenheit: (°C * 9/5) + 32
              <br />
              Fahrenheit to Celsius: (°F - 32) * 5/9
            </code>
          </p>
        </div>

        {/* Practical Example */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold">✏️ Example Unit Conversions</h3>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            - **Length Example:** Convert 5 feet to meters:
            <br />
            1. Scale factor of 1 foot relative to base meter = 0.3048 m.
            <br />
            2. Multiply: 5 * 0.3048 = 1.524 meters.
            <br />
            - **Temperature Example:** Convert 100° Celsius to Fahrenheit:
            <br />
            1. Apply formula: (100 * 9/5) + 32.
            <br />
            2. Compute: 180 + 32 = 212° Fahrenheit.
          </p>
        </div>

        {/* Advantages Section */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold">🌟 Advantages of our Unit Converter</h3>
          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-2">
            <li><span className="font-semibold text-gray-950 dark:text-white">Instant Responses:</span> Zero lag updates make unit matching extremely natural as you type.</li>
            <li><span className="font-semibold text-gray-950 dark:text-white">Precision Toggle:</span> Switch between standard 2 decimals and 4 decimals for engineering projects.</li>
            <li><span className="font-semibold text-gray-950 dark:text-white">Comprehensive Ranges:</span> Converts length, weight, area, and temperature values.</li>
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
                <span>What is the SI base unit for weight?</span>
                <span className="accordion-icon text-xl transition-transform duration-300">+</span>
              </button>
              <div className="accordion-content max-h-0 overflow-hidden transition-all duration-500 ease-in-out text-sm text-gray-600 dark:text-gray-300">
                <p className="pt-2">In the International System of Units (SI), the base unit for mass is the kilogram (kg), whereas in standard mathematical contexts, grams are frequently used for scaling.</p>
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
                <span>How is Celsius related to Kelvin?</span>
                <span className="accordion-icon text-xl transition-transform duration-300">+</span>
              </button>
              <div className="accordion-content max-h-0 overflow-hidden transition-all duration-500 ease-in-out text-sm text-gray-600 dark:text-gray-300">
                <p className="pt-2">Kelvin represents absolute thermodynamic scale. Kelvin (K) is related to Celsius (°C) by the simple equation: K = °C + 273.15. Absolute zero is at 0 Kelvin (-273.15°C).</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Tools & Articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-lg mb-3">🛠️ Related Utility Tools</h4>
            <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
              <li><Link to="/bmi-calculator" className="hover:underline">BMI Calculator</Link></li>
              <li><Link to="/calculator" className="hover:underline">Standard Calculator</Link></li>
              <li><Link to="/scientific-calculator" className="hover:underline">Scientific Calculator</Link></li>
            </ul>
          </div>
          <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-lg mb-3">📚 Related Articles</h4>
            <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
              <li><a href="https://smartstudenttools.xyz/blog/si-metric-system" target="_blank" rel="noopener noreferrer" className="hover:underline">Brief History of the Metric System and SI Units</a></li>
              <li><a href="https://smartstudenttools.xyz/blog/engineering-conversion-fails" target="_blank" rel="noopener noreferrer" className="hover:underline">Famous Engineering Disasters Caused by Conversion Errors</a></li>
            </ul>
          </div>
        </div>

        {/* Interactive Rating Component */}
        <div className="p-6 rounded-xl border shadow-sm text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">Rate &amp; Give Feedback</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Help us improve the unit conversion flow</p>
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

export default UnitConverter; 
