import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import SEO from './SEO';
import AdsterraBanner from './AdsterraBanner';

const modeInfo = {
  of: 'Find what X% of Y is (e.g., 15% of 200 = 30).',
  increase: 'Increase Y by X% (e.g., increase 200 by 15% = 230).',
  decrease: 'Decrease Y by X% (e.g., decrease 200 by 15% = 170).',
};

const PercentageCalculator = () => {
  const [rating, setRating] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const [base, setBase] = useState('');
  const [percent, setPercent] = useState('');
  const [mode, setMode] = useState('of'); // 'of', 'increase', 'decrease'
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [explanation, setExplanation] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [showTooltip, setShowTooltip] = useState('');
  const baseInputRef = useRef(null);
  const percentInputRef = useRef(null);

  const handleCalculate = () => {
    setError('');
    setExplanation('');
    const baseNum = parseFloat(base);
    const percentNum = parseFloat(percent);
    if (isNaN(baseNum) || isNaN(percentNum)) {
      setResult(null);
      setError('Please enter valid numbers for both fields.');
      return;
    }
    let res = null;
    let expl = '';
    let historyEntry = '';
    if (mode === 'of') {
      res = (percentNum / 100) * baseNum;
      expl = `${percentNum}% of ${baseNum} = (${percentNum} / 100) × ${baseNum} = ${(percentNum / 100)} × ${baseNum} = ${res}`;
      historyEntry = `${percentNum}% of ${baseNum} = ${res}`;
    } else if (mode === 'increase') {
      res = baseNum + (percentNum / 100) * baseNum;
      expl = `Increase ${baseNum} by ${percentNum}% = ${baseNum} + (${percentNum} / 100) × ${baseNum} = ${baseNum} + ${(percentNum / 100)} × ${baseNum} = ${baseNum} + ${(percentNum / 100) * baseNum} = ${res}`;
      historyEntry = `Increase ${baseNum} by ${percentNum}% = ${res}`;
    } else if (mode === 'decrease') {
      res = baseNum - (percentNum / 100) * baseNum;
      expl = `Decrease ${baseNum} by ${percentNum}% = ${baseNum} - (${percentNum} / 100) × ${baseNum} = ${baseNum} - ${(percentNum / 100)} × ${baseNum} = ${baseNum} - ${(percentNum / 100) * baseNum} = ${res}`;
      historyEntry = `Decrease ${baseNum} by ${percentNum}% = ${res}`;
    }
    setResult(res);
    setExplanation(expl);
    setHistory(prev => [historyEntry, ...prev.slice(0, 4)]);
  };

  const handleCopy = () => {
    if (result !== null) {
      navigator.clipboard.writeText(result.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  // Keyboard: Enter triggers calculation when focused on input
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCalculate();
    }
  };

  const handleReset = () => {
    setBase('');
    setPercent('');
    setResult(null);
    setError('');
    setExplanation('');
    setCopied(false);
    setHistory([]);
  };

  return (
    <>
      <SEO
        title="Percentage Calculator Online | Exam Marks, Increase & Decrease - Smart Studies"
        description="Calculate percentages, percentage increase/decrease, exam marks percentage, and ratios instantly. Step-by-step explanations, history, and free."
        url="https://smartstudenttools.xyz/percentage-calculator"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          'name': 'Percentage Calculator',
          'description': 'Calculate percentages, percentage increase/decrease, and more. Step-by-step explanations, history, and mobile-friendly design.',
          'applicationCategory': 'CalculatorApplication',
          'operatingSystem': 'All',
          'url': 'https://smartstudenttools.xyz/percentage-calculator',
          'publisher': {
            '@type': 'Organization',
            'name': 'Smart Student Tools'
          }
        }}
      />
      <div className="w-full max-w-md mx-auto mt-6 sm:mt-10 p-2 sm:p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg flex flex-col items-center">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100 calculator-hero">Percentage Calculator</h2>
        {/* Calculation History */}
        {history.length > 0 && (
          <div className="w-full mb-2 text-xs text-right text-gray-500 dark:text-gray-300 space-y-1 overflow-x-auto whitespace-nowrap">
            {history.map((item, idx) => (
              <div key={idx} className="truncate">{item}</div>
            ))}
          </div>
        )}
        <form className="w-full space-y-4" onSubmit={e => { e.preventDefault(); handleCalculate(); }}>
          <div>
            <label htmlFor="base-value" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Base Value (Y)</label>
            <input
              id="base-value"
              ref={baseInputRef}
              type="number"
              value={base}
              onChange={e => setBase(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-3 sm:py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-lg sm:text-base text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter the base value (e.g., 200)"
              aria-label="Base value"
              tabIndex={0}
              inputMode="decimal"
            />
            <p className="text-xs text-gray-500 mt-1">This is the number you want to find the percentage of, increase, or decrease.</p>
          </div>
          <div>
            <label htmlFor="percent-value" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Percentage Value (X%)</label>
            <input
              id="percent-value"
              ref={percentInputRef}
              type="number"
              value={percent}
              onChange={e => setPercent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-3 sm:py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-lg sm:text-base text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter the percentage (e.g., 15)"
              aria-label="Percentage value"
              tabIndex={0}
              inputMode="decimal"
            />
            <p className="text-xs text-gray-500 mt-1">This is the percentage you want to use.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <div className="relative flex-1">
              <button
                type="button"
                className={`w-full py-3 sm:py-2 rounded-lg font-semibold border transition-colors duration-150 flex items-center justify-center gap-1 ${mode === 'of' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700'}`}
                onClick={() => setMode('of')}
                aria-label="Find X percent of Y"
                tabIndex={0}
                onMouseEnter={() => setShowTooltip('of')}
                onMouseLeave={() => setShowTooltip('')}
                onFocus={() => setShowTooltip('of')}
                onBlur={() => setShowTooltip('')}
              >
                Find X% of Y
                <span
                  tabIndex={-1}
                  className="ml-1 text-blue-500 cursor-pointer text-base"
                  aria-label="Info about Find X% of Y"
                >
                  ℹ️
                </span>
              </button>
              {showTooltip === 'of' && (
                <div className="absolute left-0 top-full mt-1 w-max max-w-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-lg p-2 text-xs text-gray-800 dark:text-gray-100 z-10">
                  {modeInfo.of}
                </div>
              )}
            </div>
            <div className="relative flex-1">
              <button
                type="button"
                className={`w-full py-3 sm:py-2 rounded-lg font-semibold border transition-colors duration-150 flex items-center justify-center gap-1 ${mode === 'increase' ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700'}`}
                onClick={() => setMode('increase')}
                aria-label="Increase Y by X percent"
                tabIndex={0}
                onMouseEnter={() => setShowTooltip('increase')}
                onMouseLeave={() => setShowTooltip('')}
                onFocus={() => setShowTooltip('increase')}
                onBlur={() => setShowTooltip('')}
              >
                Increase Y by X%
                <span
                  tabIndex={-1}
                  className="ml-1 text-green-600 cursor-pointer text-base"
                  aria-label="Info about Increase Y by X%"
                >
                  ℹ️
                </span>
              </button>
              {showTooltip === 'increase' && (
                <div className="absolute left-0 top-full mt-1 w-max max-w-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-lg p-2 text-xs text-gray-800 dark:text-gray-100 z-10">
                  {modeInfo.increase}
                </div>
              )}
            </div>
            <div className="relative flex-1">
              <button
                type="button"
                className={`w-full py-3 sm:py-2 rounded-lg font-semibold border transition-colors duration-150 flex items-center justify-center gap-1 ${mode === 'decrease' ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700'}`}
                onClick={() => setMode('decrease')}
                aria-label="Decrease Y by X percent"
                tabIndex={0}
                onMouseEnter={() => setShowTooltip('decrease')}
                onMouseLeave={() => setShowTooltip('')}
                onFocus={() => setShowTooltip('decrease')}
                onBlur={() => setShowTooltip('')}
              >
                Decrease Y by X%
                <span
                  tabIndex={-1}
                  className="ml-1 text-red-600 cursor-pointer text-base"
                  aria-label="Info about Decrease Y by X%"
                >
                  ℹ️
                </span>
              </button>
              {showTooltip === 'decrease' && (
                <div className="absolute left-0 top-full mt-1 w-max max-w-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-lg p-2 text-xs text-gray-800 dark:text-gray-100 z-10">
                  {modeInfo.decrease}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <button
              type="submit"
              className="w-full mt-4 py-4 sm:py-3 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-lg sm:text-xl transition-colors duration-150"
              aria-label="Calculate"
              tabIndex={0}
            >
              Calculate
            </button>
            <button
              type="button"
              className="w-full mt-4 py-4 sm:py-3 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-bold text-lg sm:text-xl transition-colors duration-150"
              aria-label="Clear/reset"
              tabIndex={0}
              onClick={handleReset}
            >
              Clear
            </button>
          </div>
          {error && <div className="text-red-500 text-sm mt-2 text-center">{error}</div>}
          {result !== null && !error && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-gray-800 rounded-lg text-center text-lg sm:text-xl font-semibold text-blue-900 dark:text-blue-200 shadow">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                <span>Result:</span> <span className="font-bold text-xl sm:text-2xl">{result}</span>
                <button
                  className="ml-0 sm:ml-2 px-3 py-2 sm:px-2 sm:py-1 rounded bg-blue-200 dark:bg-blue-700 text-blue-900 dark:text-blue-100 text-base sm:text-sm font-semibold hover:bg-blue-300 dark:hover:bg-blue-600 transition-colors duration-150"
                  onClick={handleCopy}
                  aria-label="Copy result"
                  tabIndex={0}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              {explanation && (
                <div className="mt-3 text-base text-gray-700 dark:text-gray-200 text-left whitespace-pre-line">
                  <span className="font-semibold">How it works:</span><br />
                  {explanation}
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      {/* Structured Content Section */}
      <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-8 text-gray-800 dark:text-gray-200">
        
        {/* About percentages */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold">📘 About Percentages</h3>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            A percentage represents a fraction or ratio as a part of 100. It is denoted using the percent sign (%). The term percentage comes from the Latin word "per centum," which literally translates to "by the hundred." Calculating percentages is highly useful in academic grading, retail discounts, interest rate tracking, and statistics. Understanding percentage increase and decrease helps analyze growth patterns, inflation, and financial investments.
          </p>
        </div>

        {/* How to Use Section */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold">📖 How to Use the Percentage Calculator</h3>
          <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-gray-300 space-y-2">
            <li>Select the desired percentage mode from the radio options:
              <br />➔ **Percentage of** (to find part value).
              <br />➔ **Increase by** (to calculate positive change).
              <br />➔ **Decrease by** (to calculate negative change).
            </li>
            <li>Input the base amount (Y) in the first input box.</li>
            <li>Input the percent value (X) in the second input box.</li>
            <li>Press **Calculate** to see the result along with a step-by-step math explanation.</li>
          </ol>
        </div>

        {/* Formulas Section */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold">📊 Percentage Formulas</h3>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            Our tool applies standard algebraic equations depending on the chosen calculation mode:
            <br />
            - **Percentage Of:**
            <code className="block my-2 bg-gray-100 dark:bg-gray-950 p-2 rounded font-mono text-center">
              Result = (X / 100) * Y
            </code>
            - **Percentage Increase:**
            <code className="block my-2 bg-gray-100 dark:bg-gray-950 p-2 rounded font-mono text-center">
              Result = Y * (1 + X / 100)
            </code>
            - **Percentage Decrease:**
            <code className="block my-2 bg-gray-100 dark:bg-gray-950 p-2 rounded font-mono text-center">
              Result = Y * (1 - X / 100)
            </code>
          </p>
        </div>

        {/* Practical Example */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold">✏️ Example Calculations</h3>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            - **Example of "Of":** To find 20% of 250:
            <br />
            <code className="block my-1 bg-gray-100 dark:bg-gray-950 p-1 rounded font-mono">
              (20 / 100) * 250 = 0.20 * 250 = 50
            </code>
            - **Example of "Increase":** To increase 150 by 10%:
            <br />
            <code className="block my-1 bg-gray-100 dark:bg-gray-950 p-1 rounded font-mono">
              150 * (1 + 10 / 100) = 150 * 1.1 = 165
            </code>
            - **Example of "Decrease":** To decrease 80 by 15%:
            <br />
            <code className="block my-1 bg-gray-100 dark:bg-gray-950 p-1 rounded font-mono">
              80 * (1 - 15 / 100) = 80 * 0.85 = 68
            </code>
          </p>
        </div>

        {/* Advantages Section */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold">🌟 Advantages of this Percentage Calculator</h3>
          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-2">
            <li><span className="font-semibold text-gray-950 dark:text-white">Explanation Steps:</span> Displays intermediate math steps so students can learn the algebraic workflow.</li>
            <li><span className="font-semibold text-gray-950 dark:text-white">Three-in-One:</span> Handles fractional portion calculations, markups, and markdowns in a single dashboard.</li>
            <li><span className="font-semibold text-gray-950 dark:text-white">Result History:</span> Stores a list of recent calculations in the sidebar for simple comparison.</li>
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
                <span>How do you convert a decimal value to a percentage?</span>
                <span className="accordion-icon text-xl transition-transform duration-300">+</span>
              </button>
              <div className="accordion-content max-h-0 overflow-hidden transition-all duration-500 ease-in-out text-sm text-gray-600 dark:text-gray-300">
                <p className="pt-2">To convert any decimal back to a percentage, multiply the decimal value by 100. For example, 0.45 converted is: 0.45 * 100 = 45%.</p>
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
                <span>What is the percentage change between two numbers?</span>
                <span className="accordion-icon text-xl transition-transform duration-300">+</span>
              </button>
              <div className="accordion-content max-h-0 overflow-hidden transition-all duration-500 ease-in-out text-sm text-gray-600 dark:text-gray-300">
                <p className="pt-2">The percentage change is computed as: ((New Value - Old Value) / Old Value) * 100. If the result is positive, it indicates an increase; if negative, it is a decrease.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Tools & Articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-lg mb-3">🛠️ Related Math Tools</h4>
            <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
              <li><Link to="/calculator" className="hover:underline">Standard Calculator</Link></li>
              <li><Link to="/gst-calculator" className="hover:underline">GST Calculator</Link></li>
              <li><Link to="/financial-calculator" className="hover:underline">Financial Calculator</Link></li>
            </ul>
          </div>
          <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-lg mb-3">📚 Related Articles</h4>
            <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
              <li><Link to="/blog/gpa-to-percentage-calculation" className="hover:underline">GPA &amp; CGPA to Percentage Conversion: The Definitive Guide</Link></li>
            </ul>
          </div>
        </div>

        {/* Interactive Rating Component */}
        <div className="p-6 rounded-xl border shadow-sm text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">Rate &amp; Give Feedback</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Help us improve the percentage layout</p>
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

export default PercentageCalculator; 
