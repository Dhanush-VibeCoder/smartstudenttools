import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdsterraBanner from './AdsterraBanner';
import SEO from './SEO';

const memoryButtons = ['MC', 'MR', 'M+', 'M-'];
const buttonValues = [
  ['CLEAR', '⌫', '÷', '%'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['0', '.', '='],
];

const operatorMap = {
  '+': '+',
  '−': '-',
  '×': '*',
  '÷': '/',
};

const keyToButton = {
  '0': '0',
  '1': '1',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  '.': '.',
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
  '%': '%',
  'Enter': '=',
  '=': '=',
  'Backspace': 'back',
  'Delete': 'CLEAR',
  'Escape': 'CLEAR',
};

const StandardCalculator = () => {
  const [rating, setRating] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const [display, setDisplay] = useState('0');
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [operator, setOperator] = useState(null);
  const [value, setValue] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [pressedBtn, setPressedBtn] = useState(null);
  const [memory, setMemory] = useState(0);
  const [expression, setExpression] = useState('');
  const [lastEvaluated, setLastEvaluated] = useState('');

  // Determine if clear button should show AC or C
  const clearLabel = (display === '0' && value === null && operator === null && !error && !expression) ? 'AC' : 'C';

  const handleClick = (btn) => {
    setPressedBtn(btn);
    setTimeout(() => setPressedBtn(null), 120);
    // Memory functions
    if (btn === 'MC') {
      setMemory(0);
      return;
    }
    if (btn === 'MR') {
      setDisplay(String(memory));
      setWaitingForOperand(false);
      setError('');
      return;
    }
    if (btn === 'M+') {
      if (!isNaN(parseFloat(display))) setMemory(m => m + parseFloat(display));
      return;
    }
    if (btn === 'M-') {
      if (!isNaN(parseFloat(display))) setMemory(m => m - parseFloat(display));
      return;
    }
    // If error, only allow clear or number input
    if (error) {
      if (btn === 'CLEAR' || btn === 'AC' || btn === 'C') {
        setDisplay('0');
        setOperator(null);
        setValue(null);
        setWaitingForOperand(false);
        setError('');
        setExpression('');
        setLastEvaluated('');
        if (btn === 'AC' || btn === 'CLEAR') setHistory([]);
        return;
      }
      // If number or decimal, start new calculation
      if (/^[0-9.]$/.test(btn)) {
        setDisplay(btn === '.' ? '0.' : btn);
        setOperator(null);
        setValue(null);
        setWaitingForOperand(false);
        setError('');
        setExpression(btn === '.' ? '0.' : btn);
        setLastEvaluated('');
        return;
      }
      // Ignore all other buttons
      return;
    }
    if (btn === 'CLEAR' || btn === 'AC' || btn === 'C') {
      setDisplay('0');
      setOperator(null);
      setValue(null);
      setWaitingForOperand(false);
      setError('');
      setExpression('');
      setLastEvaluated('');
      if (btn === 'AC' || btn === 'CLEAR') setHistory([]);
      return;
    }
    if (btn === '⌫' || btn === 'back') {
      if (display.length > 1) {
        setDisplay(display.slice(0, -1));
        setExpression(expression.slice(0, -1));
      } else {
        setDisplay('0');
        setExpression('');
      }
      return;
    }
    if (btn === '%') {
      let result;
      if (operator && value !== null && !waitingForOperand) {
        // Advanced: a + b% = a + (a * b / 100)
        const a = value;
        const b = parseFloat(display);
        let percentValue;
        if (operator === '+') percentValue = a + (a * b / 100);
        else if (operator === '−') percentValue = a - (a * b / 100);
        else if (operator === '×') percentValue = a * (b / 100);
        else if (operator === '÷') percentValue = a / (b / 100);
        else percentValue = b / 100;
        setDisplay(String(percentValue));
        setHistory(prev => [
          `${a} ${operator} ${b}% = ${percentValue}`,
          ...prev.slice(0, 4)
        ]);
        setValue(null);
        setOperator(null);
        setWaitingForOperand(true);
        setExpression('');
        setLastEvaluated(`${a} ${operator} ${b}%`);
      } else {
        // Simple: just divide by 100
        result = parseFloat(display) / 100;
        setDisplay(String(result));
        setHistory(prev => [
          `${parseFloat(display)}% = ${result}`,
          ...prev.slice(0, 4)
        ]);
        setWaitingForOperand(true);
        setExpression('');
        setLastEvaluated(`${parseFloat(display)}%`);
      }
      return;
    }
    if (btn === '=') {
      if (operator && value !== null) {
        try {
          // Handle divide by zero
          if (operator === '÷' && parseFloat(display) === 0) {
            setDisplay('Cannot divide by zero');
            setError('Cannot divide by zero');
            setLastEvaluated(expression + ' =');
            setExpression('');
            return;
          }
          const result = eval(`${value}${operatorMap[operator]}${parseFloat(display)}`);
          setDisplay(String(result));
          setHistory(prev => [
            `${value} ${operator} ${parseFloat(display)} = ${result}`,
            ...prev.slice(0, 4)
          ]);
          setValue(null);
          setOperator(null);
          setWaitingForOperand(true);
          setLastEvaluated(expression + ' =');
          setExpression('');
        } catch {
          setDisplay('Error');
          setError('Error');
          setLastEvaluated(expression + ' =');
          setExpression('');
        }
      }
      return;
    }
    if (Object.keys(operatorMap).includes(btn)) {
      if (operator && value !== null && !waitingForOperand) {
        // Chain operations
        try {
          // Handle divide by zero in chaining
          if (operator === '÷' && parseFloat(display) === 0) {
            setDisplay('Cannot divide by zero');
            setError('Cannot divide by zero');
            setLastEvaluated(expression + btn);
            setExpression('');
            return;
          }
          const result = eval(`${value}${operatorMap[operator]}${parseFloat(display)}`);
          setValue(result);
          setDisplay('0');
          setExpression(expression + btn);
        } catch {
          setDisplay('Error');
          setError('Error');
          setLastEvaluated(expression + btn);
          setExpression('');
        }
      } else {
        setValue(parseFloat(display));
        setDisplay('0');
        setExpression(expression + btn);
      }
      setOperator(btn);
      setWaitingForOperand(true);
      return;
    }
    // Number or decimal
    if (btn === '.') {
      if (!display.includes('.')) {
        setDisplay(display + '.');
        setExpression(expression + '.');
      }
      return;
    }
    // Number
    if (display === '0' || waitingForOperand) {
      setDisplay(btn);
      setWaitingForOperand(false);
      setExpression(expression + btn);
    } else {
      setDisplay(display + btn);
      setExpression(expression + btn);
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key;
      if (keyToButton[key]) {
        e.preventDefault();
        handleClick(keyToButton[key]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <>
      <SEO
        title="Online Standard Calculator | Fast Basic Math Tool - Smart Studies"
        description="A fast, modern standard calculator for students. Perform basic arithmetic operations with ease. Mobile-friendly, free, and privacy-first."
        url="https://smartstudenttools.xyz/calculator"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          'name': 'Standard Calculator',
          'description': 'A fast, modern standard calculator for students. Perform basic arithmetic operations with ease. Mobile-friendly, free, and privacy-first.',
          'applicationCategory': 'CalculatorApplication',
          'operatingSystem': 'All',
          'url': 'https://smartstudenttools.xyz/calculator',
          'publisher': {
            '@type': 'Organization',
            'name': 'Smart Student Tools'
          }
        }}
      />
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto mt-8 p-2 sm:p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col items-center select-none">
        <div className={`w-full mb-4 rounded-2xl shadow-lg p-4 text-3xl font-bold text-center calculator-hero ${typeof darkMode !== 'undefined' && darkMode ? 'bg-gray-800 text-white' : 'bg-white text-blue-900'}`}>Standard Calculator</div>
        {/* Memory Indicator */}
        <div className="w-full flex justify-end mb-1 text-xs text-gray-500 dark:text-gray-300">
          {memory !== 0 && <span className="mr-2">M</span>}
        </div>
        {/* Memory Buttons */}
        <div className="w-full grid grid-cols-4 gap-2 mb-2">
          {memoryButtons.map((btn, idx) => (
            <button
              key={btn}
              className={`py-2 text-base font-bold rounded-lg shadow transition-all duration-150 focus:outline-none
                ${btn === 'MC' ? 'bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100' :
                  btn === 'MR' ? 'bg-blue-200 hover:bg-blue-300 dark:bg-blue-700 dark:hover:bg-blue-600 text-blue-900 dark:text-blue-100' :
                  btn === 'M+' ? 'bg-green-200 hover:bg-green-300 dark:bg-green-700 dark:hover:bg-green-600 text-green-900 dark:text-green-100' :
                  btn === 'M-' ? 'bg-red-200 hover:bg-red-300 dark:bg-red-700 dark:hover:bg-red-600 text-red-900 dark:text-red-100' :
                  ''}
                `}
              onClick={() => handleClick(btn)}
              tabIndex={0}
              aria-label={btn}
            >
              {btn}
            </button>
          ))}
        </div>
        {/* Calculation History */}
        {history.length > 0 && (
          <div className="w-full mb-2 text-xs text-right text-gray-500 dark:text-gray-300 space-y-1 overflow-x-auto whitespace-nowrap">
            {history.map((item, idx) => (
              <div key={idx} className="truncate">{item}</div>
            ))}
          </div>
        )}
        {/* Expression Display */}
        {(expression || lastEvaluated) && (
          <div className="w-full mb-1 text-right text-sm text-gray-600 dark:text-gray-300 overflow-x-auto whitespace-nowrap">
            {expression || lastEvaluated}
          </div>
        )}
        <div className={`w-full mb-4 p-2 sm:p-4 rounded-lg text-right text-2xl sm:text-3xl font-mono shadow-inner min-h-[3.5rem] overflow-x-auto ${error ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' : 'bg-gray-100 dark:bg-gray-800'}`}
          style={{ WebkitOverflowScrolling: 'touch' }}
          tabIndex={0}
          aria-label="Calculator display"
        >
          {display}
        </div>
        <div className="w-full grid grid-cols-4 gap-2 sm:gap-3">
          {buttonValues.flat().map((btn, idx) => {
            let label = btn;
            if (btn === 'CLEAR') label = clearLabel;
            const isPressed = pressedBtn === btn || (btn === 'CLEAR' && (pressedBtn === 'C' || pressedBtn === 'AC'));
            return (
              <button
                key={idx}
                className={`py-3 sm:py-4 text-lg sm:text-xl font-bold rounded-lg shadow-md transition-all duration-150 focus:outline-none
                  ${label === 'C' || label === 'AC' ? 'bg-red-400 hover:bg-red-500 text-white' :
                    btn === '⌫' ? 'bg-yellow-400 hover:bg-yellow-500 text-white' :
                    btn === '=' ? 'bg-blue-600 hover:bg-blue-700 text-white col-span-2' :
                    btn === '%' ? 'bg-purple-500 hover:bg-purple-600 text-white' :
                    Object.keys(operatorMap).includes(btn) ? 'bg-teal-500 hover:bg-teal-600 text-white' :
                    'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100'}
                  ${btn === '0' ? 'col-span-2' : ''}
                  ${isPressed ? 'scale-95 shadow-inner' : ''}
                `}
                style={{ gridColumn: btn === '0' ? 'span 2 / span 2' : undefined }}
                onClick={() => handleClick(btn === 'CLEAR' ? clearLabel : btn)}
                tabIndex={0}
                aria-label={label}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Structured Content Section */}
      <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-8 text-gray-800 dark:text-gray-200">
        
        {/* About standard math operations */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold">📘 About the Standard Calculator</h3>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            A standard calculator is a core tool used for everyday basic mathematics. It handles foundational operations such as addition (+), subtraction (−), multiplication (×), and division (÷). This tool is essential for checking homework, budgeting expenses, and dividing bills quickly. It provides a simple, direct interface that eliminates the complexity of advanced scientific calculations while retaining high accuracy.
          </p>
        </div>

        {/* How to Use Section */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold">📖 How to Use the Standard Calculator</h3>
          <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-gray-300 space-y-2">
            <li>Type in your numbers using the grid buttons or your physical keyboard.</li>
            <li>Select the desired operator (addition, subtraction, multiplication, or division).</li>
            <li>Input the second number.</li>
            <li>Press the <span className="font-bold text-blue-600 dark:text-blue-400">=</span> button to view the calculated result.</li>
            <li>Use the memory keys (<span className="font-mono">M+</span>, <span className="font-mono">M-</span>, <span className="font-mono">MR</span>, <span className="font-mono">MC</span>) to store and recall numbers during multi-step calculations.</li>
          </ol>
        </div>

        {/* PEMDAS/Precedence Logic Section */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold">🧮 Mathematical Precedence Formula (BODMAS/PEMDAS)</h3>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            This calculator operates on instant evaluation (also known as standard calculator precedence), where equations are computed left-to-right as you type. To compute equations with strict mathematical order of operations, remember to compute parenthesis or multiplication terms first and store them in memory before adding or subtracting:
            <br />
            <code className="block my-2 bg-gray-100 dark:bg-gray-950 p-2 rounded font-mono text-center">
              PEMDAS: Parentheses ➔ Exponents ➔ Multiplication &amp; Division ➔ Addition &amp; Subtraction
            </code>
          </p>
        </div>

        {/* Practical Example */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold">✏️ Example Calculations</h3>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            To calculate <code className="font-mono">45 + 12 * 3</code> using the memory keys to maintain PEMDAS:
            <br />
            1. First compute <code className="font-mono">12 * 3 = 36</code>, and press <code className="font-mono">M+</code> to store it in memory.
            <br />
            2. Clear the screen by pressing <code className="font-mono">C</code>, then type <code className="font-mono">45</code>.
            <br />
            3. Press <code className="font-mono">+</code>, then press <code className="font-mono">MR</code> (Memory Recall) to fetch the stored <code className="font-mono">36</code>.
            <br />
            4. Press <code className="font-mono">=</code> to get the correct answer: <code className="font-mono">81</code>.
          </p>
        </div>

        {/* Advantages Section */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold">🌟 Advantages of this Standard Calculator</h3>
          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-2">
            <li><span className="font-semibold text-gray-950 dark:text-white">Keyboard Inputs:</span> Full support for standard numpad and operator keys for swift desk calculations.</li>
            <li><span className="font-semibold text-gray-950 dark:text-white">Active History:</span> Keep track of your previous entries in a history sub-panel.</li>
            <li><span className="font-semibold text-gray-950 dark:text-white">Robust Memory:</span> Standard memory store keys help with composite algebra without spreadsheets.</li>
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
                <span>What is the difference between C and AC?</span>
                <span className="accordion-icon text-xl transition-transform duration-300">+</span>
              </button>
              <div className="accordion-content max-h-0 overflow-hidden transition-all duration-500 ease-in-out text-sm text-gray-600 dark:text-gray-300">
                <p className="pt-2">"C" (Clear) clears the current active entry on screen, allowing you to retype the current number. "AC" (All Clear) resets the entire expression, operators, and current calculation chain completely.</p>
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
                <span>How do memory keys (M+, M-, MR, MC) work?</span>
                <span className="accordion-icon text-xl transition-transform duration-300">+</span>
              </button>
              <div className="accordion-content max-h-0 overflow-hidden transition-all duration-500 ease-in-out text-sm text-gray-600 dark:text-gray-300">
                <p className="pt-2">M+ adds the current number to the memory registry. M- subtracts it. MR (Memory Recall) brings the stored number onto the screen. MC (Memory Clear) resets the stored registry back to zero.</p>
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
              <li><Link to="/scientific-calculator" className="hover:underline">Scientific Calculator</Link></li>
              <li><Link to="/financial-calculator" className="hover:underline">Financial Calculator</Link></li>
            </ul>
          </div>
          <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-lg mb-3">📚 Related Articles</h4>
            <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
              <li><a href="https://smartstudenttools.xyz/blog/pemdas-order-operations" target="_blank" rel="noopener noreferrer" className="hover:underline">Understanding PEMDAS and Order of Operations</a></li>
              <li><a href="https://smartstudenttools.xyz/blog/calculator-tips" target="_blank" rel="noopener noreferrer" className="hover:underline">Numpad Keyboard Shortcuts for Web Calculators</a></li>
            </ul>
          </div>
        </div>

        {/* Interactive Rating Component */}
        <div className="p-6 rounded-xl border shadow-sm text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">Rate &amp; Give Feedback</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Help us improve the calculation flow</p>
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

export default StandardCalculator; 
