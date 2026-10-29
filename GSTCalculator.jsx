import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import AdsterraBanner from './AdsterraBanner';
import SEO from './SEO';

const gstRates = [5, 12, 18, 28];
const modeInfo = {
  add: 'Add GST to a base amount. Enter the base (pre-GST) amount and GST rate to get the GST and total amount.',
  remove: 'Remove GST from a total amount. Enter the total (post-GST) amount and GST rate to get the GST and base amount.',
};

const GSTCalculator = () => {
  const [rating, setRating] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

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
        title="GST Calculator Online | Add or Remove GST (5%, 12%, 18%, 28%) - Smart Studies"
        description="Easily calculate GST, CGST, SGST, and IGST for any amount. Supports inclusive/exclusive GST rates, step-by-step breakdown, and mobile-friendly design."
        url="https://smartstudenttools.xyz/gst-calculator"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          'name': 'GST Calculator',
          'description': 'Easily add or remove GST from any amount. Supports all GST rates, step-by-step explanations, and mobile-friendly design.',
          'applicationCategory': 'CalculatorApplication',
          'operatingSystem': 'All',
          'url': 'https://smartstudenttools.xyz/gst-calculator',
          'publisher': {
            '@type': 'Organization',
            'name': 'Smart Student Tools'
          }
        }}
      />
      <div className="w-full max-w-md mx-auto mt-6 sm:mt-10 p-2 sm:p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg flex flex-col items-center">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100 calculator-hero">GST Calculator (India)</h2>
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
      <AdsterraBanner />

      {/* Structured Content Section */}
      <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-8 text-gray-800 dark:text-gray-200">
        
        {/* About GST */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold">📘 About Goods &amp; Services Tax (GST)</h3>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            Goods and Services Tax (GST) is an indirect tax levied on the supply of goods and services. It replaced multiple pre-existing indirect taxes like excise duty, service tax, VAT, and luxury tax. GST is designed to unify the national market under a single tax structure (e.g., "One Nation, One Tax"). It features specific standard rates or slabs: 5%, 12%, 18%, and 28%. Business owners and customers need to calculate base prices and tax amounts to manage invoices and expenses correctly.
          </p>
        </div>

        {/* How to Use Section */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold">📖 How to Use the GST Calculator</h3>
          <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-gray-300 space-y-2">
            <li>Select your tax mode:
              <br />➔ **Add GST** (if you have base price and want to calculate final price).
              <br />➔ **Remove GST** (if you have the final invoice price and want to extract base price).
            </li>
            <li>Input the amount value in Rupees (₹) in the amount field.</li>
            <li>Select one of the standard GST rate tabs (5%, 12%, 18%, 28%) or type a custom percentage.</li>
            <li>Press **Calculate** to see the resulting Base Amount, GST Tax Amount, and Net Total.</li>
          </ol>
        </div>

        {/* Formulas Section */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold">📊 GST Math Formulas</h3>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            The calculator applies different arithmetic depending on the chosen task:
            <br />
            - **Adding GST:**
            <code className="block my-2 bg-gray-100 dark:bg-gray-950 p-2 rounded font-mono text-center">
              GST Tax Amount = Base Amount * (GST% / 100)
              <br />
              Total Net Price = Base Amount + GST Tax Amount
            </code>
            - **Removing / Extracting GST:**
            <code className="block my-2 bg-gray-100 dark:bg-gray-950 p-2 rounded font-mono text-center">
              Base Amount = Total Net Price / (1 + GST% / 100)
              <br />
              GST Tax Amount = Total Net Price - Base Amount
            </code>
          </p>
        </div>

        {/* Practical Example */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold">✏️ Practical GST Examples</h3>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            - **Example of Adding GST:** A product has a base price of ₹1,000 with a GST rate of 18%.
            <br />
            <code className="block my-1 bg-gray-100 dark:bg-gray-950 p-1 rounded font-mono">
              GST Amount = 1000 * 0.18 = ₹180
              <br />
              Total Cost = 1000 + 180 = ₹1,180
            </code>
            - **Example of Removing GST:** An item has a total invoice value of ₹1,180 with a GST rate of 18%.
            <br />
            <code className="block my-1 bg-gray-100 dark:bg-gray-950 p-1 rounded font-mono">
              Base Amount = 1180 / 1.18 = ₹1,000
              <br />
              GST Extracted = 1180 - 1000 = ₹180
            </code>
          </p>
        </div>

        {/* Advantages Section */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold">🌟 Advantages of our GST Calculator</h3>
          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-2">
            <li><span className="font-semibold text-gray-950 dark:text-white">CGST &amp; SGST Split:</span> Automatically splits the calculated tax into state (SGST) and central (CGST) components (50% each) for invoice drafting.</li>
            <li><span className="font-semibold text-gray-950 dark:text-white">Flexible Slabs:</span> Standard quick buttons for common slabs make data entry extremely efficient.</li>
            <li><span className="font-semibold text-gray-950 dark:text-white">Copyable Results:</span> Paste the computed metrics directly into spreadsheets.</li>
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
                <span>What is the difference between CGST, SGST, and IGST?</span>
                <span className="accordion-icon text-xl transition-transform duration-300">+</span>
              </button>
              <div className="accordion-content max-h-0 overflow-hidden transition-all duration-500 ease-in-out text-sm text-gray-600 dark:text-gray-300">
                <p className="pt-2">CGST (Central GST) and SGST (State GST) are levied on transactions within a single state. IGST (Integrated GST) is levied on interstate transactions and import/export of goods.</p>
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
                <span>Why is the extracted GST less than the straight percentage?</span>
                <span className="accordion-icon text-xl transition-transform duration-300">+</span>
              </button>
              <div className="accordion-content max-h-0 overflow-hidden transition-all duration-500 ease-in-out text-sm text-gray-600 dark:text-gray-300">
                <p className="pt-2">When you remove GST from a total value, the tax is already part of the total. Calculating a straight percentage on the total would over-calculate the tax, because tax cannot be levied on the tax amount itself. Hence, we divide by the scaling factor first.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Tools & Articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-lg mb-3">🛠️ Related Math Tools</h4>
            <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
              <li><Link to="/percentage-calculator" className="hover:underline">Percentage Calculator</Link></li>
              <li><Link to="/calculator" className="hover:underline">Standard Calculator</Link></li>
              <li><Link to="/financial-calculator" className="hover:underline">Financial Calculator</Link></li>
            </ul>
          </div>
          <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-lg mb-3">📚 Related Articles</h4>
            <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
              <li><Link to="/blog/student-budgeting-financial-literacy-guide" className="hover:underline">The Ultimate Student Budgeting &amp; Financial Literacy Guide</Link></li>
              <li><a href="https://smartstudenttools.xyz/blog/calculating-tax-deductions" target="_blank" rel="noopener noreferrer" className="hover:underline">How to File Business Tax Invoices Correctly</a></li>
            </ul>
          </div>
        </div>

        {/* Interactive Rating Component */}
        <div className="p-6 rounded-xl border shadow-sm text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">Rate &amp; Give Feedback</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Help us improve the GST calculation flow</p>
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

export default GSTCalculator; 
