import React, { useState, useRef } from 'react';
import AdBanner from './AdBanner';

const modeInfo = {
  of: 'Find what X% of Y is (e.g., 15% of 200 = 30).',
  increase: 'Increase Y by X% (e.g., increase 200 by 15% = 230).',
  decrease: 'Decrease Y by X% (e.g., decrease 200 by 15% = 170).',
};

const PercentageCalculator = () => {
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
    <div className="w-full max-w-md mx-auto mt-6 sm:mt-10 p-2 sm:p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg flex flex-col items-center">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">Percentage Calculator</h2>
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
      <AdBanner />
    </div>
  );
};

export default PercentageCalculator; 