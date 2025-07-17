import React, { useState, useRef } from 'react';
import CalculationHistory from './CalculationHistory.jsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import AdBanner from './AdBanner.jsx';

const PRINT_HISTORY_KEY = 'printing_cost_history';

const EXTRAS = [
  { key: 'color', label: 'Color Printing', tooltip: 'Adds extra cost per page for color prints.' },
  { key: 'binding', label: 'Binding', tooltip: 'Adds a fixed cost per copy for binding.' },
  { key: 'lamination', label: 'Lamination', tooltip: 'Adds a fixed cost per copy for lamination/finishing.' },
];

const DEFAULT_EXTRA_COSTS = {
  color: 2, // per page
  binding: 10, // per copy
  lamination: 5, // per copy
};

const PrintingCostCalculator = ({ darkMode }) => {
  const [inputs, setInputs] = useState({
    pages: '',
    copies: '',
    costPerPage: '',
    extras: {
      color: false,
      binding: false,
      lamination: false,
    },
  });
  const [extraCosts, setExtraCosts] = useState(DEFAULT_EXTRA_COSTS);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(null);

  const resultRef = useRef(null);

  // Save calculation to history
  const saveToHistory = (input, output) => {
    const newEntry = {
      id: Date.now(),
      input,
      output,
      date: new Date().toISOString(),
    };
    let history = [];
    try {
      const stored = localStorage.getItem(PRINT_HISTORY_KEY);
      if (stored) history = JSON.parse(stored);
    } catch {}
    history.unshift(newEntry);
    if (history.length > 50) history = history.slice(0, 50);
    localStorage.setItem(PRINT_HISTORY_KEY, JSON.stringify(history));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name in inputs.extras) {
      setInputs((prev) => ({
        ...prev,
        extras: { ...prev.extras, [name]: checked },
      }));
    } else {
      if (/^\d*\.?\d*$/.test(value) || value === '') {
        setInputs((prev) => ({ ...prev, [name]: value }));
      }
    }
    setError('');
    setResult(null);
    setExplanation('');
    setIsAnimating(false);
    setFeedbackGiven(null);
  };

  const handleExtraCostChange = (e, key) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setExtraCosts((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleClear = () => {
    setInputs({
      pages: '',
      copies: '',
      costPerPage: '',
      extras: { color: false, binding: false, lamination: false },
    });
    setExtraCosts(DEFAULT_EXTRA_COSTS);
    setResult(null);
    setError('');
    setExplanation('');
    setIsAnimating(false);
    setFeedbackGiven(null);
    setCopied(false);
  };

  const validate = () => {
    const { pages, copies, costPerPage } = inputs;
    if (!pages || !copies || !costPerPage) {
      setError('Please fill in all required fields.');
      return false;
    }
    if (+pages <= 0 || +copies <= 0 || +costPerPage < 0) {
      setError('Values must be positive.');
      return false;
    }
    return true;
  };

  const handleCalculate = () => {
    if (!validate()) {
      setResult(null);
      setIsAnimating(false);
      setExplanation('');
      return;
    }
    const { pages, copies, costPerPage, extras } = inputs;
    const totalPages = +pages * +copies;
    let printCost = +pages * +copies * +costPerPage;
    let breakdown = [
      `Pages per copy: ${pages}`,
      `Number of copies: ${copies}`,
      `Total pages: ${totalPages}`,
      `Base print cost: ${pages} × ${copies} × ₹${costPerPage} = ₹${printCost.toFixed(2)}`,
    ];
    let extrasTotal = 0;
    if (extras.color) {
      const colorCost = +pages * +copies * +extraCosts.color;
      extrasTotal += colorCost;
      breakdown.push(`Color printing: ${pages} × ${copies} × ₹${extraCosts.color} = ₹${colorCost.toFixed(2)}`);
    }
    if (extras.binding) {
      const bindingCost = +copies * +extraCosts.binding;
      extrasTotal += bindingCost;
      breakdown.push(`Binding: ${copies} × ₹${extraCosts.binding} = ₹${bindingCost.toFixed(2)}`);
    }
    if (extras.lamination) {
      const lamCost = +copies * +extraCosts.lamination;
      extrasTotal += lamCost;
      breakdown.push(`Lamination: ${copies} × ₹${extraCosts.lamination} = ₹${lamCost.toFixed(2)}`);
    }
    const totalCost = printCost + extrasTotal;
    breakdown.push(`Total cost: ₹${printCost.toFixed(2)} + ₹${extrasTotal.toFixed(2)} = ₹${totalCost.toFixed(2)}`);
    setResult({
      totalPages,
      printCost: printCost.toFixed(2),
      extrasTotal: extrasTotal.toFixed(2),
      totalCost: totalCost.toFixed(2),
      breakdown,
    });
    setExplanation(breakdown.join('\n'));
    setIsAnimating(true);
    setCopied(false);
    saveToHistory({ ...inputs, extraCosts }, totalCost.toFixed(2));
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `Total Printing Cost: ₹${result.totalCost}\nBreakdown:\n${result.breakdown.join('\n')}`;
    navigator.clipboard.writeText(text).then(() => setCopied(true));
  };

  // PDF download logic
  const generatePdf = async () => {
    if (!result || error) {
      alert('No result available to download as PDF.');
      return;
    }
    if (!resultRef.current) {
      alert('Result card not found.');
      return;
    }
    try {
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth * 0.8;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const x = (pageWidth - imgWidth) / 2;
      const y = 60;
      pdf.text('Printing Cost Report', pageWidth / 2, 40, { align: 'center' });
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      pdf.save('Printing_Cost_Report.pdf');
    } catch (err) {
      alert('Failed to generate PDF.');
    }
  };

  // Keyboard accessibility: Enter to calculate
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleCalculate();
  };

  return (
    <div className={`p-4 font-inter min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-teal-50 to-blue-100'}`}>
      <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-10 max-w-xl mx-auto transition hover:shadow-xl hover:scale-[1.02] duration-200`}>
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold leading-tight mb-2 text-gray-900 dark:text-gray-100 flex items-center justify-center whitespace-nowrap">
            <span className="mr-2 text-2xl md:text-3xl">🖨️</span> Printing Cost Calculator
          </h2>
          <p className="text-base md:text-lg font-normal leading-relaxed text-gray-700 dark:text-gray-300 mb-4">
            Estimate your total printing cost for brochures, books, posters, and more. Includes extras like color, binding, and lamination.
          </p>
        </div>
        {/* Input Card */}
        <form
          className={`p-6 rounded-xl shadow-inner border space-y-4 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
          onSubmit={e => { e.preventDefault(); handleCalculate(); }}
          onKeyDown={handleKeyDown}
        >
          <h3 className={`text-2xl font-bold text-center mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Job Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pages" className="block font-semibold mb-1">Number of Pages</label>
              <input
                id="pages"
                name="pages"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={inputs.pages}
                onChange={handleInputChange}
                placeholder="e.g., 20"
                className={`w-full py-3 px-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200 ${error ? 'border-red-500' : darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                aria-label="Number of Pages"
              />
            </div>
            <div>
              <label htmlFor="copies" className="block font-semibold mb-1">Number of Copies</label>
              <input
                id="copies"
                name="copies"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={inputs.copies}
                onChange={handleInputChange}
                placeholder="e.g., 50"
                className={`w-full py-3 px-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200 ${error ? 'border-red-500' : darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                aria-label="Number of Copies"
              />
            </div>
            <div>
              <label htmlFor="costPerPage" className="block font-semibold mb-1">Cost per Page (₹)</label>
              <input
                id="costPerPage"
                name="costPerPage"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={inputs.costPerPage}
                onChange={handleInputChange}
                placeholder="e.g., 1.5"
                className={`w-full py-3 px-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200 ${error ? 'border-red-500' : darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                aria-label="Cost per Page"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold mb-1">Optional Extras</span>
              {EXTRAS.map(extra => (
                <div key={extra.key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={extra.key}
                    name={extra.key}
                    checked={inputs.extras[extra.key]}
                    onChange={handleInputChange}
                    className="form-checkbox h-5 w-5 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    aria-label={extra.label}
                  />
                  <label htmlFor={extra.key} className="flex items-center gap-1 cursor-pointer">
                    {extra.label}
                    <span
                      tabIndex={0}
                      className="ml-1 text-xs text-gray-400 dark:text-gray-300 cursor-pointer"
                      title={extra.tooltip}
                      aria-label={`Info: ${extra.tooltip}`}
                    >
                      ⓘ
                    </span>
                  </label>
                  {inputs.extras[extra.key] && (
                    <input
                      type="text"
                      inputMode="decimal"
                      className={`ml-2 w-20 py-1 px-2 rounded border focus:outline-none focus:ring-2 focus:ring-teal-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                      value={extraCosts[extra.key]}
                      onChange={e => handleExtraCostChange(e, extra.key)}
                      aria-label={`Cost for ${extra.label}`}
                      placeholder={extra.key === 'color' ? '₹/pg' : '₹/copy'}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          {error && <p className="text-red-500 text-xs italic mt-2">{error}</p>}
          <div className="flex gap-4 mt-4">
            <button
              type="submit"
              className={`flex-1 font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 ${darkMode ? 'bg-blue-700 hover:bg-blue-600 text-white focus:ring-blue-500' : 'bg-blue-800 hover:bg-blue-900 text-white focus:ring-blue-800'}`}
            >
              Calculate
            </button>
            <button
              type="button"
              onClick={handleClear}
              className={`flex-1 font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-100 focus:ring-gray-500' : 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400'}`}
            >
              Reset
            </button>
          </div>
        </form>

        {/* Result Card */}
        {result && !error && (
          <>
          <div
            ref={resultRef}
            className={`mt-8 text-center p-6 rounded-xl shadow-md transform transition-all duration-500 ease-out ${isAnimating ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'} ${darkMode ? 'bg-green-900 border-green-700 text-green-100' : 'bg-green-50 border-green-200 text-green-900 border'}`}
          >
            <p className="text-xl font-semibold mb-2">Total Printing Cost:</p>
            <p className="text-5xl font-extrabold mb-4">₹{result.totalCost}</p>
            <div className="text-left mx-auto max-w-md">
              <h4 className="font-bold mb-2">Breakdown:</h4>
              <ul className="list-disc list-inside text-base space-y-1">
                {result.breakdown.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
            {/* Copy & Feedback */}
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-6">
              <button
                onClick={handleCopy}
                className={`font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 ${copied ? 'bg-teal-600 text-white' : darkMode ? 'bg-teal-800 hover:bg-teal-900 text-white' : 'bg-teal-700 hover:bg-teal-800 text-white'}`}
                aria-label="Copy result to clipboard"
              >
                {copied ? 'Copied!' : 'Copy Result'}
              </button>
              <div className="flex items-center gap-2">
                <span className={`text-md font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>⭐ Was this accurate?</span>
                <button
                  onClick={() => setFeedbackGiven('yes')}
                  className={`font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 ${feedbackGiven === 'yes' ? 'bg-green-500 text-white' : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-green-600' : 'bg-gray-200 text-gray-700 hover:bg-green-100'}`}
                  aria-label="Feedback Yes"
                >
                  👍
                </button>
                <button
                  onClick={() => setFeedbackGiven('no')}
                  className={`font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 ${feedbackGiven === 'no' ? 'bg-red-500 text-white' : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-red-600' : 'bg-gray-200 text-gray-700 hover:bg-red-100'}`}
                  aria-label="Feedback No"
                >
                  👎
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-4">
            <button
              onClick={generatePdf}
              className={`w-full font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${darkMode ? 'bg-teal-800 hover:bg-teal-900 text-white' : 'bg-teal-700 hover:bg-teal-800 text-white'}`}
            >
              Download PDF
            </button>
          </div>
          </>
        )}

        {/* Calculation History below the result */}
        {result && !error && (
          <CalculationHistory historyKey={PRINT_HISTORY_KEY} title="Printing Cost History" darkMode={darkMode} showUniversity={false} showProgress={false} />
        )}

        {/* Info Section */}
        <div className={`my-8 p-5 rounded-lg border shadow-sm space-y-3 ${darkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
          <h3 className={`font-bold text-lg mb-3 ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>ℹ️ How Printing Cost is Calculated</h3>
          <ul className={`list-disc list-inside text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <li><b>Base Print Cost</b>: Number of pages × Number of copies × Cost per page.</li>
            <li><b>Color Printing</b>: Adds extra cost per page if selected.</li>
            <li><b>Binding/Lamination</b>: Adds a fixed cost per copy if selected.</li>
            <li>All extras are optional and can be customized.</li>
          </ul>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tip: Adjust the extra costs as per your local print shop's rates.</p>
        </div>
      </div>
      <AdBanner />
    </div>
  );
};

export default PrintingCostCalculator; 