import React, { useState, useRef } from 'react';
import AdBanner from './AdBanner.jsx';
import SEO from './SEO';

const gstRates = [5, 12, 18, 28];
const modeInfo = {
  add: 'Add GST to a base amount. Enter the base (pre-GST) amount and GST rate to get the GST and total amount.',
  remove: 'Remove GST from a total amount. Enter the total (post-GST) amount and GST rate to get the GST and base amount.',
};

const GSTCalculator = () => {
  const [mode, setMode] = useState('add'); // 'add' or 'remove'
  const [amount, setAmount] = useState('');
  const [gst, setGst] = useState('');
  const [result, setResult] = useState(null);
  const [gstAmount, setGstAmount] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [showTooltip, setShowTooltip] = useState('');
  const amountInputRef = useRef(null);
  const gstInputRef = useRef(null);

  const handleCalculate = () => {
    setError('');
    setExplanation('');
    const amt = parseFloat(amount);
    const gstRate = parseFloat(gst);
    if (isNaN(amt) || isNaN(gstRate)) {
      setResult(null);
      setGstAmount(null);
      setError('Please enter valid numbers for both fields.');
      return;
    }
    let res = null, gstVal = null, expl = '', historyEntry = '';
    if (mode === 'add') {
      gstVal = (gstRate / 100) * amt;
      res = amt + gstVal;
      expl = `GST Amount = (${gstRate}% of ${amt}) = (${gstRate}/100) × ${amt} = ${gstVal}\nTotal Amount = Base + GST = ${amt} + ${gstVal} = ${res}`;
      historyEntry = `Add GST: ₹${amt} + ${gstRate}% = ₹${res} (GST: ₹${gstVal})`;
    } else {
      res = amt / (1 + gstRate / 100);
      gstVal = amt - res;
      expl = `Base Amount = Total / (1 + GST%) = ${amt} / (1 + ${gstRate}/100) = ${amt} / ${(1 + gstRate / 100)} = ${res}\nGST Amount = Total - Base = ${amt} - ${res} = ${gstVal}`;
      historyEntry = `Remove GST: ₹${amt} - ${gstRate}% = ₹${res} (GST: ₹${gstVal})`;
    }
    setResult(res);
    setGstAmount(gstVal);
    setExplanation(expl);
    setHistory(prev => [historyEntry, ...prev.slice(0, 4)]);
  };

  const handleCopy = () => {
    if (result !== null) {
      navigator.clipboard.writeText(result.toFixed(2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCalculate();
    }
  };

  const handleReset = () => {
    setAmount('');
    setGst('');
    setResult(null);
    setGstAmount(null);
    setExplanation('');
    setError('');
    setCopied(false);
    setHistory([]);
  };

  return (
    <>
      <SEO
        title="GST Calculator - Smart Student Tools"
        description="Easily add or remove GST from any amount. Supports all GST rates, step-by-step explanations, and mobile-friendly design."
        url="https://yourdomain.com/gst-calculator"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          'name': 'GST Calculator',
          'description': 'Easily add or remove GST from any amount. Supports all GST rates, step-by-step explanations, and mobile-friendly design.',
          'applicationCategory': 'CalculatorApplication',
          'operatingSystem': 'All',
          'url': 'https://yourdomain.com/gst-calculator',
          'publisher': {
            '@type': 'Organization',
            'name': 'Smart Student Tools'
          }
        }}
      />
      <div className="w-full max-w-md mx-auto mt-6 sm:mt-10 p-2 sm:p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg flex flex-col items-center">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">GST Calculator (India)</h2>
        {/* Calculation History */}
        {history.length > 0 && (
          <div className="w-full mb-2 text-xs text-right text-gray-500 dark:text-gray-300 space-y-1 overflow-x-auto whitespace-nowrap">
            {history.map((item, idx) => (
              <div key={idx} className="truncate">{item}</div>
            ))}
          </div>
        )}
        {/* Mode Toggle */}
        <div className="flex gap-2 w-full mb-4">
          <div className="relative flex-1">
            <button
              type="button"
              className={`w-full py-3 sm:py-2 rounded-lg font-semibold border transition-colors duration-150 flex items-center justify-center gap-1 ${mode === 'add' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700'}`}
              onClick={() => setMode('add')}
              aria-label="Add GST"
              tabIndex={0}
              onMouseEnter={() => setShowTooltip('add')}
              onMouseLeave={() => setShowTooltip('')}
              onFocus={() => setShowTooltip('add')}
              onBlur={() => setShowTooltip('')}
            >
              Add GST
              <span tabIndex={-1} className="ml-1 text-blue-500 cursor-pointer text-base" aria-label="Info about Add GST">ℹ️</span>
            </button>
            {showTooltip === 'add' && (
              <div className="absolute left-0 top-full mt-1 w-max max-w-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-lg p-2 text-xs text-gray-800 dark:text-gray-100 z-10">
                {modeInfo.add}
              </div>
            )}
          </div>
          <div className="relative flex-1">
            <button
              type="button"
              className={`w-full py-3 sm:py-2 rounded-lg font-semibold border transition-colors duration-150 flex items-center justify-center gap-1 ${mode === 'remove' ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700'}`}
              onClick={() => setMode('remove')}
              aria-label="Remove GST"
              tabIndex={0}
              onMouseEnter={() => setShowTooltip('remove')}
              onMouseLeave={() => setShowTooltip('')}
              onFocus={() => setShowTooltip('remove')}
              onBlur={() => setShowTooltip('')}
            >
              Remove GST
              <span tabIndex={-1} className="ml-1 text-green-600 cursor-pointer text-base" aria-label="Info about Remove GST">ℹ️</span>
            </button>
            {showTooltip === 'remove' && (
              <div className="absolute left-0 top-full mt-1 w-max max-w-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-lg p-2 text-xs text-gray-800 dark:text-gray-100 z-10">
                {modeInfo.remove}
              </div>
            )}
          </div>
        </div>
        <form className="w-full space-y-4" onSubmit={e => { e.preventDefault(); handleCalculate(); }}>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              {mode === 'add' ? 'Base Amount (₹)' : 'Total Amount (₹)'}
            </label>
            <input
              id="amount"
              ref={amountInputRef}
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-3 sm:py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-lg sm:text-base text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder={mode === 'add' ? 'Enter base amount (e.g., 1000)' : 'Enter total amount (e.g., 1180)'}
              aria-label={mode === 'add' ? 'Base amount' : 'Total amount'}
              tabIndex={0}
              inputMode="decimal"
            />
          </div>
          <div>
            <label htmlFor="gst" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">GST Rate (%)</label>
            <div className="flex gap-2 mb-2">
              {gstRates.map(rate => (
                <button
                  key={rate}
                  type="button"
                  className={`px-3 py-2 rounded-lg font-semibold border transition-colors duration-150 text-sm sm:text-base ${parseFloat(gst) === rate ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700'}`}
                  onClick={() => setGst(rate)}
                  aria-label={`Set GST rate to ${rate}%`}
                  tabIndex={0}
                >
                  {rate}%
                </button>
              ))}
            </div>
            <input
              id="gst"
              ref={gstInputRef}
              type="number"
              value={gst}
              onChange={e => setGst(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-3 sm:py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-lg sm:text-base text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter GST rate (e.g., 18)"
              aria-label="GST rate"
              tabIndex={0}
              inputMode="decimal"
            />
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
                <span>{mode === 'add' ? 'Total Amount:' : 'Base Amount:'}</span> <span className="font-bold text-xl sm:text-2xl">₹{result.toFixed(2)}</span>
                <button
                  className="ml-0 sm:ml-2 px-3 py-2 sm:px-2 sm:py-1 rounded bg-blue-200 dark:bg-blue-700 text-blue-900 dark:text-blue-100 text-base sm:text-sm font-semibold hover:bg-blue-300 dark:hover:bg-blue-600 transition-colors duration-150"
                  onClick={handleCopy}
                  aria-label="Copy result"
                  tabIndex={0}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="mt-2 text-base text-gray-700 dark:text-gray-200">
                GST Amount: <span className="font-bold">₹{gstAmount !== null ? gstAmount.toFixed(2) : ''}</span>
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
      <AdBanner />
    </>
  );
};

export default GSTCalculator; 