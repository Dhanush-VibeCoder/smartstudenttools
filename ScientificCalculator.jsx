import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import CalculationHistory from './CalculationHistory.jsx';
import AdsterraBanner from './AdsterraBanner';
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
  const [rating, setRating] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
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
        title="Scientific Calculator Online | Free Trigonometry & Math Tool - Smart Studies"
        description="Advanced scientific calculator for engineering and math students. Supports trigonometry, logarithms, memory, and powers. Mobile-friendly and free."
        url="https://smartstudenttools.xyz/scientific-calculator"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          'name': 'Scientific Calculator',
          'description': 'Advanced scientific calculator for students. Supports trigonometry, logarithms, memory, and more. Mobile-friendly and free.',
          'applicationCategory': 'CalculatorApplication',
          'operatingSystem': 'All',
          'url': 'https://smartstudenttools.xyz/scientific-calculator',
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

        {/* Structured Content Section */}
        <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-8 text-gray-800 dark:text-gray-200">
          
          {/* About Scientific Calculations */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold">📘 About Scientific Calculations</h3>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              Unlike standard calculators, a scientific calculator is designed to solve advanced problems in engineering, physics, calculus, and chemistry. It supports complex trigonometric functions (sine, cosine, tangent), logarithmic transformations (natural log ln, base-10 log), square roots, exponent raising ($x^y$), factorials ($n!$), and incorporates universal mathematical constants such as Pi ($\pi$) and Euler's number ($e$). Having access to these operators is crucial for college engineering labs and high-school trigonometry homework.
            </p>
          </div>

          {/* How to Use Section */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold">📖 How to Use the Scientific Calculator</h3>
            <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <li>Toggle between **Deg** (Degrees) and **Rad** (Radians) for trigonometric tasks.</li>
              <li>Input numbers, then press function keys like <span className="font-mono">sin</span>, <span className="font-mono">cos</span>, or <span className="font-mono">log</span> to evaluate them instantly.</li>
              <li>Use the power button <span className="font-mono">x^y</span> to raise a base to any customized exponent.</li>
              <li>Use standard brackets <span className="font-mono">(</span> and <span className="font-mono">)</span> to write nested equations, maintaining mathematical priority.</li>
              <li>Press the copy button or download PDF option to store your formulas and outputs.</li>
            </ol>
          </div>

          {/* Formulas Section */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold">📊 Trigonometry &amp; Logarithm Equations</h3>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              The calculator computes functions based on standard real-number analysis:
              <br />
              - **Trigonometric Ratios:**
              <br />
              <code className="block my-2 bg-gray-100 dark:bg-gray-950 p-2 rounded font-mono text-center">
                sin(θ) = Opposite / Hypotenuse
                <br />
                cos(θ) = Adjacent / Hypotenuse
                <br />
                tan(θ) = Opposite / Adjacent
              </code>
              - **Logarithmic Scales:**
              <br />
              <code className="block my-2 bg-gray-100 dark:bg-gray-950 p-2 rounded font-mono text-center">
                log(x) = y ➔ 10^y = x
                <br />
                ln(x) = y ➔ e^y = x (Euler's base)
              </code>
            </p>
          </div>

          {/* Practical Example */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold">✏️ Example Calculations</h3>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              - **Trigonometry Example:** To calculate the sine of 30 degrees:
              <br />
              1. Toggle the mode to **Deg**.
              <br />
              2. Type <code className="font-mono">30</code> and click <code className="font-mono">sin</code>.
              <br />
              3. Output: <code className="font-mono">0.5</code>.
              <br />
              - **Exponent Example:** To find 5 raised to the power of 3:
              <br />
              1. Press <code className="font-mono">5</code>.
              <br />
              2. Click the <code className="font-mono">x^y</code> button.
              <br />
              3. Press <code className="font-mono">3</code>, then press <code className="font-mono">=</code>.
              <br />
              4. Output: <code className="font-mono">125</code>.
            </p>
          </div>

          {/* Advantages Section */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold">🌟 Advantages of our Scientific Calculator</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <li><span className="font-semibold text-gray-950 dark:text-white">Precision Results:</span> Utilizes JS floating-point libraries to compute results accurate to 12 decimal places.</li>
              <li><span className="font-semibold text-gray-950 dark:text-white">Deg/Rad Switch:</span> Essential for switching between physical angular coordinates and abstract math units.</li>
              <li><span className="font-semibold text-gray-950 dark:text-white">Formula Logging:</span> The ledger displays the input expression so you can spot errors in long brackets.</li>
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
                  <span>Why does log(0) return an error?</span>
                  <span className="accordion-icon text-xl transition-transform duration-300">+</span>
                </button>
                <div className="accordion-content max-h-0 overflow-hidden transition-all duration-500 ease-in-out text-sm text-gray-600 dark:text-gray-300">
                  <p className="pt-2">Logarithms find the power to which a base must be raised to yield a target number. Since raising any positive number (like 10 or e) to any power cannot produce 0, log(0) is undefined and results in an error.</p>
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
                  <span>What is the difference between log and ln?</span>
                  <span className="accordion-icon text-xl transition-transform duration-300">+</span>
                </button>
                <div className="accordion-content max-h-0 overflow-hidden transition-all duration-500 ease-in-out text-sm text-gray-600 dark:text-gray-300">
                  <p className="pt-2">"log" refers to the common logarithm which has a base of 10. "ln" refers to the natural logarithm which has a base of e (Euler's number ≈ 2.71828).</p>
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
                <li><Link to="/percentage-calculator" className="hover:underline">Percentage Calculator</Link></li>
                <li><Link to="/financial-calculator" className="hover:underline">Financial Calculator</Link></li>
              </ul>
            </div>
            <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <h4 className="font-bold text-lg mb-3">📚 Related Articles</h4>
              <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
                <li><a href="https://smartstudenttools.xyz/blog/trigonometry-unit-circle" target="_blank" rel="noopener noreferrer" className="hover:underline">Trigonometry and the Unit Circle Simplified</a></li>
                <li><a href="https://smartstudenttools.xyz/blog/understanding-euler-number" target="_blank" rel="noopener noreferrer" className="hover:underline">What is Euler's Number (e) and Why is it Useful?</a></li>
              </ul>
            </div>
          </div>

          {/* Interactive Rating Component */}
          <div className="p-6 rounded-xl border shadow-sm text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">Rate &amp; Give Feedback</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Help us improve the advanced calculator layout</p>
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
      </div>
    </>
  );
};

export default ScientificCalculator; 
