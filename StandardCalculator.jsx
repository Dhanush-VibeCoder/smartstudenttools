import React, { useState, useEffect } from 'react';
import AdBanner from './AdBanner.jsx';
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
        title="Standard Calculator - Smart Student Tools"
        description="A fast, modern standard calculator for students. Perform basic arithmetic operations with ease. Mobile-friendly, free, and privacy-first."
        url="https://yourdomain.com/calculator"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          'name': 'Standard Calculator',
          'description': 'A fast, modern standard calculator for students. Perform basic arithmetic operations with ease. Mobile-friendly, free, and privacy-first.',
          'applicationCategory': 'CalculatorApplication',
          'operatingSystem': 'All',
          'url': 'https://yourdomain.com/calculator',
          'publisher': {
            '@type': 'Organization',
            'name': 'Smart Student Tools'
          }
        }}
      />
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto mt-8 p-2 sm:p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col items-center select-none">
        <div className={`w-full mb-4 rounded-2xl shadow-lg p-4 text-3xl font-bold text-center ${typeof darkMode !== 'undefined' && darkMode ? 'bg-gray-800 text-white' : 'bg-white text-blue-900'}`}>Standard Calculator</div>
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
      <AdBanner />
    </>
  );
};

export default StandardCalculator; 