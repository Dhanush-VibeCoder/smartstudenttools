import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import CalculationHistory from './CalculationHistory.jsx';
import AdBanner from './AdBanner.jsx';
import SEO from './SEO';

const SCI_HISTORY_KEY = 'scientific_calc_history';

const sciButtons = [
  [
    { label: 'sin', type: 'func' },
    { label: 'cos', type: 'func' },
    { label: 'tan', type: 'func' },
    { label: 'log', type: 'func' },
  ],
  [
    { label: 'ln', type: 'func' },
    { label: 'sqrt', type: 'func' },
    { label: 'pow2', type: 'func' },
    { label: 'pow3', type: 'func' },
  ],
  [
    { label: 'factorial', type: 'func' },
    { label: 'M+', type: 'mem' },
    { label: 'M-', type: 'mem' },
    { label: 'MR', type: 'mem' },
    { label: 'MC', type: 'mem' },
  ],
];

const numPad = [
  ['7', '8', '9', '/', '('],
  ['4', '5', '6', '*', ')'],
  ['1', '2', '3', '-', ''],
  ['0', '.', '=', '+', ''],
];

function factorial(n) {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

const ScientificCalculator = ({ darkMode }) => {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [memory, setMemory] = useState(0);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(null);
  const displayRef = useRef(null);

  // Save calculation to history
  const saveToHistory = (expr, res) => {
    const newEntry = {
      id: Date.now(),
      input: expr,
      output: res,
      date: new Date().toISOString(),
    };
    let hist = [];
    try {
      const stored = localStorage.getItem(SCI_HISTORY_KEY);
      if (stored) hist = JSON.parse(stored);
    } catch {}
    hist.unshift(newEntry);
    if (hist.length > 50) hist = hist.slice(0, 50);
    localStorage.setItem(SCI_HISTORY_KEY, JSON.stringify(hist));
    setHistory(hist);
  };

  // Evaluate expression safely
  const safeEval = (expr) => {
    try {
      // Replace functions with Math equivalents
      let exp = expr
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/pow2\(/g, 'Math.pow(')
        .replace(/pow3\(/g, 'Math.pow(')
        .replace(/([0-9.]+)!/g, 'factorial($1)');
      // pow2(x) => Math.pow(x,2), pow3(x) => Math.pow(x,3)
      exp = exp.replace(/Math\.pow\(([^,\)]+)\)/g, 'Math.pow($1,2)');
      exp = exp.replace(/Math\.pow\(([^,\)]+),3\)/g, 'Math.pow($1,3)');
      // eslint-disable-next-line no-new-func
      // Provide factorial in scope
      // eslint-disable-next-line no-new-func
      const fn = new Function('factorial', `return (${exp})`);
      let val = fn(factorial);
      if (typeof val === 'number' && !isNaN(val) && isFinite(val)) return val;
      return 'Error';
    } catch {
      return 'Error';
    }
  };

  const handleButton = (btn) => {
    setError('');
    setCopied(false);
    setFeedbackGiven(null);
    if (btn === '=') {
      let res = safeEval(expression);
      setResult(res);
      if (res !== 'Error') saveToHistory(expression, res);
      else setError('Invalid expression');
      return;
    }
    if (btn === 'Clear') {
      setExpression('');
      setResult('');
      setError('');
      return;
    }
    if (btn === 'M+') {
      if (!isNaN(Number(result))) setMemory(memory + Number(result));
      return;
    }
    if (btn === 'M-') {
      if (!isNaN(Number(result))) setMemory(memory - Number(result));
      return;
    }
    if (btn === 'MR') {
      setExpression(expression + memory);
      return;
    }
    if (btn === 'MC') {
      setMemory(0);
      return;
    }
    if (btn === 'factorial') {
      setExpression(expression + 'factorial(');
      return;
    }
    if (['sin', 'cos', 'tan', 'log', 'ln', 'sqrt', 'pow2', 'pow3'].includes(btn)) {
      setExpression(expression + btn + '(');
      return;
    }
    setExpression(expression + btn);
  };

  // Keyboard support
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) return;
      if (e.key === 'Enter') handleButton('=');
      if (e.key === 'Backspace') setExpression(expression.slice(0, -1));
      if (e.key === 'Escape') handleButton('Clear');
      if (/^[0-9+\-*/().]$/.test(e.key)) setExpression(expression + e.key);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expression]);

  // Copy result
  const handleCopy = () => {
    if (result !== '' && result !== 'Error') {
      navigator.clipboard.writeText(result.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  // Remove PDF export function and button

  return (
    <>
      <SEO
        title="Scientific Calculator - Smart Student Tools"
        description="Advanced scientific calculator for students. Supports trigonometry, logarithms, memory, and more. Mobile-friendly and free."
        url="https://yourdomain.com/scientific-calculator"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          'name': 'Scientific Calculator',
          'description': 'Advanced scientific calculator for students. Supports trigonometry, logarithms, memory, and more. Mobile-friendly and free.',
          'applicationCategory': 'CalculatorApplication',
          'operatingSystem': 'All',
          'url': 'https://yourdomain.com/scientific-calculator',
          'publisher': {
            '@type': 'Organization',
            'name': 'Smart Student Tools'
          }
        }}
      />
      <div className={`p-4 font-inter min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-teal-50 to-blue-100'}`}>
        <div className={`w-full max-w-3xl mx-auto mt-6 mb-4 rounded-2xl shadow-lg p-4 text-3xl font-bold text-center ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-blue-900'}`}>Scientific Calculator</div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 md:p-8 max-w-3xl mx-auto flex flex-col gap-4">
          {/* Display Area */}
          <div className={`rounded-xl p-4 mb-2 min-h-[70px] text-2xl font-mono whitespace-pre-wrap break-words ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`} ref={displayRef}>
            {expression || <span className="text-gray-400">0</span>}
            {result !== '' && (
              <div className="text-lg text-gray-500 mt-2">= {result}</div>
            )}
            <div className="text-xs text-gray-500 mt-1">Memory: {memory}</div>
          </div>
          {/* Button Grid */}
          <div className="grid grid-cols-4 gap-2 mb-2">
            {sciButtons[0].map(btn => (
              <button key={btn.label} className="col-span-1 py-3 rounded-lg bg-indigo-400 hover:bg-indigo-500 text-white font-bold text-lg focus:outline-none" onClick={() => handleButton(btn.label)}>{btn.label}</button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {sciButtons[1].map(btn => (
              <button key={btn.label} className="col-span-1 py-3 rounded-lg bg-indigo-400 hover:bg-indigo-500 text-white font-bold text-lg focus:outline-none" onClick={() => handleButton(btn.label)}>{btn.label}</button>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-2 mb-2">
            {sciButtons[2].map(btn => (
              <button key={btn.label} className="col-span-1 py-3 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-bold text-lg focus:outline-none" onClick={() => handleButton(btn.label)}>{btn.label}</button>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-2 mb-2">
            <button className="col-span-2 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-lg focus:outline-none" onClick={() => handleButton('Clear')}>Clear</button>
            {['(', ')'].map(b => (
              <button key={b} className="col-span-1 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold text-lg focus:outline-none" onClick={() => handleButton(b)}>{b}</button>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-2 mb-2">
            {numPad.flat().map((btn, idx) => btn ? (
              <button
                key={btn+idx}
                className={`col-span-1 py-3 rounded-lg ${btn === '=' ? 'bg-green-500 hover:bg-green-600 text-white' : ['+', '-', '*', '/',].includes(btn) ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-white hover:bg-gray-200 text-gray-900'} font-bold text-lg focus:outline-none`}
                onClick={() => handleButton(btn)}
              >
                {btn}
              </button>
            ) : <div key={idx}></div>)}
          </div>
          <div className="flex gap-2 mt-2">
            <button onClick={handleCopy} className={`flex-1 bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-lg shadow-md transition-all text-lg focus:outline-none focus:ring-2 focus:ring-teal-400 ${copied ? 'opacity-80' : ''}`}>{copied ? 'Copied!' : 'Copy Result'}</button>
          </div>
          {/* Feedback Section */}
          <div className="mt-2 flex flex-col items-center">
            <span className={`text-md font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>⭐ Was this helpful?</span>
            <div className="flex gap-4 mt-2">
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
          {/* Calculation History below the calculator */}
          <CalculationHistory historyKey={SCI_HISTORY_KEY} title="Scientific Calculator History" darkMode={darkMode} showUniversity={false} showProgress={false} />
        </div>
        <AdBanner />
      </div>
    </>
  );
};

export default ScientificCalculator; 